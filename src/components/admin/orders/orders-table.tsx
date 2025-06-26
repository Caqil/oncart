"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrders } from "@/hooks/use-orders";
import { useCurrency } from "@/hooks/use-currency";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from "@/types/order";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  RefreshCw,
  Download,
  Plus,
  Calendar,
  DollarSign,
  Package,
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface OrdersTableProps {
  className?: string;
  vendorId?: string;
  customerId?: string;
  embedded?: boolean;
}

export function OrdersTable({
  className,
  vendorId,
  customerId,
  embedded = false,
}: OrdersTableProps) {
  const t = useTranslations();
  const { formatPriceWithSymbol } = useCurrency();

  const {
    orders,
    isLoading,
    error,
    total,
    hasMore,
    filters,
    setFilters,
    loadMore,
    updateOrder,
    cancelOrder,
    markAsShipped,
    exportOrders,
    refreshOrders,
    searchOrders,
  } = useOrders({ vendorId, customerId });

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchOrders(query);
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const url = await exportOrders();
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsExporting(false);
    }
  };

  // Status badge variants
  const getStatusBadge = (status: OrderStatus) => {
    const variants = {
      [OrderStatus.PENDING]: {
        variant: "secondary" as const,
        color: "text-yellow-600",
      },
      [OrderStatus.CONFIRMED]: {
        variant: "default" as const,
        color: "text-blue-600",
      },
      [OrderStatus.PROCESSING]: {
        variant: "default" as const,
        color: "text-blue-600",
      },
      [OrderStatus.SHIPPED]: {
        variant: "default" as const,
        color: "text-purple-600",
      },
      [OrderStatus.OUT_FOR_DELIVERY]: {
        variant: "default" as const,
        color: "text-purple-600",
      },
      [OrderStatus.DELIVERED]: {
        variant: "default" as const,
        color: "text-green-600",
      },
      [OrderStatus.CANCELLED]: {
        variant: "secondary" as const,
        color: "text-red-600",
      },
      [OrderStatus.REFUNDED]: {
        variant: "secondary" as const,
        color: "text-orange-600",
      },
      [OrderStatus.RETURNED]: {
        variant: "secondary" as const,
        color: "text-orange-600",
      },
      [OrderStatus.FAILED]: {
        variant: "destructive" as const,
        color: "text-red-600",
      },
    };
    return (
      variants[status] || {
        variant: "secondary" as const,
        color: "text-gray-600",
      }
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants = {
      [PaymentStatus.PENDING]: { variant: "secondary" as const, icon: Clock },
      [PaymentStatus.PROCESSING]: { variant: "default" as const, icon: Clock },
      [PaymentStatus.PAID]: { variant: "default" as const, icon: CheckCircle },
      [PaymentStatus.FAILED]: {
        variant: "destructive" as const,
        icon: XCircle,
      },
      [PaymentStatus.CANCELLED]: {
        variant: "secondary" as const,
        icon: XCircle,
      },
      [PaymentStatus.REFUNDED]: {
        variant: "secondary" as const,
        icon: AlertCircle,
      },
      [PaymentStatus.DISPUTED]: {
        variant: "destructive" as const,
        icon: AlertCircle,
      },
    };
    return variants[status] || { variant: "secondary" as const, icon: Clock };
  };

  const formatOrderDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 7 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("admin.orders.title")}
              {total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {total.toLocaleString()}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{t("admin.orders.description")}</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshOrders}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              <span className="hidden sm:inline ml-2">
                {t("common.refresh")}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">
                {t("common.export")}
              </span>
            </Button>

            {!embedded && (
              <Button size="sm" asChild>
                <Link href="/admin/orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.orders.new")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.orders.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({
                  status: value === "all" ? undefined : (value as OrderStatus),
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("admin.orders.filterStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.orders.allStatuses")}
                </SelectItem>
                {Object.values(OrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`admin.orders.status.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus || "all"}
              onValueChange={(value) =>
                setFilters({
                  paymentStatus:
                    value === "all" ? undefined : (value as PaymentStatus),
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("admin.orders.filterPayment")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.orders.allPayments")}
                </SelectItem>
                {Object.values(PaymentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`admin.orders.payment.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              {t("admin.orders.selectedCount", {
                count: selectedOrders.length,
              })}
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm">
                {t("admin.orders.bulkUpdate")}
              </Button>
              <Button variant="outline" size="sm">
                {t("admin.orders.bulkExport")}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={refreshOrders} className="mt-4">
              {t("common.retry")}
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t("admin.orders.noOrders")}
            </p>
            {!embedded && (
              <Button asChild className="mt-4">
                <Link href="/admin/orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("admin.orders.createFirst")}
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.length === orders.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t("admin.orders.orderNumber")}</TableHead>
                  <TableHead>{t("admin.orders.customer")}</TableHead>
                  <TableHead>{t("admin.orders.status")}</TableHead>
                  <TableHead>{t("admin.orders.payment")}</TableHead>
                  <TableHead>{t("admin.orders.total")}</TableHead>
                  <TableHead>{t("admin.orders.date")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const paymentBadge = getPaymentStatusBadge(
                    order.paymentStatus
                  );
                  const PaymentIcon = paymentBadge.icon;

                  return (
                    <TableRow key={order.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOrder(order.id, checked as boolean)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            #{order.orderNumber}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            <span>
                              {order.itemCount} {t("admin.orders.items")}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={order.user?.name} />
                            <AvatarFallback>
                              {order.customer.firstName.charAt(0)}
                              {order.customer.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {order.customer.firstName}{" "}
                              {order.customer.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={statusBadge.variant}
                          className={statusBadge.color}
                        >
                          {t(
                            `admin.orders.status.${order.status.toLowerCase()}`
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PaymentIcon className="h-4 w-4" />
                          <Badge variant={paymentBadge.variant}>
                            {t(
                              `admin.orders.payment.${order.paymentStatus.toLowerCase()}`
                            )}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPriceWithSymbol(order.total)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.currency}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div>{formatOrderDate(order.placedAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.placedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t("common.actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("common.view")}
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </Link>
                            </DropdownMenuItem>

                            {order.status === OrderStatus.CONFIRMED && (
                              <DropdownMenuItem
                                onClick={() => {
                                  // Open shipping modal
                                }}
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                {t("admin.orders.markShipped")}
                              </DropdownMenuItem>
                            )}

                            {order.canCancel && (
                              <DropdownMenuItem
                                onClick={() => cancelOrder(order.id)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t("admin.orders.cancel")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Load More */}
            {hasMore && (
              <div className="p-6 text-center border-t">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {t("common.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
