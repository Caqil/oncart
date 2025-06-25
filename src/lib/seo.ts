import type { Metadata } from 'next';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import type { Vendor } from '@/types/vendor';
import type { SEOSettings } from '@/types/settings';

// SEO configuration interface
export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}

// Page-specific SEO data
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
}

// SEO Manager class
export class SEOManager {
  private config: SEOConfig;

  constructor(config: SEOConfig) {
    this.config = config;
  }

  // Generate metadata for Next.js 13+ app directory
  generateMetadata(seo: PageSEO): Metadata {
    const title = this.formatTitle(seo.title);
    const description = seo.description || this.config.defaultDescription;
    const image = seo.image || this.config.defaultImage;
    const url = seo.url ? `${this.config.siteUrl}${seo.url}` : this.config.siteUrl;

    const metadata: Metadata = {
      title,
      description,
      keywords: seo.keywords || this.config.defaultKeywords,
      
      // Open Graph
      openGraph: {
        title,
        description,
        url,
        siteName: this.config.siteName,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },

      // Twitter
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: this.config.twitterHandle,
      },

      // Additional meta tags
      other: {},
    };

    // Add canonical URL
    if (seo.canonical) {
      metadata.alternates = {
        canonical: seo.canonical,
      };
    }

    // Add noindex/nofollow
    if (seo.noIndex || seo.noFollow) {
      metadata.robots = {
        index: !seo.noIndex,
        follow: !seo.noFollow,
      };
    }

    // Add article-specific data
    if (seo.type === 'article' && seo.publishedTime) {
      metadata.openGraph = {
        ...metadata.openGraph,
        type: 'article',
        publishedTime: seo.publishedTime,
        modifiedTime: seo.modifiedTime,
        authors: seo.author ? [seo.author] : undefined,
      };
    }

    return metadata;
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(type: string, data: any): string {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    return JSON.stringify(baseData, null, 2);
  }

  // Generate product structured data
  generateProductSchema(product: Product, vendor: Vendor): string {
    const productData = {
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: vendor.storeName,
      },
      offers: {
        '@type': 'Offer',
        url: `${this.config.siteUrl}/product/${product.slug}`,
        priceCurrency: product.currency,
        price: product.price,
        availability: product.stockStatus === 'IN_STOCK' 
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: vendor.storeName,
        },
      },
      aggregateRating: product.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating,
        reviewCount: product.reviewCount,
      } : undefined,
    };

    if (product.images.length > 0) {
      productData['image'] = product.images.map(img => img.url);
    }

    return this.generateStructuredData('Product', productData);
  }

  // Generate organization structured data
  generateOrganizationSchema(): string {
    const organizationData = {
      '@type': 'Organization',
      name: this.config.siteName,
      url: this.config.siteUrl,
      logo: this.config.defaultImage,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${this.config.siteUrl}/contact`,
      },
      sameAs: [
        // Add social media URLs
      ],
    };

    return this.generateStructuredData('Organization', organizationData);
  }

  // Generate breadcrumb structured data
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): string {
    const breadcrumbData = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.config.siteUrl}${crumb.url}`,
      })),
    };

    return this.generateStructuredData('BreadcrumbList', breadcrumbData);
  }

  // Generate FAQ structured data
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
    const faqData = {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return this.generateStructuredData('FAQPage', faqData);
  }

  // Format page title
  private formatTitle(title: string): string {
    if (title === this.config.defaultTitle) {
      return title;
    }
    return `${title} | ${this.config.siteName}`;
  }

  // Generate meta description
  generateMetaDescription(content: string, maxLength: number = 160): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Truncate at the last complete word
    const truncated = content.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  // Generate keywords from content
  generateKeywords(content: string, existingKeywords: string[] = []): string[] {
    // Simple keyword extraction (in production, you might want to use a more sophisticated approach)
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    const wordFreq = words.reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return [...existingKeywords, ...keywords].slice(0, 15);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    ];
    return stopWords.includes(word);
  }
}

// SEO-specific functions for different page types
export class SEOTemplates {
  private seoManager: SEOManager;

  constructor(seoManager: SEOManager) {
    this.seoManager = seoManager;
  }

  // Product page SEO
  generateProductSEO(product: Product, vendor: Vendor): PageSEO {
    const title = `${product.name} - ${vendor.storeName}`;
    const description = this.seoManager.generateMetaDescription(
      product.description || `Buy ${product.name} from ${vendor.storeName}. ${product.shortDescription || ''}`
    );
    
    const keywords = [
      product.name.toLowerCase(),
      vendor.storeName.toLowerCase(),
      ...(product.tags || []),
      ...this.seoManager.generateKeywords(product.description || ''),
    ];

    return {
      title,
      description,
      keywords,
      image: product.images[0]?.url,
      url: `/product/${product.slug}`,
      type: 'product',
    };
  }

  // Category page SEO
  generateCategorySEO(category: Category): PageSEO {
    const title = `${category.name} - Shop Now`;
    const description = this.seoManager.generateMetaDescription(
      category.description || `Shop the best ${category.name.toLowerCase()} products. Find quality items at great prices.`
    );

    return {
      title,
      description,
      keywords: [category.name.toLowerCase(), 'shop', 'buy', 'online'],
      url: `/category/${category.slug}`,
      type: 'website',
    };
  }

  // Vendor page SEO
  generateVendorSEO(vendor: Vendor): PageSEO {
    const title = `${vendor.storeName} - Online Store`;
    const description = this.seoManager.generateMetaDescription(
      vendor.storeDescription || `Shop from ${vendor.storeName}. Quality products and excellent service.`
    );

    return {
      title,
      description,
      keywords: [vendor.storeName.toLowerCase(), 'store', 'shop', 'vendor'],
      image: vendor.storeLogo || '',
      url: `/store/${vendor.storeSlug}`,
      type: 'profile',
    };
  }

  // Search results SEO
  generateSearchSEO(query: string, resultCount: number): PageSEO {
    const title = `Search Results for "${query}"`;
    const description = `Found ${resultCount} products for "${query}". Shop now and find what you're looking for.`;

    return {
      title,
      description,
      keywords: [query.toLowerCase(), 'search', 'results', 'shop'],
      url: `/search?q=${encodeURIComponent(query)}`,
      type: 'website',
      noIndex: true, // Usually don't index search results
    };
  }

  // Blog post SEO
  generateBlogSEO(post: {
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: Date;
    updatedAt?: Date;
    slug: string;
    featuredImage?: string;
    tags?: string[];
  }): PageSEO {
    const keywords = [
      ...(post.tags || []),
      ...this.seoManager.generateKeywords(post.content),
    ];

    return {
      title: post.title,
      description: this.seoManager.generateMetaDescription(post.excerpt),
      keywords,
      image: post.featuredImage,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      author: post.author,
    };
  }
}

// URL and slug utilities
export class URLManager {
  // Generate SEO-friendly slug
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Ensure slug uniqueness
  static async ensureUniqueSlug(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Generate canonical URL
  static generateCanonicalURL(baseURL: string, path: string, params?: Record<string, string>): string {
    const url = new URL(path, baseURL);
    
    if (params) {
      // Only include specific allowed parameters for canonical URLs
      const allowedParams = ['page', 'sort', 'category'];
      Object.entries(params).forEach(([key, value]) => {
        if (allowedParams.includes(key)) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }

  // Generate hreflang URLs for multi-language sites
  static generateHreflangURLs(
    baseURL: string,
    path: string,
    supportedLocales: string[]
  ): Array<{ lang: string; url: string }> {
    return supportedLocales.map(locale => ({
      lang: locale,
      url: `${baseURL}/${locale}${path}`,
    }));
  }
}

// Sitemap generation utilities
export class SitemapGenerator {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Generate sitemap entry
  generateSitemapEntry(
    url: string,
    lastmod?: Date,
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority?: number
  ): string {
    const loc = `${this.baseURL}${url}`;
    const lastmodStr = lastmod ? lastmod.toISOString().split('T')[0] : undefined;

    return `
  <url>
    <loc>${loc}</loc>
    ${lastmodStr ? `<lastmod>${lastmodStr}</lastmod>` : ''}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
  }

  // Generate full sitemap XML
  generateSitemap(urls: Array<{
    url: string;
    lastmod?: Date;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }>): string {
    const urlEntries = urls.map(entry => 
      this.generateSitemapEntry(entry.url, entry.lastmod, entry.changefreq, entry.priority)
    ).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  // Generate sitemap index
  generateSitemapIndex(sitemaps: Array<{ url: string; lastmod?: Date }>): string {
    const sitemapEntries = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod.toISOString().split('T')[0]}</lastmod>` : ''}
  </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
  }
}

// Robots.txt generation
export class RobotsGenerator {
  static generateRobotsTxt(
    sitemapURL: string,
    disallowedPaths: string[] = [],
    userAgentRules: Record<string, string[]> = {}
  ): string {
    let robotsTxt = '';

    // Default rules for all user agents
    robotsTxt += 'User-agent: *\n';
    
    // Add disallowed paths
    disallowedPaths.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });

    // Add user-agent specific rules
    Object.entries(userAgentRules).forEach(([userAgent, rules]) => {
      robotsTxt += `\nUser-agent: ${userAgent}\n`;
      rules.forEach(rule => {
        robotsTxt += `${rule}\n`;
      });
    });

    // Add sitemap
    robotsTxt += `\nSitemap: ${sitemapURL}\n`;

    return robotsTxt;
  }
}

// Default SEO configuration
export const defaultSEOConfig: SEOConfig = {
  siteName: 'Multi-Vendor Ecommerce',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
  defaultTitle: 'Multi-Vendor Ecommerce - Shop from Multiple Vendors',
  defaultDescription: 'Discover amazing products from verified vendors. Shop with confidence and get the best deals.',
  defaultKeywords: ['ecommerce', 'online shopping', 'marketplace', 'vendors', 'products'],
  defaultImage: '/images/og-image.jpg',
  twitterHandle: '@yourecommerce',
  facebookAppId: process.env.FACEBOOK_APP_ID,
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.BING_SITE_VERIFICATION,
};

// Export default instances
export const seoManager = new SEOManager(defaultSEOConfig);
export const seoTemplates = new SEOTemplates(seoManager);
export const sitemapGenerator = new SitemapGenerator(defaultSEOConfig.siteUrl);

// Helper function to generate complete metadata
export function generatePageMetadata(seo: PageSEO): Metadata {
  return seoManager.generateMetadata(seo);
}