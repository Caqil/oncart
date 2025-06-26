"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Store,
  CreditCard,
  Activity,
  Eye,
  Heart,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    currency: string;
  };
  orders: {
    total: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    pending: number;
    processing: number;
    completed: number;
  };
  customers: {
    total: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    active: number;
    returning: number;
  };
  products: {
    total: number;
    published: number;
    draft: number;
    outOfStock: number;
    lowStock: number;
    pending: number;
  };
  vendors: {
    total: number;
    active: number;
    pending: number;
    verified: number;
    growth: number;
  };
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
    growth: number;
  };
  conversions: {
    rate: number;
    value: number;
    abandoned: number;
    growth: number;
  };
}

interface StatsCardsProps {
  className?: string;
  period?: "today" | "week" | "month" | "year";
  onPeriodChange?: (period: string) => void;
}

export function StatsCards({
  className,
  period = "month",
  onPeriodChange,
}: StatsCardsProps) {
  const t = useTranslations();
  const { formatPriceWithSymbol } = useCurrency();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_ROUTES.ANALYTICS}/dashboard?period=${period}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dashboard stats");
      }

      setStats(data.stats);
      setLastUpdated(new Date());
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={cn("flex items-center gap-1 text-sm", colorClass)}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
      >
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {error || t("dashboard.stats.error")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStats}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: t("dashboard.stats.revenue"),
      value: formatPriceWithSymbol(stats.revenue.total),
      change: formatGrowth(stats.revenue.growth),
      icon: DollarSign,
      description: t("dashboard.stats.revenueDesc", {
        period: t(`dashboard.periods.${period}`),
      }),
      trend: stats.revenue.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.today"),
          value: formatPriceWithSymbol(stats.revenue.today),
        },
        {
          label: t("dashboard.stats.thisMonth"),
          value: formatPriceWithSymbol(stats.revenue.thisMonth),
        },
      ],
    },
    {
      title: t("dashboard.stats.orders"),
      value: stats.orders.total.toLocaleString(),
      change: formatGrowth(stats.orders.growth),
      icon: ShoppingCart,
      description: t("dashboard.stats.ordersDesc"),
      trend: stats.orders.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.pending"),
          value: stats.orders.pending.toString(),
        },
        {
          label: t("dashboard.stats.completed"),
          value: stats.orders.completed.toString(),
        },
      ],
      badges:
        stats.orders.pending > 0
          ? [
              {
                text: `${stats.orders.pending} ${t("dashboard.stats.pending")}`,
                variant: "secondary" as const,
              },
            ]
          : undefined,
    },
    {
      title: t("dashboard.stats.customers"),
      value: stats.customers.total.toLocaleString(),
      change: formatGrowth(stats.customers.growth),
      icon: Users,
      description: t("dashboard.stats.customersDesc"),
      trend: stats.customers.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.active"),
          value: stats.customers.active.toString(),
        },
        {
          label: t("dashboard.stats.returning"),
          value: stats.customers.returning.toString(),
        },
      ],
    },
    {
      title: t("dashboard.stats.products"),
      value: stats.products.total.toLocaleString(),
      change: null,
      icon: Package,
      description: t("dashboard.stats.productsDesc"),
      trend: "neutral" as const,
      details: [
        {
          label: t("dashboard.stats.published"),
          value: stats.products.published.toString(),
        },
        {
          label: t("dashboard.stats.draft"),
          value: stats.products.draft.toString(),
        },
      ],
      badges: [
        ...(stats.products.outOfStock > 0
          ? [
              {
                text: `${stats.products.outOfStock} ${t("dashboard.stats.outOfStock")}`,
                variant: "destructive" as const,
              },
            ]
          : []),
        ...(stats.products.lowStock > 0
          ? [
              {
                text: `${stats.products.lowStock} ${t("dashboard.stats.lowStock")}`,
                variant: "secondary" as const,
              },
            ]
          : []),
        ...(stats.products.pending > 0
          ? [
              {
                text: `${stats.products.pending} ${t("dashboard.stats.pending")}`,
                variant: "outline" as const,
              },
            ]
          : []),
      ],
    },
    {
      title: t("dashboard.stats.vendors"),
      value: stats.vendors.total.toLocaleString(),
      change: formatGrowth(stats.vendors.growth),
      icon: Store,
      description: t("dashboard.stats.vendorsDesc"),
      trend: stats.vendors.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.active"),
          value: stats.vendors.active.toString(),
        },
        {
          label: t("dashboard.stats.verified"),
          value: stats.vendors.verified.toString(),
        },
      ],
      badges:
        stats.vendors.pending > 0
          ? [
              {
                text: `${stats.vendors.pending} ${t("dashboard.stats.pending")}`,
                variant: "secondary" as const,
              },
            ]
          : undefined,
    },
    {
      title: t("dashboard.stats.traffic"),
      value: stats.traffic.totalViews.toLocaleString(),
      change: formatGrowth(stats.traffic.growth),
      icon: Eye,
      description: t("dashboard.stats.trafficDesc"),
      trend: stats.traffic.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.visitors"),
          value: stats.traffic.uniqueVisitors.toLocaleString(),
        },
        {
          label: t("dashboard.stats.bounceRate"),
          value: `${stats.traffic.bounceRate.toFixed(1)}%`,
        },
      ],
    },
    {
      title: t("dashboard.stats.conversions"),
      value: `${stats.conversions.rate.toFixed(2)}%`,
      change: formatGrowth(stats.conversions.growth),
      icon: Activity,
      description: t("dashboard.stats.conversionsDesc"),
      trend: stats.conversions.growth >= 0 ? "up" : "down",
      details: [
        {
          label: t("dashboard.stats.conversionValue"),
          value: formatPriceWithSymbol(stats.conversions.value),
        },
        {
          label: t("dashboard.stats.abandoned"),
          value: stats.conversions.abandoned.toString(),
        },
      ],
    },
    {
      title: t("dashboard.stats.avgSessionDuration"),
      value: formatDuration(stats.traffic.averageSessionDuration),
      change: null,
      icon: Activity,
      description: t("dashboard.stats.sessionDesc"),
      trend: "neutral" as const,
      details: [
        {
          label: t("dashboard.stats.bounceRate"),
          value: `${stats.traffic.bounceRate.toFixed(1)}%`,
        },
        {
          label: t("dashboard.stats.visitors"),
          value: stats.traffic.uniqueVisitors.toLocaleString(),
        },
      ],
    },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t("dashboard.stats.title")}</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              {t("dashboard.stats.lastUpdated", {
                time: lastUpdated.toLocaleTimeString(),
              })}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={loadStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-md",
              card.trend === "up" && "border-l-4 border-l-green-500",
              card.trend === "down" && "border-l-4 border-l-red-500"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon
                className={cn(
                  "h-4 w-4",
                  card.trend === "up" && "text-green-600",
                  card.trend === "down" && "text-red-600",
                  card.trend === "neutral" && "text-muted-foreground"
                )}
              />
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change}
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {card.description}
              </p>

              {/* Details */}
              {card.details && (
                <div className="space-y-1 mb-3">
                  {card.details.map((detail, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {detail.label}:
                      </span>
                      <span className="font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {card.badges && card.badges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.badges.map((badge, i) => (
                    <Badge key={i} variant={badge.variant} className="text-xs">
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
