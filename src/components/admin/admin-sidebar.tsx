"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  CreditCard,
  TruckIcon,
  TicketIcon,
  MessageSquare,
  BarChart3,
  Settings,
  Globe,
  Palette,
  Shield,
  Bell,
  FileText,
  Tag,
  ChevronDown,
  ChevronRight,
  Zap,
  Database,
  Mail,
  Smartphone,
  HelpCircle,
  Activity,
  Download,
  Upload,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: SidebarItem[];
  permissions?: string[];
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({
  isCollapsed = false,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { user, hasPermission } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>(["dashboard"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users & Accounts",
      icon: Users,
      children: [
        {
          title: "All Users",
          href: "/admin/users",
          icon: Users,
          permissions: ["users:read"],
        },
        {
          title: "Customers",
          href: "/admin/users/customers",
          icon: Users,
          permissions: ["users:read"],
        },
        {
          title: "Administrators",
          href: "/admin/users/admins",
          icon: Shield,
          permissions: ["users:manage"],
        },
        {
          title: "User Roles",
          href: "/admin/users/roles",
          icon: Shield,
          permissions: ["users:manage"],
        },
      ],
    },
    {
      title: "Vendors & Stores",
      icon: Store,
      children: [
        {
          title: "All Vendors",
          href: "/admin/vendors",
          icon: Store,
          permissions: ["vendors:read"],
        },
        {
          title: "Pending Approval",
          href: "/admin/vendors/pending",
          icon: Store,
          badge: "5",
          permissions: ["vendors:approve"],
        },
        {
          title: "Vendor Applications",
          href: "/admin/vendors/applications",
          icon: FileText,
          permissions: ["vendors:approve"],
        },
        {
          title: "Store Settings",
          href: "/admin/vendors/stores",
          icon: Settings,
          permissions: ["vendors:read"],
        },
      ],
    },
    {
      title: "Products & Catalog",
      icon: Package,
      children: [
        {
          title: "All Products",
          href: "/admin/products",
          icon: Package,
          permissions: ["products:read"],
        },
        {
          title: "Product Reviews",
          href: "/admin/products/reviews",
          icon: MessageSquare,
          badge: "12",
          permissions: ["products:read"],
        },
        {
          title: "Categories",
          href: "/admin/products/categories",
          icon: Tag,
          permissions: ["products:read"],
        },
        {
          title: "Brands",
          href: "/admin/products/brands",
          icon: Tag,
          permissions: ["products:read"],
        },
        {
          title: "Inventory",
          href: "/admin/products/inventory",
          icon: Database,
          permissions: ["products:read"],
        },
        {
          title: "Import/Export",
          href: "/admin/products/import-export",
          icon: Upload,
          permissions: ["products:write"],
        },
      ],
    },
    {
      title: "Orders & Fulfillment",
      icon: ShoppingCart,
      children: [
        {
          title: "All Orders",
          href: "/admin/orders",
          icon: ShoppingCart,
          permissions: ["orders:read"],
        },
        {
          title: "Pending Orders",
          href: "/admin/orders/pending",
          icon: ShoppingCart,
          badge: "8",
          permissions: ["orders:read"],
        },
        {
          title: "Returns & Refunds",
          href: "/admin/orders/returns",
          icon: ShoppingCart,
          permissions: ["orders:read"],
        },
        {
          title: "Shipping",
          href: "/admin/orders/shipping",
          icon: TruckIcon,
          permissions: ["orders:read"],
        },
      ],
    },
    {
      title: "Payments & Finance",
      icon: CreditCard,
      children: [
        {
          title: "Transactions",
          href: "/admin/payments/transactions",
          icon: CreditCard,
          permissions: ["payments:read"],
        },
        {
          title: "Payment Methods",
          href: "/admin/payments/methods",
          icon: CreditCard,
          permissions: ["payments:read"],
        },
        {
          title: "Vendor Payouts",
          href: "/admin/payments/payouts",
          icon: CreditCard,
          permissions: ["payments:read"],
        },
        {
          title: "Commission",
          href: "/admin/payments/commission",
          icon: CreditCard,
          permissions: ["payments:read"],
        },
        {
          title: "Tax Settings",
          href: "/admin/payments/tax",
          icon: FileText,
          permissions: ["payments:manage"],
        },
      ],
    },
    {
      title: "Marketing & Promotions",
      icon: TicketIcon,
      children: [
        {
          title: "Coupons",
          href: "/admin/marketing/coupons",
          icon: TicketIcon,
          permissions: ["marketing:read"],
        },
        {
          title: "Campaigns",
          href: "/admin/marketing/campaigns",
          icon: Zap,
          permissions: ["marketing:read"],
        },
        {
          title: "Email Marketing",
          href: "/admin/marketing/email",
          icon: Mail,
          permissions: ["marketing:read"],
        },
        {
          title: "Push Notifications",
          href: "/admin/marketing/push",
          icon: Smartphone,
          permissions: ["marketing:read"],
        },
        {
          title: "Banners & Ads",
          href: "/admin/marketing/banners",
          icon: FileText,
          permissions: ["marketing:read"],
        },
      ],
    },
    {
      title: "Analytics & Reports",
      icon: BarChart3,
      children: [
        {
          title: "Sales Reports",
          href: "/admin/analytics/sales",
          icon: BarChart3,
          permissions: ["analytics:read"],
        },
        {
          title: "User Analytics",
          href: "/admin/analytics/users",
          icon: Users,
          permissions: ["analytics:read"],
        },
        {
          title: "Product Performance",
          href: "/admin/analytics/products",
          icon: Package,
          permissions: ["analytics:read"],
        },
        {
          title: "Traffic Reports",
          href: "/admin/analytics/traffic",
          icon: Activity,
          permissions: ["analytics:read"],
        },
        {
          title: "Export Data",
          href: "/admin/analytics/export",
          icon: Download,
          permissions: ["analytics:read"],
        },
      ],
    },
    {
      title: "Settings & Configuration",
      icon: Settings,
      children: [
        {
          title: "General Settings",
          href: "/admin/settings/general",
          icon: Settings,
          permissions: ["settings:read"],
        },
        {
          title: "Localization",
          href: "/admin/settings/localization",
          icon: Globe,
          permissions: ["settings:read"],
        },
        {
          title: "Theme & Appearance",
          href: "/admin/settings/theme",
          icon: Palette,
          permissions: ["settings:read"],
        },
        {
          title: "Security",
          href: "/admin/settings/security",
          icon: Shield,
          permissions: ["settings:read"],
        },
        {
          title: "Notifications",
          href: "/admin/settings/notifications",
          icon: Bell,
          permissions: ["settings:read"],
        },
        {
          title: "API Keys",
          href: "/admin/settings/api",
          icon: Database,
          permissions: ["settings:manage"],
        },
        {
          title: "System Status",
          href: "/admin/settings/system",
          icon: Activity,
          permissions: ["system:manage"],
        },
      ],
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      children: [
        {
          title: "Documentation",
          href: "/admin/help/docs",
          icon: FileText,
        },
        {
          title: "Support Tickets",
          href: "/admin/help/tickets",
          icon: MessageSquare,
          permissions: ["support:read"],
        },
        {
          title: "System Logs",
          href: "/admin/help/logs",
          icon: FileText,
          permissions: ["system:manage"],
        },
      ],
    },
  ];

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive =
      pathname === item.href ||
      (item.children && item.children.some((child) => pathname === child.href));
    const hasAccess =
      !item.permissions ||
      item.permissions.some((permission) => hasPermission(permission));

    if (!hasAccess) return null;

    if (item.children) {
      const sectionKey = item.title.toLowerCase().replace(/\s+/g, "-");
      const isOpen = openSections.includes(sectionKey);

      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleSection(sectionKey)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-10",
                level > 0 && "pl-8",
                isActive && "bg-accent text-accent-foreground",
                isCollapsed && "px-2 justify-center"
              )}
            >
              <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!isCollapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children.map((child) =>
                renderSidebarItem(child, level + 1)
              )}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 h-10",
          level > 0 && "pl-8",
          isActive && "bg-accent text-accent-foreground",
          isCollapsed && "px-2 justify-center"
        )}
        asChild
      >
        <Link href={item.href!}>
          <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                A
              </span>
            </div>
            <span className="font-semibold">Admin Panel</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <div className="space-y-1 px-2">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
