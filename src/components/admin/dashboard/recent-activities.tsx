"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/hooks/use-currency";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ShoppingCart,
  User,
  Package,
  Store,
  CreditCard,
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  ExternalLink,
  Filter,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata: Record<string, any>;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  entityId?: string;
  entityType?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

enum ActivityType {
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  USER_REGISTERED = "USER_REGISTERED",
  VENDOR_APPLIED = "VENDOR_APPLIED",
  VENDOR_APPROVED = "VENDOR_APPROVED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  REVIEW_SUBMITTED = "REVIEW_SUBMITTED",
  REFUND_REQUESTED = "REFUND_REQUESTED",
  SYSTEM_ERROR = "SYSTEM_ERROR",
  SECURITY_ALERT = "SECURITY_ALERT",
  BACKUP_COMPLETED = "BACKUP_COMPLETED",
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  STOCK_LOW = "STOCK_LOW",
  STOCK_OUT = "STOCK_OUT",
}

interface RecentActivitiesProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
  realtime?: boolean;
}

export function RecentActivities({
  className,
  limit = 20,
  showFilters = true,
  realtime = false,
}: RecentActivitiesProps) {
  const t = useTranslations();
  const { formatPriceWithSymbol } = useCurrency();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ActivityType | "all">("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  useEffect(() => {
    loadActivities();

    // Set up real-time updates if enabled
    if (realtime) {
      const interval = setInterval(loadActivities, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [limit, filterType, filterSeverity]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filterType !== "all" && { type: filterType }),
        ...(filterSeverity !== "all" && { severity: filterSeverity }),
      });

      const response = await fetch(
        `${API_ROUTES.ANALYTICS}/activities?${params}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load activities");
      }

      setActivities(
        data.activities.map((activity: any) => ({
          ...activity,
          createdAt: new Date(activity.createdAt),
          updatedAt: new Date(activity.updatedAt),
        }))
      );
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to load activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    const iconMap = {
      [ActivityType.ORDER_PLACED]: ShoppingCart,
      [ActivityType.ORDER_CANCELLED]: ShoppingCart,
      [ActivityType.PAYMENT_RECEIVED]: CreditCard,
      [ActivityType.PAYMENT_FAILED]: CreditCard,
      [ActivityType.USER_REGISTERED]: User,
      [ActivityType.VENDOR_APPLIED]: Store,
      [ActivityType.VENDOR_APPROVED]: Store,
      [ActivityType.PRODUCT_CREATED]: Package,
      [ActivityType.PRODUCT_UPDATED]: Package,
      [ActivityType.REVIEW_SUBMITTED]: MessageSquare,
      [ActivityType.REFUND_REQUESTED]: CreditCard,
      [ActivityType.SYSTEM_ERROR]: AlertTriangle,
      [ActivityType.SECURITY_ALERT]: AlertTriangle,
      [ActivityType.BACKUP_COMPLETED]: CheckCircle,
      [ActivityType.LOGIN_ATTEMPT]: User,
      [ActivityType.PASSWORD_CHANGED]: User,
      [ActivityType.STOCK_LOW]: Package,
      [ActivityType.STOCK_OUT]: Package,
    };

    return iconMap[type] || Activity;
  };

  const getSeverityColor = (severity: string) => {
    const colorMap = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100",
    };
    return (
      colorMap[severity as keyof typeof colorMap] || "text-gray-600 bg-gray-100"
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary" as const,
      completed: "default" as const,
      failed: "destructive" as const,
      cancelled: "outline" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const formatActivityTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const renderActivityDetails = (activity: ActivityItem) => {
    const { metadata } = activity;

    switch (activity.type) {
      case ActivityType.ORDER_PLACED:
        return (
          <div className="text-sm">
            <span className="font-medium">Order #{metadata.orderNumber}</span>
            {metadata.total && (
              <span className="text-muted-foreground ml-2">
                • {formatPriceWithSymbol(metadata.total)}
              </span>
            )}
          </div>
        );

      case ActivityType.PAYMENT_RECEIVED:
        return (
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              +{formatPriceWithSymbol(metadata.amount)}
            </span>
            {metadata.method && (
              <span className="text-muted-foreground ml-2">
                via {metadata.method}
              </span>
            )}
          </div>
        );

      case ActivityType.VENDOR_APPLIED:
        return (
          <div className="text-sm">
            <span className="font-medium">{metadata.storeName}</span>
            <span className="text-muted-foreground ml-2">
              • {metadata.businessType}
            </span>
          </div>
        );

      case ActivityType.PRODUCT_CREATED:
        return (
          <div className="text-sm">
            <span className="font-medium">{metadata.productName}</span>
            {metadata.price && (
              <span className="text-muted-foreground ml-2">
                • {formatPriceWithSymbol(metadata.price)}
              </span>
            )}
          </div>
        );

      case ActivityType.STOCK_LOW:
      case ActivityType.STOCK_OUT:
        return (
          <div className="text-sm">
            <span className="font-medium">{metadata.productName}</span>
            <span className="text-muted-foreground ml-2">
              • {metadata.quantity} units remaining
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const getActivityLink = (activity: ActivityItem) => {
    const { type, entityId, metadata } = activity;

    switch (type) {
      case ActivityType.ORDER_PLACED:
      case ActivityType.ORDER_CANCELLED:
        return `/admin/orders/${entityId}`;

      case ActivityType.USER_REGISTERED:
        return `/admin/users/${entityId}`;

      case ActivityType.VENDOR_APPLIED:
      case ActivityType.VENDOR_APPROVED:
        return `/admin/vendors/${entityId}`;

      case ActivityType.PRODUCT_CREATED:
      case ActivityType.PRODUCT_UPDATED:
        return `/admin/products/${entityId}`;

      case ActivityType.REVIEW_SUBMITTED:
        return `/admin/products/reviews/${entityId}`;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("dashboard.activities.title")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.activities.description")}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadActivities}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 pt-2">
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as ActivityType | "all")
              }
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">{t("dashboard.activities.allTypes")}</option>
              <option value={ActivityType.ORDER_PLACED}>
                {t("dashboard.activities.orders")}
              </option>
              <option value={ActivityType.USER_REGISTERED}>
                {t("dashboard.activities.users")}
              </option>
              <option value={ActivityType.VENDOR_APPLIED}>
                {t("dashboard.activities.vendors")}
              </option>
              <option value={ActivityType.PRODUCT_CREATED}>
                {t("dashboard.activities.products")}
              </option>
              <option value={ActivityType.SYSTEM_ERROR}>
                {t("dashboard.activities.system")}
              </option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">
                {t("dashboard.activities.allSeverities")}
              </option>
              <option value="low">{t("dashboard.activities.low")}</option>
              <option value="medium">{t("dashboard.activities.medium")}</option>
              <option value="high">{t("dashboard.activities.high")}</option>
              <option value="critical">
                {t("dashboard.activities.critical")}
              </option>
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadActivities}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.retry")}
            </Button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {t("dashboard.activities.noActivities")}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const link = getActivityLink(activity);

                return (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      {/* Activity Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          getSeverityColor(activity.severity)
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">
                                {activity.title}
                              </p>
                              <Badge
                                variant={getStatusBadge(activity.status)}
                                className="text-xs"
                              >
                                {activity.status}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>

                            {renderActivityDetails(activity)}

                            {/* User Info */}
                            {activity.userName && (
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={activity.userAvatar} />
                                  <AvatarFallback className="text-xs">
                                    {activity.userName.substring(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {activity.userName}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatActivityTime(activity.createdAt)}
                            </span>
                            {link && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={link}>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < activities.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* View All Link */}
        {activities.length > 0 && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/activities">
                {t("dashboard.activities.viewAll")}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
