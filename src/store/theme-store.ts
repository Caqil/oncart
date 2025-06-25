import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type FontSize = 'small' | 'medium' | 'large';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large';
export type Spacing = 'compact' | 'normal' | 'comfortable';

export interface ThemeCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
}

export interface ThemeSettings {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  borderRadius: BorderRadius;
  spacing: Spacing;
  enableAnimations: boolean;
  enableSounds: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  customization?: ThemeCustomization;
}

interface ThemeState {
  // Current theme settings
  settings: ThemeSettings;
  
  // System preferences
  systemTheme: 'light' | 'dark';
  
  // Available options
  availableColorSchemes: Array<{
    id: ColorScheme;
    name: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  }>;
  
  // State management
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface ThemeStore extends ThemeState {
  // Theme management
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: FontSize) => void;
  setBorderRadius: (radius: BorderRadius) => void;
  setSpacing: (spacing: Spacing) => void;
  setAnimations: (enabled: boolean) => void;
  setSounds: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  
  // Bulk updates
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  resetToDefaults: () => void;
  
  // Custom theming
  setCustomization: (customization: Partial<ThemeCustomization>) => void;
  clearCustomization: () => void;
  
  // System integration
  detectSystemTheme: () => void;
  syncWithSystem: () => void;
  
  // Utilities
  getCurrentTheme: () => 'light' | 'dark';
  getEffectiveTheme: () => 'light' | 'dark';
  getThemeClass: () => string;
  getCSSVariables: () => Record<string, string>;
  
  // Persistence
  saveThemeSettings: () => Promise<void>;
  loadThemeSettings: () => Promise<void>;
  
  // Accessibility
  getAccessibilitySettings: () => {
    highContrast: boolean;
    reduceMotion: boolean;
    fontSize: FontSize;
  };
  
  // Presets
  applyPreset: (presetName: string) => void;
  saveAsPreset: (name: string) => void;
  getPresets: () => Array<{ name: string; settings: ThemeSettings }>;
  
  // DOM manipulation
  applyThemeToDOM: () => void;
  
  // Loading and error management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const defaultSettings: ThemeSettings = {
  mode: 'system',
  colorScheme: 'default',
  fontSize: 'medium',
  borderRadius: 'medium',
  spacing: 'normal',
  enableAnimations: true,
  enableSounds: false,
  highContrast: false,
  reduceMotion: false,
};

const colorSchemes = [
  {
    id: 'default' as ColorScheme,
    name: 'Default',
    description: 'Clean and modern default theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
    },
  },
  {
    id: 'blue' as ColorScheme,
    name: 'Ocean Blue',
    description: 'Calming blue tones',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
    },
  },
  {
    id: 'green' as ColorScheme,
    name: 'Forest Green',
    description: 'Natural green palette',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
    },
  },
  {
    id: 'purple' as ColorScheme,
    name: 'Royal Purple',
    description: 'Elegant purple shades',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
    },
  },
  {
    id: 'orange' as ColorScheme,
    name: 'Sunset Orange',
    description: 'Warm orange tones',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
    },
  },
  {
    id: 'red' as ColorScheme,
    name: 'Cherry Red',
    description: 'Bold red palette',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
    },
  },
];

const initialState: ThemeState = {
  settings: defaultSettings,
  systemTheme: 'light',
  availableColorSchemes: colorSchemes,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Theme mode management
      setThemeMode: (mode: ThemeMode) => {
        set((state) => ({
          settings: { ...state.settings, mode },
          lastUpdated: new Date(),
        }));
        
        // Apply theme immediately
        get().applyThemeToDOM();
      },
      
      setColorScheme: (scheme: ColorScheme) => {
        set((state) => ({
          settings: { ...state.settings, colorScheme: scheme },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setFontSize: (size: FontSize) => {
        set((state) => ({
          settings: { ...state.settings, fontSize: size },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setBorderRadius: (radius: BorderRadius) => {
        set((state) => ({
          settings: { ...state.settings, borderRadius: radius },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setSpacing: (spacing: Spacing) => {
        set((state) => ({
          settings: { ...state.settings, spacing },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setAnimations: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, enableAnimations: enabled },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setSounds: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, enableSounds: enabled },
          lastUpdated: new Date(),
        }));
      },
      
      setHighContrast: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, highContrast: enabled },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      setReduceMotion: (enabled: boolean) => {
        set((state) => ({
          settings: { ...state.settings, reduceMotion: enabled },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      // Bulk updates
      updateSettings: (newSettings: Partial<ThemeSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      resetToDefaults: () => {
        set({
          settings: defaultSettings,
          lastUpdated: new Date(),
        });
        
        get().applyThemeToDOM();
      },
      
      // Custom theming
      setCustomization: (customization: Partial<ThemeCustomization>) => {
        const defaultCustomization: ThemeCustomization = {
          primaryColor: '',
          secondaryColor: '',
          accentColor: '',
          backgroundColor: '',
          surfaceColor: '',
          textColor: '',
          borderColor: '',
        };
        set((state) => ({
          settings: {
            ...state.settings,
            customization: {
              ...defaultCustomization,
              ...state.settings.customization,
              ...customization,
            },
          },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      clearCustomization: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            customization: undefined,
          },
          lastUpdated: new Date(),
        }));
        
        get().applyThemeToDOM();
      },
      
      // System integration
      detectSystemTheme: () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        set({ systemTheme: prefersDark ? 'dark' : 'light' });
      },
      
      syncWithSystem: () => {
        get().detectSystemTheme();
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          set({ systemTheme: e.matches ? 'dark' : 'light' });
          if (get().settings.mode === 'system') {
            get().applyThemeToDOM();
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        
        // Return cleanup function
        return () => mediaQuery.removeEventListener('change', handleChange);
      },
      
      // Utilities
      getCurrentTheme: (): 'light' | 'dark' => {
        const { mode } = get().settings;
        const { systemTheme } = get();
        
        if (mode === 'system') {
          return systemTheme;
        }
        
        return mode;
      },
      
      getEffectiveTheme: (): 'light' | 'dark' => {
        return get().getCurrentTheme();
      },
      
      getThemeClass: (): string => {
        const { settings } = get();
        const theme = get().getCurrentTheme();
        
        const classes = [
          theme,
          `color-scheme-${settings.colorScheme}`,
          `font-size-${settings.fontSize}`,
          `border-radius-${settings.borderRadius}`,
          `spacing-${settings.spacing}`,
        ];
        
        if (settings.highContrast) classes.push('high-contrast');
        if (settings.reduceMotion) classes.push('reduce-motion');
        if (!settings.enableAnimations) classes.push('no-animations');
        
        return classes.join(' ');
      },
      
      getCSSVariables: (): Record<string, string> => {
        const { settings, availableColorSchemes } = get();
        const scheme = availableColorSchemes.find(s => s.id === settings.colorScheme);
        const theme = get().getCurrentTheme();
        
        const variables: Record<string, string> = {};
        
        // Color variables
        if (scheme) {
          variables['--color-primary'] = scheme.colors.primary;
          variables['--color-secondary'] = scheme.colors.secondary;
          variables['--color-accent'] = scheme.colors.accent;
        }
        
        // Font size variables
        const fontSizes = {
          small: '14px',
          medium: '16px',
          large: '18px',
        };
        variables['--font-size-base'] = fontSizes[settings.fontSize];
        
        // Border radius variables
        const borderRadii = {
          none: '0px',
          small: '4px',
          medium: '8px',
          large: '12px',
        };
        variables['--border-radius'] = borderRadii[settings.borderRadius];
        
        // Spacing variables
        const spacings = {
          compact: '0.75',
          normal: '1',
          comfortable: '1.25',
        };
        variables['--spacing-multiplier'] = spacings[settings.spacing];
        
        // Custom colors if available
        if (settings.customization) {
          Object.entries(settings.customization).forEach(([key, value]) => {
            variables[`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
          });
        }
        
        return variables;
      },
      
      // Apply theme to DOM
      applyThemeToDOM: () => {
        const root = document.documentElement;
        const themeClass = get().getThemeClass();
        const cssVariables = get().getCSSVariables();
        
        // Remove existing theme classes
        root.className = root.className
          .split(' ')
          .filter(cls => !cls.startsWith('theme-') && 
                         !cls.includes('color-scheme-') &&
                         !cls.includes('font-size-') &&
                         !cls.includes('border-radius-') &&
                         !cls.includes('spacing-') &&
                         cls !== 'high-contrast' &&
                         cls !== 'reduce-motion' &&
                         cls !== 'no-animations' &&
                         cls !== 'light' &&
                         cls !== 'dark')
          .join(' ');
        
        // Add new theme classes
        root.className += ` ${themeClass}`;
        
        // Apply CSS variables
        Object.entries(cssVariables).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
      },
      
      // Persistence
      saveThemeSettings: async () => {
        try {
          const response = await fetch('/api/user/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: get().settings }),
          });
          
          if (!response.ok && response.status !== 401) {
            console.warn('Failed to save theme settings to server');
          }
        } catch (error) {
          console.error('Failed to save theme settings:', error);
        }
      },
      
      loadThemeSettings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/user/theme');
          
          if (response.ok) {
            const { settings } = await response.json();
            set({
              settings: { ...defaultSettings, ...settings },
              isLoading: false,
              lastUpdated: new Date(),
            });
            
            get().applyThemeToDOM();
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load theme settings',
            isLoading: false,
          });
        }
      },
      
      // Accessibility
      getAccessibilitySettings: () => {
        const { settings } = get();
        return {
          highContrast: settings.highContrast,
          reduceMotion: settings.reduceMotion,
          fontSize: settings.fontSize,
        };
      },
      
      // Presets
      applyPreset: (presetName: string) => {
        const presets = get().getPresets();
        const preset = presets.find(p => p.name === presetName);
        
        if (preset) {
          get().updateSettings(preset.settings);
        }
      },
      
      saveAsPreset: (name: string) => {
        const currentSettings = get().settings;
        const presets = get().getPresets();
        
        const newPresets = [
          ...presets.filter(p => p.name !== name),
          { name, settings: currentSettings },
        ];
        
        localStorage.setItem('theme-presets', JSON.stringify(newPresets));
      },
      
      getPresets: () => {
        try {
          const stored = localStorage.getItem('theme-presets');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
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
      name: 'theme-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  const store = useThemeStore.getState();
  store.detectSystemTheme();
  store.syncWithSystem();
  store.applyThemeToDOM();
}

// Selectors for better performance
export const useThemeMode = () => useThemeStore((state) => state.settings.mode);
export const useColorScheme = () => useThemeStore((state) => state.settings.colorScheme);
export const useCurrentTheme = () => useThemeStore((state) => state.getCurrentTheme());
export const useThemeClass = () => useThemeStore((state) => state.getThemeClass());
export const useThemeSettings = () => useThemeStore((state) => state.settings);
export const useAvailableColorSchemes = () => useThemeStore((state) => state.availableColorSchemes);
export const useThemeLoading = () => useThemeStore((state) => state.isLoading);
export const useThemeError = () => useThemeStore((state) => state.error);