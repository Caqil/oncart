import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import {
  Language,
  Translation,
  TranslationNamespace,
  Locale,
  AutoTranslationProvider,
} from '@/types/language';

// Supported locales configuration
export const locales = ['en', 'es', 'fr', 'de', 'ar', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type SupportedLocale = typeof locales[number];

// Locale configuration for next-intl
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: await import(`../../locales/${locale}/common.json`).then(
      (module) => module.default
    ),
  };
});

// Translation key types for better TypeScript support
export interface TranslationKeys {
  // Authentication
  'auth.signin.title': string;
  'auth.signin.email': string;
  'auth.signin.password': string;
  'auth.signin.button': string;
  'auth.signup.title': string;
  'auth.signup.name': string;
  'auth.signup.email': string;
  'auth.signup.password': string;
  'auth.signup.confirmPassword': string;
  'auth.signup.button': string;
  'auth.forgotPassword': string;
  'auth.rememberMe': string;
  
  // Navigation
  'nav.home': string;
  'nav.shop': string;
  'nav.categories': string;
  'nav.vendors': string;
  'nav.cart': string;
  'nav.wishlist': string;
  'nav.account': string;
  'nav.admin': string;
  'nav.vendor': string;
  
  // Common actions
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.warning': string;
  'common.info': string;
  
  // Product related
  'product.addToCart': string;
  'product.addToWishlist': string;
  'product.price': string;
  'product.description': string;
  'product.reviews': string;
  'product.rating': string;
  'product.inStock': string;
  'product.outOfStock': string;
  'product.quantity': string;
  
  // Cart related
  'cart.title': string;
  'cart.empty': string;
  'cart.subtotal': string;
  'cart.shipping': string;
  'cart.tax': string;
  'cart.total': string;
  'cart.checkout': string;
  'cart.continueShopping': string;
  
  // Order related
  'order.number': string;
  'order.date': string;
  'order.status': string;
  'order.total': string;
  'order.items': string;
  'order.shipping': string;
  'order.billing': string;
  'order.payment': string;
  
  // Validation messages
  'validation.required': string;
  'validation.email': string;
  'validation.minLength': string;
  'validation.maxLength': string;
  'validation.numeric': string;
  'validation.positive': string;
}

// Translation manager class
export class TranslationManager {
  private translations: Map<string, Map<string, string>> = new Map();
  private namespaces: Map<string, TranslationNamespace> = new Map();
  private currentLocale: string = defaultLocale;
  private fallbackLocale: string = defaultLocale;

  constructor() {
    this.loadDefaultTranslations();
  }

  private async loadDefaultTranslations() {
    // Load default translations for all supported locales
    for (const locale of locales) {
      try {
        const translations = await this.loadTranslationsForLocale(locale);
        this.translations.set(locale, translations);
      } catch (error) {
        console.warn(`Failed to load translations for locale: ${locale}`);
      }
    }
  }

  private async loadTranslationsForLocale(locale: string): Promise<Map<string, string>> {
    const translations = new Map<string, string>();
    
    try {
      // Load common translations
      const common = await import(`../../locales/${locale}/common.json`);
      this.mergeTranslations(translations, common.default, 'common');
      
      // Load auth translations
      const auth = await import(`../../locales/${locale}/auth.json`);
      this.mergeTranslations(translations, auth.default, 'auth');
      
      // Load shop translations
      const shop = await import(`../../locales/${locale}/shop.json`);
      this.mergeTranslations(translations, shop.default, 'shop');
      
      // Load admin translations
      const admin = await import(`../../locales/${locale}/admin.json`);
      this.mergeTranslations(translations, admin.default, 'admin');
      
      // Load vendor translations
      const vendor = await import(`../../locales/${locale}/vendor.json`);
      this.mergeTranslations(translations, vendor.default, 'vendor');
      
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
    }
    
    return translations;
  }

  private mergeTranslations(
    target: Map<string, string>,
    source: Record<string, any>,
    namespace: string,
    prefix: string = ''
  ) {
    Object.entries(source).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const namespacedKey = `${namespace}.${fullKey}`;
      
      if (typeof value === 'object' && value !== null) {
        this.mergeTranslations(target, value, namespace, fullKey);
      } else {
        target.set(namespacedKey, String(value));
      }
    });
  }

  setLocale(locale: string) {
    if (locales.includes(locale as any)) {
      this.currentLocale = locale;
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  translate(key: string, variables?: Record<string, any>, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const localeTranslations = this.translations.get(targetLocale);
    
    let translation = localeTranslations?.get(key);
    
    // Fallback to default locale
    if (!translation && targetLocale !== this.fallbackLocale) {
      const fallbackTranslations = this.translations.get(this.fallbackLocale);
      translation = fallbackTranslations?.get(key);
    }
    
    // Fallback to key if no translation found
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${targetLocale}`);
      return key;
    }
    
    // Interpolate variables
    if (variables) {
      return this.interpolate(translation, variables);
    }
    
    return translation;
  }

  translatePlural(
    key: string,
    count: number,
    variables?: Record<string, any>,
    locale?: string
  ): string {
    const pluralKey = this.getPluralKey(key, count, locale);
    return this.translate(pluralKey, { count, ...variables }, locale);
  }

  private getPluralKey(key: string, count: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    
    // Simple plural rules - you can extend this for more complex languages
    const pluralRules: Record<string, (count: number) => string> = {
      en: (n) => n === 1 ? 'one' : 'other',
      es: (n) => n === 1 ? 'one' : 'other',
      fr: (n) => n === 0 || n === 1 ? 'one' : 'other',
      de: (n) => n === 1 ? 'one' : 'other',
      ar: (n) => {
        if (n === 0) return 'zero';
        if (n === 1) return 'one';
        if (n === 2) return 'two';
        if (n % 100 >= 3 && n % 100 <= 10) return 'few';
        if (n % 100 >= 11) return 'many';
        return 'other';
      },
      zh: () => 'other', // Chinese doesn't have plurals
    };
    
    const rule = pluralRules[targetLocale] || pluralRules.en;
    const pluralForm = rule(count);
    
    return `${key}_${pluralForm}`;
  }

  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(variables, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async loadNamespace(namespace: string, locale?: string): Promise<void> {
    const targetLocale = locale || this.currentLocale;
    
    try {
      const translations = await import(`../../locales/${targetLocale}/${namespace}.json`);
      const localeTranslations = this.translations.get(targetLocale) || new Map();
      
      this.mergeTranslations(localeTranslations, translations.default, namespace);
      this.translations.set(targetLocale, localeTranslations);
    } catch (error) {
      console.error(`Failed to load namespace ${namespace} for locale ${targetLocale}:`, error);
    }
  }

  getSupportedLocales(): string[] {
    return [...locales];
  }

  isRTL(locale?: string): boolean {
    const targetLocale = locale || this.currentLocale;
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(targetLocale);
  }

  getDirection(locale?: string): 'ltr' | 'rtl' {
    return this.isRTL(locale) ? 'rtl' : 'ltr';
  }

  formatDate(date: Date, locale?: string, options?: Intl.DateTimeFormatOptions): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.DateTimeFormat(targetLocale, options).format(date);
  }

  formatNumber(number: number, locale?: string, options?: Intl.NumberFormatOptions): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.NumberFormat(targetLocale, options).format(number);
  }

  formatCurrency(
    amount: number,
    currency: string,
    locale?: string,
    options?: Intl.NumberFormatOptions
  ): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  }

  formatRelativeTime(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' });
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    }
  }
}

// Auto-translation service
export class AutoTranslationService {
  private provider: AutoTranslationProvider;
  private apiKey: string;

  constructor(provider: AutoTranslationProvider, apiKey: string) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    switch (this.provider) {
      case AutoTranslationProvider.GOOGLE_TRANSLATE:
        return this.translateWithGoogle(text, fromLanguage, toLanguage);
      case AutoTranslationProvider.DEEPL:
        return this.translateWithDeepL(text, fromLanguage, toLanguage);
      case AutoTranslationProvider.AZURE_TRANSLATOR:
        return this.translateWithAzure(text, fromLanguage, toLanguage);
      case AutoTranslationProvider.AWS_TRANSLATE:
        return this.translateWithAWS(text, fromLanguage, toLanguage);
      default:
        throw new Error(`Unsupported translation provider: ${this.provider}`);
    }
  }

  private async translateWithGoogle(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: fromLanguage,
          target: toLanguage,
          format: 'text',
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Google Translate error: ${data.error?.message}`);
    }

    return {
      translatedText: data.data.translations[0].translatedText,
      confidence: 0.9, // Google doesn't provide confidence scores
    };
  }

  private async translateWithDeepL(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: fromLanguage.toUpperCase(),
        target_lang: toLanguage.toUpperCase(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`DeepL error: ${data.message}`);
    }

    return {
      translatedText: data.translations[0].text,
      confidence: 0.95, // DeepL is generally high quality
    };
  }

  private async translateWithAzure(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    const response = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLanguage}&to=${toLanguage}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }]),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Azure Translator error: ${data.error?.message}`);
    }

    return {
      translatedText: data[0].translations[0].text,
      confidence: data[0].translations[0].confidence || 0.8,
    };
  }

  private async translateWithAWS(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<{ translatedText: string; confidence: number }> {
    // AWS Translate implementation would go here
    // This is a simplified example
    throw new Error('AWS Translate implementation not yet available');
  }

  async batchTranslate(
    texts: string[],
    fromLanguage: string,
    toLanguage: string
  ): Promise<Array<{ originalText: string; translatedText: string; confidence: number }>> {
    const results = await Promise.all(
      texts.map(async (text) => {
        try {
          const result = await this.translate(text, fromLanguage, toLanguage);
          return {
            originalText: text,
            translatedText: result.translatedText,
            confidence: result.confidence,
          };
        } catch (error) {
          console.error(`Translation failed for text: ${text}`, error);
          return {
            originalText: text,
            translatedText: text, // Fallback to original
            confidence: 0,
          };
        }
      })
    );

    return results;
  }
}

// Language detection service
export class LanguageDetector {
  static detectFromBrowser(): string {
    if (typeof window === 'undefined') return defaultLocale;
    
    const browserLanguage = navigator.language.split('-')[0];
    return locales.includes(browserLanguage as any) ? browserLanguage : defaultLocale;
  }

  static async detectFromIP(ipAddress: string): Promise<string> {
    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();
      
      const countryCode = data.country_code?.toLowerCase();
      
      // Map country codes to languages
      const countryLanguageMap: Record<string, string> = {
        'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en',
        'es': 'es', 'mx': 'es', 'ar': 'es', 'co': 'es',
        'fr': 'fr', 'be': 'fr', 'ch': 'fr',
        'de': 'de', 'at': 'de',
        'sa': 'ar', 'eg': 'ar', 'ae': 'ar',
        'cn': 'zh', 'tw': 'zh', 'hk': 'zh',
      };
      
      return countryLanguageMap[countryCode] || defaultLocale;
    } catch (error) {
      console.error('Failed to detect language from IP:', error);
      return defaultLocale;
    }
  }

  static detectFromText(text: string): Promise<string> {
    // This would use a language detection service
    // For now, return default
    return Promise.resolve(defaultLocale);
  }
}

// Singleton instance
export const translationManager = new TranslationManager();

// Helper functions
export function t(key: string, variables?: Record<string, any>, locale?: string): string {
  return translationManager.translate(key, variables, locale);
}

export function tp(
  key: string,
  count: number,
  variables?: Record<string, any>,
  locale?: string
): string {
  return translationManager.translatePlural(key, count, variables, locale);
}

export function setLocale(locale: string): void {
  translationManager.setLocale(locale);
}

export function getLocale(): string {
  return translationManager.getLocale();
}

export function isRTL(locale?: string): boolean {
  return translationManager.isRTL(locale);
}

export function getDirection(locale?: string): 'ltr' | 'rtl' {
  return translationManager.getDirection(locale);
}

export function formatDate(
  date: Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return translationManager.formatDate(date, locale, options);
}

export function formatNumber(
  number: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return translationManager.formatNumber(number, locale, options);
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return translationManager.formatCurrency(amount, currency, locale, options);
}

export function formatRelativeTime(date: Date, locale?: string): string {
  return translationManager.formatRelativeTime(date, locale);
}