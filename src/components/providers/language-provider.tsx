"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Language } from "@/types/language";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface LanguageContextType {
  languages: Language[];
  currentLanguage: Language;
  isLoading: boolean;
  error: string | null;
  isRTL: boolean;
  setLanguage: (languageCode: string) => void;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (number: number) => string;
  getAvailableLanguages: () => Language[];
  getSupportedRegions: (languageCode: string) => any[];
  refreshTranslations: () => Promise<void>;
  getTranslationProgress: (languageCode: string) => number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const defaultLanguage: Language = {
  code: "en",
  name: "English",
  nativeName: "English",
  flag: "🇺🇸",
  isActive: true,
  isDefault: true,
  isRTL: false,
  regions: [
    {
      code: "US",
      name: "United States",
      locale: "en-US",
      isDefault: true,
      currency: "USD",
      timezone: "America/New_York",
    },
  ],
  completeness: 100,
  totalStrings: 1000,
  translatedStrings: 1000,
  dateFormat: "MM/dd/yyyy",
  timeFormat: "h:mm a",
  numberFormat: {
    decimal: ".",
    thousands: ",",
    currency: "${amount}",
  },
  direction: "ltr",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([defaultLanguage]);
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<string>(
    "language",
    "en"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load languages on mount
  useEffect(() => {
    loadLanguages();
  }, []);

  // Apply language direction
  useEffect(() => {
    const language = languages.find((l) => l.code === selectedLanguage);
    if (language) {
      document.documentElement.dir = language.direction;
      document.documentElement.lang = language.code;
    }
  }, [selectedLanguage, languages]);

  const loadLanguages = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/languages");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load languages");
      }

      setLanguages(data.languages);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to load languages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback(
    (languageCode: string): void => {
      const language = languages.find(
        (l) => l.code === languageCode && l.isActive
      );

      if (language) {
        setSelectedLanguage(languageCode);

        // Apply language direction
        document.documentElement.dir = language.isRTL ? "rtl" : "ltr";
        document.documentElement.lang = languageCode;

        // Navigate to new locale path
        const currentPath = window.location.pathname;
        const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, "");
        const newPath = `/${languageCode}${pathWithoutLocale}`;

        if (newPath !== currentPath) {
          router.push(newPath);
        }

        toast.success("Language changed successfully");
      } else {
        toast.error("Invalid or inactive language");
      }
    },
    [languages, setSelectedLanguage, router]
  );

  const formatDate = useCallback(
    (date: Date): string => {
      const language = languages.find((l) => l.code === selectedLanguage);
      if (!language) return date.toLocaleDateString();

      const locale = language.regions[0]?.locale || language.code;
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }).format(date);
    },
    [languages, selectedLanguage]
  );

  const formatTime = useCallback(
    (date: Date): string => {
      const language = languages.find((l) => l.code === selectedLanguage);
      if (!language) return date.toLocaleTimeString();

      const locale = language.regions[0]?.locale || language.code;
      return new Intl.DateTimeFormat(locale, {
        timeStyle: "short",
      }).format(date);
    },
    [languages, selectedLanguage]
  );

  const formatNumber = useCallback(
    (number: number): string => {
      const language = languages.find((l) => l.code === selectedLanguage);
      if (!language) return number.toString();

      const locale = language.regions[0]?.locale || language.code;
      return new Intl.NumberFormat(locale).format(number);
    },
    [languages, selectedLanguage]
  );

  const getAvailableLanguages = useCallback((): Language[] => {
    return languages.filter((l) => l.isActive);
  }, [languages]);

  const getSupportedRegions = useCallback(
    (languageCode: string): any[] => {
      const language = languages.find((l) => l.code === languageCode);
      return language?.regions || [];
    },
    [languages]
  );

  const refreshTranslations = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/languages/refresh-translations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh translations");
      }

      await loadLanguages();
      toast.success("Translations updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh translations");
    } finally {
      setIsLoading(false);
    }
  }, [loadLanguages]);

  const getTranslationProgress = useCallback(
    (languageCode: string): number => {
      const language = languages.find((l) => l.code === languageCode);
      return language?.completeness || 0;
    },
    [languages]
  );

  const currentLanguage =
    languages.find((l) => l.code === selectedLanguage) || defaultLanguage;
  const isRTL = currentLanguage.isRTL;

  const value: LanguageContextType = {
    languages,
    currentLanguage,
    isLoading,
    error,
    isRTL,
    setLanguage,
    formatDate,
    formatTime,
    formatNumber,
    getAvailableLanguages,
    getSupportedRegions,
    refreshTranslations,
    getTranslationProgress,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
