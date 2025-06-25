"use client";

import { useState } from "react";
import { Check, ChevronDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  variant?: "default" | "compact" | "icon-only";
  align?: "start" | "center" | "end";
  className?: string;
}

export function CurrencySwitcher({
  variant = "default",
  align = "end",
  className,
}: CurrencySwitcherProps) {
  const {
    currencies,
    currentCurrency,
    setCurrency,
    getSupportedCurrencies,
    isLoading,
    lastUpdated,
  } = useCurrency();

  const supportedCurrencies = getSupportedCurrencies();

  if (isLoading || !currentCurrency) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <DollarSign className="h-4 w-4" />
        {variant === "default" && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  const formatCurrencyDisplay = (currency: any) => {
    switch (variant) {
      case "compact":
        return currency.symbol;
      case "icon-only":
        return currency.symbol;
      default:
        return `${currency.symbol} ${currency.code}`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <DollarSign className="h-4 w-4" />
          {variant !== "icon-only" && (
            <>
              <span>{formatCurrencyDisplay(currentCurrency)}</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          Currency
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedCurrencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setCurrency(currency.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{currency.symbol}</span>
              <div>
                <div className="font-medium">{currency.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currency.code}
                </div>
              </div>
            </div>
            {currentCurrency.code === currency.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          Rates updated every hour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
