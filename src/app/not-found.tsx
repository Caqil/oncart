import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Search,
  Home,
  ArrowLeft,
  Package,
  Store,
  ShoppingCart,
  Heart,
  Compass,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function NotFound() {
  const t = await getTranslations("notFound");

  const quickLinks = [
    {
      href: "/shop",
      icon: Package,
      title: t("quickLinks.shop"),
      description: t("quickLinks.shopDesc"),
    },
    {
      href: "/categories",
      icon: Compass,
      title: t("quickLinks.categories"),
      description: t("quickLinks.categoriesDesc"),
    },
    {
      href: "/vendors",
      icon: Store,
      title: t("quickLinks.vendors"),
      description: t("quickLinks.vendorsDesc"),
    },
    {
      href: "/deals",
      icon: ShoppingCart,
      title: t("quickLinks.deals"),
      description: t("quickLinks.dealsDesc"),
    },
  ];

  const popularCategories = [
    { name: "Electronics", href: "/categories/electronics" },
    { name: "Fashion", href: "/categories/fashion" },
    { name: "Home & Garden", href: "/categories/home-garden" },
    { name: "Sports", href: "/categories/sports" },
    { name: "Beauty", href: "/categories/beauty" },
    { name: "Books", href: "/categories/books" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-muted/50 via-background to-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* 404 Animation */}
              <div className="relative">
                <div className="text-9xl font-bold text-muted-foreground/20 select-none">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <Search className="w-16 h-16 text-primary/50" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("description")}
                </p>
              </div>

              {/* Search Bar */}
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <form className="flex gap-2">
                    <Input
                      type="search"
                      placeholder={t("searchPlaceholder")}
                      className="flex-1"
                    />
                    <Button type="submit">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    {t("buttons.home")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/shop">
                    <Package className="w-4 h-4 mr-2" />
                    {t("buttons.shop")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold">{t("quickLinks.title")}</h2>
                <p className="text-muted-foreground">
                  {t("quickLinks.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.map((link) => (
                  <Card
                    key={link.href}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <Link href={link.href} className="block space-y-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <link.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">{t("categories.title")}</h2>
                <p className="text-muted-foreground">
                  {t("categories.description")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {popularCategories.map((category) => (
                  <Button
                    key={category.href}
                    asChild
                    variant="outline"
                    className="rounded-full"
                  >
                    <Link href={category.href}>{category.name}</Link>
                  </Button>
                ))}
              </div>

              <div className="pt-8">
                <Button asChild>
                  <Link href="/categories">{t("categories.viewAll")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">{t("help.title")}</h2>
                <p className="text-muted-foreground">{t("help.description")}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/help">{t("help.helpCenter")}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">{t("help.contact")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
