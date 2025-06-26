"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'dark' | 'light';
  resolvedTheme: 'dark' | 'light';
  toggleTheme: () => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeProviderInner>{children}</ThemeProviderInner>
    </NextThemesProvider>
  );
}

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme
  useEffect(() => {
    setMounted(true);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = (localStorage.getItem('theme') as Theme) || 'system';
  
  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    
    // Update meta theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const resolvedTheme = newTheme === 'system' ? systemTheme : newTheme;
      themeColorMeta.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
    }
    
    // Dispatch storage event to sync across tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: newTheme,
    }));
  };

  const toggleTheme = () => {
    const currentResolvedTheme = theme === 'system' ? systemTheme : theme;
    setTheme(currentResolvedTheme === 'light' ? 'dark' : 'light');
  };

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const themes: Theme[] = ['light', 'dark', 'system'];

  // Apply theme on mount and theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme, systemTheme, mounted]);

  // Listen for storage changes (theme changes in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted) {
    return null;
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    systemTheme,
    resolvedTheme,
    toggleTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}