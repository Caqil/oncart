export interface Language {
  code: string; // ISO 639-1 language code (e.g., 'en', 'es', 'fr')
  name: string; // Language name in English (e.g., 'English', 'Spanish')
  nativeName: string; // Language name in native script (e.g., 'English', 'Español')
  flag?: string | null; // Flag emoji or image URL
  isActive: boolean; // Whether the language is available
  isDefault: boolean; // Whether this is the default language
  isRTL: boolean; // Whether the language is right-to-left
  
  // Regional variants
  regions: LanguageRegion[];
  
  // Translation completeness
  completeness: number; // Percentage of translated strings (0-100)
  totalStrings: number;
  translatedStrings: number;
  
  // Date and number formatting
  dateFormat: string; // Date format pattern
  timeFormat: string; // Time format pattern
  numberFormat: {
    decimal: string; // Decimal separator
    thousands: string; // Thousands separator
    currency: string; // Currency format pattern
  };
  
  // Text direction and layout
  direction: 'ltr' | 'rtl';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageRegion {
  code: string; // Region code (e.g., 'US', 'GB', 'MX')
  name: string; // Region name (e.g., 'United States', 'United Kingdom')
  locale: string; // Full locale code (e.g., 'en-US', 'en-GB', 'es-MX')
  isDefault: boolean; // Default region for this language
  currency: string; // Default currency for this region
  timezone: string; // Default timezone for this region
}

export interface Translation {
  id: string;
  namespace: string; // Translation namespace (e.g., 'common', 'auth', 'shop')
  key: string; // Translation key (e.g., 'welcome.title', 'button.submit')
  value: string; // Translated text
  language: string; // Language code
  context?: string | null; // Additional context for translators
  description?: string | null; // Description of when/how this is used
  
  // Pluralization support
  pluralForms?: PluralForm[] | null;
  
  // Variables and interpolation
  variables: string[]; // List of variables used in translation
  
  // Translation metadata
  isApproved: boolean;
  isAutoTranslated: boolean;
  needsReview: boolean;
  
  // Version control
  version: number;
  previousValue?: string | null;
  
  // Translation quality
  confidence?: number | null; // Auto-translation confidence (0-1)
  quality?: TranslationQuality | null;
  
  // Timestamps
  translatedAt: Date;
  translatedBy?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PluralForm {
  form: 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
  value: string;
}

export enum TranslationQuality {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  NEEDS_WORK = 'NEEDS_WORK',
}

export interface TranslationNamespace {
  id: string;
  name: string; // e.g., 'common', 'auth', 'product'
  description?: string | null;
  path: string; // File path or logical grouping
  isCore: boolean; // Whether this is a core system namespace
  
  // Statistics
  totalKeys: number;
  translatedKeys: Record<string, number>; // Keys per language
  
  // Dependencies
  dependencies: string[]; // Other namespaces this depends on
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationKey {
  id: string;
  namespace: string;
  key: string;
  defaultValue: string; // Default/source language value
  description?: string | null;
  context?: string | null;
  
  // Key metadata
  isPlural: boolean;
  variables: string[];
  maxLength?: number | null;
  
  // Usage tracking
  usageCount: number;
  lastUsed?: Date | null;
  
  // Status
  isDeprecated: boolean;
  replacedBy?: string | null;
  
  // Translations for this key
  translations: Translation[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageSettings {
  // Default language
  defaultLanguage: string;
  fallbackLanguage: string;
  
  // Enabled languages
  enabledLanguages: string[];
  
  // Auto-detection
  autoDetectLanguage: boolean;
  detectionMethods: ('BROWSER' | 'IP' | 'USER_AGENT' | 'DOMAIN')[];
  
  // Translation settings
  enableAutoTranslation: boolean;
  autoTranslationProvider?: AutoTranslationProvider | null;
  requireApproval: boolean;
  
  // Display settings
  showLanguageSelector: boolean;
  languageSelectorPosition: 'HEADER' | 'FOOTER' | 'SIDEBAR';
  showFlags: boolean;
  showNativeNames: boolean;
  
  // URL structure
  urlStructure: 'SUBDOMAIN' | 'PATH' | 'QUERY'; // e.g., en.site.com, site.com/en, site.com?lang=en
  
  // SEO settings
  generateHreflang: boolean;
  translateUrls: boolean;
  translateMetadata: boolean;
  
  updatedAt: Date;
  updatedBy: string;
}

export enum AutoTranslationProvider {
  GOOGLE_TRANSLATE = 'GOOGLE_TRANSLATE',
  DEEPL = 'DEEPL',
  AZURE_TRANSLATOR = 'AZURE_TRANSLATOR',
  AWS_TRANSLATE = 'AWS_TRANSLATE',
  YANDEX_TRANSLATE = 'YANDEX_TRANSLATE',
}

export interface TranslationProvider {
  name: string;
  provider: AutoTranslationProvider;
  isActive: boolean;
  apiKey: string;
  apiUrl?: string | null;
  
  // Supported languages
  supportedLanguages: string[];
  
  // Pricing and limits
  charactersPerMonth: number;
  charactersUsed: number;
  costPerCharacter?: number | null;
  
  // Quality settings
  confidence: number; // Minimum confidence threshold
  
  // Features
  features: {
    batchTranslation: boolean;
    domainSpecific: boolean;
    customModels: boolean;
    qualityScoring: boolean;
  };
}

export interface TranslationRequest {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText?: string | null;
  
  // Request details
  namespace: string;
  key: string;
  context?: string | null;
  
  // Processing
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  provider?: AutoTranslationProvider | null;
  
  // Quality metrics
  confidence?: number | null;
  quality?: TranslationQuality | null;
  
  // Review status
  needsReview: boolean;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  
  // Error handling
  error?: string | null;
  retryCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationMemory {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  
  // Context and metadata
  domain?: string | null; // e.g., 'ecommerce', 'technical'
  context?: string | null;
  
  // Quality and usage
  quality: TranslationQuality;
  usageCount: number;
  lastUsed: Date;
  
  // Source information
  source: 'HUMAN' | 'AUTO' | 'IMPORTED';
  createdBy?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageAnalytics {
  // Usage statistics
  popularLanguages: Array<{
    language: string;
    userCount: number;
    pageviews: number;
    percentage: number;
  }>;
  
  // Geographic distribution
  languagesByCountry: Array<{
    country: string;
    languages: Array<{
      language: string;
      userCount: number;
    }>;
  }>;
  
  // Translation progress
  translationProgress: Array<{
    language: string;
    completeness: number;
    totalKeys: number;
    translatedKeys: number;
    needsReview: number;
  }>;
  
  // Content performance
  contentPerformance: Array<{
    language: string;
    conversionRate: number;
    bounceRate: number;
    averageSessionDuration: number;
  }>;
  
  // Translation costs
  translationCosts: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    byProvider: Record<AutoTranslationProvider, number>;
  };
}

export interface TranslationExport {
  id: string;
  format: 'JSON' | 'CSV' | 'PO' | 'XLIFF' | 'RESX';
  languages: string[];
  namespaces: string[];
  includeContext: boolean;
  includeMetadata: boolean;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string | null;
  fileSize?: number | null;
  recordCount?: number | null;
  error?: string | null;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface TranslationImport {
  id: string;
  fileName: string;
  fileSize: number;
  format: 'JSON' | 'CSV' | 'PO' | 'XLIFF' | 'RESX';
  targetLanguage: string;
  namespace?: string | null;
  
  // Processing status
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number; // 0-100
  
  // Results
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  skippedRecords: number;
  failedRecords: number;
  
  // Errors and warnings
  errors: Array<{
    row: number;
    key: string;
    message: string;
    type: 'ERROR' | 'WARNING';
  }>;
  
  // Options
  options: {
    overwriteExisting: boolean;
    markAsReviewed: boolean;
    autoApprove: boolean;
  };
  
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Locale {
  code: string; // Full locale code (e.g., 'en-US', 'fr-CA')
  language: string; // Language code (e.g., 'en', 'fr')
  region: string; // Region code (e.g., 'US', 'CA')
  displayName: string; // Display name (e.g., 'English (United States)')
  isActive: boolean;
  
  // Formatting preferences
  formatting: {
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    numberFormat: Intl.NumberFormatOptions;
    currencyFormat: Intl.NumberFormatOptions;
    percentFormat: Intl.NumberFormatOptions;
  };
  
  // Cultural preferences
  cultural: {
    weekStartsOn: number; // 0 = Sunday, 1 = Monday
    workingDays: number[]; // Array of working days (0-6)
    holidays: string[]; // Array of holiday dates
    timeZone: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationValidation {
  isValid: boolean;
  errors: TranslationValidationError[];
  warnings: TranslationValidationWarning[];
}

export interface TranslationValidationError {
  field: string;
  message: string;
  code: 'MISSING_VARIABLE' | 'INVALID_SYNTAX' | 'TOO_LONG' | 'EMPTY_VALUE';
}

export interface TranslationValidationWarning {
  field: string;
  message: string;
  code: 'POSSIBLE_TYPO' | 'INCONSISTENT_TERMINOLOGY' | 'UNTRANSLATED_CONTENT';
}

export interface TranslationWorkflow {
  id: string;
  name: string;
  description?: string | null;
  
  // Workflow steps
  steps: TranslationWorkflowStep[];
  
  // Assignment rules
  assignmentRules: {
    autoAssign: boolean;
    assignmentMethod: 'ROUND_ROBIN' | 'WORKLOAD_BASED' | 'SKILL_BASED';
    requiredSkills?: string[] | null;
  };
  
  // Quality gates
  qualityGates: {
    minimumConfidence: number;
    requireReview: boolean;
    requireApproval: boolean;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationWorkflowStep {
  id: string;
  name: string;
  type: 'TRANSLATE' | 'REVIEW' | 'APPROVE' | 'PUBLISH';
  assigneeType: 'USER' | 'ROLE' | 'AUTO';
  assignee?: string | null;
  isRequired: boolean;
  timeoutHours?: number | null;
  position: number;
}

export interface TranslationTask {
  id: string;
  workflowId: string;
  stepId: string;
  key: string;
  namespace: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  
  // Assignment
  assignedTo?: string | null;
  assignedAt?: Date | null;
  
  // Status
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'TIMEOUT';
  
  // Work details
  translatedText?: string | null;
  comments?: string | null;
  attachments?: string[] | null;
  
  // Timing
  dueDate?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationGlossary {
  id: string;
  name: string;
  description?: string | null;
  sourceLanguage: string;
  targetLanguages: string[];
  
  // Entries
  entries: GlossaryEntry[];
  
  // Usage
  isActive: boolean;
  isPublic: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface GlossaryEntry {
  id: string;
  glossaryId: string;
  sourceText: string;
  targetText: Record<string, string>; // translations by language
  context?: string | null;
  notes?: string | null;
  partOfSpeech?: string | null;
  domain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationStyle {
  id: string;
  name: string;
  language: string;
  
  // Style guidelines
  guidelines: {
    tone: 'FORMAL' | 'INFORMAL' | 'FRIENDLY' | 'PROFESSIONAL';
    voiceActive: boolean;
    abbreviations: 'AVOID' | 'STANDARD' | 'EXTENSIVE';
    technicalLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  };
  
  // Terminology preferences
  terminology: Array<{
    term: string;
    preferredTranslation: string;
    avoidTranslations: string[];
    context?: string | null;
  }>;
  
  // Format preferences
  formatting: {
    dateFormat: string;
    numberFormat: string;
    addressFormat: string;
    phoneFormat: string;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}