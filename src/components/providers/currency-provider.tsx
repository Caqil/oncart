"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { Currency, ExchangeRate } from "@/types/currency";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency;
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  setCurrency: (currencyCode: string) => void;
  convertPrice: (
    amount: number,
    fromCurrency?: string,
    toCurrency?: string
  ) => number;
  formatPrice: (amount: number, currencyCode?: string) => string;
  getExchangeRate: (fromCurrency: string, toCurrency: string) => number;
  refreshRates: () => Promise<void>;
  getSupportedCurrencies: () => Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const defaultCurrency: Currency = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  symbolPosition: "before",
  decimalPlaces: 2,
  thousandsSeparator: ",",
  decimalSeparator: ".",
  rounding: "NONE",
  format: {
    positive: "{symbol}{amount}",
    negative: "-{symbol}{amount}",
    zero: "{symbol}0",
  },
  countries: ["US"],
  isActive: true,
  isDefault: true,
  exchangeRate: 1,
  lastUpdated: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([defaultCurrency]);
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage<string>(
    "currency",
    "USD"
  );
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load currencies on mount
  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, []);

  // Auto-refresh rates every hour
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshRates();
      },
      60 * 60 * 1000
    ); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const loadCurrencies = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/currencies");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load currencies");
      }

      setCurrencies(data.currencies);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to load currencies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadExchangeRates = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/currencies/exchange-rates");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load exchange rates");
      }

      setExchangeRates(data.rates);
      setLastUpdated(new Date(data.lastUpdated));
    } catch (error: any) {
      console.error("Failed to load exchange rates:", error);
    }
  }, []);

  const setCurrency = useCallback(
    (currencyCode: string): void => {
      const currency = currencies.find(
        (c) => c.code === currencyCode && c.isActive
      );

      if (currency) {
        setSelectedCurrency(currencyCode);
        toast.success(`Currency changed to ${currency.name}`);
      } else {
        toast.error("Invalid or inactive currency");
      }
    },
    [currencies, setSelectedCurrency]
  );

  const getExchangeRate = useCallback(
    (fromCurrency: string, toCurrency: string): number => {
      if (fromCurrency === toCurrency) return 1;

      const rate = exchangeRates.find(
        (r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
      );

      if (rate) return rate.rate;

      // Try reverse rate
      const reverseRate = exchangeRates.find(
        (r) => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
      );

      if (reverseRate) return 1 / reverseRate.rate;

      // Fallback to USD conversion
      const fromToUSD = exchangeRates.find(
        (r) => r.fromCurrency === fromCurrency && r.toCurrency === "USD"
      );
      const usdToTarget = exchangeRates.find(
        (r) => r.fromCurrency === "USD" && r.toCurrency === toCurrency
      );

      if (fromToUSD && usdToTarget) {
        return fromToUSD.rate * usdToTarget.rate;
      }

      return 1; // Fallback
    },
    [exchangeRates]
  );

  const convertPrice = useCallback(
    (
      amount: number,
      fromCurrency: string = "USD",
      toCurrency?: string
    ): number => {
      const targetCurrency = toCurrency || selectedCurrency;
      const rate = getExchangeRate(fromCurrency, targetCurrency);
      return amount * rate;
    },
    [selectedCurrency, getExchangeRate]
  );

  const formatPrice = useCallback(
    (amount: number, currencyCode?: string): string => {
      const currency =
        currencies.find((c) => c.code === (currencyCode || selectedCurrency)) ||
        defaultCurrency;

      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
      });

      try {
        return formatter.format(amount);
      } catch (error) {
        // Fallback for unsupported currencies
        const formattedAmount = amount.toFixed(currency.decimalPlaces);
        return currency.symbolPosition === "before"
          ? `${currency.symbol}${formattedAmount}`
          : `${formattedAmount}${currency.symbol}`;
      }
    },
    [currencies, selectedCurrency]
  );

  const refreshRates = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/currencies/exchange-rates/refresh", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to refresh exchange rates");
      }

      setExchangeRates(data.rates);
      setLastUpdated(new Date());
      toast.success("Exchange rates updated");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message || "Failed to refresh exchange rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSupportedCurrencies = useCallback((): Currency[] => {
    return currencies.filter((currency) => currency.isActive);
  }, [currencies]);

  const currentCurrency =
    currencies.find((c) => c.code === selectedCurrency) || defaultCurrency;

  const value: CurrencyContextType = {
    currencies,
    currentCurrency,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    setCurrency,
    convertPrice,
    formatPrice,
    getExchangeRate,
    refreshRates,
    getSupportedCurrencies,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
