import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Language,
  Locale,
  Translation,
  TranslationNamespace,
} from '@/types/language';

interface LanguageState {
  // Current language selection
  currentLanguage: string;
  currentLocale: string;
  availableLanguages: Language[];
  availableLocales: Locale[];
  
  // Translations
  translations: Record<string, Record<string, string>>; // namespace -> key -> translation
  loadedNamespaces: string[];
  
  // Language preferences
  fallbackLanguage: string;
  autoDetect: boolean;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface LanguageStore extends LanguageState {
  // Language selection
  setLanguage: (languageCode: string) => Promise<void>;
  setLocale: (localeCode: string) => Promise<void>;
  switchLanguage: (languageCode: string) => void;
  
  // Translation management
  loadTranslations: (namespace: string, language?: string) => Promise<void>;
  loadMultipleNamespaces: (namespaces: string[], language?: string) => Promise<void>;
  getTranslation: (key: string, namespace?: string, variables?: Record<string, any>) => string;
  translate: (key: string, namespace?: string, variables?: Record<string, any>) => string;
  
  // Plural translations
  translatePlural: (key: string, count: number, namespace?: string, variables?: Record<string, any>) => string;
  
  // Language data management
  loadLanguages: () => Promise<void>;
  loadLocales: () => Promise<void>;
  
  // Auto-detection
  detectUserLanguage: () => Promise<string>;
  detectUserLocale: () => Promise<string>;
  
  // Language information
  getLanguage: (code: string) => Language | undefined;
  getLocale: (code: string) => Locale | undefined;
  getSupportedLanguages: () => Language[];
  getLanguageInfo: (code: string) => {
    name: string;
    nativeName: string;
    flag?: string;
    isRTL: boolean;
    completeness: number;
  } | null;
  
  // Formatting utilities
  formatDate: (date: Date, format?: string) => string;
  formatTime: (date: Date, format?: string) => string;
  formatDateTime: (date: Date, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency: string, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (date: Date) => string;
  
  // Utilities
  isRTL: (language?: string) => boolean;
  getDirection: (language?: string) => 'ltr' | 'rtl';
  isLanguageSupported: (code: string) => boolean;
  getTranslationProgress: (language: string) => number;
  
  // Caching and optimization
  preloadNamespace: (namespace: string, language?: string) => Promise<void>;
  clearTranslationCache: () => void;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState: LanguageState = {
  currentLanguage: 'en',
  currentLocale: 'en-US',
  availableLanguages: [],
  availableLocales: [],
  translations: {},
  loadedNamespaces: [],
  fallbackLanguage: 'en',
  autoDetect: true,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Set language and persist preference
      setLanguage: async (languageCode: string) => {
        const isSupported = get().isLanguageSupported(languageCode);
        if (!isSupported) {
          throw new Error(`Language not supported: ${languageCode}`);
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Save preference to server if user is authenticated
          const response = await fetch('/api/user/language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: languageCode }),
          });
          
          if (!response.ok && response.status !== 401) {
            console.warn('Failed to save language preference to server');
          }
          
          // Update current language
          set({
            currentLanguage: languageCode,
            isLoading: false,
          });
          
          // Load core translations for the new language
          await get().loadTranslations('common', languageCode);
          
        } catch (error) {
          // Even if server update fails, update locally
          set({
            currentLanguage: languageCode,
            isLoading: false,
            error: null, // Don't show error for offline usage
          });
          
          // Still try to load translations
          try {
            await get().loadTranslations('common', languageCode);
          } catch (translationError) {
            console.error('Failed to load translations:', translationError);
          }
        }
      },
      
      // Set locale
      setLocale: async (localeCode: string) => {
        const locale = get().getLocale(localeCode);
        if (!locale) {
          throw new Error(`Locale not supported: ${localeCode}`);
        }
        
        set({ currentLocale: localeCode });
        
        // If language changed, update it too
        if (locale.language !== get().currentLanguage) {
          await get().setLanguage(locale.language);
        }
      },
      
      // Quick language switch (local only)
      switchLanguage: (languageCode: string) => {
        const isSupported = get().isLanguageSupported(languageCode);
        if (!isSupported) {
          console.warn(`Language not supported: ${languageCode}`);
          return;
        }
        
        set({ currentLanguage: languageCode });
      },
      
      // Load translations for a specific namespace
      loadTranslations: async (namespace: string, language?: string) => {
        const targetLanguage = language || get().currentLanguage;
        const cacheKey = `${targetLanguage}-${namespace}`;
        
        // Check if already loaded
        if (get().loadedNamespaces.includes(cacheKey)) {
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`/api/translations/${targetLanguage}/${namespace}`);
          
          if (!response.ok) {
            // Try fallback language
            const fallbackLanguage = get().fallbackLanguage;
            if (targetLanguage !== fallbackLanguage) {
              const fallbackResponse = await fetch(`/api/translations/${fallbackLanguage}/${namespace}`);
              if (fallbackResponse.ok) {
                const fallbackTranslations = await fallbackResponse.json();
                set((state) => ({
                  translations: {
                    ...state.translations,
                    [namespace]: {
                      ...state.translations[namespace],
                      ...fallbackTranslations,
                    },
                  },
                  loadedNamespaces: [...state.loadedNamespaces, cacheKey],
                  isLoading: false,
                }));
                return;
              }
            }
            throw new Error(`Failed to load translations for ${namespace}`);
          }
          
          const translations = await response.json();
          
          set((state) => ({
            translations: {
              ...state.translations,
              [namespace]: {
                ...state.translations[namespace],
                ...translations,
              },
            },
            loadedNamespaces: [...state.loadedNamespaces, cacheKey],
            isLoading: false,
            lastUpdated: new Date(),
          }));
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load translations',
            isLoading: false,
          });
        }
      },
      
      // Load multiple namespaces
      loadMultipleNamespaces: async (namespaces: string[], language?: string) => {
        const targetLanguage = language || get().currentLanguage;
        
        const loadPromises = namespaces.map(namespace =>
          get().loadTranslations(namespace, targetLanguage)
        );
        
        await Promise.all(loadPromises);
      },
      
      // Get translation with interpolation
      getTranslation: (key: string, namespace: string = 'common', variables?: Record<string, any>): string => {
        const translations = get().translations[namespace] || {};
        let translation = translations[key];
        
        // Fallback to fallback language
        if (!translation) {
          const fallbackLanguage = get().fallbackLanguage;
          const currentLanguage = get().currentLanguage;
          
          if (currentLanguage !== fallbackLanguage) {
            const fallbackTranslations = get().translations[namespace] || {};
            translation = fallbackTranslations[key];
          }
        }
        
        // Fallback to key if no translation found
        if (!translation) {
          console.warn(`Translation missing: ${namespace}.${key}`);
          return key;
        }
        
        // Interpolate variables
        if (variables) {
          Object.entries(variables).forEach(([variable, value]) => {
            const regex = new RegExp(`{{\\s*${variable}\\s*}}`, 'g');
            translation = translation.replace(regex, String(value));
          });
        }
        
        return translation;
      },
      
      // Alias for getTranslation
      translate: (key: string, namespace?: string, variables?: Record<string, any>): string => {
        return get().getTranslation(key, namespace, variables);
      },
      
      // Plural translations
      translatePlural: (key: string, count: number, namespace: string = 'common', variables?: Record<string, any>): string => {
        const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
        const translation = get().getTranslation(pluralKey, namespace, {
          count,
          ...variables,
        });
        
        // Fallback to singular form if plural not found
        if (translation === pluralKey) {
          return get().getTranslation(key, namespace, { count, ...variables });
        }
        
        return translation;
      },
      
      // Load available languages
      loadLanguages: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/languages');
          
          if (!response.ok) {
            throw new Error('Failed to load languages');
          }
          
          const languages: Language[] = await response.json();
          
          set({
            availableLanguages: languages,
            isLoading: false,
            lastUpdated: new Date(),
          });
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load languages',
            isLoading: false,
          });
        }
      },
      
      // Load available locales
      loadLocales: async () => {
        try {
          const response = await fetch('/api/locales');
          
          if (response.ok) {
            const locales: Locale[] = await response.json();
            set({ availableLocales: locales });
          }
        } catch (error) {
          console.error('Failed to load locales:', error);
        }
      },
      
      // Auto-detect user language
      detectUserLanguage: async (): Promise<string> => {
        try {
          const response = await fetch('/api/language/detect');
          
          if (response.ok) {
            const { language } = await response.json();
            return language;
          }
        } catch (error) {
          console.error('Language detection failed:', error);
        }
        
        // Fallback to browser language
        const browserLanguage = navigator.language.split('-')[0];
        const isSupported = get().isLanguageSupported(browserLanguage);
        
        return isSupported ? browserLanguage : 'en';
      },
      
      // Auto-detect user locale
      detectUserLocale: async (): Promise<string> => {
        try {
          const response = await fetch('/api/locale/detect');
          
          if (response.ok) {
            const { locale } = await response.json();
            return locale;
          }
        } catch (error) {
          console.error('Locale detection failed:', error);
        }
        
        // Fallback to browser locale
        return navigator.language || 'en-US';
      },
      
      // Get language information
      getLanguage: (code: string) => {
        return get().availableLanguages.find(language => language.code === code);
      },
      
      // Get locale information
      getLocale: (code: string) => {
        return get().availableLocales.find(locale => locale.code === code);
      },
      
      // Get supported languages (active only)
      getSupportedLanguages: () => {
        return get().availableLanguages.filter(language => language.isActive);
      },
      
      // Get comprehensive language info
      getLanguageInfo: (code: string) => {
        const language = get().getLanguage(code);
        if (!language) return null;
        
        return {
          name: language.name,
          nativeName: language.nativeName,
          flag: language.flag ?? undefined,
          isRTL: language.isRTL,
          completeness: language.completeness,
        };
      },
      
      // Formatting utilities
      formatDate: (date: Date, format?: string): string => {
        const locale = get().currentLocale;
        const language = get().getLanguage(get().currentLanguage);
        
        if (format && language?.dateFormat) {
          // Use custom format if provided
          return new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
          }).format(date);
        }
        
        return new Intl.DateTimeFormat(locale).format(date);
      },
      
      formatTime: (date: Date, format?: string): string => {
        const locale = get().currentLocale;
        return new Intl.DateTimeFormat(locale, {
          timeStyle: 'short',
        }).format(date);
      },
      
      formatDateTime: (date: Date, format?: string): string => {
        const locale = get().currentLocale;
        return new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date);
      },
      
      formatNumber: (number: number, options?: Intl.NumberFormatOptions): string => {
        const locale = get().currentLocale;
        return new Intl.NumberFormat(locale, options).format(number);
      },
      
      formatCurrency: (amount: number, currency: string, options?: Intl.NumberFormatOptions): string => {
        const locale = get().currentLocale;
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          ...options,
        }).format(amount);
      },
      
      formatRelativeTime: (date: Date): string => {
        const locale = get().currentLocale;
        const now = new Date();
        const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
        
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        if (Math.abs(diffInSeconds) < 60) {
          return rtf.format(diffInSeconds, 'second');
        } else if (Math.abs(diffInSeconds) < 3600) {
          return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
        } else if (Math.abs(diffInSeconds) < 86400) {
          return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
        } else {
          return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
        }
      },
      
      // Utility functions
      isRTL: (language?: string): boolean => {
        const languageCode = language || get().currentLanguage;
        const languageInfo = get().getLanguage(languageCode);
        return languageInfo?.isRTL || false;
      },
      
      getDirection: (language?: string): 'ltr' | 'rtl' => {
        return get().isRTL(language) ? 'rtl' : 'ltr';
      },
      
      isLanguageSupported: (code: string): boolean => {
        return get().availableLanguages.some(language => 
          language.code === code && language.isActive
        );
      },
      
      getTranslationProgress: (language: string): number => {
        const languageInfo = get().getLanguage(language);
        return languageInfo?.completeness || 0;
      },
      
      // Preload namespace for better performance
      preloadNamespace: async (namespace: string, language?: string) => {
        await get().loadTranslations(namespace, language);
      },
      
      // Clear translation cache
      clearTranslationCache: () => {
        set({
          translations: {},
          loadedNamespaces: [],
        });
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
      name: 'language-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        currentLocale: state.currentLocale,
        fallbackLanguage: state.fallbackLanguage,
        autoDetect: state.autoDetect,
        translations: state.translations,
        loadedNamespaces: state.loadedNamespaces,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentLanguage = () => useLanguageStore((state) => state.currentLanguage);
export const useCurrentLocale = () => useLanguageStore((state) => state.currentLocale);
export const useAvailableLanguages = () => useLanguageStore((state) => state.getSupportedLanguages());
export const useTranslate = () => useLanguageStore((state) => state.translate);
export const useTranslatePlural = () => useLanguageStore((state) => state.translatePlural);
export const useFormatDate = () => useLanguageStore((state) => state.formatDate);
export const useFormatNumber = () => useLanguageStore((state) => state.formatNumber);
export const useIsRTL = () => useLanguageStore((state) => state.isRTL());
export const useDirection = () => useLanguageStore((state) => state.getDirection());
export const useLanguageLoading = () => useLanguageStore((state) => state.isLoading);
export const useLanguageError = () => useLanguageStore((state) => state.error);