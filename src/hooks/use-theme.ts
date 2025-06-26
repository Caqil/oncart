import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: 'light' | 'dark';
}

export function useTheme(): UseThemeReturn {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>('theme', 'system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const resolvedTheme = storedTheme === 'system' ? systemTheme : storedTheme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', resolvedTheme === 'dark' ? '#000000' : '#ffffff');
    }
  }, [storedTheme, systemTheme]);

  const setTheme = useCallback((theme: Theme) => {
    setStoredTheme(theme);
  }, [setStoredTheme]);

  const toggleTheme = useCallback(() => {
    const currentResolvedTheme = storedTheme === 'system' ? systemTheme : storedTheme;
    setTheme(currentResolvedTheme === 'light' ? 'dark' : 'light');
  }, [storedTheme, systemTheme, setTheme]);

  const resolvedTheme = storedTheme === 'system' ? systemTheme : storedTheme;

  return {
    theme: storedTheme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  };
}
