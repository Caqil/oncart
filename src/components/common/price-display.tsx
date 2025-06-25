"use client";

import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  showCurrency?: boolean;
  showComparePrice?: boolean;
  comparePrice?: number;
  showDiscount?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "muted" | "primary";
  format?: "full" | "compact" | "symbol-only";
}

export function PriceDisplay({
  amount,
  currency,
  showCurrency = true,
  showComparePrice = true,
  comparePrice,
  showDiscount = true,
  className,
  size = "md",
  variant = "default",
  format = "full",
}: PriceDisplayProps) {
  const { formatPriceWithSymbol, currentCurrency, convertPrice } =
    useCurrency();

  const displayCurrency = currency || currentCurrency?.code || "USD";
  const displayAmount =
    currency !== currentCurrency?.code
      ? convertPrice(amount, currency)
      : amount;
  const displayComparePrice =
    comparePrice && currency !== currentCurrency?.code
      ? convertPrice(comparePrice, currency)
      : comparePrice;

  const hasDiscount =
    displayComparePrice && displayComparePrice > displayAmount;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((displayComparePrice - displayAmount) / displayComparePrice) * 100
      )
    : 0;

  const formatPrice = (price: number) => {
    switch (format) {
      case "compact":
        return formatPriceWithSymbol(price, displayCurrency).replace(
          /\.00$/,
          ""
        );
      case "symbol-only":
        return currentCurrency?.symbol || "$";
      default:
        return formatPriceWithSymbol(price, displayCurrency);
    }
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Main Price */}
      <span
        className={cn(
          "font-semibold",
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        {formatPrice(displayAmount)}
      </span>

      {/* Compare Price */}
      {showComparePrice && hasDiscount && (
        <span
          className={cn(
            "line-through text-muted-foreground",
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {formatPrice(displayComparePrice)}
        </span>
      )}

      {/* Discount Badge */}
      {showDiscount && hasDiscount && (
        <Badge variant="destructive" className="text-xs">
          -{discountPercentage}%
        </Badge>
      )}

      {/* Currency Code */}
      {showCurrency &&
        format === "full" &&
        displayCurrency !== currentCurrency?.code && (
          <span className="text-xs text-muted-foreground">
            {displayCurrency}
          </span>
        )}
    </div>
  );
}
