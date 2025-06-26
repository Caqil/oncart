"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Home,
  Grid3X3,
  Store,
  Tag,
  TrendingUp,
  Heart,
  ShoppingCart,
  User,
  Package,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Crown,
  Filter,
  DollarSign,
  Star,
  MapPin,
  Calendar,
} from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

interface StoreSidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function StoreSidebar({ className, children }: StoreSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { categories, topCategories } = useCategories();

  const mainNavigation = [
    {
      title: t("nav.home"),
      url: "/",
      icon: Home,
    },
    {
      title: t("nav.shop"),
      url: "/shop",
      icon: Grid3X3,
    },
    {
      title: t("nav.categories"),
      url: "/categories",
      icon: Grid3X3,
      items: topCategories.map((cat) => ({
        title: cat.name,
        url: `/categories/${cat.slug}`,
        badge: cat.productCount > 0 ? cat.productCount.toString() : undefined,
      })),
    },
    {
      title: t("nav.vendors"),
      url: "/vendors",
      icon: Store,
    },
    {
      title: t("nav.deals"),
      url: "/deals",
      icon: Tag,
      badge: "Hot",
      badgeVariant: "destructive" as const,
    },
    {
      title: t("nav.trending"),
      url: "/trending",
      icon: TrendingUp,
    },
  ];

  const userNavigation = isAuthenticated
    ? [
        {
          title: t("nav.account"),
          url: "/account",
          icon: User,
        },
        {
          title: t("nav.orders"),
          url: "/account/orders",
          icon: Package,
        },
        {
          title: t("nav.wishlist"),
          url: "/wishlist",
          icon: Heart,
        },
        {
          title: t("nav.cart"),
          url: "/cart",
          icon: ShoppingCart,
        },
        {
          title: t("nav.settings"),
          url: "/account/settings",
          icon: Settings,
        },
      ]
    : [];

  const adminNavigation =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? [
          {
            title: t("nav.admin"),
            url: "/admin",
            icon: Crown,
          },
        ]
      : [];

  const vendorNavigation =
    user?.role === "VENDOR"
      ? [
          {
            title: t("nav.vendorDashboard"),
            url: "/vendor/dashboard",
            icon: Store,
          },
        ]
      : [];

  const supportNavigation = [
    {
      title: t("nav.help"),
      url: "/help",
      icon: HelpCircle,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <Sidebar className={cn("border-r", className)}>
        <SidebarHeader className="border-b p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">EcomStore</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.browse")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.items ? (
                      <Collapsible className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full justify-between",
                              pathname.startsWith(item.url) && "bg-accent"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link
                                    href={subItem.url}
                                    className={cn(
                                      "flex items-center justify-between",
                                      pathname === subItem.url && "bg-accent"
                                    )}
                                  >
                                    <span>{subItem.title}</span>
                                    {subItem.badge && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center justify-between",
                            pathname === item.url && "bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || "secondary"}
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* User Navigation */}
          {isAuthenticated && userNavigation.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav.account")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center gap-2",
                            pathname === item.url && "bg-accent"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Vendor Navigation */}
          {vendorNavigation.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav.vendor")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {vendorNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center gap-2",
                            pathname.startsWith(item.url) && "bg-accent"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin Navigation */}
          {adminNavigation.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>{t("nav.admin")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex items-center gap-2",
                            pathname.startsWith(item.url) && "bg-accent"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Support Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>{t("nav.support")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportNavigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-2",
                          pathname === item.url && "bg-accent"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Shopping Filters (for shop/category pages) */}
          {(pathname.startsWith("/shop") ||
            pathname.startsWith("/categories")) && (
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("shop.filters")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-4 p-4">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t("shop.priceRange")}
                    </h4>
                    <div className="space-y-2">
                      {[
                        "Under $25",
                        "$25 - $50",
                        "$50 - $100",
                        "$100 - $250",
                        "Over $250",
                      ].map((range) => (
                        <label
                          key={range}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input type="checkbox" className="rounded" />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t("shop.rating")}
                    </h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input type="checkbox" className="rounded" />
                          <div className="flex items-center gap-1">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                            <span>& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("shop.location")}
                    </h4>
                    <div className="space-y-2">
                      {[
                        "Local (Same City)",
                        "Same State",
                        "Same Country",
                        "International",
                      ].map((location) => (
                        <label
                          key={location}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input type="checkbox" className="rounded" />
                          <span>{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("shop.availability")}
                    </h4>
                    <div className="space-y-2">
                      {[
                        "In Stock",
                        "Ships Today",
                        "On Sale",
                        "Free Shipping",
                      ].map((availability) => (
                        <label
                          key={availability}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input type="checkbox" className="rounded" />
                          <span>{availability}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("auth.logout")}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">{t("auth.signin")}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signup">{t("auth.signup")}</Link>
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      {children && (
        <main className="flex-1 overflow-hidden">
          <div className="border-b p-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      )}
    </SidebarProvider>
  );
}
