export interface GeneralSettings {
  // Site identity
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  phoneNumber?: string | null;
  
  // Logo and branding
  logo?: string | null;
  favicon?: string | null;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Social media
  socialMedia: {
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  };
  
  // Legal
  termsOfServiceUrl?: string | null;
  privacyPolicyUrl?: string | null;
  returnPolicyUrl?: string | null;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  
  // Analytics
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  
  // Time and locale
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface PaymentSettings {
  // Default currency
  defaultCurrency: string;
  acceptedCurrencies: string[];
  
  // Payment providers
  providers: {
    stripe: StripeSettings;
    paypal: PayPalSettings;
    razorpay: RazorpaySettings;
    square: SquareSettings;
    bankTransfer: BankTransferSettings;
    cashOnDelivery: CashOnDeliverySettings;
  };
  
  // Payment options
  allowGuestCheckout: boolean;
  requireBillingAddress: boolean;
  savePaymentMethods: boolean;
  autoCapture: boolean;
  
  // Security
  enable3DSecure: boolean;
  fraudDetection: boolean;
  
  // Fees
  processingFees: {
    creditCard: number; // percentage
    debitCard: number; // percentage
    digitalWallet: number; // percentage
    bankTransfer: number; // fixed amount
  };
  
  updatedAt: Date;
  updatedBy: string;
}

export interface StripeSettings {
  enabled: boolean;
  testMode: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  supportedMethods: string[];
  connectAccountId?: string | null;
}

export interface PayPalSettings {
  enabled: boolean;
  testMode: boolean;
  clientId: string;
  clientSecret: string;
  webhookId: string;
  supportedMethods: string[];
}

export interface RazorpaySettings {
  enabled: boolean;
  testMode: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  supportedMethods: string[];
}

export interface SquareSettings {
  enabled: boolean;
  testMode: boolean;
  applicationId: string;
  accessToken: string;
  webhookSignatureKey: string;
  locationId: string;
}

export interface BankTransferSettings {
  enabled: boolean;
  instructions: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode?: string | null;
  };
  verificationRequired: boolean;
}

export interface CashOnDeliverySettings {
  enabled: boolean;
  availableCountries: string[];
  additionalFee: number;
  maxOrderAmount?: number | null;
  instructions: string;
}

export interface ShippingSettings {
  // Default shipping
  defaultShippingMethod?: string | null;
  freeShippingThreshold?: number | null;
  
  // Origin address
  originAddress: {
    company: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  
  // Shipping providers
  providers: {
    fedex: FedExSettings;
    ups: UPSSettings;
    dhl: DHLSettings;
    usps: USPSSettings;
    custom: CustomShippingSettings[];
  };
  
  // Shipping options
  enableLocalDelivery: boolean;
  localDeliveryRadius: number; // in kilometers
  localDeliveryFee: number;
  
  // International shipping
  enableInternationalShipping: boolean;
  internationalShippingCountries: string[];
  
  // Packaging
  defaultPackaging: {
    type: 'BOX' | 'ENVELOPE' | 'TUBE';
    weight: number; // in grams
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: 'CM' | 'IN';
    };
  };
  
  // Processing time
  processingTime: {
    min: number;
    max: number;
    unit: 'DAYS' | 'HOURS';
  };
  
  updatedAt: Date;
  updatedBy: string;
}

export interface FedExSettings {
  enabled: boolean;
  testMode: boolean;
  accountNumber: string;
  meterNumber: string;
  key: string;
  password: string;
  services: string[];
}

export interface UPSSettings {
  enabled: boolean;
  testMode: boolean;
  accessKey: string;
  username: string;
  password: string;
  accountNumber: string;
  services: string[];
}

export interface DHLSettings {
  enabled: boolean;
  testMode: boolean;
  siteId: string;
  password: string;
  accountNumber: string;
  services: string[];
}

export interface USPSSettings {
  enabled: boolean;
  testMode: boolean;
  userId: string;
  password: string;
  services: string[];
}

export interface CustomShippingSettings {
  id: string;
  name: string;
  description: string;
  rate: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  countries: string[];
  enabled: boolean;
}

export interface TaxSettings {
  // Tax configuration
  enableTax: boolean;
  taxInclusive: boolean;
  displayTaxBreakdown: boolean;
  
  // Tax rates
  defaultTaxRate: number;
  taxRates: TaxRate[];
  
  // Digital products
  digitalProductTax: boolean;
  digitalProductTaxRate: number;
  
  // International tax
  chargeInternationalTax: boolean;
  
  // Tax providers
  taxProvider?: 'MANUAL' | 'AVALARA' | 'TAXJAR' | null;
  providerSettings?: Record<string, any> | null;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  countries: string[];
  states?: string[] | null;
  cities?: string[] | null;
  postalCodes?: string[] | null;
  isActive: boolean;
}

export interface EmailSettings {
  // SMTP configuration
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  
  // Email service provider
  provider: 'SMTP' | 'SENDGRID' | 'MAILGUN' | 'SES' | 'RESEND';
  providerSettings?: Record<string, any> | null;
  
  // Default sender
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  
  // Email templates
  templates: {
    orderConfirmation: EmailTemplate;
    orderShipped: EmailTemplate;
    orderDelivered: EmailTemplate;
    orderCancelled: EmailTemplate;
    passwordReset: EmailTemplate;
    welcomeEmail: EmailTemplate;
    vendorApproval: EmailTemplate;
    payoutNotification: EmailTemplate;
  };
  
  // Email preferences
  enableTransactionalEmails: boolean;
  enableMarketingEmails: boolean;
  enableSystemEmails: boolean;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
  variables: string[];
}

export interface SEOSettings {
  // Meta defaults
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string[];
  
  // Open Graph
  openGraphImage?: string | null;
  twitterCard: 'summary' | 'summary_large_image';
  twitterSite?: string | null;
  
  // Sitemaps
  enableSitemaps: boolean;
  sitemapUrl?: string | null;
  lastSitemapGeneration?: Date | null;
  
  // Robots
  robotsTxt: string;
  
  // Analytics
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  googleSearchConsole?: string | null;
  bingWebmasterTools?: string | null;
  
  // Schema markup
  enableSchemaMarkup: boolean;
  organizationSchema: Record<string, any>;
  
  // URL structure
  productUrlFormat: 'product-name' | 'category/product-name' | 'vendor/product-name';
  categoryUrlFormat: 'category-name' | 'shop/category-name';
  
  updatedAt: Date;
  updatedBy: string;
}

export interface SecuritySettings {
  // Password requirements
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number; // days, 0 for no expiry
  };
  
  // Two-factor authentication
  enable2FA: boolean;
  require2FA: boolean;
  
  // Login security
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  enableCaptcha: boolean;
  captchaProvider: 'RECAPTCHA' | 'HCAPTCHA' | 'TURNSTILE';
  captchaSettings: Record<string, any>;
  
  // Session security
  sessionTimeout: number; // minutes
  allowMultipleSessions: boolean;
  
  // HTTPS
  forceHttps: boolean;
  hstsEnabled: boolean;
  
  // Content Security Policy
  enableCSP: boolean;
  cspDirectives: Record<string, string>;
  
  // Rate limiting
  enableRateLimit: boolean;
  rateLimitRules: RateLimitRule[];
  
  // IP blocking
  blockedIPs: string[];
  allowedIPs: string[];
  
  updatedAt: Date;
  updatedBy: string;
}

export interface RateLimitRule {
  path: string;
  method: string;
  limit: number;
  window: number; // seconds
  message: string;
}

export interface NotificationSettings {
  // Admin notifications
  adminNotifications: {
    newOrder: boolean;
    lowStock: boolean;
    newVendorRegistration: boolean;
    productReview: boolean;
    paymentFailure: boolean;
    systemError: boolean;
  };
  
  // Vendor notifications
  vendorNotifications: {
    newOrder: boolean;
    orderCancellation: boolean;
    productApproval: boolean;
    payoutProcessed: boolean;
    lowStock: boolean;
    newReview: boolean;
  };
  
  // Customer notifications
  customerNotifications: {
    orderConfirmation: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    passwordReset: boolean;
    accountUpdate: boolean;
    promotionalEmails: boolean;
    priceDropAlert: boolean;
    backInStock: boolean;
  };
  
  // Notification channels
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  
  // SMS settings
  smsProvider?: 'TWILIO' | 'NEXMO' | 'CLICKSEND' | null;
  smsSettings?: Record<string, any> | null;
  
  // Push notification settings
  pushProvider?: 'FIREBASE' | 'ONESIGNAL' | 'PUSHER' | null;
  pushSettings?: Record<string, any> | null;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface MarketplaceSettings {
  // Vendor settings
  allowVendorRegistration: boolean;
  vendorApprovalRequired: boolean;
  vendorCommissionRate: number;
  
  // Product settings
  productApprovalRequired: boolean;
  allowVendorProductCategories: boolean;
  maxProductsPerVendor?: number | null;
  
  // Commission settings
  commissionType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  commissionStructure: Record<string, any>;
  
  // Payout settings
  payoutFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  minPayoutAmount: number;
  payoutHoldPeriod: number; // days
  
  // Review settings
  enableVendorReviews: boolean;
  allowVendorResponses: boolean;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface InventorySettings {
  // Stock tracking
  trackInventory: boolean;
  allowBackorders: boolean;
  lowStockThreshold: number;
  
  // Notifications
  lowStockNotifications: boolean;
  outOfStockNotifications: boolean;
  
  // Reservations
  reserveStockDuration: number; // minutes
  
  // Multi-location
  enableMultiLocation: boolean;
  locations: InventoryLocation[];
  
  updatedAt: Date;
  updatedBy: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CacheSettings {
  // Cache providers
  provider: 'MEMORY' | 'REDIS' | 'MEMCACHED';
  
  // Cache durations (in seconds)
  productCache: number;
  categoryCache: number;
  userCache: number;
  cartCache: number;
  
  // Page caching
  enablePageCache: boolean;
  pageCacheDuration: number;
  excludedPaths: string[];
  
  // API caching
  enableApiCache: boolean;
  apiCacheDuration: number;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface BackupSettings {
  // Backup frequency
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  
  // Backup storage
  provider: 'LOCAL' | 'S3' | 'DROPBOX' | 'GOOGLE_DRIVE';
  providerSettings: Record<string, any>;
  
  // Retention
  retentionPeriod: number; // days
  maxBackups: number;
  
  // What to backup
  includeDatabase: boolean;
  includeFiles: boolean;
  includeUploads: boolean;
  
  // Encryption
  enableEncryption: boolean;
  encryptionKey?: string | null;
  
  // Last backup
  lastBackup?: Date | null;
  nextBackup?: Date | null;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface MaintenanceSettings {
  // Maintenance mode
  enabled: boolean;
  message: string;
  allowedIPs: string[];
  
  // Scheduled maintenance
  scheduledMaintenance?: {
    startTime: Date;
    endTime: Date;
    message: string;
    notifyUsers: boolean;
  } | null;
  
  updatedAt: Date;
  updatedBy: string;
}

export interface PerformanceSettings {
  // Image optimization
  enableImageOptimization: boolean;
  imageQuality: number; // 1-100
  enableWebP: boolean;
  enableLazyLoading: boolean;
  
  // Minification
  enableCSSMinification: boolean;
  enableJSMinification: boolean;
  enableHTMLMinification: boolean;
  
  // Compression
  enableGzipCompression: boolean;
  enableBrotliCompression: boolean;
  
  // CDN
  enableCDN: boolean;
  cdnUrl?: string | null;
  
  updatedAt: Date;
  updatedBy: string;
}