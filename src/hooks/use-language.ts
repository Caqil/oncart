import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Language, Translation } from '@/types/language';
import { API_ROUTES } from '@/lib/constants';
import { useLocalStorage } from './use-local-storage';

interface UseLanguageReturn {
  languages: Language[];
  currentLanguage: Language;
  isLoading: boolean;
  error: string | null;
  isRTL: boolean;
  setLanguage: (languageCode: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (number: number) => string;
  getAvailableLanguages: () => Language[];
  getSupportedRegions: (languageCode: string) => any[];
  refreshTranslations: () => Promise<void>;
}

export function useLanguage(): UseLanguageReturn {
  const router = useRouter();
  const t = useTranslations();
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>('language', 'en');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load languages on mount
  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ROUTES.SETTINGS}/languages`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load languages');
      }

      setLanguages(data.languages);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load languages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback((languageCode: string): void => {
    const language = languages.find(l => l.code === languageCode);
    if (language && language.isActive) {
      setSelectedLanguage(languageCode);
      
      // Update HTML dir attribute for RTL support
      document.documentElement.dir = language.isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
      // Navigate to new locale
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${languageCode}`);
      router.push(newPath);
      
      toast.success('Language changed successfully');
    } else {
      toast.error('Invalid or inactive language');
    }
  }, [languages, setSelectedLanguage, router]);

  const formatDate = useCallback((date: Date): string => {
    const language = languages.find(l => l.code === selectedLanguage);
    if (!language) return date.toLocaleDateString();

    const locale = language.regions[0]?.locale || language.code;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
    }).format(date);
  }, [languages, selectedLanguage]);

  const formatTime = useCallback((date: Date): string => {
    const language = languages.find(l => l.code === selectedLanguage);
    if (!language) return date.toLocaleTimeString();

    const locale = language.regions[0]?.locale || language.code;
    return new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
    }).format(date);
  }, [languages, selectedLanguage]);

  const formatNumber = useCallback((number: number): string => {
    const language = languages.find(l => l.code === selectedLanguage);
    if (!language) return number.toString();

    const locale = language.regions[0]?.locale || language.code;
    return new Intl.NumberFormat(locale).format(number);
  }, [languages, selectedLanguage]);

  const getAvailableLanguages = useCallback((): Language[] => {
    return languages.filter(l => l.isActive);
  }, [languages]);

  const getSupportedRegions = useCallback((languageCode: string): any[] => {
    const language = languages.find(l => l.code === languageCode);
    return language?.regions || [];
  }, [languages]);

  const refreshTranslations = useCallback(async (): Promise<void> => {
    await loadLanguages();
    toast.success('Translations updated');
  }, [loadLanguages]);

  const currentLanguage = languages.find(l => l.code === selectedLanguage) || languages[0];
  const isRTL = currentLanguage?.isRTL || false;

  return {
    languages,
    currentLanguage,
    isLoading,
    error,
    isRTL,
    setLanguage,
    t,
    formatDate,
    formatTime,
    formatNumber,
    getAvailableLanguages,
    getSupportedRegions,
    refreshTranslations,
  };
}