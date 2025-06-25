"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Pause,
  PlayCircle,
  StopCircle,
  Truck,
  Package,
  CreditCard,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  type?: "order" | "payment" | "user" | "product" | "vendor" | "generic";
}

export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  showIcon = true,
  className,
  type = "generic",
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, "-");

    // Order statuses
    if (type === "order") {
      switch (normalizedStatus) {
        case "pending":
          return {
            label: "Pending",
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: Clock,
          };
        case "confirmed":
        case "processing":
          return {
            label: "Processing",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: PlayCircle,
          };
        case "shipped":
        case "in-transit":
          return {
            label: "Shipped",
            color: "bg-purple-100 text-purple-800 border-purple-200",
            icon: Truck,
          };
        case "delivered":
        case "completed":
          return {
            label: "Delivered",
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
          };
        case "cancelled":
        case "canceled":
          return {
            label: "Cancelled",
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
          };
        case "returned":
        case "refunded":
          return {
            label: "Returned",
            color: "bg-orange-100 text-orange-800 border-orange-200",
            icon: Package,
          };
        default:
          return {
            label: status,
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: AlertCircle,
          };
      }
    }

    // Payment statuses
    if (type === "payment") {
      switch (normalizedStatus) {
        case "pending":
          return {
            label: "Pending",
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: Clock,
          };
        case "processing":
          return {
            label: "Processing",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: CreditCard,
          };
        case "completed":
        case "paid":
        case "success":
          return {
            label: "Paid",
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
          };
        case "failed":
        case "declined":
          return {
            label: "Failed",
            color: "bg-red-100 text-red-800 border-red-200",
            icon: XCircle,
          };
        case "refunded":
          return {
            label: "Refunded",
            color: "bg-orange-100 text-orange-800 border-orange-200",
            icon: Package,
          };
        default:
          return {
            label: status,
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: CreditCard,
          };
      }
    }

    // User statuses
    if (type === "user") {
      switch (normalizedStatus) {
        case "active":
          return {
            label: "Active",
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle,
          };
        case "inactive":
          return {
            label: "Inactive",
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: Pause,
          };
        case "suspended":
        case "banned":
          return {
            label: "Suspended",
            color: "bg-red-100 text-red-800 border-red-200",
            icon: StopCircle,
          };
        case "pending":
          return {
            label: "Pending",
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: Clock,
          };
        default:
          return {
            label: status,
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: AlertCircle,
          };
      }
    }

    // Generic fallback
    switch (normalizedStatus) {
      case "active":
      case "enabled":
      case "published":
      case "approved":
        return {
          label: status,
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "inactive":
      case "disabled":
      case "draft":
      case "paused":
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Pause,
        };
      case "pending":
      case "review":
        return {
          label: status,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        };
      case "rejected":
      case "failed":
      case "error":
        return {
          label: status,
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1.5",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        sizeClasses[size],
        variant === "default" ? config.color : "border",
        "inline-flex items-center gap-1 font-medium",
        className
      )}
    >
      {showIcon && <Icon className={iconSizeClasses[size]} />}
      {config.label}
    </Badge>
  );
}
