"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import {
  ChevronRight,
  ChevronDown,
  Home,
  Grid3X3,
  Store,
  Tag,
  TrendingUp,
  ShoppingCart,
  Heart,
  User,
  Package,
  Settings,
  LogOut,
  Crown,
  Phone,
  HelpCircle,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const t = useTranslations();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { categories, topCategories } = useCategories();

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">EcomStore</span>
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 pb-6">
              {/* User Section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/auth/signin" onClick={onClose}>
                      {t("auth.signin")}
                    </Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/auth/signup" onClick={onClose}>
                      {t("auth.signup")}
                    </Link>
                  </Button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium">{t("nav.cart")}</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                      >
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {t("nav.wishlist")}
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {/* Home */}
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">{t("nav.home")}</span>
                </Link>

                {/* Shop */}
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Grid3X3 className="h-5 w-5" />
                  <span className="font-medium">{t("nav.shop")}</span>
                </Link>

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleCategory("categories")}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Grid3X3 className="h-5 w-5" />
                      <span className="font-medium">{t("nav.categories")}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedCategories.includes("categories")
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {expandedCategories.includes("categories") && (
                    <div className="ml-8 mt-2 space-y-2">
                      {topCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.slug}`}
                          onClick={onClose}
                          className="block p-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        href="/categories"
                        onClick={onClose}
                        className="block p-2 text-sm font-medium text-primary hover:underline"
                      >
                        {t("nav.viewAll")}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Vendors */}
                <Link
                  href="/vendors"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Store className="h-5 w-5" />
                  <span className="font-medium">{t("nav.vendors")}</span>
                </Link>

                {/* Deals */}
                <Link
                  href="/deals"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Tag className="h-5 w-5" />
                  <span className="font-medium">{t("nav.deals")}</span>
                </Link>

                {/* Trending */}
                <Link
                  href="/trending"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">{t("nav.trending")}</span>
                </Link>

                <Separator className="my-4" />

                {/* User Account Links */}
                {isAuthenticated && (
                  <>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">{t("nav.account")}</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Package className="h-5 w-5" />
                      <span className="font-medium">{t("nav.orders")}</span>
                    </Link>

                    {user?.role === "VENDOR" && (
                      <Link
                        href="/vendor/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Store className="h-5 w-5" />
                        <span className="font-medium">
                          {t("nav.vendorDashboard")}
                        </span>
                      </Link>
                    )}

                    {(user?.role === "ADMIN" ||
                      user?.role === "SUPER_ADMIN") && (
                      <Link
                        href="/admin"
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Crown className="h-5 w-5" />
                        <span className="font-medium">{t("nav.admin")}</span>
                      </Link>
                    )}

                    <Link
                      href="/account/settings"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">{t("nav.settings")}</span>
                    </Link>

                    <Separator className="my-4" />
                  </>
                )}

                {/* Support */}
                <Link
                  href="/help"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-medium">{t("nav.help")}</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">{t("nav.contact")}</span>
                </Link>

                {/* Support Info */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>support@ecomstore.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t("footer.hours")}</span>
                  </div>
                </div>

                {isAuthenticated && (
                  <>
                    <Separator className="my-4" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors w-full text-left text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">{t("auth.logout")}</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
