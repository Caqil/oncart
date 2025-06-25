import {
  Currency,
  ExchangeRate,
  ExchangeRateSource,
  CurrencyConversion,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  PriceDisplay,
  CurrencyDisplayOptions,
  MultiCurrencyPrice,
} from '@/types/currency';
import { DEFAULT_CURRENCIES } from './constants';

// Exchange rate providers
const EXCHANGE_RATE_PROVIDERS = {
  [ExchangeRateSource.FIXER]: {
    url: 'https://api.fixer.io/v1/latest',
    requiresKey: true,
  },
  [ExchangeRateSource.EXCHANGERATE_API]: {
    url: 'https://api.exchangerate-api.com/v4/latest',
    requiresKey: false,
  },
  [ExchangeRateSource.OPENEXCHANGERATES]: {
    url: 'https://openexchangerates.org/api/latest.json',
    requiresKey: true,
  },
  [ExchangeRateSource.CURRENCYLAYER]: {
    url: 'https://api.currencylayer.com/live',
    requiresKey: true,
  },
} as const;

// Currency formatting utilities
export class CurrencyFormatter {
  private currencies: Map<string, Currency> = new Map();
  private exchangeRates: Map<string, number> = new Map();

  constructor(currencies: Currency[] = DEFAULT_CURRENCIES) {
    this.loadCurrencies(currencies);
  }

  loadCurrencies(currencies: Currency[]): void {
    this.currencies.clear();
    currencies.forEach(currency => {
      this.currencies.set(currency.code, currency);
      this.exchangeRates.set(currency.code, currency.exchangeRate);
    });
  }

  getCurrency(code: string): Currency | undefined {
    return this.currencies.get(code);
  }

  isValidCurrency(code: string): boolean {
    return this.currencies.has(code) && this.currencies.get(code)!.isActive;
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;

    const fromRate = this.exchangeRates.get(fromCurrency) || 1;
    const toRate = this.exchangeRates.get(toCurrency) || 1;

    // Convert through base currency (usually USD)
    const baseCurrency = this.getBaseCurrency();
    if (fromCurrency === baseCurrency.code) {
      return toRate;
    } else if (toCurrency === baseCurrency.code) {
      return 1 / fromRate;
    } else {
      return toRate / fromRate;
    }
  }

  convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rounding: 'NONE' | 'UP' | 'DOWN' | 'NEAREST' = 'NEAREST'
  ): CurrencyConversion {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    let convertedAmount = amount * rate;

    // Apply rounding
    const originalAmount = convertedAmount;
    const targetCurrency = this.getCurrency(toCurrency);
    const decimalPlaces = targetCurrency?.decimalPlaces || 2;

    switch (rounding) {
      case 'UP':
        convertedAmount = Math.ceil(convertedAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        break;
      case 'DOWN':
        convertedAmount = Math.floor(convertedAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        break;
      case 'NEAREST':
        convertedAmount = Math.round(convertedAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
        break;
      case 'NONE':
        // No rounding
        break;
    }

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: convertedAmount,
      originalToAmount: originalAmount,
      exchangeRate: rate,
      convertedAt: new Date(),
      source: ExchangeRateSource.MANUAL,
      roundingApplied: rounding,
    };
  }

  format(
    amount: number,
    currencyCode: string,
    options: Partial<CurrencyDisplayOptions> = {}
  ): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      return amount.toString();
    }

    const defaultOptions: CurrencyDisplayOptions = {
      showSymbol: true,
      showCode: false,
      symbolPosition: currency.symbolPosition,
      useShortFormat: false,
      alwaysShowDecimals: true,
      hideDecimalsForWholeNumbers: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Format the number
    let formattedAmount = this.formatNumber(amount, currency, finalOptions);

    // Apply short format if requested
    if (finalOptions.useShortFormat && amount >= 1000) {
      formattedAmount = this.formatShortNumber(amount);
    }

    // Add symbol and/or code
    let result = formattedAmount;

    if (finalOptions.showSymbol) {
      if (finalOptions.symbolPosition === 'before') {
        result = currency.symbol + result;
      } else {
        result = result + currency.symbol;
      }
    }

    if (finalOptions.showCode) {
      result = result + ` ${currencyCode}`;
    }

    return result;
  }

  formatNumber(
    amount: number,
    currency: Currency,
    options: CurrencyDisplayOptions
  ): string {
    const { decimalPlaces, thousandsSeparator, decimalSeparator } = currency;
    const { alwaysShowDecimals, hideDecimalsForWholeNumbers } = options;

    const isWholeNumber = amount % 1 === 0;
    const shouldShowDecimals = alwaysShowDecimals && !hideDecimalsForWholeNumbers;
    const finalDecimalPlaces = (isWholeNumber && hideDecimalsForWholeNumbers) ? 0 : decimalPlaces;

    // Format with standard separators first
    let formatted = amount.toFixed(shouldShowDecimals || !isWholeNumber ? finalDecimalPlaces : 0);

    // Replace standard separators with currency-specific ones
    if (decimalSeparator !== '.') {
      formatted = formatted.replace('.', decimalSeparator);
    }

    // Add thousands separator
    if (thousandsSeparator) {
      const parts = formatted.split(decimalSeparator);
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      formatted = parts.join(decimalSeparator);
    }

    return formatted;
  }

  formatShortNumber(amount: number): string {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  }

  getPriceDisplay(
    amount: number,
    currencyCode: string,
    options: Partial<CurrencyDisplayOptions> = {}
  ): PriceDisplay {
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
      formattedAmount: this.format(amount, currencyCode, finalOptions),
      displayOptions: finalOptions,
    };
  }

  getMultiCurrencyPrices(
    baseAmount: number,
    baseCurrency: string,
    targetCurrencies: string[]
  ): MultiCurrencyPrice {
    const prices = targetCurrencies.map(currency => {
      const conversion = this.convert(baseAmount, baseCurrency, currency);
      return {
        currency,
        amount: conversion.toAmount,
        isConverted: currency !== baseCurrency,
        convertedAt: conversion.convertedAt,
        exchangeRate: conversion.exchangeRate,
      };
    });

    return {
      baseCurrency,
      baseAmount,
      prices,
    };
  }

  getBaseCurrency(): Currency {
    return Array.from(this.currencies.values()).find(c => c.isDefault) || DEFAULT_CURRENCIES[0];
  }

  getSupportedCurrencies(): Currency[] {
    return Array.from(this.currencies.values()).filter(c => c.isActive);
  }

  updateExchangeRate(currencyCode: string, rate: number): void {
    this.exchangeRates.set(currencyCode, rate);
    
    const currency = this.currencies.get(currencyCode);
    if (currency) {
      currency.exchangeRate = rate;
      currency.lastUpdated = new Date();
    }
  }
}

// Exchange rate fetching utilities
export class ExchangeRateService {
  private apiKey: string | undefined;
  private provider: ExchangeRateSource;
  private baseCurrency: string;

  constructor(
    provider: ExchangeRateSource = ExchangeRateSource.EXCHANGERATE_API,
    apiKey?: string,
    baseCurrency: string = 'USD'
  ) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.baseCurrency = baseCurrency;
  }

  async fetchExchangeRates(targetCurrencies?: string[]): Promise<Record<string, ExchangeRate>> {
    try {
      const url = this.buildApiUrl();
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseApiResponse(data, targetCurrencies);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  }

  private buildApiUrl(): string {
    const providerConfig = EXCHANGE_RATE_PROVIDERS[this.provider as keyof typeof EXCHANGE_RATE_PROVIDERS];
    let url = providerConfig.url;

    switch (this.provider) {
      case ExchangeRateSource.FIXER:
        url += `?access_key=${this.apiKey}&base=${this.baseCurrency}`;
        break;
      case ExchangeRateSource.OPENEXCHANGERATES:
        url += `?app_id=${this.apiKey}&base=${this.baseCurrency}`;
        break;
      case ExchangeRateSource.CURRENCYLAYER:
        url += `?access_key=${this.apiKey}&source=${this.baseCurrency}`;
        break;
      case ExchangeRateSource.EXCHANGERATE_API:
        url += `/${this.baseCurrency}`;
        break;
    }

    return url;
  }

  private parseApiResponse(
    data: any,
    targetCurrencies?: string[]
  ): Record<string, ExchangeRate> {
    const rates: Record<string, ExchangeRate> = {};
    const timestamp = new Date();

    let ratesData: Record<string, number> = {};

    switch (this.provider) {
      case ExchangeRateSource.FIXER:
      case ExchangeRateSource.EXCHANGERATE_API:
        ratesData = data.rates || {};
        break;
      case ExchangeRateSource.OPENEXCHANGERATES:
        ratesData = data.rates || {};
        break;
      case ExchangeRateSource.CURRENCYLAYER:
        ratesData = {};
        Object.entries(data.quotes || {}).forEach(([key, value]) => {
          const currency = key.replace(this.baseCurrency, '');
          ratesData[currency] = value as number;
        });
        break;
    }

    Object.entries(ratesData).forEach(([currency, rate]) => {
      if (!targetCurrencies || targetCurrencies.includes(currency)) {
        rates[`${this.baseCurrency}_${currency}`] = {
          id: `${this.baseCurrency}_${currency}_${Date.now()}`,
          fromCurrency: this.baseCurrency,
          toCurrency: currency,
          rate: rate,
          source: this.provider,
          timestamp,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      }
    });

    return rates;
  }
}

// Currency detection utilities
export class CurrencyDetector {
  private static readonly COUNTRY_CURRENCY_MAP: Record<string, string> = {
    'US': 'USD',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'CA': 'CAD',
    'AU': 'AUD',
    'JP': 'JPY',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'RU': 'RUB',
    'KR': 'KRW',
    'TR': 'TRY',
    'ZA': 'ZAR',
    'SG': 'SGD',
    'HK': 'HKD',
    'NZ': 'NZD',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
    'CH': 'CHF',
    'PL': 'PLN',
    'CZ': 'CZK',
    'HU': 'HUF',
    'IL': 'ILS',
    'EG': 'EGP',
    'SA': 'SAR',
    'AE': 'AED',
    'TH': 'THB',
    'MY': 'MYR',
    'ID': 'IDR',
    'PH': 'PHP',
    'VN': 'VND',
  };

  static async detectFromIP(ipAddress: string): Promise<string> {
    try {
      // Use a geolocation service to get country from IP
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();
      
      const countryCode = data.country_code;
      return this.COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
    } catch (error) {
      console.error('Failed to detect currency from IP:', error);
      return 'USD';
    }
  }

  static detectFromLocale(locale: string): string {
    const countryCode = locale.split('-')[1]?.toUpperCase();
    return this.COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  }

  static detectFromBrowser(): string {
    if (typeof window === 'undefined') return 'USD';

    // Try to get currency from browser locale
    const locale = navigator.language || 'en-US';
    return this.detectFromLocale(locale);
  }
}

// Currency validation utilities
export class CurrencyValidator {
  static validateCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }

  static validateExchangeRate(rate: number): boolean {
    return rate > 0 && rate < 1000000 && !isNaN(rate) && isFinite(rate);
  }

  static validateAmount(amount: number): boolean {
    return amount >= 0 && !isNaN(amount) && isFinite(amount);
  }

  static validateCurrencySymbol(symbol: string): boolean {
    return symbol.length > 0 && symbol.length <= 5;
  }

  static validateDecimalPlaces(places: number): boolean {
    return Number.isInteger(places) && places >= 0 && places <= 4;
  }
}

// Singleton instance for global use
export const currencyFormatter = new CurrencyFormatter();

// Helper functions for common operations
export function formatPrice(
  amount: number,
  currency: string,
  options?: Partial<CurrencyDisplayOptions>
): string {
  return currencyFormatter.format(amount, currency, options);
}

export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): CurrencyConversion {
  return currencyFormatter.convert(amount, fromCurrency, toCurrency);
}

export function isValidCurrency(code: string): boolean {
  return currencyFormatter.isValidCurrency(code);
}

export function getSupportedCurrencies(): Currency[] {
  return currencyFormatter.getSupportedCurrencies();
}

export function detectUserCurrency(): string {
  return CurrencyDetector.detectFromBrowser();
}