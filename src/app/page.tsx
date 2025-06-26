import { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TopVendors } from "@/components/home/top-vendors";
import { DealsOfTheDay } from "@/components/home/deals-of-the-day";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { FeaturesSection } from "@/components/home/features-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { BlogSection } from "@/components/home/blog-section";
import { StatsSection } from "@/components/home/stats-section";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords").split(","),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      url: "/",
      images: [
        {
          url: "/images/home-og.png",
          width: 1200,
          height: 630,
          alt: t("meta.title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.title"),
      description: t("meta.description"),
      images: ["/images/home-og.png"],
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <Suspense fallback={<LoadingSkeleton className="h-[600px]" />}>
            <HeroSection />
          </Suspense>

          {/* Featured Categories */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[400px]" />}>
                <FeaturedCategories />
              </Suspense>
            </div>
          </section>

          {/* Deals of the Day */}
          <section className="py-16">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[500px]" />}>
                <DealsOfTheDay />
              </Suspense>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[600px]" />}>
                <FeaturedProducts />
              </Suspense>
            </div>
          </section>

          {/* New Arrivals */}
          <section className="py-16">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[500px]" />}>
                <NewArrivals />
              </Suspense>
            </div>
          </section>

          {/* Best Sellers */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[500px]" />}>
                <BestSellers />
              </Suspense>
            </div>
          </section>

          {/* Top Vendors */}
          <section className="py-16">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[400px]" />}>
                <TopVendors />
              </Suspense>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <FeaturesSection />
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-primary text-primary-foreground">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[200px]" />}>
                <StatsSection />
              </Suspense>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[400px]" />}>
                <TestimonialsSection />
              </Suspense>
            </div>
          </section>

          {/* Blog Section */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <Suspense fallback={<LoadingSkeleton className="h-[500px]" />}>
                <BlogSection />
              </Suspense>
            </div>
          </section>

          {/* Newsletter */}
          <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
            <div className="container">
              <NewsletterSection />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
