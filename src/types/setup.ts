export interface SetupProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  completedSteps: string[];
  currentStepStatus: 'pending' | 'in_progress' | 'completed' | 'error';
}

export interface SetupValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface DatabaseSetupResult {
  success: boolean;
  tablesCreated: number;
  migrationsApplied: number;
  seedDataLoaded: boolean;
  duration: number; // milliseconds
  error?: string;
}

export interface AdminSetupResult {
  success: boolean;
  userId: string;
  email: string;
  error?: string;
}

export interface StoreSetupResult {
  success: boolean;
  settingsConfigured: number;
  error?: string;
}

export interface SetupCompletionResult {
  success: boolean;
  setupId: string;
  completedAt: Date;
  redirectUrl: string;
  error?: string;
}

// Base setup data interface (used in components)
export interface SetupData {
  database: {
    status: 'pending' | 'checking' | 'migrating' | 'seeding' | 'completed' | 'error';
    migrationsApplied: boolean;
    seedDataLoaded: boolean;
    error?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    created: boolean;
  };
  settings: {
    siteName: string;
    siteUrl: string;
    currency: string;
    language: string;
    timezone: string;
    configured: boolean;
  };
  completed: boolean;
}

// Extended setup data with additional tracking
export interface ExtendedSetupData extends SetupData {
  progress: SetupProgress;
  validation: SetupValidation;
  sampleData: {
    enabled: boolean;
    type: 'basic' | 'demo' | 'full';
    loaded: boolean;
  };
  backups: {
    enabled: boolean;
    beforeSetup: boolean;
    afterSetup: boolean;
  };
  performance: {
    startTime: Date;
    stepDurations: Record<string, number>;
    totalDuration?: number;
  };
}

// Setup step configuration
export interface SetupStepConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<SetupStepProps>;
  required: boolean;
  weight: number; // For progress calculation
  dependencies?: string[]; // Steps that must be completed first
  validation?: (data: SetupData) => SetupValidation;
}

// Props passed to each setup step component
export interface SetupStepProps {
  onNext: (data?: any) => void;
  onPrevious: () => void;
  onComplete: (data: any) => Promise<void>;
  setupData: SetupData;
  isLoading: boolean;
  error?: string;
}

// API response types
export interface SetupStatusResponse {
  completed: boolean;
  completedSteps: string[];
  setupData: Partial<SetupData>;
  message?: string;
}

export interface DatabaseCheckResponse {
  connected: boolean;
  migrationsApplied: boolean;
  migrationsPending: string[];
  seedDataLoaded: boolean;
  tablesCreated: number;
  totalTables: number;
  error?: string;
}

export interface SetupSummaryResponse {
  database: {
    tablesCreated: number;
    migrationsApplied: number;
    seedDataLoaded: boolean;
  };
  admin: {
    name: string;
    email: string;
  };
  store: {
    name: string;
    url: string;
    currency: string;
    language: string;
    multivendorEnabled: boolean;
  };
  nextSteps: string[];
}

// Currency and Language types for setup
export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
  format: string;
  isDefault: boolean;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  direction: 'ltr' | 'rtl';
  isDefault: boolean;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  numberFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportedTimezone {
  value: string;
  label: string;
  offset: string;
}

// Setup form data types
export interface AdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface StoreSettingsFormData {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  currency: string;
  language: string;
  timezone: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableMultivendor: boolean;
  defaultShippingRate: number;
  taxRate: number;
}

// Setup error types
export interface SetupError {
  code: string;
  message: string;
  step?: string;
  field?: string;
  details?: Record<string, any>;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Setup context type
export interface SetupContextType {
  setupData: ExtendedSetupData;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  updateSetupData: (data: Partial<SetupData>) => void;
  nextStep: (data?: any) => void;
  previousStep: () => void;
  completeSetup: (data: any) => Promise<void>;
  resetSetup: () => void;
}
