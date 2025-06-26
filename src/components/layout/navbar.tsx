"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Grid3X3,
  Store,
  Tag,
  TrendingUp,
  Zap,
  Gift,
  Smartphone,
  Laptop,
  Shirt,
  Home as HomeIcon,
  Car,
  Heart,
  Camera,
  Gamepad2,
  Baby,
  ChevronRight,
} from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const t = useTranslations();
  const { categories, topCategories, featuredCategories } = useCategories();

  // Group categories by parent for mega menu
  const megaMenuCategories = topCategories.slice(0, 8);

  const categoryIcons: Record<string, any> = {
    electronics: Smartphone,
    computers: Laptop,
    fashion: Shirt,
    home: HomeIcon,
    automotive: Car,
    health: Heart,
    photography: Camera,
    gaming: Gamepad2,
    baby: Baby,
  };

  const quickLinks = [
    {
      href: "/deals",
      label: t("nav.deals"),
      icon: Tag,
      badge: t("nav.hot"),
      badgeVariant: "destructive" as const,
    },
    {
      href: "/new-arrivals",
      label: t("nav.newArrivals"),
      icon: Zap,
      badge: t("nav.new"),
      badgeVariant: "secondary" as const,
    },
    {
      href: "/best-sellers",
      label: t("nav.bestSellers"),
      icon: TrendingUp,
    },
    {
      href: "/gift-cards",
      label: t("nav.giftCards"),
      icon: Gift,
    },
  ];

  return (
    <div className={cn("container py-2", className)}>
      <NavigationMenu className="max-w-full">
        <NavigationMenuList className="flex-wrap justify-start gap-2">
          {/* Categories Mega Menu */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              {t("nav.categories")}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[800px] p-6">
                <div className="grid grid-cols-4 gap-6">
                  {megaMenuCategories.map((category) => {
                    const IconComponent =
                      categoryIcons[category.slug] || Grid3X3;

                    return (
                      <div key={category.id} className="space-y-3">
                        <Link
                          href={`/categories/${category.slug}`}
                          className="flex items-center gap-2 font-medium text-sm hover:text-primary transition-colors"
                        >
                          <IconComponent className="h-4 w-4" />
                          {category.name}
                        </Link>

                        {category.children && category.children.length > 0 && (
                          <ul className="space-y-2">
                            {category.children.slice(0, 5).map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/categories/${child.slug}`}
                                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                            {category.children.length > 5 && (
                              <li>
                                <Link
                                  href={`/categories/${category.slug}`}
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  {t("nav.viewAll")}
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3 text-sm">
                      {t("nav.featured")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {featuredCategories.slice(0, 6).map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Vendors */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="gap-2">
              <Store className="h-4 w-4" />
              {t("nav.vendors")}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[400px] p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">
                      {t("nav.browseVendors")}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/vendors"
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {t("nav.allVendors")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("nav.browseAll")}
                        </div>
                      </Link>
                      <Link
                        href="/vendors/featured"
                        className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {t("nav.featured")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("nav.topRated")}
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">{t("nav.forVendors")}</h4>
                    <div className="space-y-2">
                      <Link
                        href="/become-vendor"
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t("nav.becomeVendor")}
                      </Link>
                      <Link
                        href="/vendor/signin"
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t("nav.vendorPortal")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Quick Links */}
          {quickLinks.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={link.href}
                  className={cn(navigationMenuTriggerStyle(), "gap-2 relative")}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.badge && (
                    <Badge
                      variant={link.badgeVariant || "secondary"}
                      className="ml-1 text-xs px-1 py-0 h-4"
                    >
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}

          {/* Regular Navigation Links */}
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="/shop"
                className={cn(navigationMenuTriggerStyle(), "gap-2")}
              >
                {t("nav.shop")}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="/brands"
                className={cn(navigationMenuTriggerStyle(), "gap-2")}
              >
                {t("nav.brands")}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="/help"
                className={cn(navigationMenuTriggerStyle(), "gap-2")}
              >
                {t("nav.help")}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
