// OnCart Multi-Vendor Ecommerce Platform Seed Data
// Based on your project structure and requirements

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OnCart database seeding...');

  // ==================== CREATE SUPER ADMIN FIRST ====================
  console.log('👑 Creating Super Admin account...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create Super Admin - This is the main administrator account
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@oncart.com',
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+1-555-0001',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
      twoFactorEnabled: false,
    },
  });

  console.log(`✅ Super Admin created successfully!`);
  console.log(`📧 Email: admin@oncart.com`);
  console.log(`🔑 Password: password123`);
  console.log(`🆔 User ID: ${superAdmin.id}`);

  // ==================== SYSTEM SETTINGS ====================
  console.log('📝 Creating system settings...');
  
  const generalSettings = {
    siteName: 'OnCart',
    siteDescription: 'Your Premier Multi-Vendor Ecommerce Platform',
    siteUrl: 'https://oncart.com',
    contactEmail: 'contact@oncart.com',
    supportEmail: 'support@oncart.com',
    phoneNumber: '+1-555-0123',
    logo: '/images/logo.png',
    favicon: '/images/favicon.ico',
    brandColors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
    },
    address: {
      street: '123 Commerce Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    socialMedia: {
      facebook: 'https://facebook.com/oncart',
      twitter: 'https://twitter.com/oncart',
      instagram: 'https://instagram.com/oncart',
      linkedin: 'https://linkedin.com/company/oncart',
    },
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    maintenanceMode: false,
  };

  const paymentSettings = {
    defaultCurrency: 'USD',
    acceptedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    providers: {
      stripe: {
        enabled: true,
        testMode: true,
        publishableKey: 'pk_test_...',
        secretKey: 'sk_test_...',
        supportedMethods: ['card', 'apple_pay', 'google_pay'],
      },
      paypal: {
        enabled: true,
        testMode: true,
        clientId: 'sb-...',
        supportedMethods: ['paypal', 'venmo'],
      },
      bankTransfer: {
        enabled: true,
        instructions: 'Please transfer to our bank account and use your order number as reference.',
      },
      cashOnDelivery: {
        enabled: true,
        availableCountries: ['US', 'CA', 'GB'],
        additionalFee: 5.00,
      },
    },
    allowGuestCheckout: true,
    requireBillingAddress: true,
    savePaymentMethods: true,
    autoCapture: true,
    enable3DSecure: true,
    fraudDetection: true,
  };

  const shippingSettings = {
    freeShippingThreshold: 50.00,
    originAddress: {
      company: 'OnCart Distribution Center',
      street: '123 Commerce Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1-555-0123',
    },
    enableLocalDelivery: true,
    localDeliveryRadius: 25,
    localDeliveryFee: 10.00,
    enableInternationalShipping: true,
    internationalShippingCountries: ['CA', 'GB', 'AU', 'DE', 'FR'],
    processingTime: { min: 1, max: 3, unit: 'DAYS' },
  };

  await prisma.setting.createMany({
    data: [
      { key: 'general', value: JSON.stringify(generalSettings), type: 'JSON' },
      { key: 'payment', value: JSON.stringify(paymentSettings), type: 'JSON' },
      { key: 'shipping', value: JSON.stringify(shippingSettings), type: 'JSON' },
      { key: 'enableRegistration', value: 'true', type: 'BOOLEAN' },
      { key: 'requireEmailVerification', value: 'true', type: 'BOOLEAN' },
      { key: 'enableMultivendor', value: 'true', type: 'BOOLEAN' },
      { key: 'enableReviews', value: 'true', type: 'BOOLEAN' },
      { key: 'enableWishlist', value: 'true', type: 'BOOLEAN' },
      { key: 'enableCoupons', value: 'true', type: 'BOOLEAN' },
      { key: 'defaultCommissionRate', value: '15.0', type: 'NUMBER' },
      { key: 'defaultTaxRate', value: '8.25', type: 'NUMBER' },
    ],
  });

  // ==================== LANGUAGES ====================
  console.log('🌐 Creating languages...');
  
  const languages = await prisma.language.createMany({
    data: [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        isActive: true,
        isDefault: true,
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        direction: 'rtl',
        isActive: true,
        isDefault: false,
      },
    ],
  });

  // ==================== CURRENCIES ====================
  console.log('💰 Creating currencies...');
  
  await prisma.currency.createMany({
    data: [
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, isActive: true, isDefault: true },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, isActive: true, isDefault: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, isActive: true, isDefault: false },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0, isActive: true, isDefault: false },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25, isActive: true, isDefault: false },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35, isActive: true, isDefault: false },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92, isActive: true, isDefault: false },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45, isActive: true, isDefault: false },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5, isActive: true, isDefault: false },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2, isActive: true, isDefault: false },
    ],
  });

  // ==================== USERS ====================
  console.log('👥 Creating additional users...');
  
  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'manager@oncart.com',
      name: 'Store Manager',
      role: 'ADMIN',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+1-555-0002',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
      twoFactorEnabled: false,
    },
  });

  // Create Vendors
  const vendor1User = await prisma.user.create({
    data: {
      email: 'john@techstore.com',
      name: 'John Smith',
      role: 'VENDOR',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+1-555-1001',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      timezone: 'America/New_York',
    },
  });

  const vendor2User = await prisma.user.create({
    data: {
      email: 'sarah@fashionhub.com',
      name: 'Sarah Johnson',
      role: 'VENDOR',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+1-555-1002',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      timezone: 'America/Los_Angeles',
    },
  });

  const vendor3User = await prisma.user.create({
    data: {
      email: 'mike@homegoods.com',
      name: 'Mike Davis',
      role: 'VENDOR',
      status: 'ACTIVE',
      provider: 'CREDENTIALS',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+1-555-1003',
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      timezone: 'America/Chicago',
    },
  });

  // Create Customers
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Brown',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        provider: 'CREDENTIALS',
        password: hashedPassword,
        emailVerified: new Date(),
        phone: '+1-555-2001',
        preferredLanguage: 'en',
        preferredCurrency: 'USD',
        timezone: 'America/New_York',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Wilson',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        provider: 'CREDENTIALS',
        password: hashedPassword,
        emailVerified: new Date(),
        phone: '+1-555-2002',
        preferredLanguage: 'en',
        preferredCurrency: 'USD',
        timezone: 'America/Los_Angeles',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        name: 'Carol Martinez',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        provider: 'CREDENTIALS',
        password: hashedPassword,
        emailVerified: new Date(),
        phone: '+1-555-2003',
        preferredLanguage: 'es',
        preferredCurrency: 'USD',
        timezone: 'America/Chicago',
      },
    }),
  ]);

  // ==================== VENDORS ====================
  console.log('🏪 Creating vendor stores...');
  
  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendor1User.id,
      storeName: 'TechStore Pro',
      storeSlug: 'techstore-pro',
      description: 'Your premier destination for the latest technology products, gadgets, and electronics.',
      logo: '/images/vendors/techstore-logo.png',
      banner: '/images/vendors/techstore-banner.jpg',
      status: 'APPROVED',
      email: 'john@techstore.com',
      phone: '+1-555-1001',
      website: 'https://techstore.pro',
      businessName: 'TechStore Pro LLC',
      businessType: 'LLC',
      taxId: '12-3456789',
      address: '456 Tech Avenue',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
      commissionRate: 12.0,
      payoutMethod: 'BANK_TRANSFER',
      payoutDetails: JSON.stringify({
        bankName: 'Chase Bank',
        accountNumber: '****1234',
        routingNumber: '021000021',
      }),
      socialMedia: JSON.stringify({
        facebook: 'https://facebook.com/techstorepro',
        twitter: 'https://twitter.com/techstorepro',
        instagram: 'https://instagram.com/techstorepro',
      }),
      isVerified: true,
      verifiedAt: new Date(),
      averageRating: 4.7,
      totalSales: 145000.00,
      totalOrders: 2340,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendor2User.id,
      storeName: 'Fashion Hub',
      storeSlug: 'fashion-hub',
      description: 'Trendy and affordable fashion for the modern lifestyle. Discover the latest styles.',
      logo: '/images/vendors/fashionhub-logo.png',
      banner: '/images/vendors/fashionhub-banner.jpg',
      status: 'APPROVED',
      email: 'sarah@fashionhub.com',
      phone: '+1-555-1002',
      website: 'https://fashionhub.com',
      businessName: 'Fashion Hub Inc',
      businessType: 'Corporation',
      taxId: '98-7654321',
      address: '789 Fashion District',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90028',
      country: 'United States',
      commissionRate: 15.0,
      payoutMethod: 'PAYPAL',
      payoutDetails: JSON.stringify({
        paypalEmail: 'sarah@fashionhub.com',
      }),
      socialMedia: JSON.stringify({
        facebook: 'https://facebook.com/fashionhub',
        instagram: 'https://instagram.com/fashionhub',
        pinterest: 'https://pinterest.com/fashionhub',
      }),
      isVerified: true,
      verifiedAt: new Date(),
      averageRating: 4.5,
      totalSales: 89000.00,
      totalOrders: 1680,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendor3User.id,
      storeName: 'Home & Garden Essentials',
      storeSlug: 'home-garden-essentials',
      description: 'Quality home and garden products to make your house a beautiful home.',
      logo: '/images/vendors/homegoods-logo.png',
      banner: '/images/vendors/homegoods-banner.jpg',
      status: 'APPROVED',
      email: 'mike@homegoods.com',
      phone: '+1-555-1003',
      website: 'https://homegoods.com',
      businessName: 'Home Goods Co',
      businessType: 'Partnership',
      taxId: '45-6789012',
      address: '321 Home Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'United States',
      commissionRate: 18.0,
      payoutMethod: 'BANK_TRANSFER',
      payoutDetails: JSON.stringify({
        bankName: 'Wells Fargo',
        accountNumber: '****5678',
        routingNumber: '111000025',
      }),
      socialMedia: JSON.stringify({
        facebook: 'https://facebook.com/homegoods',
        instagram: 'https://instagram.com/homegoods',
      }),
      isVerified: true,
      verifiedAt: new Date(),
      averageRating: 4.3,
      totalSales: 67000.00,
      totalOrders: 890,
    },
  });

  // ==================== CATEGORIES ====================
  console.log('📁 Creating categories...');
  
  // Root Categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronics, gadgets, and tech accessories',
      image: '/images/categories/electronics.jpg',
      banner: '/images/categories/electronics-banner.jpg',
      icon: 'Smartphone',
      position: 1,
      isActive: true,
      isFeatured: true,
      metaTitle: 'Electronics - OnCart',
      metaDescription: 'Shop the latest electronics and gadgets at OnCart',
      commissionRate: 12.0,
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing, shoes, and accessories',
      image: '/images/categories/fashion.jpg',
      banner: '/images/categories/fashion-banner.jpg',
      icon: 'Shirt',
      position: 2,
      isActive: true,
      isFeatured: true,
      metaTitle: 'Fashion - OnCart',
      metaDescription: 'Discover the latest fashion trends at OnCart',
      commissionRate: 15.0,
    },
  });

  const homeGarden = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home and garden',
      image: '/images/categories/home-garden.jpg',
      banner: '/images/categories/home-garden-banner.jpg',
      icon: 'Home',
      position: 3,
      isActive: true,
      isFeatured: true,
      metaTitle: 'Home & Garden - OnCart',
      metaDescription: 'Transform your home and garden with OnCart',
      commissionRate: 18.0,
    },
  });

  // Electronics Subcategories
  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones and mobile devices',
      image: '/images/categories/smartphones.jpg',
      parentId: electronics.id,
      position: 1,
      isActive: true,
      metaTitle: 'Smartphones - OnCart',
      metaDescription: 'Shop the latest smartphones at OnCart',
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'Laptops, desktops, and computer accessories',
      image: '/images/categories/laptops.jpg',
      parentId: electronics.id,
      position: 2,
      isActive: true,
      metaTitle: 'Laptops & Computers - OnCart',
      metaDescription: 'Find the perfect laptop or computer at OnCart',
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'electronics-accessories',
      description: 'Chargers, cases, and tech accessories',
      image: '/images/categories/accessories.jpg',
      parentId: electronics.id,
      position: 3,
      isActive: true,
      metaTitle: 'Electronics Accessories - OnCart',
      metaDescription: 'Essential electronics accessories at OnCart',
    },
  });

  // Fashion Subcategories
  const mensFashion = await prisma.category.create({
    data: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Stylish clothing for men',
      image: '/images/categories/mens-fashion.jpg',
      parentId: fashion.id,
      position: 1,
      isActive: true,
      metaTitle: "Men's Fashion - OnCart",
      metaDescription: "Shop men's fashion at OnCart",
    },
  });

  const womensFashion = await prisma.category.create({
    data: {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Trendy clothing for women',
      image: '/images/categories/womens-fashion.jpg',
      parentId: fashion.id,
      position: 2,
      isActive: true,
      metaTitle: "Women's Fashion - OnCart",
      metaDescription: "Shop women's fashion at OnCart",
    },
  });

  const shoes = await prisma.category.create({
    data: {
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      image: '/images/categories/shoes.jpg',
      parentId: fashion.id,
      position: 3,
      isActive: true,
      metaTitle: 'Shoes - OnCart',
      metaDescription: 'Step up your style with shoes from OnCart',
    },
  });

  // Home & Garden Subcategories
  const furniture = await prisma.category.create({
    data: {
      name: 'Furniture',
      slug: 'furniture',
      description: 'Quality furniture for every room',
      image: '/images/categories/furniture.jpg',
      parentId: homeGarden.id,
      position: 1,
      isActive: true,
      metaTitle: 'Furniture - OnCart',
      metaDescription: 'Furnish your home with OnCart',
    },
  });

  const kitchenDining = await prisma.category.create({
    data: {
      name: 'Kitchen & Dining',
      slug: 'kitchen-dining',
      description: 'Kitchen appliances and dining essentials',
      image: '/images/categories/kitchen.jpg',
      parentId: homeGarden.id,
      position: 2,
      isActive: true,
      metaTitle: 'Kitchen & Dining - OnCart',
      metaDescription: 'Kitchen and dining essentials at OnCart',
    },
  });

  // ==================== BRANDS ====================
  console.log('🏷️ Creating brands...');
  
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Apple',
        slug: 'apple',
        description: 'Innovative technology products',
        logo: '/images/brands/apple.png',
        website: 'https://apple.com',
        isActive: true,
        metaTitle: 'Apple Products - OnCart',
        metaDescription: 'Shop Apple products at OnCart',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Leading electronics manufacturer',
        logo: '/images/brands/samsung.png',
        website: 'https://samsung.com',
        isActive: true,
        metaTitle: 'Samsung Products - OnCart',
        metaDescription: 'Discover Samsung electronics at OnCart',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Athletic wear and footwear',
        logo: '/images/brands/nike.png',
        website: 'https://nike.com',
        isActive: true,
        metaTitle: 'Nike Products - OnCart',
        metaDescription: 'Shop Nike athletic wear at OnCart',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Three stripes - Sports and lifestyle',
        logo: '/images/brands/adidas.png',
        website: 'https://adidas.com',
        isActive: true,
        metaTitle: 'Adidas Products - OnCart',
        metaDescription: 'Find Adidas products at OnCart',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'IKEA',
        slug: 'ikea',
        description: 'Affordable furniture and home accessories',
        logo: '/images/brands/ikea.png',
        website: 'https://ikea.com',
        isActive: true,
        metaTitle: 'IKEA Products - OnCart',
        metaDescription: 'Shop IKEA furniture at OnCart',
      },
    }),
  ]);

  // ==================== PRODUCTS ====================
  console.log('📦 Creating products...');
  
  // TechStore Pro Products
  const iphone15 = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'The most advanced iPhone yet with titanium design, A17 Pro chip, and professional camera system.',
      shortDescription: 'Latest iPhone with titanium design and A17 Pro chip',
      sku: 'TECH-IP15PM-001',
      barcode: '1234567890123',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 1199.99,
      comparePrice: 1299.99,
      costPrice: 800.00,
      currency: 'USD',
      taxable: true,
      taxRate: 8.25,
      trackQuantity: true,
      quantity: 50,
      lowStockThreshold: 10,
      stockStatus: 'IN_STOCK',
      allowBackorder: false,
      weight: 0.221,
      weightUnit: 'KG',
      dimensions: JSON.stringify({ length: 159.9, width: 76.7, height: 8.25, unit: 'MM' }),
      categoryId: smartphones.id,
      brandId: brands.find(b => b.slug === 'apple')?.id,
      tags: JSON.stringify(['smartphone', 'apple', 'iphone', 'pro', 'titanium']),
      hasVariants: true,
      shippingRequired: true,
      shippingWeight: 0.5,
      metaTitle: 'iPhone 15 Pro Max - OnCart',
      metaDescription: 'Buy the latest iPhone 15 Pro Max with titanium design',
      featured: true,
      featuredAt: new Date(),
      publishedAt: new Date(),
      averageRating: 4.8,
      reviewCount: 127,
      totalSales: 89,
      viewCount: 2450,
      wishlistCount: 156,
    },
  });

  const macbookPro = await prisma.product.create({
    data: {
      vendorId: vendor1.id,
      name: 'MacBook Pro 16-inch M3 Pro',
      slug: 'macbook-pro-16-m3-pro',
      description: 'Supercharged by M3 Pro chip. Built for Apple Intelligence. Up to 22 hours of battery life.',
      shortDescription: 'Professional laptop with M3 Pro chip',
      sku: 'TECH-MBP16-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 2499.99,
      comparePrice: 2699.99,
      costPrice: 1800.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 25,
      lowStockThreshold: 5,
      stockStatus: 'IN_STOCK',
      weight: 2.15,
      weightUnit: 'KG',
      categoryId: laptops.id,
      brandId: brands.find(b => b.slug === 'apple')?.id,
      tags: JSON.stringify(['laptop', 'apple', 'macbook', 'professional', 'm3']),
      shippingRequired: true,
      featured: true,
      featuredAt: new Date(),
      publishedAt: new Date(),
      averageRating: 4.9,
      reviewCount: 83,
      totalSales: 34,
      viewCount: 1890,
      wishlistCount: 98,
    },
  });

  // Fashion Hub Products
  const nikeAirMax = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'The Nike Air Max 270 delivers visible cushioning under every step. Inspired by the Air Max 93 and Air Max 180.',
      shortDescription: 'Comfortable running shoes with visible Air cushioning',
      sku: 'FASH-NAM270-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 149.99,
      comparePrice: 179.99,
      costPrice: 80.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 120,
      lowStockThreshold: 20,
      stockStatus: 'IN_STOCK',
      weight: 0.8,
      weightUnit: 'KG',
      categoryId: shoes.id,
      brandId: brands.find(b => b.slug === 'nike')?.id,
      tags: JSON.stringify(['shoes', 'nike', 'running', 'air max', 'comfortable']),
      hasVariants: true,
      shippingRequired: true,
      featured: true,
      featuredAt: new Date(),
      publishedAt: new Date(),
      averageRating: 4.6,
      reviewCount: 203,
      totalSales: 156,
      viewCount: 3200,
      wishlistCount: 189,
    },
  });

  const adidasUltraboost = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      name: 'Adidas Ultraboost 23',
      slug: 'adidas-ultraboost-23',
      description: 'The most responsive running shoe ever. Ultraboost 23 with BOOST midsole technology.',
      shortDescription: 'High-performance running shoes with BOOST technology',
      sku: 'FASH-ULTRA23-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 189.99,
      comparePrice: 219.99,
      costPrice: 95.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 80,
      lowStockThreshold: 15,
      stockStatus: 'IN_STOCK',
      weight: 0.75,
      weightUnit: 'KG',
      categoryId: shoes.id,
      brandId: brands.find(b => b.slug === 'adidas')?.id,
      tags: JSON.stringify(['shoes', 'adidas', 'running', 'ultraboost', 'performance']),
      hasVariants: true,
      shippingRequired: true,
      publishedAt: new Date(),
      averageRating: 4.7,
      reviewCount: 142,
      totalSales: 98,
      viewCount: 2100,
      wishlistCount: 76,
    },
  });

  const levisJeans = await prisma.product.create({
    data: {
      vendorId: vendor2.id,
      name: "Levi's 501 Original Jeans",
      slug: 'levis-501-original-jeans',
      description: "The original blue jean since 1873. The Levi's 501 Original is an iconic straight fit with a timeless style.",
      shortDescription: 'Classic straight-fit jeans with iconic styling',
      sku: 'FASH-LEVI501-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 79.99,
      comparePrice: 99.99,
      costPrice: 35.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 200,
      lowStockThreshold: 30,
      stockStatus: 'IN_STOCK',
      weight: 0.6,
      weightUnit: 'KG',
      categoryId: mensFashion.id,
      tags: JSON.stringify(['jeans', 'levis', 'denim', 'classic', 'mens']),
      hasVariants: true,
      shippingRequired: true,
      publishedAt: new Date(),
      averageRating: 4.4,
      reviewCount: 89,
      totalSales: 167,
      viewCount: 1800,
      wishlistCount: 45,
    },
  });

  // Home & Garden Products
  const ikeaSofa = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      name: 'IKEA KIVIK 3-Seat Sofa',
      slug: 'ikea-kivik-3-seat-sofa',
      description: 'A generous seating series with a soft, deep seat and comfortable support for your back.',
      shortDescription: 'Comfortable 3-seat sofa with deep seating',
      sku: 'HOME-KIVIK3-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 599.99,
      comparePrice: 699.99,
      costPrice: 320.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 15,
      lowStockThreshold: 3,
      stockStatus: 'IN_STOCK',
      weight: 65.0,
      weightUnit: 'KG',
      dimensions: JSON.stringify({ length: 228, width: 95, height: 83, unit: 'CM' }),
      categoryId: furniture.id,
      brandId: brands.find(b => b.slug === 'ikea')?.id,
      tags: JSON.stringify(['sofa', 'furniture', 'ikea', 'living room', 'comfortable']),
      hasVariants: true,
      shippingRequired: true,
      shippingWeight: 70.0,
      publishedAt: new Date(),
      averageRating: 4.2,
      reviewCount: 56,
      totalSales: 23,
      viewCount: 890,
      wishlistCount: 34,
    },
  });

  const coffeeMaker = await prisma.product.create({
    data: {
      vendorId: vendor3.id,
      name: 'Breville Barista Express Coffee Machine',
      slug: 'breville-barista-express-coffee-machine',
      description: 'Create third wave specialty coffee at home. Integrated conical burr grinder and 15 bar pump.',
      shortDescription: 'Professional espresso machine with built-in grinder',
      sku: 'HOME-BREVILLE-001',
      type: 'PHYSICAL',
      status: 'PUBLISHED',
      price: 599.99,
      comparePrice: 749.99,
      costPrice: 350.00,
      currency: 'USD',
      taxable: true,
      trackQuantity: true,
      quantity: 30,
      lowStockThreshold: 8,
      stockStatus: 'IN_STOCK',
      weight: 12.0,
      weightUnit: 'KG',
      categoryId: kitchenDining.id,
      tags: JSON.stringify(['coffee', 'espresso', 'kitchen', 'breville', 'appliance']),
      shippingRequired: true,
      publishedAt: new Date(),
      averageRating: 4.8,
      reviewCount: 234,
      totalSales: 67,
      viewCount: 1560,
      wishlistCount: 123,
    },
  });

  // ==================== PRODUCT IMAGES ====================
  console.log('🖼️ Creating product images...');
  
  const productImages = [
    // iPhone 15 Pro Max images
    { productId: iphone15.id, url: '/images/products/iphone15-main.jpg', alt: 'iPhone 15 Pro Max', position: 0, isMain: true },
    { productId: iphone15.id, url: '/images/products/iphone15-back.jpg', alt: 'iPhone 15 Pro Max Back', position: 1, isMain: false },
    { productId: iphone15.id, url: '/images/products/iphone15-side.jpg', alt: 'iPhone 15 Pro Max Side', position: 2, isMain: false },
    
    // MacBook Pro images
    { productId: macbookPro.id, url: '/images/products/macbook-main.jpg', alt: 'MacBook Pro 16-inch', position: 0, isMain: true },
    { productId: macbookPro.id, url: '/images/products/macbook-open.jpg', alt: 'MacBook Pro Open', position: 1, isMain: false },
    
    // Nike Air Max images
    { productId: nikeAirMax.id, url: '/images/products/nike-airmax-main.jpg', alt: 'Nike Air Max 270', position: 0, isMain: true },
    { productId: nikeAirMax.id, url: '/images/products/nike-airmax-side.jpg', alt: 'Nike Air Max Side View', position: 1, isMain: false },
    
    // Adidas Ultraboost images
    { productId: adidasUltraboost.id, url: '/images/products/adidas-ultra-main.jpg', alt: 'Adidas Ultraboost 23', position: 0, isMain: true },
    { productId: adidasUltraboost.id, url: '/images/products/adidas-ultra-detail.jpg', alt: 'Adidas Ultraboost Detail', position: 1, isMain: false },
    
    // Levi's Jeans images
    { productId: levisJeans.id, url: '/images/products/levis-jeans-main.jpg', alt: "Levi's 501 Jeans", position: 0, isMain: true },
    
    // IKEA Sofa images
    { productId: ikeaSofa.id, url: '/images/products/ikea-sofa-main.jpg', alt: 'IKEA KIVIK Sofa', position: 0, isMain: true },
    { productId: ikeaSofa.id, url: '/images/products/ikea-sofa-room.jpg', alt: 'IKEA Sofa in Room', position: 1, isMain: false },
    
    // Coffee Maker images
    { productId: coffeeMaker.id, url: '/images/products/breville-main.jpg', alt: 'Breville Coffee Machine', position: 0, isMain: true },
    { productId: coffeeMaker.id, url: '/images/products/breville-detail.jpg', alt: 'Breville Detail View', position: 1, isMain: false },
  ];

  await prisma.productImage.createMany({ data: productImages });

  // ==================== PRODUCT VARIANTS ====================
  console.log('🎨 Creating product variants...');
  
  // iPhone 15 Pro Max variants (Storage/Color)
  const iphoneVariants = [
    { productId: iphone15.id, sku: 'TECH-IP15PM-256-BLACK', price: 1199.99, quantity: 15, optionValues: JSON.stringify([{ name: 'Storage', value: '256GB' }, { name: 'Color', value: 'Black Titanium' }]) },
    { productId: iphone15.id, sku: 'TECH-IP15PM-256-WHITE', price: 1199.99, quantity: 12, optionValues: JSON.stringify([{ name: 'Storage', value: '256GB' }, { name: 'Color', value: 'White Titanium' }]) },
    { productId: iphone15.id, sku: 'TECH-IP15PM-512-BLACK', price: 1399.99, quantity: 10, optionValues: JSON.stringify([{ name: 'Storage', value: '512GB' }, { name: 'Color', value: 'Black Titanium' }]) },
    { productId: iphone15.id, sku: 'TECH-IP15PM-512-WHITE', price: 1399.99, quantity: 8, optionValues: JSON.stringify([{ name: 'Storage', value: '512GB' }, { name: 'Color', value: 'White Titanium' }]) },
    { productId: iphone15.id, sku: 'TECH-IP15PM-1TB-BLACK', price: 1599.99, quantity: 5, optionValues: JSON.stringify([{ name: 'Storage', value: '1TB' }, { name: 'Color', value: 'Black Titanium' }]) },
  ];

  // Nike Air Max variants (Size/Color)
  const nikeVariants = [
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-8-BLACK', quantity: 20, optionValues: JSON.stringify([{ name: 'Size', value: '8' }, { name: 'Color', value: 'Black/White' }]) },
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-9-BLACK', quantity: 25, optionValues: JSON.stringify([{ name: 'Size', value: '9' }, { name: 'Color', value: 'Black/White' }]) },
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-10-BLACK', quantity: 30, optionValues: JSON.stringify([{ name: 'Size', value: '10' }, { name: 'Color', value: 'Black/White' }]) },
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-8-BLUE', quantity: 15, optionValues: JSON.stringify([{ name: 'Size', value: '8' }, { name: 'Color', value: 'Blue/White' }]) },
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-9-BLUE', quantity: 20, optionValues: JSON.stringify([{ name: 'Size', value: '9' }, { name: 'Color', value: 'Blue/White' }]) },
    { productId: nikeAirMax.id, sku: 'FASH-NAM270-10-BLUE', quantity: 10, optionValues: JSON.stringify([{ name: 'Size', value: '10' }, { name: 'Color', value: 'Blue/White' }]) },
  ];

  // Levi's Jeans variants (Size/Color)
  const levisVariants = [
    { productId: levisJeans.id, sku: 'FASH-LEVI501-30-BLUE', quantity: 25, optionValues: JSON.stringify([{ name: 'Waist', value: '30' }, { name: 'Length', value: '32' }, { name: 'Color', value: 'Dark Blue' }]) },
    { productId: levisJeans.id, sku: 'FASH-LEVI501-32-BLUE', quantity: 40, optionValues: JSON.stringify([{ name: 'Waist', value: '32' }, { name: 'Length', value: '32' }, { name: 'Color', value: 'Dark Blue' }]) },
    { productId: levisJeans.id, sku: 'FASH-LEVI501-34-BLUE', quantity: 35, optionValues: JSON.stringify([{ name: 'Waist', value: '34' }, { name: 'Length', value: '32' }, { name: 'Color', value: 'Dark Blue' }]) },
    { productId: levisJeans.id, sku: 'FASH-LEVI501-32-BLACK', quantity: 30, optionValues: JSON.stringify([{ name: 'Waist', value: '32' }, { name: 'Length', value: '32' }, { name: 'Color', value: 'Black' }]) },
    { productId: levisJeans.id, sku: 'FASH-LEVI501-34-BLACK', quantity: 25, optionValues: JSON.stringify([{ name: 'Waist', value: '34' }, { name: 'Length', value: '32' }, { name: 'Color', value: 'Black' }]) },
  ];

  // IKEA Sofa variants (Color)
  const sofaVariants = [
    { productId: ikeaSofa.id, sku: 'HOME-KIVIK3-GRAY', quantity: 8, optionValues: JSON.stringify([{ name: 'Color', value: 'Hillared Dark Gray' }]) },
    { productId: ikeaSofa.id, sku: 'HOME-KIVIK3-BEIGE', quantity: 5, optionValues: JSON.stringify([{ name: 'Color', value: 'Hillared Beige' }]) },
    { productId: ikeaSofa.id, sku: 'HOME-KIVIK3-BLUE', quantity: 2, optionValues: JSON.stringify([{ name: 'Color', value: 'Hillared Dark Blue' }]) },
  ];

  const allVariants = [...iphoneVariants, ...nikeVariants, ...levisVariants, ...sofaVariants];
  await prisma.productVariant.createMany({ data: allVariants });

  // ==================== VARIANT OPTIONS ====================
  console.log('⚙️ Creating variant options...');
  
  const variantOptions = [
    // iPhone options
    { productId: iphone15.id, name: 'Storage', position: 0, values: JSON.stringify(['256GB', '512GB', '1TB']) },
    { productId: iphone15.id, name: 'Color', position: 1, values: JSON.stringify(['Black Titanium', 'White Titanium', 'Natural Titanium', 'Blue Titanium']) },
    
    // Nike options
    { productId: nikeAirMax.id, name: 'Size', position: 0, values: JSON.stringify(['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']) },
    { productId: nikeAirMax.id, name: 'Color', position: 1, values: JSON.stringify(['Black/White', 'Blue/White', 'Red/Black', 'Gray/White']) },
    
    // Adidas options
    { productId: adidasUltraboost.id, name: 'Size', position: 0, values: JSON.stringify(['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12']) },
    { productId: adidasUltraboost.id, name: 'Color', position: 1, values: JSON.stringify(['Core Black', 'Cloud White', 'Solar Red', 'Tech Purple']) },
    
    // Levi's options
    { productId: levisJeans.id, name: 'Waist', position: 0, values: JSON.stringify(['28', '30', '32', '34', '36', '38', '40']) },
    { productId: levisJeans.id, name: 'Length', position: 1, values: JSON.stringify(['30', '32', '34']) },
    { productId: levisJeans.id, name: 'Color', position: 2, values: JSON.stringify(['Dark Blue', 'Light Blue', 'Black', 'Gray']) },
    
    // IKEA Sofa options
    { productId: ikeaSofa.id, name: 'Color', position: 0, values: JSON.stringify(['Hillared Dark Gray', 'Hillared Beige', 'Hillared Dark Blue', 'Orrsta Light Gray']) },
  ];

  await prisma.variantOption.createMany({ data: variantOptions });

  // ==================== PRODUCT REVIEWS ====================
  console.log('⭐ Creating product reviews...');
  
  const reviews = [
    // iPhone reviews
    { productId: iphone15.id, userId: customers[0].id, rating: 5, title: 'Amazing phone!', comment: 'The camera quality is incredible and the titanium build feels premium.', isVerifiedPurchase: true, helpful: 12, status: 'PUBLISHED' },
    { productId: iphone15.id, userId: customers[1].id, rating: 4, title: 'Great upgrade', comment: 'Coming from iPhone 13, this is a solid upgrade. Battery life is excellent.', isVerifiedPurchase: true, helpful: 8, status: 'PUBLISHED' },
    { productId: iphone15.id, userId: customers[2].id, rating: 5, title: 'Love the new design', comment: 'The titanium finish is beautiful and much lighter than expected.', isVerifiedPurchase: false, helpful: 5, status: 'PUBLISHED' },
    
    // MacBook reviews
    { productId: macbookPro.id, userId: customers[0].id, rating: 5, title: 'Perfect for work', comment: 'M3 Pro chip handles everything I throw at it. Great for video editing.', isVerifiedPurchase: true, helpful: 15, status: 'PUBLISHED' },
    { productId: macbookPro.id, userId: customers[1].id, rating: 4, title: 'Expensive but worth it', comment: 'Pricey but the performance and build quality justify the cost.', isVerifiedPurchase: true, helpful: 9, status: 'PUBLISHED' },
    
    // Nike reviews
    { productId: nikeAirMax.id, userId: customers[0].id, rating: 4, title: 'Comfortable for daily wear', comment: 'Very comfortable for walking and casual wear. True to size.', isVerifiedPurchase: true, helpful: 18, status: 'PUBLISHED' },
    { productId: nikeAirMax.id, userId: customers[2].id, rating: 5, title: 'Love these shoes!', comment: 'Super comfortable and stylish. Get compliments all the time.', isVerifiedPurchase: true, helpful: 11, status: 'PUBLISHED' },
    
    // Coffee maker reviews
    { productId: coffeeMaker.id, userId: customers[1].id, rating: 5, title: 'Best coffee machine!', comment: 'Makes cafe-quality espresso at home. Built-in grinder is fantastic.', isVerifiedPurchase: true, helpful: 23, status: 'PUBLISHED' },
    { productId: coffeeMaker.id, userId: customers[2].id, rating: 4, title: 'Great machine', comment: 'Easy to use and makes great coffee. Takes some practice to get perfect shots.', isVerifiedPurchase: true, helpful: 7, status: 'PUBLISHED' },
  ];

  await prisma.productReview.createMany({ data: reviews });

  // ==================== COUPONS ====================
  console.log('🎫 Creating coupons...');
  
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.0,
      description: 'Welcome discount for new customers',
      usageLimit: 1000,
      usageCount: 156,
      userUsageLimit: 1,
      minimumAmount: 50.0,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-12-31'),
      isActive: true,
    },
    {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0.0,
      description: 'Free shipping on all orders',
      usageLimit: 500,
      usageCount: 78,
      minimumAmount: 75.0,
      validFrom: new Date('2024-06-01'),
      validTo: new Date('2025-06-30'),
      isActive: true,
    },
    {
      code: 'SAVE25',
      type: 'FIXED_AMOUNT',
      value: 25.0,
      description: '$25 off orders over $200',
      usageLimit: 200,
      usageCount: 34,
      minimumAmount: 200.0,
      maximumDiscount: 25.0,
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2025-03-31'),
      isActive: true,
    },
    {
      code: 'ELECTRONICS15',
      type: 'PERCENTAGE',
      value: 15.0,
      description: '15% off electronics',
      usageLimit: 300,
      usageCount: 67,
      minimumAmount: 100.0,
      applicableCategories: JSON.stringify([electronics.id]),
      validFrom: new Date('2024-11-01'),
      validTo: new Date('2025-01-31'),
      isActive: true,
    },
  ];

  await prisma.coupon.createMany({ data: coupons });

  // ==================== ADDRESSES ====================
  console.log('📍 Creating sample addresses...');
  
  const addresses = [
    // Customer 1 addresses
    {
      userId: customers[0].id,
      type: 'SHIPPING',
      firstName: 'Alice',
      lastName: 'Brown',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '+1-555-2001',
      isDefault: true,
    },
    {
      userId: customers[0].id,
      type: 'BILLING',
      firstName: 'Alice',
      lastName: 'Brown',
      company: 'Tech Corp',
      addressLine1: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10002',
      country: 'United States',
      phone: '+1-555-2001',
      isDefault: false,
    },
    
    // Customer 2 addresses
    {
      userId: customers[1].id,
      type: 'BOTH',
      firstName: 'Bob',
      lastName: 'Wilson',
      addressLine1: '789 Oak Street',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
      phone: '+1-555-2002',
      isDefault: true,
    },
    
    // Customer 3 addresses
    {
      userId: customers[2].id,
      type: 'SHIPPING',
      firstName: 'Carol',
      lastName: 'Martinez',
      addressLine1: '321 Pine Avenue',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'United States',
      phone: '+1-555-2003',
      isDefault: true,
    },
  ];

  await prisma.address.createMany({ data: addresses });

  // ==================== SAMPLE ORDERS ====================
  console.log('🛒 Creating sample orders...');
  
  const sampleOrder1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2025-001',
      userId: customers[0].id,
      vendorId: vendor1.id,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'FULFILLED',
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      subtotal: 1199.99,
      taxAmount: 99.00,
      shippingCost: 0.00,
      discount: 119.99,
      total: 1179.00,
      currency: 'USD',
      billingAddress: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Brown',
        addressLine1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      }),
      shippingAddress: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Brown',
        addressLine1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      }),
      shippingMethod: 'Standard Shipping',
      trackingNumber: 'TRK123456789',
      trackingUrl: 'https://tracking.example.com/TRK123456789',
      paymentMethod: JSON.stringify({
        type: 'credit_card',
        provider: 'stripe',
        last4: '4242',
        brand: 'visa',
      }),
      paymentReference: 'pi_1234567890',
      confirmedAt: new Date('2024-12-01T10:00:00Z'),
      shippedAt: new Date('2024-12-02T14:30:00Z'),
      deliveredAt: new Date('2024-12-05T16:45:00Z'),
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2025-002',
      userId: customers[1].id,
      vendorId: vendor2.id,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'PARTIALLY_FULFILLED',
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      subtotal: 229.98,
      taxAmount: 18.40,
      shippingCost: 9.99,
      discount: 0.00,
      total: 258.37,
      currency: 'USD',
      billingAddress: JSON.stringify({
        firstName: 'Bob',
        lastName: 'Wilson',
        addressLine1: '789 Oak Street',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'United States',
      }),
      shippingAddress: JSON.stringify({
        firstName: 'Bob',
        lastName: 'Wilson',
        addressLine1: '789 Oak Street',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'United States',
      }),
      shippingMethod: 'Express Shipping',
      trackingNumber: 'TRK987654321',
      paymentMethod: JSON.stringify({
        type: 'paypal',
        provider: 'paypal',
      }),
      paymentReference: 'PAY-9876543210',
      confirmedAt: new Date('2024-12-20T09:15:00Z'),
      shippedAt: new Date('2024-12-21T11:00:00Z'),
    },
  });

  const sampleOrder3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2025-003',
      userId: customers[2].id,
      vendorId: vendor3.id,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      fulfillmentStatus: 'UNFULFILLED',
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      subtotal: 1199.98,
      taxAmount: 96.00,
      shippingCost: 49.99,
      discount: 60.00,
      total: 1285.97,
      currency: 'USD',
      billingAddress: JSON.stringify({
        firstName: 'Carol',
        lastName: 'Martinez',
        addressLine1: '321 Pine Avenue',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'United States',
      }),
      shippingAddress: JSON.stringify({
        firstName: 'Carol',
        lastName: 'Martinez',
        addressLine1: '321 Pine Avenue',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'United States',
      }),
      shippingMethod: 'Standard Shipping',
      paymentMethod: JSON.stringify({
        type: 'credit_card',
        provider: 'stripe',
        last4: '1234',
        brand: 'mastercard',
      }),
      paymentReference: 'pi_0987654321',
      confirmedAt: new Date('2024-12-25T13:30:00Z'),
    },
  });

  // ==================== ORDER ITEMS ====================
  console.log('📦 Creating order items...');
  
  const orderItems = [
    // Order 1 items
    {
      orderId: sampleOrder1.id,
      productId: iphone15.id,
      vendorId: vendor1.id,
      name: 'iPhone 15 Pro Max',
      sku: 'TECH-IP15PM-256-BLACK',
      image: '/images/products/iphone15-main.jpg',
      price: 1199.99,
      quantity: 1,
      total: 1199.99,
      variantOptions: JSON.stringify([
        { name: 'Storage', value: '256GB' },
        { name: 'Color', value: 'Black Titanium' }
      ]),
      fulfillmentStatus: 'FULFILLED',
      shippedAt: new Date('2024-12-02T14:30:00Z'),
      deliveredAt: new Date('2024-12-05T16:45:00Z'),
    },
    
    // Order 2 items
    {
      orderId: sampleOrder2.id,
      productId: nikeAirMax.id,
      vendorId: vendor2.id,
      name: 'Nike Air Max 270',
      sku: 'FASH-NAM270-9-BLACK',
      image: '/images/products/nike-airmax-main.jpg',
      price: 149.99,
      quantity: 1,
      total: 149.99,
      variantOptions: JSON.stringify([
        { name: 'Size', value: '9' },
        { name: 'Color', value: 'Black/White' }
      ]),
      fulfillmentStatus: 'SHIPPED',
      shippedAt: new Date('2024-12-21T11:00:00Z'),
    },
    {
      orderId: sampleOrder2.id,
      productId: levisJeans.id,
      vendorId: vendor2.id,
      name: "Levi's 501 Original Jeans",
      sku: 'FASH-LEVI501-32-BLUE',
      image: '/images/products/levis-jeans-main.jpg',
      price: 79.99,
      quantity: 1,
      total: 79.99,
      variantOptions: JSON.stringify([
        { name: 'Waist', value: '32' },
        { name: 'Length', value: '32' },
        { name: 'Color', value: 'Dark Blue' }
      ]),
      fulfillmentStatus: 'SHIPPED',
      shippedAt: new Date('2024-12-21T11:00:00Z'),
    },
    
    // Order 3 items
    {
      orderId: sampleOrder3.id,
      productId: ikeaSofa.id,
      vendorId: vendor3.id,
      name: 'IKEA KIVIK 3-Seat Sofa',
      sku: 'HOME-KIVIK3-GRAY',
      image: '/images/products/ikea-sofa-main.jpg',
      price: 599.99,
      quantity: 1,
      total: 599.99,
      variantOptions: JSON.stringify([
        { name: 'Color', value: 'Hillared Dark Gray' }
      ]),
      fulfillmentStatus: 'UNFULFILLED',
    },
    {
      orderId: sampleOrder3.id,
      productId: coffeeMaker.id,
      vendorId: vendor3.id,
      name: 'Breville Barista Express Coffee Machine',
      sku: 'HOME-BREVILLE-001',
      image: '/images/products/breville-main.jpg',
      price: 599.99,
      quantity: 1,
      total: 599.99,
      fulfillmentStatus: 'UNFULFILLED',
    },
  ];

  await prisma.orderItem.createMany({ data: orderItems });

  // ==================== PAYMENTS ====================
  console.log('💳 Creating payments...');
  
  const payments = [
    {
      orderId: sampleOrder1.id,
      amount: 1179.00,
      currency: 'USD',
      status: 'PAID',
      method: 'credit_card',
      provider: 'stripe',
      reference: 'pi_1234567890',
      gatewayResponse: JSON.stringify({
        id: 'pi_1234567890',
        status: 'succeeded',
        amount: 117900,
        currency: 'usd',
      }),
      processedAt: new Date('2024-12-01T10:05:00Z'),
    },
    {
      orderId: sampleOrder2.id,
      amount: 258.37,
      currency: 'USD',
      status: 'PAID',
      method: 'paypal',
      provider: 'paypal',
      reference: 'PAY-9876543210',
      gatewayResponse: JSON.stringify({
        id: 'PAY-9876543210',
        status: 'COMPLETED',
        amount: { total: '258.37', currency: 'USD' },
      }),
      processedAt: new Date('2024-12-20T09:20:00Z'),
    },
    {
      orderId: sampleOrder3.id,
      amount: 1285.97,
      currency: 'USD',
      status: 'PAID',
      method: 'credit_card',
      provider: 'stripe',
      reference: 'pi_0987654321',
      gatewayResponse: JSON.stringify({
        id: 'pi_0987654321',
        status: 'succeeded',
        amount: 128597,
        currency: 'usd',
      }),
      processedAt: new Date('2024-12-25T13:35:00Z'),
    },
  ];

  await prisma.payment.createMany({ data: payments });

  // ==================== ORDER HISTORY ====================
  console.log('📋 Creating order histories...');
  
  const orderHistories = [
    // Order 1 history
    { orderId: sampleOrder1.id, status: 'PENDING', comment: 'Order placed successfully', isCustomerVisible: true, createdAt: new Date('2024-12-01T10:00:00Z') },
    { orderId: sampleOrder1.id, status: 'CONFIRMED', paymentStatus: 'PAID', comment: 'Payment confirmed', isCustomerVisible: true, createdAt: new Date('2024-12-01T10:05:00Z') },
    { orderId: sampleOrder1.id, status: 'PROCESSING', comment: 'Order is being prepared for shipment', isCustomerVisible: true, createdAt: new Date('2024-12-02T09:00:00Z') },
    { orderId: sampleOrder1.id, status: 'SHIPPED', fulfillmentStatus: 'FULFILLED', comment: 'Order has been shipped', isCustomerVisible: true, createdAt: new Date('2024-12-02T14:30:00Z') },
    { orderId: sampleOrder1.id, status: 'DELIVERED', comment: 'Order delivered successfully', isCustomerVisible: true, createdAt: new Date('2024-12-05T16:45:00Z') },
    
    // Order 2 history
    { orderId: sampleOrder2.id, status: 'PENDING', comment: 'Order placed', isCustomerVisible: true, createdAt: new Date('2024-12-20T09:15:00Z') },
    { orderId: sampleOrder2.id, status: 'CONFIRMED', paymentStatus: 'PAID', comment: 'PayPal payment received', isCustomerVisible: true, createdAt: new Date('2024-12-20T09:20:00Z') },
    { orderId: sampleOrder2.id, status: 'PROCESSING', comment: 'Items being prepared', isCustomerVisible: true, createdAt: new Date('2024-12-21T08:00:00Z') },
    { orderId: sampleOrder2.id, status: 'SHIPPED', fulfillmentStatus: 'PARTIALLY_FULFILLED', comment: 'Package shipped via Express', isCustomerVisible: true, createdAt: new Date('2024-12-21T11:00:00Z') },
    
    // Order 3 history
    { orderId: sampleOrder3.id, status: 'PENDING', comment: 'Order received', isCustomerVisible: true, createdAt: new Date('2024-12-25T13:30:00Z') },
    { orderId: sampleOrder3.id, status: 'CONFIRMED', paymentStatus: 'PAID', comment: 'Credit card payment processed', isCustomerVisible: true, createdAt: new Date('2024-12-25T13:35:00Z') },
    { orderId: sampleOrder3.id, status: 'PROCESSING', comment: 'Large items require special handling', isCustomerVisible: true, createdAt: new Date('2024-12-26T10:00:00Z') },
  ];

  await prisma.orderHistory.createMany({ data: orderHistories });

  // ==================== WISHLISTS ====================
  console.log('❤️ Creating wishlists...');
  
  const wishlists = await Promise.all([
    prisma.wishlist.create({
      data: {
        userId: customers[0].id,
        isPublic: false,
        items: {
          create: [
            { productId: macbookPro.id },
            { productId: coffeeMaker.id },
          ],
        },
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customers[1].id,
        isPublic: true,
        shareToken: 'wish_share_abc123',
        items: {
          create: [
            { productId: adidasUltraboost.id },
            { productId: ikeaSofa.id },
          ],
        },
      },
    }),
    prisma.wishlist.create({
      data: {
        userId: customers[2].id,
        isPublic: false,
        items: {
          create: [
            { productId: iphone15.id },
            { productId: nikeAirMax.id },
          ],
        },
      },
    }),
  ]);

  // ==================== ANALYTICS ====================
  console.log('📊 Creating analytics data...');
  
  type AnalyticsData = {
    date: Date;
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRate: number;
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    productViews: number;
    cartAdds: number;
    checkouts: number;
    newUsers: number;
    returningUsers: number;
  };
  const analyticsData: AnalyticsData[] = [];
  const startDate = new Date('2024-11-01');
  const endDate = new Date('2024-12-31');

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Generate realistic daily metrics
    const baseVisitors = isWeekend ? 800 : 1200;
    const visitors = baseVisitors + Math.floor(Math.random() * 400);
    const uniqueVisitors = Math.floor(visitors * 0.75);
    const pageViews = Math.floor(visitors * 2.5);
    const bounceRate = 0.35 + Math.random() * 0.2;
    
    const orders = Math.floor(Math.random() * 15) + 5;
    const avgOrderValue = 150 + Math.random() * 200;
    const totalSales = orders * avgOrderValue;
    
    analyticsData.push({
      date: new Date(date),
      totalVisitors: visitors,
      uniqueVisitors: uniqueVisitors,
      pageViews: pageViews,
      bounceRate: bounceRate,
      totalSales: totalSales,
      totalOrders: orders,
      averageOrderValue: avgOrderValue,
      productViews: Math.floor(pageViews * 0.4),
      cartAdds: Math.floor(visitors * 0.12),
      checkouts: Math.floor(orders * 1.8),
      newUsers: Math.floor(visitors * 0.15),
      returningUsers: Math.floor(visitors * 0.85),
    });
  }

  await prisma.analytics.createMany({ data: analyticsData });

  // ==================== NOTIFICATIONS ====================
  console.log('🔔 Creating sample notifications...');
  
  const notifications = [
    // Customer notifications
    { userId: customers[0].id, type: 'ORDER_CONFIRMED', title: 'Order Confirmed', message: 'Your order #ORD-2025-001 has been confirmed', data: JSON.stringify({ orderId: sampleOrder1.id }) },
    { userId: customers[0].id, type: 'ORDER_SHIPPED', title: 'Order Shipped', message: 'Your order #ORD-2025-001 has been shipped', data: JSON.stringify({ orderId: sampleOrder1.id, trackingNumber: 'TRK123456789' }), read: true, readAt: new Date() },
    { userId: customers[0].id, type: 'ORDER_DELIVERED', title: 'Order Delivered', message: 'Your order #ORD-2025-001 has been delivered', data: JSON.stringify({ orderId: sampleOrder1.id }), read: true, readAt: new Date() },
    
    { userId: customers[1].id, type: 'ORDER_CONFIRMED', title: 'Order Confirmed', message: 'Your order #ORD-2025-002 has been confirmed', data: JSON.stringify({ orderId: sampleOrder2.id }) },
    { userId: customers[1].id, type: 'ORDER_SHIPPED', title: 'Order Shipped', message: 'Your order #ORD-2025-002 has been shipped', data: JSON.stringify({ orderId: sampleOrder2.id, trackingNumber: 'TRK987654321' }) },
    
    { userId: customers[2].id, type: 'ORDER_CONFIRMED', title: 'Order Confirmed', message: 'Your order #ORD-2025-003 has been confirmed', data: JSON.stringify({ orderId: sampleOrder3.id }) },
    { userId: customers[2].id, type: 'PRICE_DROP', title: 'Price Drop Alert', message: 'iPhone 15 Pro Max price dropped by $100!', data: JSON.stringify({ productId: iphone15.id, oldPrice: 1299.99, newPrice: 1199.99 }) },
    
    // Vendor notifications
    { userId: vendor1User.id, type: 'VENDOR_NEW_ORDER', title: 'New Order Received', message: 'You have received a new order #ORD-2025-001', data: JSON.stringify({ orderId: sampleOrder1.id }) },
    { userId: vendor2User.id, type: 'VENDOR_NEW_ORDER', title: 'New Order Received', message: 'You have received a new order #ORD-2025-002', data: JSON.stringify({ orderId: sampleOrder2.id }) },
    { userId: vendor3User.id, type: 'VENDOR_NEW_ORDER', title: 'New Order Received', message: 'You have received a new order #ORD-2025-003', data: JSON.stringify({ orderId: sampleOrder3.id }) },
    { userId: vendor1User.id, type: 'LOW_STOCK_ALERT', title: 'Low Stock Alert', message: 'iPhone 15 Pro Max (1TB Black) is running low on stock', data: JSON.stringify({ productId: iphone15.id, variant: '1TB Black', currentStock: 5 }) },
  ];

  await prisma.notification.createMany({ data: notifications });

  console.log('✅ OnCart database seeding completed successfully!');
  console.log('\n🎉 SETUP COMPLETE - Your OnCart platform is ready!');
  console.log('\n' + '='.repeat(60));
  console.log('🔐 IMPORTANT: Save these login credentials safely!');
  console.log('='.repeat(60));
  console.log('\n👑 SUPER ADMIN ACCESS:');
  console.log(`📧 Email: admin@oncart.com`);
  console.log(`🔑 Password: password123`);
  console.log(`🌐 Access: Full platform administration`);
  
  console.log('\n👨‍💼 STORE MANAGER ACCESS:');
  console.log(`📧 Email: manager@oncart.com`);
  console.log(`🔑 Password: password123`);
  console.log(`🌐 Access: Store management and operations`);

  console.log('\n🏪 SAMPLE VENDOR ACCOUNTS:');
  console.log(`📧 TechStore Pro: john@techstore.com / password123`);
  console.log(`📧 Fashion Hub: sarah@fashionhub.com / password123`);
  console.log(`📧 Home & Garden: mike@homegoods.com / password123`);

  console.log('\n👤 SAMPLE CUSTOMER ACCOUNTS:');
  console.log(`📧 Customer 1: alice@example.com / password123`);
  console.log(`📧 Customer 2: bob@example.com / password123`);
  console.log(`📧 Customer 3: carol@example.com / password123`);

  console.log('\n' + '='.repeat(60));
  console.log('📊 SEEDED DATA SUMMARY:');
  console.log('='.repeat(60));
  console.log('👥 Users: 6 (1 Super Admin, 1 Admin, 3 Vendors, 3 Customers)');
  console.log('🏪 Vendors: 3 approved stores with products');
  console.log('📁 Categories: 9 (3 main + 6 subcategories)');
  console.log('🏷️ Brands: 5 major brands');
  console.log('📦 Products: 6 with variants, images, and reviews');
  console.log('🛒 Orders: 3 sample orders with different statuses');
  console.log('⭐ Reviews: 9 customer reviews');
  console.log('🎫 Coupons: 4 active discount codes');
  console.log('💰 Currencies: 10 supported currencies');
  console.log('🌐 Languages: 5 supported languages');
  console.log('📊 Analytics: 61 days of sample data');
  console.log('🔔 Notifications: 12 sample notifications');

  console.log('\n' + '='.repeat(60));
  console.log('🚀 NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('1. Start your Next.js application');
  console.log('2. Navigate to /admin and login as Super Admin');
  console.log('3. Configure payment gateways in settings');
  console.log('4. Set up email service for notifications');
  console.log('5. Customize your store branding and theme');
  console.log('6. Add your own products and categories');
  console.log('\n🎉 Happy selling with OnCart!');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });