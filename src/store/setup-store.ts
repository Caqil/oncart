import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SetupStep = 
  | 'welcome'
  | 'database'
  | 'admin'
  | 'general'
  | 'payment'
  | 'shipping'
  | 'email'
  | 'complete';

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  url?: string; // For connection URL
}

export interface AdminConfig {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GeneralConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
}

export interface PaymentConfig {
  enableStripe: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  enablePayPal: boolean;
  paypalClientId?: string;
  paypalClientSecret?: string;
  enableCashOnDelivery: boolean;
  enableBankTransfer: boolean;
}

export interface ShippingConfig {
  enableShipping: boolean;
  defaultShippingMethod?: string;
  freeShippingThreshold?: number;
  originAddress: {
    company: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'resend';
  fromName: string;
  fromEmail: string;
  // SMTP specific
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  // Provider specific
  apiKey?: string;
}

export interface SetupData {
  database: DatabaseConfig;
  admin: AdminConfig;
  general: GeneralConfig;
  payment: PaymentConfig;
  shipping: ShippingConfig;
  email: EmailConfig;
}

export interface SetupValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

interface SetupState {
  // Current setup progress
  currentStep: SetupStep;
  completedSteps: SetupStep[];
  isSetupComplete: boolean;
  
  // Setup data
  data: Partial<SetupData>;
  
  // Validation
  validation: Record<SetupStep, SetupValidation>;
  
  // Installation progress
  isInstalling: boolean;
  installationProgress: number;
  installationLogs: string[];
  
  // Error states
  error: string | null;
  stepErrors: Record<SetupStep, string | null>;
  
  // Configuration
  availableTimezones: string[];
  availableCurrencies: Array<{ code: string; name: string; symbol: string }>;
  availableLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

interface SetupStore extends SetupState {
  // Step navigation
  setCurrentStep: (step: SetupStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: SetupStep) => void;
  markStepComplete: (step: SetupStep) => void;
  
  // Data management
  updateStepData: <K extends keyof SetupData>(step: K, data: Partial<SetupData[K]>) => void;
  setStepData: <K extends keyof SetupData>(step: K, data: SetupData[K]) => void;
  clearStepData: (step: keyof SetupData) => void;
  
  // Validation
  validateStep: (step: SetupStep) => Promise<SetupValidation>;
  validateAllSteps: () => Promise<boolean>;
  clearValidation: (step?: SetupStep) => void;
  
  // Installation process
  startInstallation: () => Promise<void>;
  testDatabaseConnection: () => Promise<boolean>;
  testEmailConfiguration: () => Promise<boolean>;
  testPaymentConfiguration: () => Promise<boolean>;
  
  // Configuration loading
  loadConfiguration: () => Promise<void>;
  saveConfiguration: () => Promise<void>;
  resetConfiguration: () => void;
  
  // Utilities
  canProceedToNext: () => boolean;
  canGoToPrevious: () => boolean;
  getStepIndex: (step: SetupStep) => number;
  getProgressPercentage: () => number;
  
  // Error management
  setError: (error: string | null) => void;
  setStepError: (step: SetupStep, error: string | null) => void;
  clearErrors: () => void;
  
  // Setup status
  checkSetupStatus: () => Promise<boolean>;
  completeSetup: () => Promise<void>;
}

const setupSteps: SetupStep[] = [
  'welcome',
  'database',
  'admin',
  'general',
  'payment',
  'shipping',
  'email',
  'complete',
];

const initialValidation: SetupValidation = {
  isValid: true,
  errors: {},
  warnings: {},
};

const initialState: SetupState = {
  currentStep: 'welcome',
  completedSteps: [],
  isSetupComplete: false,
  data: {},
  validation: setupSteps.reduce((acc, step) => {
    acc[step] = initialValidation;
    return acc;
  }, {} as Record<SetupStep, SetupValidation>),
  isInstalling: false,
  installationProgress: 0,
  installationLogs: [],
  error: null,
  stepErrors: setupSteps.reduce((acc, step) => {
    acc[step] = null;
    return acc;
  }, {} as Record<SetupStep, string | null>),
  availableTimezones: [],
  availableCurrencies: [],
  availableLanguages: [],
};

export const useSetupStore = create<SetupStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Step navigation
      setCurrentStep: (step: SetupStep) => {
        set({ currentStep: step });
      },
      
      nextStep: () => {
        const currentIndex = get().getStepIndex(get().currentStep);
        const nextIndex = Math.min(currentIndex + 1, setupSteps.length - 1);
        set({ currentStep: setupSteps[nextIndex] });
      },
      
      previousStep: () => {
        const currentIndex = get().getStepIndex(get().currentStep);
        const prevIndex = Math.max(currentIndex - 1, 0);
        set({ currentStep: setupSteps[prevIndex] });
      },
      
      goToStep: (step: SetupStep) => {
        // Check if we can go to this step (all previous steps completed)
        const stepIndex = get().getStepIndex(step);
        const completedSteps = get().completedSteps;
        
        const canGoToStep = setupSteps.slice(0, stepIndex).every(s => 
          completedSteps.includes(s) || s === 'welcome'
        );
        
        if (canGoToStep) {
          set({ currentStep: step });
        }
      },
      
      markStepComplete: (step: SetupStep) => {
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        }));
      },
      
      // Data management
      updateStepData: <K extends keyof SetupData>(step: K, data: Partial<SetupData[K]>) => {
        set((state) => ({
          data: {
            ...state.data,
            [step]: {
              ...state.data[step],
              ...data,
            },
          },
        }));
      },
      
      setStepData: <K extends keyof SetupData>(step: K, data: SetupData[K]) => {
        set((state) => ({
          data: {
            ...state.data,
            [step]: data,
          },
        }));
      },
      
      clearStepData: (step: keyof SetupData) => {
        set((state) => {
          const newData = { ...state.data };
          delete newData[step];
          return { data: newData };
        });
      },
      
      // Validation
      validateStep: async (step: SetupStep): Promise<SetupValidation> => {
        const validation: SetupValidation = { isValid: true, errors: {}, warnings: {} };
        
        try {
          const response = await fetch(`/api/setup/validate/${step}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data[step as keyof SetupData] || {}),
          });
          
          if (response.ok) {
            const result = await response.json();
            Object.assign(validation, result);
          } else {
            validation.isValid = false;
            validation.errors.general = ['Validation failed'];
          }
        } catch (error) {
          validation.isValid = false;
          validation.errors.general = ['Network error during validation'];
        }
        
        set((state) => ({
          validation: {
            ...state.validation,
            [step]: validation,
          },
        }));
        
        return validation;
      },
      
      validateAllSteps: async (): Promise<boolean> => {
        const validationPromises = setupSteps
          .filter(step => step !== 'welcome' && step !== 'complete')
          .map(step => get().validateStep(step));
        
        const results = await Promise.all(validationPromises);
        return results.every(result => result.isValid);
      },
      
      clearValidation: (step?: SetupStep) => {
        if (step) {
          set((state) => ({
            validation: {
              ...state.validation,
              [step]: initialValidation,
            },
          }));
        } else {
          set({
            validation: setupSteps.reduce((acc, s) => {
              acc[s] = initialValidation;
              return acc;
            }, {} as Record<SetupStep, SetupValidation>),
          });
        }
      },
      
      // Installation process
      startInstallation: async () => {
        set({ 
          isInstalling: true, 
          installationProgress: 0, 
          installationLogs: [],
          error: null 
        });
        
        try {
          const response = await fetch('/api/setup/install', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data),
          });
          
          if (!response.ok) {
            throw new Error('Installation failed');
          }
          
          // Create EventSource for real-time updates
          const eventSource = new EventSource('/api/setup/install/progress');
          
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            set((state) => ({
              installationProgress: data.progress,
              installationLogs: [...state.installationLogs, data.message],
            }));
            
            if (data.progress >= 100) {
              eventSource.close();
              set({ isInstalling: false });
              get().completeSetup();
            }
          };
          
          eventSource.onerror = () => {
            eventSource.close();
            set({ 
              isInstalling: false,
              error: 'Installation progress monitoring failed',
            });
          };
          
        } catch (error) {
          set({
            isInstalling: false,
            error: error instanceof Error ? error.message : 'Installation failed',
          });
          throw error;
        }
      },
      
      testDatabaseConnection: async (): Promise<boolean> => {
        try {
          const response = await fetch('/api/setup/test/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data.database || {}),
          });
          
          return response.ok;
        } catch (error) {
          return false;
        }
      },
      
      testEmailConfiguration: async (): Promise<boolean> => {
        try {
          const response = await fetch('/api/setup/test/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data.email || {}),
          });
          
          return response.ok;
        } catch (error) {
          return false;
        }
      },
      
      testPaymentConfiguration: async (): Promise<boolean> => {
        try {
          const response = await fetch('/api/setup/test/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data.payment || {}),
          });
          
          return response.ok;
        } catch (error) {
          return false;
        }
      },
      
      // Configuration loading
      loadConfiguration: async () => {
        try {
          const response = await fetch('/api/setup/config');
          
          if (response.ok) {
            const config = await response.json();
            set({
              availableTimezones: config.timezones || [],
              availableCurrencies: config.currencies || [],
              availableLanguages: config.languages || [],
            });
          }
        } catch (error) {
          console.error('Failed to load configuration:', error);
        }
      },
      
      saveConfiguration: async () => {
        try {
          await fetch('/api/setup/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().data),
          });
        } catch (error) {
          console.error('Failed to save configuration:', error);
        }
      },
      
      resetConfiguration: () => {
        set({
          currentStep: 'welcome',
          completedSteps: [],
          data: {},
          validation: setupSteps.reduce((acc, step) => {
            acc[step] = initialValidation;
            return acc;
          }, {} as Record<SetupStep, SetupValidation>),
        });
      },
      
      // Utilities
      canProceedToNext: (): boolean => {
        const currentStep = get().currentStep;
        const validation = get().validation[currentStep];
        
        // Welcome step can always proceed
        if (currentStep === 'welcome') return true;
        
        // Complete step can't proceed
        if (currentStep === 'complete') return false;
        
        return validation.isValid;
      },
      
      canGoToPrevious: (): boolean => {
        const currentStep = get().currentStep;
        return currentStep !== 'welcome' && currentStep !== 'complete';
      },
      
      getStepIndex: (step: SetupStep): number => {
        return setupSteps.indexOf(step);
      },
      
      getProgressPercentage: (): number => {
        const completedCount = get().completedSteps.length;
        const totalSteps = setupSteps.length - 1; // Exclude welcome step
        return Math.round((completedCount / totalSteps) * 100);
      },
      
      // Error management
      setError: (error: string | null) => {
        set({ error });
      },
      
      setStepError: (step: SetupStep, error: string | null) => {
        set((state) => ({
          stepErrors: {
            ...state.stepErrors,
            [step]: error,
          },
        }));
      },
      
      clearErrors: () => {
        set({ 
          error: null, 
          stepErrors: setupSteps.reduce((acc, step) => {
            acc[step] = null;
            return acc;
          }, {} as Record<SetupStep, string | null>)
        });
      },
      
      // Setup status
      checkSetupStatus: async (): Promise<boolean> => {
        try {
          const response = await fetch('/api/setup/status');
          
          if (response.ok) {
            const { isComplete } = await response.json();
            set({ isSetupComplete: isComplete });
            return isComplete;
          }
          
          return false;
        } catch (error) {
          return false;
        }
      },
      
      completeSetup: async () => {
        try {
          await fetch('/api/setup/complete', {
            method: 'POST',
          });
          
          set({
            isSetupComplete: true,
            currentStep: 'complete',
          });
        } catch (error) {
          console.error('Failed to complete setup:', error);
        }
      },
    }),
    {
      name: 'setup-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        data: state.data,
        isSetupComplete: state.isSetupComplete,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentStep = () => useSetupStore((state) => state.currentStep);
export const useCompletedSteps = () => useSetupStore((state) => state.completedSteps);
export const useSetupData = () => useSetupStore((state) => state.data);
export const useIsSetupComplete = () => useSetupStore((state) => state.isSetupComplete);
export const useSetupProgress = () => useSetupStore((state) => state.getProgressPercentage());
export const useCanProceedNext = () => useSetupStore((state) => state.canProceedToNext());
export const useCanGoBack = () => useSetupStore((state) => state.canGoToPrevious());
export const useSetupError = () => useSetupStore((state) => state.error);
export const useInstallationProgress = () => useSetupStore((state) => ({
  isInstalling: state.isInstalling,
  progress: state.installationProgress,
  logs: state.installationLogs,
}));