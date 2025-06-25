import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Currency, ExchangeRate, CurrencyCalculation } from '@/types/currency';
import { API_ROUTES } from '@/lib/constants';
import { useLocalStorage } from './use-local-storage';

interface UseCurrencyReturn {
  currencies: Currency[];
  currentCurrency: Currency;
  exchangeRates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  setCurrency: (currencyCode: string) => void;
  convertPrice: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  formatPrice: (amount: number, currencyCode?: string) => string;
  formatPriceWithSymbol: (amount: number, currencyCode?: string) => string;
  getExchangeRate: (fromCurrency: string, toCurrency: string) => number;
  refreshRates: () => Promise<void>;
  calculate: (amount: number, fromCurrency: string, toCurrency: string) => CurrencyCalculation;
  getSupportedCurrencies: () => Currency[];
  isValidCurrency: (code: string) => boolean;
}

export function useCurrency(): UseCurrencyReturn {
  const [selectedCurrency, setSelectedCurrency] = useLocalStorage<string>('currency', 'USD');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load currencies and exchange rates on mount
  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, []);

  const loadCurrencies = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${API_ROUTES.SETTINGS}/currencies`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load currencies');
      }

      setCurrencies(data.currencies);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load currencies:', error);
    }
  }, []);

  const loadExchangeRates = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ROUTES.SETTINGS}/exchange-rates`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load exchange rates');
      }

      setExchangeRates(data.rates);
      setLastUpdated(new Date(data.lastUpdated));
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrency = useCallback((currencyCode: string): void => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency && currency.isActive) {
      setSelectedCurrency(currencyCode);
    } else {
      toast.error('Invalid or inactive currency');
    }
  }, [currencies, setSelectedCurrency]);

  const getExchangeRate = useCallback((fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return 1;

    const rate = exchangeRates.find(r => 
      r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );

    if (rate) return rate.rate;

    // Try reverse rate
    const reverseRate = exchangeRates.find(r => 
      r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
    );

    if (reverseRate) return 1 / reverseRate.rate;

    // Fallback to USD conversion
    const fromToUsd = exchangeRates.find(r => 
      r.fromCurrency === fromCurrency && r.toCurrency === 'USD'
    );
    const usdToTarget = exchangeRates.find(r => 
      r.fromCurrency === 'USD' && r.toCurrency === toCurrency
    );

    if (fromToUsd && usdToTarget) {
      return fromToUsd.rate * usdToTarget.rate;
    }

    console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    return 1;
  }, [exchangeRates]);

  const convertPrice = useCallback((
    amount: number, 
    fromCurrency: string = 'USD', 
    toCurrency?: string
  ): number => {
    const targetCurrency = toCurrency || selectedCurrency;
    const rate = getExchangeRate(fromCurrency, targetCurrency);
    return Math.round((amount * rate) * 100) / 100;
  }, [selectedCurrency, getExchangeRate]);

  const formatPrice = useCallback((amount: number, currencyCode?: string): string => {
    const currency = currencies.find(c => c.code === (currencyCode || selectedCurrency));
    if (!currency) return amount.toString();

    const convertedAmount = currencyCode ? amount : convertPrice(amount, 'USD', currencyCode);
    
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });

    return formatter.format(convertedAmount);
  }, [currencies, selectedCurrency, convertPrice]);

  const formatPriceWithSymbol = useCallback((amount: number, currencyCode?: string): string => {
    const currency = currencies.find(c => c.code === (currencyCode || selectedCurrency));
    if (!currency) return amount.toString();

    const formattedAmount = formatPrice(amount, currencyCode);
    
    return currency.symbolPosition === 'before' 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount}${currency.symbol}`;
  }, [currencies, selectedCurrency, formatPrice]);

  const refreshRates = useCallback(async (): Promise<void> => {
    await loadExchangeRates();
    toast.success('Exchange rates updated');
  }, [loadExchangeRates]);

  const calculate = useCallback((
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): CurrencyCalculation => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;
    const fees = 0; // Implement fee calculation if needed
    const total = convertedAmount + fees;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      convertedCurrency: toCurrency,
      exchangeRate: rate,
      fees,
      total,
      calculation: `${amount} ${fromCurrency} × ${rate} = ${convertedAmount} ${toCurrency}`,
    };
  }, [getExchangeRate]);

  const getSupportedCurrencies = useCallback((): Currency[] => {
    return currencies.filter(c => c.isActive);
  }, [currencies]);

  const isValidCurrency = useCallback((code: string): boolean => {
    return currencies.some(c => c.code === code && c.isActive);
  }, [currencies]);

  const currentCurrency = useMemo(() => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  }, [currencies, selectedCurrency]);

  return {
    currencies,
    currentCurrency,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    setCurrency,
    convertPrice,
    formatPrice,
    formatPriceWithSymbol,
    getExchangeRate,
    refreshRates,
    calculate,
    getSupportedCurrencies,
    isValidCurrency,
  };
}