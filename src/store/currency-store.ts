import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Currency,
  CurrencyConversion,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  PriceDisplay,
  CurrencyDisplayOptions,
  CurrencyPreferences,
  ExchangeRate,
} from '@/types/currency';

interface CurrencyState {
  // Current currency selection
  currentCurrency: string;
  availableCurrencies: Currency[];
  exchangeRates: Record<string, ExchangeRate>;
  
  // User preferences
  preferences: CurrencyPreferences;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface CurrencyStore extends CurrencyState {
  // Currency selection
  setCurrency: (currencyCode: string) => Promise<void>;
  switchCurrency: (currencyCode: string) => void;
  
  // Currency data management
  loadCurrencies: () => Promise<void>;
  loadExchangeRates: () => Promise<void>;
  refreshExchangeRates: () => Promise<void>;
  
  // Conversion utilities
  convertPrice: (amount: number, fromCurrency: string, toCurrency?: string) => Promise<CurrencyConversion>;
  convertPriceSync: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatPrice: (amount: number, currency?: string, options?: Partial<CurrencyDisplayOptions>) => string;
  getPriceDisplay: (amount: number, currency?: string, options?: Partial<CurrencyDisplayOptions>) => PriceDisplay;
  
  // Multi-currency pricing
  getMultiCurrencyPrices: (baseAmount: number, baseCurrency: string, targetCurrencies?: string[]) => Array<{
    currency: string;
    amount: number;
    formatted: string;
  }>;
  
  // Currency information
  getCurrency: (code: string) => Currency | undefined;
  getExchangeRate: (fromCurrency: string, toCurrency: string) => number;
  getSupportedCurrencies: () => Currency[];
  getPopularCurrencies: () => Currency[];
  
  // Auto-detection
  detectUserCurrency: () => Promise<string>;
  
  // Preferences management
  updatePreferences: (preferences: Partial<CurrencyPreferences>) => void;
  
  // Utilities
  isValidCurrency: (code: string) => boolean;
  getCurrencySymbol: (code: string) => string;
  getCurrencyName: (code: string) => string;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultPreferences: CurrencyPreferences = {
  userId: '',
  preferredCurrency: 'USD',
  autoConvert: true,
  showComparisonPrices: false,
  comparisonCurrencies: [],
  notifications: {
    rateAlerts: false,
    significantChanges: false,
    threshold: 5,
  },
  updatedAt: new Date(),
};

const initialState: CurrencyState = {
  currentCurrency: 'USD',
  availableCurrencies: [],
  exchangeRates: {},
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Set currency and persist preference
      setCurrency: async (currencyCode: string) => {
        const isValid = get().isValidCurrency(currencyCode);
        if (!isValid) {
          throw new Error(`Invalid currency code: ${currencyCode}`);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Save preference to server if user is authenticated
          const response = await fetch('/api/user/currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currency: currencyCode }),
          });
          
          if (!response.ok && response.status !== 401) {
            console.warn('Failed to save currency preference to server');
          }
          
          set((state) => ({
            currentCurrency: currencyCode,
            preferences: {
              ...state.preferences,
              preferredCurrency: currencyCode,
              updatedAt: new Date(),
            },
            isLoading: false,
          }));
          
        } catch (error) {
          // Even if server update fails, update locally
          set((state) => ({
            currentCurrency: currencyCode,
            preferences: {
              ...state.preferences,
              preferredCurrency: currencyCode,
              updatedAt: new Date(),
            },
            isLoading: false,
            error: null, // Don't show error for offline usage
          }));
        }
      },
      
      // Quick currency switch (local only)
      switchCurrency: (currencyCode: string) => {
        const isValid = get().isValidCurrency(currencyCode);
        if (!isValid) {
          console.warn(`Invalid currency code: ${currencyCode}`);
          return;
        }
        
        set({ currentCurrency: currencyCode });
      },
      
      // Load available currencies
      loadCurrencies: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/currencies');
          
          if (!response.ok) {
            throw new Error('Failed to load currencies');
          }
          
          const currencies: Currency[] = await response.json();
          
          set({
            availableCurrencies: currencies,
            isLoading: false,
            lastUpdated: new Date(),
          });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load currencies',
            isLoading: false,
          });
        }
      },
      
      // Load exchange rates
      loadExchangeRates: async () => {
        try {
          const response = await fetch('/api/exchange-rates');
          
          if (response.ok) {
            const rates: Record<string, ExchangeRate> = await response.json();
            set({
              exchangeRates: rates,
              lastUpdated: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to load exchange rates:', error);
        }
      },
      
      // Refresh exchange rates
      refreshExchangeRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/exchange-rates/refresh', {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Failed to refresh exchange rates');
          }
          
          const rates: Record<string, ExchangeRate> = await response.json();
          
          set({
            exchangeRates: rates,
            isLoading: false,
            lastUpdated: new Date(),
          });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh rates',
            isLoading: false,
          });
        }
      },
      
      // Convert price with API call
      convertPrice: async (amount: number, fromCurrency: string, toCurrency?: string): Promise<CurrencyConversion> => {
        const targetCurrency = toCurrency || get().currentCurrency;
        
        const request: CurrencyConversionRequest = {
          fromCurrency,
          toCurrency: targetCurrency,
          amount,
          useLatestRate: true,
        };
        
        const response = await fetch('/api/currency/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        
        if (!response.ok) {
          throw new Error('Currency conversion failed');
        }
        
        const conversionResponse: CurrencyConversionResponse = await response.json();
        
        return {
          fromCurrency: conversionResponse.fromCurrency,
          toCurrency: conversionResponse.toCurrency,
          fromAmount: conversionResponse.fromAmount,
          toAmount: conversionResponse.toAmount,
          originalToAmount: conversionResponse.toAmount, // Assuming no rounding initially
          roundingApplied: null, // Assuming no rounding initially
          exchangeRate: conversionResponse.exchangeRate,
          convertedAt: new Date(),
          source: conversionResponse.rateSource,
        };
      },
      
      // Convert price using local rates (faster)
      convertPriceSync: (amount: number, fromCurrency: string, toCurrency?: string): number => {
        const targetCurrency = toCurrency || get().currentCurrency;
        
        if (fromCurrency === targetCurrency) {
          return amount;
        }
        
        const rate = get().getExchangeRate(fromCurrency, targetCurrency);
        return amount * rate;
      },
      
      // Format price according to currency rules
      formatPrice: (amount: number, currency?: string, options?: Partial<CurrencyDisplayOptions>): string => {
        const currencyCode = currency || get().currentCurrency;
        const currencyInfo = get().getCurrency(currencyCode);
        
        if (!currencyInfo) {
          return amount.toString();
        }
        
        const defaultOptions: CurrencyDisplayOptions = {
          showSymbol: true,
          showCode: false,
          symbolPosition: currencyInfo.symbolPosition,
          useShortFormat: false,
          alwaysShowDecimals: true,
          hideDecimalsForWholeNumbers: false,
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Format number
        let formattedAmount = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: finalOptions.alwaysShowDecimals ? currencyInfo.decimalPlaces : 0,
          maximumFractionDigits: currencyInfo.decimalPlaces,
        }).format(amount);
        
        // Apply short format if requested
        if (finalOptions.useShortFormat && amount >= 1000) {
          if (amount >= 1000000) {
            formattedAmount = (amount / 1000000).toFixed(1) + 'M';
          } else if (amount >= 1000) {
            formattedAmount = (amount / 1000).toFixed(1) + 'K';
          }
        }
        
        // Add symbol and/or code
        let result = formattedAmount;
        
        if (finalOptions.showSymbol) {
          if (finalOptions.symbolPosition === 'before') {
            result = currencyInfo.symbol + result;
          } else {
            result = result + currencyInfo.symbol;
          }
        }
        
        if (finalOptions.showCode) {
          result = result + ` ${currencyCode}`;
        }
        
        return result;
      },
      
      // Get complete price display object
      getPriceDisplay: (amount: number, currency?: string, options?: Partial<CurrencyDisplayOptions>): PriceDisplay => {
        const currencyCode = currency || get().currentCurrency;
        const defaultOptions: CurrencyDisplayOptions = {
          showSymbol: true,
          showCode: false,
          symbolPosition: 'before',
          useShortFormat: false,
          alwaysShowDecimals: true,
          hideDecimalsForWholeNumbers: false,
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        return {
          amount,
          currency: currencyCode,
          formattedAmount: get().formatPrice(amount, currencyCode, finalOptions),
          displayOptions: finalOptions,
        };
      },
      
      // Get prices in multiple currencies
      getMultiCurrencyPrices: (baseAmount: number, baseCurrency: string, targetCurrencies?: string[]) => {
        const currencies = targetCurrencies || get().preferences.comparisonCurrencies;
        
        return currencies.map(currency => ({
          currency,
          amount: get().convertPriceSync(baseAmount, baseCurrency, currency),
          formatted: get().formatPrice(
            get().convertPriceSync(baseAmount, baseCurrency, currency),
            currency
          ),
        }));
      },
      
      // Get currency information
      getCurrency: (code: string) => {
        return get().availableCurrencies.find(currency => currency.code === code);
      },
      
      // Get exchange rate between two currencies
      getExchangeRate: (fromCurrency: string, toCurrency: string): number => {
        if (fromCurrency === toCurrency) {
          return 1;
        }
        
        const rates = get().exchangeRates;
        const rateKey = `${fromCurrency}_${toCurrency}`;
        const reverseRateKey = `${toCurrency}_${fromCurrency}`;
        
        if (rates[rateKey]) {
          return rates[rateKey].rate;
        }
        
        if (rates[reverseRateKey]) {
          return 1 / rates[reverseRateKey].rate;
        }
        
        // Fallback: try to convert through USD
        const fromToUSD = rates[`${fromCurrency}_USD`]?.rate || 1;
        const USDToTo = rates[`USD_${toCurrency}`]?.rate || 1;
        
        return fromToUSD * USDToTo;
      },
      
      // Get supported currencies (active only)
      getSupportedCurrencies: () => {
        return get().availableCurrencies.filter(currency => currency.isActive);
      },
      
      // Get popular currencies (you could add popularity scoring)
      getPopularCurrencies: () => {
        const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
        return get().availableCurrencies.filter(currency => 
          currency.isActive && popular.includes(currency.code)
        );
      },
      
      // Auto-detect user currency based on location
      detectUserCurrency: async (): Promise<string> => {
        try {
          const response = await fetch('/api/currency/detect');
          
          if (response.ok) {
            const { currency } = await response.json();
            return currency;
          }
        } catch (error) {
          console.error('Currency detection failed:', error);
        }
        
        return 'USD'; // Fallback
      },
      
      // Update user preferences
      updatePreferences: (preferences: Partial<CurrencyPreferences>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
            updatedAt: new Date(),
          },
        }));
      },
      
      // Utility functions
      isValidCurrency: (code: string): boolean => {
        return get().availableCurrencies.some(currency => 
          currency.code === code && currency.isActive
        );
      },
      
      getCurrencySymbol: (code: string): string => {
        const currency = get().getCurrency(code);
        return currency?.symbol || code;
      },
      
      getCurrencyName: (code: string): string => {
        const currency = get().getCurrency(code);
        return currency?.name || code;
      },
      
      // Loading and error management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'currency-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentCurrency: state.currentCurrency,
        preferences: state.preferences,
        exchangeRates: state.exchangeRates,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentCurrency = () => useCurrencyStore((state) => state.currentCurrency);
export const useAvailableCurrencies = () => useCurrencyStore((state) => state.getSupportedCurrencies());
export const useCurrencySymbol = (code?: string) => {
  const currentCurrency = useCurrencyStore((state) => state.currentCurrency);
  const getCurrencySymbol = useCurrencyStore((state) => state.getCurrencySymbol);
  return getCurrencySymbol(code || currentCurrency);
};
export const useFormatPrice = () => useCurrencyStore((state) => state.formatPrice);
export const useConvertPrice = () => useCurrencyStore((state) => state.convertPriceSync);
export const useCurrencyLoading = () => useCurrencyStore((state) => state.isLoading);
export const useCurrencyError = () => useCurrencyStore((state) => state.error);