// src/lib/validations.ts - Updated with proper enum usage
import { z } from 'zod';
import { UserRole, UserStatus, AuthProvider, Gender } from '@/types/auth';
import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

// Common validation schemas
export const commonValidations = {
  email: z.string().email(ERROR_MESSAGES.INVALID_EMAIL),
  phone: z.string().regex(VALIDATION_RULES.PHONE_REGEX, ERROR_MESSAGES.INVALID_PHONE).optional(),
  url: z.string().url(ERROR_MESSAGES.INVALID_URL).optional(),
  password: z.string()
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(VALIDATION_RULES.PASSWORD_REGEX, ERROR_MESSAGES.PASSWORD_WEAK),
  slug: z.string().regex(VALIDATION_RULES.SLUG_REGEX, 'Invalid slug format'),
  colorHex: z.string().regex(VALIDATION_RULES.COLOR_HEX_REGEX, ERROR_MESSAGES.INVALID_COLOR),
  uuid: z.string().uuid('Invalid UUID format'),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Cannot be negative'),
  requiredString: z.string().min(1, ERROR_MESSAGES.REQUIRED),
  optionalString: z.string().optional(),
};

// Authentication validation schemas
export const authValidations = {
  // Sign in validation
  signIn: z.object({
    email: commonValidations.email,
    password: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    rememberMe: z.boolean().optional(),
  }),

  // Sign up validation
  signUp: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: commonValidations.email,
    password: commonValidations.password,
    confirmPassword: z.string(),
    phone: commonValidations.phone,
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
    newsletter: z.boolean().optional(),
  }).refine(data => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  }),

  // Forgot password validation
  forgotPassword: z.object({
    email: commonValidations.email,
  }),

  // Reset password validation
  resetPassword: z.object({
    token: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    password: commonValidations.password,
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  }),

  // Change password validation
  changePassword: z.object({
    currentPassword: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    newPassword: commonValidations.password,
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
    path: ['confirmPassword'],
  }),

  // Email verification
  verifyEmail: z.object({
    token: z.string().min(1, ERROR_MESSAGES.REQUIRED),
  }),

  // Two-factor authentication
  twoFactorSetup: z.object({
    secret: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    token: z.string().length(6, 'Token must be 6 digits'),
  }),

  twoFactorVerify: z.object({
    token: z.string().length(6, 'Token must be 6 digits'),
    code: z.string().length(6, 'Code must be 6 digits'),
  }),
};

// User validation schemas
export const userValidations = {
  // Create user
  createUser: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    email: commonValidations.email,
    password: commonValidations.password.optional(),
    phone: commonValidations.phone,
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus).optional(),
    dateOfBirth: z.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
  }),

  // Update user
  updateUser: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
    email: commonValidations.email.optional(),
    phone: commonValidations.phone,
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    dateOfBirth: z.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
  }),

  // Update profile
  updateProfile: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
    displayName: z.string().max(100, 'Display name too long').optional(),
    bio: z.string().max(500, 'Bio too long').optional(),
    website: commonValidations.url,
    socialLinks: z.object({
      facebook: commonValidations.url,
      twitter: commonValidations.url,
      instagram: commonValidations.url,
      linkedin: commonValidations.url,
      youtube: commonValidations.url,
    }).optional(),
  }),

  // Address validation
  address: z.object({
    type: z.enum(['HOME', 'WORK', 'BILLING', 'SHIPPING', 'OTHER'] as const),
    isDefault: z.boolean().optional(),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    company: z.string().max(100, 'Company name too long').optional(),
    addressLine1: z.string().min(1, 'Address is required').max(200, 'Address too long'),
    addressLine2: z.string().max(200, 'Address too long').optional(),
    city: z.string().min(1, 'City is required').max(100, 'City name too long'),
    state: z.string().min(1, 'State is required').max(100, 'State name too long'),
    postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
    country: z.string().min(2, 'Country is required').max(2, 'Use 2-letter country code'),
    phone: commonValidations.phone,
    instructions: z.string().max(300, 'Instructions too long').optional(),
  }),
};

// Product validation schemas
export const productValidations = {
  // Create product
  createProduct: z.object({
    name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
    description: z.string().max(5000, 'Description too long').optional(),
    shortDescription: z.string().max(300, 'Short description too long').optional(),
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
    barcode: z.string().max(50, 'Barcode too long').optional(),
    type: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE', 'SUBSCRIPTION', 'GIFT_CARD'] as const),
    price: commonValidations.positiveNumber,
    comparePrice: commonValidations.positiveNumber.optional(),
    costPrice: commonValidations.positiveNumber.optional(),
    currency: z.string().length(3, 'Currency must be 3 characters'),
    taxable: z.boolean(),
    taxRate: z.number().min(0).max(100).optional(),
    trackQuantity: z.boolean(),
    quantity: commonValidations.nonNegativeNumber,
    lowStockThreshold: commonValidations.nonNegativeNumber,
    allowBackorder: z.boolean(),
    weight: commonValidations.positiveNumber.optional(),
    weightUnit: z.enum(['KG', 'LB', 'G', 'OZ'] as const),
    dimensions: z.object({
      length: commonValidations.positiveNumber,
      width: commonValidations.positiveNumber,
      height: commonValidations.positiveNumber,
      unit: z.enum(['CM', 'IN', 'M', 'FT'] as const),
    }).optional(),
    categoryId: commonValidations.uuid.optional(),
    brandId: commonValidations.uuid.optional(),
    tags: z.array(z.string().max(50, 'Tag too long')),
    images: z.array(z.string().url('Invalid image URL')),
    metaTitle: z.string().max(60, 'Meta title too long').optional(),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    metaKeywords: z.array(z.string().max(50, 'Keyword too long')).optional(),
    shippingRequired: z.boolean(),
    featured: z.boolean().optional(),
  }),

  // Update product
  updateProduct: z.object({
    name: z.string().min(1, 'Product name is required').max(200, 'Product name too long').optional(),
    description: z.string().max(5000, 'Description too long').optional(),
    shortDescription: z.string().max(300, 'Short description too long').optional(),
    price: commonValidations.positiveNumber.optional(),
    comparePrice: commonValidations.positiveNumber.optional(),
    quantity: commonValidations.nonNegativeNumber.optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK', 'DISCONTINUED'] as const).optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string().max(50, 'Tag too long')).optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
  }),

  // Product variant
  variant: z.object({
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU too long'),
    price: commonValidations.positiveNumber.optional(),
    comparePrice: commonValidations.positiveNumber.optional(),
    quantity: commonValidations.nonNegativeNumber,
    weight: commonValidations.positiveNumber.optional(),
    optionValues: z.array(commonValidations.uuid),
    isActive: z.boolean(),
  }),

  // Category validation
  category: z.object({
    name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
    slug: commonValidations.slug,
    description: z.string().max(1000, 'Description too long').optional(),
    parentId: commonValidations.uuid.optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    metaTitle: z.string().max(60, 'Meta title too long').optional(),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
  }),

  // Brand validation
  brand: z.object({
    name: z.string().min(1, 'Brand name is required').max(100, 'Brand name too long'),
    slug: commonValidations.slug,
    description: z.string().max(1000, 'Description too long').optional(),
    website: commonValidations.url,
    isActive: z.boolean().optional(),
  }),
};

// Vendor validation schemas
export const vendorValidations = {
  // Vendor registration
  register: z.object({
    storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100, 'Store name too long'),
    storeDescription: z.string().max(1000, 'Store description too long').optional(),
    type: z.enum(['INDIVIDUAL', 'BUSINESS', 'CORPORATION', 'PARTNERSHIP'] as const),
    businessName: z.string().min(1, 'Business name is required').max(200, 'Business name too long'),
    businessRegistrationNumber: z.string().max(100, 'Registration number too long').optional(),
    businessEmail: commonValidations.email,
    businessPhone: commonValidations.phone,
    address: z.object({
      addressLine1: z.string().min(1, 'Address is required').max(200, 'Address too long'),
      addressLine2: z.string().max(200, 'Address too long').optional(),
      city: z.string().min(1, 'City is required').max(100, 'City name too long'),
      state: z.string().min(1, 'State is required').max(100, 'State name too long'),
      postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code too long'),
      country: z.string().min(2, 'Country is required').max(2, 'Use 2-letter country code'),
    }),
    contactPerson: z.object({
      firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
      lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
      title: z.string().max(100, 'Title too long').optional(),
      email: commonValidations.email,
      phone: z.string().min(1, 'Phone is required').regex(VALIDATION_RULES.PHONE_REGEX, ERROR_MESSAGES.INVALID_PHONE),
    }),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
    acceptPrivacy: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  }),

  // Update vendor
  updateVendor: z.object({
    storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100, 'Store name too long').optional(),
    storeDescription: z.string().max(1000, 'Store description too long').optional(),
    businessName: z.string().min(1, 'Business name is required').max(200, 'Business name too long').optional(),
    businessPhone: commonValidations.phone,
    website: commonValidations.url,
    socialLinks: z.object({
      facebook: commonValidations.url,
      twitter: commonValidations.url,
      instagram: commonValidations.url,
      linkedin: commonValidations.url,
      youtube: commonValidations.url,
    }).optional(),
  }),

  // Bank info validation
  bankInfo: z.object({
    accountHolderName: z.string().min(1, 'Account holder name is required').max(200, 'Name too long'),
    bankName: z.string().min(1, 'Bank name is required').max(200, 'Bank name too long'),
    accountNumber: z.string().min(1, 'Account number is required').max(50, 'Account number too long'),
    routingNumber: z.string().max(20, 'Routing number too long').optional(),
    swiftCode: z.string().max(20, 'SWIFT code too long').optional(),
    accountType: z.enum(['CHECKING', 'SAVINGS', 'BUSINESS'] as const),
  }),
};

// Order validation schemas
export const orderValidations = {
  // Create order
  createOrder: z.object({
    items: z.array(z.object({
      productId: commonValidations.uuid,
      variantId: commonValidations.uuid.optional(),
      quantity: z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one item is required'),
    shippingAddress: userValidations.address.omit({ type: true, isDefault: true }),
    billingAddress: userValidations.address.omit({ type: true, isDefault: true }).optional(),
    shippingMethodId: commonValidations.uuid.optional(),
    paymentMethodId: commonValidations.uuid.optional(),
    couponCodes: z.array(z.string().max(50, 'Coupon code too long')).optional(),
    customerNotes: z.string().max(500, 'Notes too long').optional(),
    guestInfo: z.object({
      email: commonValidations.email,
      firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
      lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
      phone: commonValidations.phone,
    }).optional(),
  }),

  // Update order
  updateOrder: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).optional(),
    trackingNumber: z.string().max(100, 'Tracking number too long').optional(),
    estimatedDelivery: z.date().optional(),
    adminNotes: z.string().max(1000, 'Notes too long').optional(),
    notifyCustomer: z.boolean().optional(),
  }),

  // Order refund
  refund: z.object({
    amount: commonValidations.positiveNumber,
    reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
    items: z.array(z.object({
      orderItemId: commonValidations.uuid,
      quantity: z.number().int().positive(),
      reason: z.string().max(200, 'Reason too long'),
    })).optional(),
    customerNotes: z.string().max(500, 'Notes too long').optional(),
  }),
};

// Payment validation schemas
export const paymentValidations = {
  // Create payment method
  createPaymentMethod: z.object({
    type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'DIGITAL_WALLET', 'BANK_ACCOUNT'] as const),
    provider: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'SQUARE'] as const),
    token: z.string().min(1, 'Payment token is required'),
    isDefault: z.boolean().optional(),
    nickname: z.string().max(50, 'Nickname too long').optional(),
    billingAddress: userValidations.address.omit({ type: true, isDefault: true }).optional(),
  }),

  // Process payment
  processPayment: z.object({
    orderId: commonValidations.uuid,
    amount: commonValidations.positiveNumber,
    currency: z.string().length(3, 'Currency must be 3 characters'),
    paymentMethodId: commonValidations.uuid.optional(),
    provider: z.enum(['STRIPE', 'PAYPAL', 'RAZORPAY', 'SQUARE', 'CASH_ON_DELIVERY'] as const),
    returnUrl: commonValidations.url.optional(),
  }),
};

// Coupon validation schemas
export const couponValidations = {
  // Create coupon
  createCoupon: z.object({
    code: z.string().min(3, 'Coupon code must be at least 3 characters').max(20, 'Coupon code too long').optional(),
    name: z.string().min(1, 'Coupon name is required').max(100, 'Coupon name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y'] as const),
    value: commonValidations.positiveNumber,
    currency: z.string().length(3, 'Currency must be 3 characters').optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerCustomer: z.number().int().positive().optional(),
    minimumAmount: commonValidations.positiveNumber.optional(),
    maximumDiscount: commonValidations.positiveNumber.optional(),
    startsAt: z.date().optional(),
    expiresAt: z.date().optional(),
    isPublic: z.boolean().optional(),
    applicableProducts: z.array(commonValidations.uuid).optional(),
    applicableCategories: z.array(commonValidations.uuid).optional(),
  }).refine(data => {
    if (data.type === 'FIXED_AMOUNT' && !data.currency) {
      return false;
    }
    return true;
  }, {
    message: 'Currency is required for fixed amount coupons',
    path: ['currency'],
  }),

  // Apply coupon
  applyCoupon: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    cartId: commonValidations.uuid.optional(),
  }),
};

// Review validation schemas
export const reviewValidations = {
  // Create review
  createReview: z.object({
    productId: commonValidations.uuid,
    orderId: commonValidations.uuid.optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().max(100, 'Title too long').optional(),
    comment: z.string().max(1000, 'Comment too long').optional(),
    pros: z.array(z.string().max(100, 'Pro too long')).optional(),
    cons: z.array(z.string().max(100, 'Con too long')).optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    isAnonymous: z.boolean().optional(),
  }),

  // Update review
  updateReview: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
    title: z.string().max(100, 'Title too long').optional(),
    comment: z.string().max(1000, 'Comment too long').optional(),
  }),

  // Review response
  reviewResponse: z.object({
    message: z.string().min(1, 'Response message is required').max(500, 'Response too long'),
    isPublic: z.boolean().optional(),
  }),
};

// Settings validation schemas
export const settingsValidations = {
  // General settings
  general: z.object({
    siteName: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
    siteDescription: z.string().max(300, 'Site description too long'),
    siteUrl: commonValidations.url,
    contactEmail: commonValidations.email,
    supportEmail: commonValidations.email,
    phoneNumber: commonValidations.phone,
    timezone: z.string().min(1, 'Timezone is required'),
  }),

  // Email settings
  email: z.object({
    provider: z.enum(['SMTP', 'SENDGRID', 'MAILGUN', 'RESEND'] as const),
    fromName: z.string().min(1, 'From name is required').max(100, 'From name too long'),
    fromEmail: commonValidations.email,
    smtpHost: z.string().optional(),
    smtpPort: z.number().int().min(1).max(65535).optional(),
    smtpUsername: z.string().optional(),
    smtpPassword: z.string().optional(),
    apiKey: z.string().optional(),
  }),

  // Payment settings
  payment: z.object({
    defaultCurrency: z.string().length(3, 'Currency must be 3 characters'),
    enableStripe: z.boolean(),
    stripePublishableKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    enablePayPal: z.boolean(),
    paypalClientId: z.string().optional(),
    paypalClientSecret: z.string().optional(),
    enableCashOnDelivery: z.boolean(),
  }),
};

// Search and filter validation schemas
export const searchValidations = {
  // Product search
  productSearch: z.object({
    q: z.string().max(200, 'Search query too long').optional(),
    category: commonValidations.uuid.optional(),
    brand: commonValidations.uuid.optional(),
    vendor: commonValidations.uuid.optional(),
    priceMin: commonValidations.nonNegativeNumber.optional(),
    priceMax: commonValidations.positiveNumber.optional(),
    rating: z.number().min(1).max(5).optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    sortBy: z.enum(['name', 'price', 'rating', 'sales', 'created'] as const).optional(),
    sortOrder: z.enum(['asc', 'desc'] as const).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }),

  // Order search
  orderSearch: z.object({
    q: z.string().max(200, 'Search query too long').optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    amountMin: commonValidations.nonNegativeNumber.optional(),
    amountMax: commonValidations.positiveNumber.optional(),
    customerId: commonValidations.uuid.optional(),
    vendorId: commonValidations.uuid.optional(),
  }),
};

// File upload validation
export const uploadValidations = {
  image: z.object({
    file: z.any().refine((file) => {
      if (!(file instanceof File)) return false;
      return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    }, 'Invalid image format'),
    maxSize: z.number().optional(),
    minWidth: z.number().optional(),
    minHeight: z.number().optional(),
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
  }),

  document: z.object({
    file: z.any().refine((file) => {
      if (!(file instanceof File)) return false;
      return ['application/pdf', 'application/msword', 'text/plain'].includes(file.type);
    }, 'Invalid document format'),
    maxSize: z.number().optional(),
  }),
};

// Validation helper functions
export class ValidationHelpers {
  // Validate email format
  static isValidEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL_REGEX.test(email);
  }

  // Validate phone format
  static isValidPhone(phone: string): boolean {
    return VALIDATION_RULES.PHONE_REGEX.test(phone);
  }

  // Validate URL format
  static isValidUrl(url: string): boolean {
    return VALIDATION_RULES.URL_REGEX.test(url);
  }

  // Validate password strength
  static isStrongPassword(password: string): boolean {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH &&
           VALIDATION_RULES.PASSWORD_REGEX.test(password);
  }

  // Validate slug format
  static isValidSlug(slug: string): boolean {
    return VALIDATION_RULES.SLUG_REGEX.test(slug);
  }

  // Validate hex color
  static isValidHexColor(color: string): boolean {
    return VALIDATION_RULES.COLOR_HEX_REGEX.test(color);
  }

  // Validate file size
  static isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // Validate image dimensions
  static async validateImageDimensions(
    file: File,
    constraints: {
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(url);

        const isValid = 
          (!constraints.minWidth || width >= constraints.minWidth) &&
          (!constraints.minHeight || height >= constraints.minHeight) &&
          (!constraints.maxWidth || width <= constraints.maxWidth) &&
          (!constraints.maxHeight || height <= constraints.maxHeight);

        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  }

  // Sanitize input string
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // Validate and sanitize HTML
  static sanitizeHtml(html: string): string {
    // This is a basic implementation
    // In production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  // Check if string contains profanity (basic implementation)
  static containsProfanity(text: string): boolean {
    const profanityWords = ['spam', 'fake']; // Add more words as needed
    const lowercaseText = text.toLowerCase();
    return profanityWords.some(word => lowercaseText.includes(word));
  }

  // Validate date range
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  // Validate numeric range
  static isValidNumericRange(min: number, max: number): boolean {
    return min <= max;
  }

  // Validate array length
  static isValidArrayLength(array: any[], min: number, max: number): boolean {
    return array.length >= min && array.length <= max;
  }
}

// Custom validation errors
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validation result interface
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

// Generic validation function
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }

    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
      }],
    };
  }
}

// Export all validation schemas
export const validationSchemas = {
  auth: authValidations,
  user: userValidations,
  product: productValidations,
  vendor: vendorValidations,
  order: orderValidations,
  payment: paymentValidations,
  coupon: couponValidations,
  review: reviewValidations,
  settings: settingsValidations,
  search: searchValidations,
  upload: uploadValidations,
};

// Default export
export default validationSchemas;