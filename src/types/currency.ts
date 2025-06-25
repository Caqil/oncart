export interface Currency {
  code: string; // ISO 4217 currency code (e.g., 'USD', 'EUR')
  name: string; // Full name (e.g., 'United States Dollar')
  symbol: string; // Currency symbol (e.g., '$', '€')
  symbolPosition: 'before' | 'after'; // Position of symbol relative to amount
  decimalPlaces: number; // Number of decimal places (usually 2)
  thousandsSeparator: string; // Thousands separator (e.g., ',', '.')
  decimalSeparator: string; // Decimal separator (e.g., '.', ',')
  isActive: boolean; // Whether currency is available for use
  isDefault: boolean; // Whether this is the default/base currency
  exchangeRate: number; // Exchange rate relative to base currency
  lastUpdated: Date; // When exchange rate was last updated
  rounding: 'NONE' | 'UP' | 'DOWN' | 'NEAREST'; // How to round converted amounts
  
  // Display formatting
  format: {
    positive: string; // Format for positive amounts (e.g., '$#,##0.00')
    negative: string; // Format for negative amounts (e.g., '-$#,##0.00')
    zero: string; // Format for zero amounts (e.g., '$0.00')
  };
  
  // Country/region info
  countries: string[]; // ISO country codes where this currency is used
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string; // Base currency code
  toCurrency: string; // Target currency code
  rate: number; // Exchange rate (1 fromCurrency = rate toCurrency)
  source: ExchangeRateSource; // Source of the exchange rate
  timestamp: Date; // When this rate was recorded
  isActive: boolean; // Whether this rate is currently active
  
  // Rate metadata
  bid?: number | null; // Bid rate (for financial markets)
  ask?: number | null; // Ask rate (for financial markets)
  high?: number | null; // Highest rate in the period
  low?: number | null; // Lowest rate in the period
  change?: number | null; // Change from previous rate
  changePercent?: number | null; // Percentage change
  
  createdAt: Date;
  updatedAt: Date;
}

export enum ExchangeRateSource {
  MANUAL = 'MANUAL',
  ECB = 'ECB', // European Central Bank
  FED = 'FED', // Federal Reserve
  BOE = 'BOE', // Bank of England
  FIXER = 'FIXER', // Fixer.io API
  CURRENCYLAYER = 'CURRENCYLAYER', // CurrencyLayer API
  EXCHANGERATE_API = 'EXCHANGERATE_API', // ExchangeRate-API
  OPENEXCHANGERATES = 'OPENEXCHANGERATES', // Open Exchange Rates
  XE = 'XE', // XE.com
  YAHOO = 'YAHOO', // Yahoo Finance
  COINDESK = 'COINDESK', // For cryptocurrency rates
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  convertedAt: Date;
  source: ExchangeRateSource;
  
  // Conversion fees (if applicable)
  conversionFee?: number | null;
  conversionFeePercentage?: number | null;
  
  // Rounding information
  originalToAmount: number; // Before rounding
  roundingApplied: string | null;
}

export interface CurrencySettings {
  // Default currency
  baseCurrency: string; // The base currency for the system
  defaultDisplayCurrency: string; // Default currency for display
  
  // Enabled currencies
  enabledCurrencies: string[]; // List of enabled currency codes
  
  // Auto-detection
  autoDetectCurrency: boolean; // Auto-detect currency based on user location
  fallbackCurrency: string; // Fallback if auto-detection fails
  
  // Exchange rate settings
  exchangeRateProvider: ExchangeRateSource;
  updateFrequency: 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  lastUpdate?: Date | null;
  nextUpdate?: Date | null;
  
  // Provider API settings
  providerApiKey?: string | null;
  providerSettings?: Record<string, any> | null;
  
  // Display settings
  showCurrencySelector: boolean;
  currencySelectorPosition: 'HEADER' | 'FOOTER' | 'SIDEBAR';
  showExchangeRateInfo: boolean;
  
  // Conversion settings
  defaultRounding: 'NONE' | 'UP' | 'DOWN' | 'NEAREST';
  conversionFeePercentage?: number | null;
  
  // Multi-currency pricing
  allowVendorCurrencyPricing: boolean; // Allow vendors to set prices in different currencies
  automaticConversion: boolean; // Auto-convert prices to user's currency
  
  updatedAt: Date;
  updatedBy: string;
}

export interface CurrencyDisplayOptions {
  showSymbol: boolean;
  showCode: boolean;
  symbolPosition: 'before' | 'after';
  useShortFormat: boolean; // e.g., $1K instead of $1,000
  alwaysShowDecimals: boolean;
  hideDecimalsForWholeNumbers: boolean;
}

export interface PriceDisplay {
  amount: number;
  currency: string;
  formattedAmount: string; // Human-readable formatted amount
  displayOptions: CurrencyDisplayOptions;
}

export interface MultiCurrencyPrice {
  baseCurrency: string;
  baseAmount: number;
  prices: Array<{
    currency: string;
    amount: number;
    isConverted: boolean; // True if converted from base, false if manually set
    convertedAt?: Date | null;
    exchangeRate?: number | null;
  }>;
}

export interface CurrencyConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  useLatestRate?: boolean;
  rounding?: 'NONE' | 'UP' | 'DOWN' | 'NEAREST';
}

export interface CurrencyConversionResponse {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  rateSource: ExchangeRateSource;
  rateTimestamp: Date;
  conversionFee?: number | null;
  totalAmount: number; // Including any fees
  formattedAmount: string;
  
  // Rounding information
  originalToAmount: number; // Before rounding
  roundingApplied: boolean;
}

export interface ExchangeRateProvider {
  name: string;
  source: ExchangeRateSource;
  isActive: boolean;
  apiKey?: string | null;
  baseUrl: string;
  supportedCurrencies: string[];
  updateFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY';
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  features: {
    historicalRates: boolean;
    fluctuationData: boolean;
    cryptoCurrencies: boolean;
  };
}

export interface ExchangeRateHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  date: Date;
  rate: number;
  source: ExchangeRateSource;
  high?: number | null;
  low?: number | null;
  open?: number | null;
  close?: number | null;
  volume?: number | null;
  createdAt: Date;
}

export interface CurrencyFluctuation {
  fromCurrency: string;
  toCurrency: string;
  startDate: Date;
  endDate: Date;
  startRate: number;
  endRate: number;
  change: number;
  changePercent: number;
  fluctuation: number; // Difference between high and low
  high: number;
  low: number;
}

export interface CurrencyAnalytics {
  // Usage statistics
  popularCurrencies: Array<{
    currency: string;
    usageCount: number;
    percentage: number;
  }>;
  
  // Conversion statistics
  topConversions: Array<{
    fromCurrency: string;
    toCurrency: string;
    conversionCount: number;
    totalAmount: number;
  }>;
  
  // Geographic distribution
  currencyByCountry: Array<{
    country: string;
    currency: string;
    userCount: number;
  }>;
  
  // Trends
  conversionTrends: Array<{
    date: string;
    conversions: number;
    totalAmount: number;
    uniqueCurrencies: number;
  }>;
  
  // Exchange rate volatility
  volatilityData: Array<{
    currency: string;
    volatility: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }>;
}

export interface CurrencyValidation {
  isValid: boolean;
  errors: CurrencyValidationError[];
  warnings: CurrencyValidationWarning[];
}

export interface CurrencyValidationError {
  field: string;
  message: string;
  code: 'INVALID_CODE' | 'UNSUPPORTED_CURRENCY' | 'INVALID_RATE' | 'MISSING_SYMBOL';
}

export interface CurrencyValidationWarning {
  field: string;
  message: string;
  code: 'DEPRECATED_CURRENCY' | 'HIGH_VOLATILITY' | 'OUTDATED_RATE';
}

export interface CurrencyPreferences {
  userId: string;
  preferredCurrency: string;
  autoConvert: boolean;
  showComparisonPrices: boolean; // Show prices in multiple currencies
  comparisonCurrencies: string[]; // Additional currencies to show
  notifications: {
    rateAlerts: boolean;
    significantChanges: boolean;
    threshold: number; // Percentage change threshold for notifications
  };
  updatedAt: Date;
}

export interface CurrencyRateAlert {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'ABOVE' | 'BELOW' | 'EQUALS';
  isActive: boolean;
  triggeredAt?: Date | null;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyFormat {
  currency: string;
  locale: string; // BCP 47 language tag (e.g., 'en-US', 'de-DE')
  options: Intl.NumberFormatOptions;
  examples: {
    positive: string; // Example: "$1,234.56"
    negative: string; // Example: "-$1,234.56"
    zero: string; // Example: "$0.00"
  };
}

export interface CryptoExchangeRate {
  id: string;
  symbol: string; // e.g., 'BTC', 'ETH'
  name: string; // e.g., 'Bitcoin', 'Ethereum'
  priceUSD: number;
  priceInCurrencies: Record<string, number>; // Prices in different fiat currencies
  marketCap: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  lastUpdated: Date;
  source: 'COINDESK' | 'COINMARKETCAP' | 'COINGECKO' | 'BINANCE';
}

export interface CurrencyBatch {
  id: string;
  operation: 'UPDATE_RATES' | 'ADD_CURRENCY' | 'UPDATE_SETTINGS';
  currencies: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0-100
  processedCount: number;
  totalCount: number;
  errors: Array<{
    currency: string;
    error: string;
  }>;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface CurrencyImport {
  id: string;
  fileName: string;
  fileSize: number;
  format: 'CSV' | 'JSON' | 'XML';
  source: ExchangeRateSource;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    currency: string;
    field: string;
    message: string;
  }>;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface CurrencyExport {
  id: string;
  format: 'CSV' | 'JSON' | 'XML';
  includeRates: boolean;
  includeHistory: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  } | null;
  currencies: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string | null;
  fileSize?: number | null;
  recordCount?: number | null;
  error?: string | null;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface CurrencyWidget {
  id: string;
  name: string;
  type: 'CONVERTER' | 'RATES_TABLE' | 'RATE_TICKER' | 'CHART';
  configuration: {
    baseCurrency?: string;
    targetCurrencies?: string[];
    showFlags?: boolean;
    showTrends?: boolean;
    updateInterval?: number; // seconds
    theme?: 'LIGHT' | 'DARK' | 'AUTO';
    size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  };
  isActive: boolean;
  placement: 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'PRODUCT_PAGE' | 'CHECKOUT';
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyAPI {
  endpoint: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  responseFormat: 'JSON' | 'XML' | 'CSV';
  dataPath: string; // JSONPath to extract rate data
  rateMapping: {
    fromCurrency: string;
    toCurrency: string;
    rate: string;
    timestamp: string;
  };
  errorHandling: {
    retryAttempts: number;
    retryDelay: number; // milliseconds
    fallbackProvider?: ExchangeRateSource | null;
  };
}

// Currency-related utility types
export type CurrencyCode = string;
export type CurrencyAmount = number;
export type ExchangeRateValue = number;

export interface CurrencyPair {
  base: CurrencyCode;
  quote: CurrencyCode;
}

export interface CurrencyCalculation {
  originalAmount: CurrencyAmount;
  originalCurrency: CurrencyCode;
  convertedAmount: CurrencyAmount;
  convertedCurrency: CurrencyCode;
  exchangeRate: ExchangeRateValue;
  fees: CurrencyAmount;
  total: CurrencyAmount;
  calculation: string; // Human-readable calculation steps
}

export interface CurrencySupport {
  // Supported currencies by feature
  checkout: CurrencyCode[];
  display: CurrencyCode[];
  reporting: CurrencyCode[];
  payouts: CurrencyCode[];
  
  // Limitations
  restrictions: Array<{
    currency: CurrencyCode;
    restriction: string;
    reason: string;
  }>;
  
  // Provider support matrix
  providerSupport: Record<ExchangeRateSource, CurrencyCode[]>;
}