"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Package,
  ShoppingCart,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";

interface ChartData {
  salesOverTime: Array<{
    date: string;
    sales: number;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  topVendors: Array<{
    id: string;
    storeName: string;
    orders: number;
    revenue: number;
    commission: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
    color: string;
  }>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    rate: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    growth: number;
  }>;
  customerGrowth: Array<{
    date: string;
    new: number;
    returning: number;
    total: number;
  }>;
}

interface ChartsProps {
  className?: string;
  period?: "week" | "month" | "quarter" | "year";
}

export function Charts({ className, period = "month" }: ChartsProps) {
  const t = useTranslations();
  const { formatPriceWithSymbol, currentCurrency } = useCurrency();

  const [data, setData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sales");

  useEffect(() => {
    loadChartData();
  }, [period]);

  const loadChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_ROUTES.ANALYTICS}/charts?period=${period}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load chart data");
      }

      setData(result.data);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to load chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return formatPriceWithSymbol(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Color schemes
  const colors = {
    primary: "#2563eb",
    secondary: "#64748b",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0891b2",
  };

  const statusColors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#06b6d4",
    delivered: "#10b981",
    cancelled: "#ef4444",
    refunded: "#8b5cf6",
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {error || t("dashboard.charts.error")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadChartData}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("dashboard.charts.sales")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("dashboard.charts.orders")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("dashboard.charts.products")}
              </span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("dashboard.charts.customers")}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t("dashboard.charts.export")}
            </Button>
            <Button variant="outline" size="sm" onClick={loadChartData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t("dashboard.charts.salesOverTime")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.charts.salesOverTimeDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.salesOverTime}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        name === "revenue"
                          ? formatCurrency(value)
                          : formatNumber(value),
                        name,
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.1}
                      name={t("dashboard.charts.revenue")}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke={colors.success}
                      fill={colors.success}
                      fillOpacity={0.1}
                      name={t("dashboard.charts.orders")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.revenueByCategory")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.revenueByCategoryDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByCategory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        "Revenue",
                      ]}
                    />
                    <Bar dataKey="revenue" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.topVendors")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.topVendorsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topVendors.slice(0, 5).map((vendor, index) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-32">
                            {vendor.storeName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.orders} {t("dashboard.charts.orders")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(vendor.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(vendor.commission)}{" "}
                          {t("dashboard.charts.commission")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Analytics */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.ordersByStatus")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.ordersByStatusDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={(entry) =>
                        `${entry.status} (${entry.percentage}%)`
                      }
                    >
                      {data.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.conversionFunnel")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.conversionFunnelDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {stage.stage}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {formatNumber(stage.count)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatPercentage(stage.rate)}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${stage.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Analytics */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("dashboard.charts.topProducts")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.topProductsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topProducts.slice(0, 10).map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-48">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(product.views)}{" "}
                            {t("dashboard.charts.views")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(product.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} {t("dashboard.charts.sales")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Analytics */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer Growth */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("dashboard.charts.customerGrowth")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.customerGrowthDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.customerGrowth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="new"
                      stroke={colors.success}
                      strokeWidth={2}
                      name={t("dashboard.charts.newCustomers")}
                    />
                    <Line
                      type="monotone"
                      dataKey="returning"
                      stroke={colors.warning}
                      strokeWidth={2}
                      name={t("dashboard.charts.returningCustomers")}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke={colors.primary}
                      strokeWidth={2}
                      name={t("dashboard.charts.totalCustomers")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.charts.trafficSources")}</CardTitle>
                <CardDescription>
                  {t("dashboard.charts.trafficSourcesDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.trafficSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="visitors"
                      label={(entry) =>
                        `${entry.source} (${entry.percentage}%)`
                      }
                    >
                      {data.trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
