import { Currency } from "@/types/currency";


// App Configuration
export const APP_CONFIG = {
  name: 'Multi-Vendor ECommerce',
  version: '1.0.0',
  description: 'Complete multi-vendor ecommerce platform',
  author: 'Your Company',
  website: 'https://yourwebsite.com',
  supportEmail: 'support@yourwebsite.com',
  
  // File upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Rate limiting
  rateLimitRequests: 100,
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  
  // Session
  sessionTimeout: 30 * 24 * 60 * 60, // 30 days
  
  // Security
  passwordMinLength: 8,
  tokenExpiryHours: 24,
  
  // Features
  enableMultiVendor: true,
  enableWishlist: true,
  enableReviews: true,
  enableCoupons: true,
  enableMultiCurrency: true,
  enableMultiLanguage: true,
} as const;
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  BANNED = 'BANNED',
}
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
  VENDOR: 'VENDOR' as const,
  CUSTOMER: 'CUSTOMER' as const,
} as const;

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE' as const,
  INACTIVE: 'INACTIVE' as const,
  SUSPENDED: 'SUSPENDED' as const,
  PENDING: 'PENDING' as const,
  BANNED: 'BANNED' as const,
} as const;

// Permission constants
export const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',
  
  // Vendor management
  VENDORS_READ: 'vendors:read',
  VENDORS_WRITE: 'vendors:write',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_MANAGE: 'vendors:manage',
  
  // Product management
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_APPROVE: 'products:approve',
  PRODUCTS_MANAGE: 'products:manage',
  
  // Order management
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  ORDERS_MANAGE: 'orders:manage',
  
  // Payment management
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write',
  PAYMENTS_MANAGE: 'payments:manage',
  
  // Settings management
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  SETTINGS_MANAGE: 'settings:manage',
  
  // Analytics
  ANALYTICS_READ: 'analytics:read',
  
  // System
  SYSTEM_MANAGE: 'system:manage',
} as const;

// Role-based permission mapping using enums
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ['*'], // All permissions
  [UserRole.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.VENDORS_WRITE,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.PRODUCTS_APPROVE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
  ],
  [UserRole.VENDOR]: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
  ],
  [UserRole.CUSTOMER]: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
  ],
} as const;

// Product Constants
export const PRODUCT_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REJECTED: 'REJECTED',
} as const;

export const PRODUCT_TYPES = {
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
  SERVICE: 'SERVICE',
  SUBSCRIPTION: 'SUBSCRIPTION',
  GIFT_CARD: 'GIFT_CARD',
} as const;

export const STOCK_STATUSES = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  BACKORDER: 'BACKORDER',
  PREORDER: 'PREORDER',
} as const;

// Order Constants
export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  RETURNED: 'RETURNED',
  FAILED: 'FAILED',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
} as const;

export const FULFILLMENT_STATUSES = {
  UNFULFILLED: 'UNFULFILLED',
  PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
  FULFILLED: 'FULFILLED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
} as const;

// Vendor Constants
export const VENDOR_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
  UNDER_REVIEW: 'UNDER_REVIEW',
} as const;

export const VENDOR_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
  CORPORATION: 'CORPORATION',
  PARTNERSHIP: 'PARTNERSHIP',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
} as const;

// Payment Constants
export const PAYMENT_PROVIDERS = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  RAZORPAY: 'RAZORPAY',
  SQUARE: 'SQUARE',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  WALLET: 'WALLET',
  CRYPTO: 'CRYPTO',
} as const;

export const PAYMENT_METHOD_TYPES = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  DIGITAL_WALLET: 'DIGITAL_WALLET',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  CASH: 'CASH',
  CRYPTOCURRENCY: 'CRYPTOCURRENCY',
  BUY_NOW_PAY_LATER: 'BUY_NOW_PAY_LATER',
} as const;

// Shipping Constants
export const SHIPPING_PROVIDERS = {
  FEDEX: 'FEDEX',
  UPS: 'UPS',
  DHL: 'DHL',
  USPS: 'USPS',
  ROYAL_MAIL: 'ROYAL_MAIL',
  CANADA_POST: 'CANADA_POST',
  AUSTRALIA_POST: 'AUSTRALIA_POST',
  LOCAL_COURIER: 'LOCAL_COURIER',
  CUSTOM: 'CUSTOM',
} as const;

export const SHIPPING_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED_DELIVERY: 'FAILED_DELIVERY',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
  EXCEPTION: 'EXCEPTION',
} as const;

// Coupon Constants
export const COUPON_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIPPING: 'FREE_SHIPPING',
  BUY_X_GET_Y: 'BUY_X_GET_Y',
  BULK_DISCOUNT: 'BULK_DISCOUNT',
} as const;

export const COUPON_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
  DEPLETED: 'DEPLETED',
  SCHEDULED: 'SCHEDULED',
  PAUSED: 'PAUSED',
} as const;

// Review Constants
export const REVIEW_STATUSES = {
  PUBLISHED: 'PUBLISHED',
  PENDING: 'PENDING',
  HIDDEN: 'HIDDEN',
  DELETED: 'DELETED',
  FLAGGED: 'FLAGGED',
  SPAM: 'SPAM',
} as const;

export const REVIEW_TYPES = {
  PRODUCT: 'PRODUCT',
  VENDOR: 'VENDOR',
  ORDER: 'ORDER',
  SERVICE: 'SERVICE',
} as const;

// Commission Constants
export const COMMISSION_TYPES = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  TIERED: 'TIERED',
  PERFORMANCE_BASED: 'PERFORMANCE_BASED',
} as const;

export const COMMISSION_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED',
} as const;

// Currency Constants
export const DEFAULT_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isActive: true,
    isDefault: true,
    exchangeRate: 1,
    lastUpdated: new Date(),
    rounding: 'NEAREST',
    format: {
      positive: '$#,##0.00',
      negative: '-$#,##0.00',
      zero: '$0.00',
    },
    countries: ['US'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    isActive: true,
    isDefault: false,
    exchangeRate: 0.85,
    lastUpdated: new Date(),
    rounding: 'NEAREST',
    format: {
      positive: '€#.##0,00',
      negative: '-€#.##0,00',
      zero: '€0,00',
    },
    countries: ['DE', 'FR', 'IT', 'ES', 'NL'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    isActive: true,
    isDefault: false,
    exchangeRate: 0.73,
    lastUpdated: new Date(),
    rounding: 'NEAREST',
    format: {
      positive: '£#,##0.00',
      negative: '-£#,##0.00',
      zero: '£0.00',
    },
    countries: ['GB'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Language Constants
export const DEFAULT_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isActive: true,
    isDefault: true,
    isRTL: false,
    regions: [
      { code: 'US', name: 'United States', locale: 'en-US', isDefault: true, currency: 'USD', timezone: 'America/New_York' },
      { code: 'GB', name: 'United Kingdom', locale: 'en-GB', isDefault: false, currency: 'GBP', timezone: 'Europe/London' },
    ],
    completeness: 100,
    totalStrings: 1000,
    translatedStrings: 1000,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$#,##0.00',
    },
    direction: 'ltr',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isActive: true,
    isDefault: false,
    isRTL: false,
    regions: [
      { code: 'ES', name: 'Spain', locale: 'es-ES', isDefault: true, currency: 'EUR', timezone: 'Europe/Madrid' },
      { code: 'MX', name: 'Mexico', locale: 'es-MX', isDefault: false, currency: 'MXN', timezone: 'America/Mexico_City' },
    ],
    completeness: 85,
    totalStrings: 1000,
    translatedStrings: 850,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: '#.##0,00 €',
    },
    direction: 'ltr',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as const;

// File Upload Constants
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

// API Constants
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  VENDORS: '/api/vendors',
  CART: '/api/cart',
  WISHLIST: '/api/wishlist',
  PAYMENTS: '/api/payments',
  SHIPPING: '/api/shipping',
  COUPONS: '/api/coupons',
  REVIEWS: '/api/reviews',
  UPLOAD: '/api/upload',
  SETTINGS: '/api/settings',
  ANALYTICS: '/api/analytics',
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  COLOR_HEX_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  URL_REGEX: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, number and special character',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_COLOR: 'Please enter a valid hex color',
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
  SENT: 'Sent successfully',
  UPLOADED: 'Uploaded successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Environment
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';


// Supported currencies for the platform
export const SUPPORTED_CURRENCIES = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    format: '$#,##0.00',
    isDefault: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    format: '#.##0,00 €',
    isDefault: false,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    format: '£#,##0.00',
    isDefault: false,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    locale: 'ja-JP',
    format: '¥#,##0',
    isDefault: false,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    locale: 'en-CA',
    format: 'C$#,##0.00',
    isDefault: false,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    locale: 'en-AU',
    format: 'A$#,##0.00',
    isDefault: false,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    locale: 'de-CH',
    format: 'CHF #,##0.00',
    isDefault: false,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    locale: 'zh-CN',
    format: '¥#,##0.00',
    isDefault: false,
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    locale: 'en-IN',
    format: '₹#,##,##0.00',
    isDefault: false,
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    locale: 'pt-BR',
    format: 'R$ #.##0,00',
    isDefault: false,
  },
] as const;

// Supported languages for the platform
export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: 'en-US',
    direction: 'ltr',
    isDefault: true,
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: '#,##0.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es-ES',
    direction: 'ltr',
    isDefault: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: '#.##0,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    locale: 'fr-FR',
    direction: 'ltr',
    isDefault: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: '#.##0,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    locale: 'de-DE',
    direction: 'ltr',
    isDefault: false,
    currency: 'EUR',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: '24h',
    numberFormat: '#.##0,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    locale: 'it-IT',
    direction: 'ltr',
    isDefault: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: '#.##0,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    locale: 'pt-PT',
    direction: 'ltr',
    isDefault: false,
    currency: 'EUR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: '#.##0,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    locale: 'ja-JP',
    direction: 'ltr',
    isDefault: false,
    currency: 'JPY',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    numberFormat: '#,##0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    locale: 'zh-CN',
    direction: 'ltr',
    isDefault: false,
    currency: 'CNY',
    dateFormat: 'yyyy/MM/dd',
    timeFormat: '24h',
    numberFormat: '#,##0.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    locale: 'ar-SA',
    direction: 'rtl',
    isDefault: false,
    currency: 'USD',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: '#,##0.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    locale: 'hi-IN',
    direction: 'ltr',
    isDefault: false,
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h',
    numberFormat: '#,##,##0.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as const;

// Setup-specific constants
export const SETUP_STEPS = [
  'database',
  'admin', 
  'settings',
  'complete'
] as const;

export const SETUP_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

// Database setup constants
export const REQUIRED_TABLES = [
  'User',
  'Vendor', 
  'Product',
  'ProductCategory',
  'ProductImage',
  'Order',
  'OrderItem',
  'Payment',
  'Shipping',
  'Review',
  'Coupon',
  'Setting',
  'Language',
  'Currency',
  'ShippingMethod',
  'PaymentMethod',
  'Tax',
  'Webhook',
] as const;

// Setup validation
export const SETUP_VALIDATION = {
  SITE_NAME_MIN_LENGTH: 2,
  SITE_NAME_MAX_LENGTH: 100,
  ADMIN_PASSWORD_MIN_LENGTH: 8,
  URL_REGEX: /^https?:\/\/.+/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Sample data options
export const SAMPLE_DATA_OPTIONS = {
  BASIC: 'basic', // Just categories and settings
  DEMO: 'demo', // Categories, products, vendors
  FULL: 'full', // Everything including sample orders
} as const;

// Timezone options for setup
export const SUPPORTED_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: '-05:00' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: '-06:00' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: '-08:00' },
  { value: 'Europe/London', label: 'London (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: '+01:00' },
  { value: 'Europe/Rome', label: 'Rome (CET)', offset: '+01:00' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: '+01:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: '+05:30' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: '+10:00' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)', offset: '+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: '+12:00' },
] as const;

// Default settings for new installations
export const DEFAULT_SETUP_SETTINGS = {
  SITE_NAME: 'My Store',
  SITE_DESCRIPTION: 'A modern multi-vendor ecommerce platform',
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  TIMEZONE: 'UTC',
  ALLOW_REGISTRATION: true,
  REQUIRE_EMAIL_VERIFICATION: true,
  ENABLE_MULTIVENDOR: true,
  DEFAULT_SHIPPING_RATE: 10.00,
  DEFAULT_TAX_RATE: 0.00,
  ENABLE_REVIEWS: true,
  ENABLE_WISHLIST: true,
  ENABLE_COUPONS: true,
  ENABLE_ANALYTICS: true,
} as const;

// Setup progress tracking
export const SETUP_PROGRESS_STEPS = [
  {
    id: 'database',
    title: 'Database Setup',
    description: 'Initialize database and apply migrations',
    weight: 30, // Percentage of total setup
  },
  {
    id: 'admin',
    title: 'Admin Account', 
    description: 'Create administrator account',
    weight: 20,
  },
  {
    id: 'settings',
    title: 'Store Settings',
    description: 'Configure basic store settings',
    weight: 30,
  },
  {
    id: 'complete',
    title: 'Finalization',
    description: 'Complete setup and prepare platform',
    weight: 20,
  },
] as const;

// Error messages specific to setup
export const SETUP_ERROR_MESSAGES = {
  DATABASE_CONNECTION_FAILED: 'Failed to connect to database',
  MIGRATION_FAILED: 'Database migration failed',
  SEED_DATA_FAILED: 'Failed to load initial data',
  ADMIN_CREATION_FAILED: 'Failed to create administrator account',
  ADMIN_ALREADY_EXISTS: 'Administrator account already exists',
  SETTINGS_SAVE_FAILED: 'Failed to save store settings',
  SETUP_ALREADY_COMPLETED: 'Setup has already been completed',
  INVALID_SETUP_DATA: 'Invalid setup data provided',
  SETUP_COMPLETION_FAILED: 'Failed to complete setup process',
} as const;

// Success messages for setup
export const SETUP_SUCCESS_MESSAGES = {
  DATABASE_INITIALIZED: 'Database initialized successfully',
  MIGRATIONS_APPLIED: 'Database migrations applied successfully',
  SEED_DATA_LOADED: 'Initial data loaded successfully',
  ADMIN_CREATED: 'Administrator account created successfully',
  SETTINGS_SAVED: 'Store settings saved successfully',
  SETUP_COMPLETED: 'Setup completed successfully! Welcome to your new store.',
} as const;