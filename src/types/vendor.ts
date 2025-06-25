export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum VendorType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  CORPORATION = 'CORPORATION',
  PARTNERSHIP = 'PARTNERSHIP',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  storeDescription?: string | null;
  storeLogo?: string | null;
  storeBanner?: string | null;
  storeUrl?: string | null;
  status: VendorStatus;
  type: VendorType;
  subscriptionPlan: SubscriptionPlan;
  commissionRate: number; // Percentage
  isVerified: boolean;
  verifiedAt?: Date | null;
  businessInfo: VendorBusinessInfo;
  bankInfo?: VendorBankInfo | null;
  taxInfo?: VendorTaxInfo | null;
  settings: VendorSettings;
  metrics: VendorMetrics;
  socialLinks?: VendorSocialLinks | null;
  operatingHours?: VendorOperatingHours | null;
  shippingInfo: VendorShippingInfo;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectedAt?: Date | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: Date | null;
  suspendedBy?: string | null;
  suspensionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface VendorBusinessInfo {
  businessName: string;
  businessRegistrationNumber?: string | null;
  businessLicense?: string | null;
  businessType: VendorType;
  establishedYear?: number | null;
  website?: string | null;
  address: VendorAddress;
  contactPerson: ContactPerson;
  vatNumber?: string | null;
  taxId?: string | null;
}

export interface VendorAddress {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface ContactPerson {
  firstName: string;
  lastName: string;
  title?: string | null;
  email: string;
  phone: string;
  alternativePhone?: string | null;
}

export interface VendorBankInfo {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string | null;
  swiftCode?: string | null;
  iban?: string | null;
  accountType: 'CHECKING' | 'SAVINGS' | 'BUSINESS';
  currency: string;
  isVerified: boolean;
  verifiedAt?: Date | null;
}

export interface VendorTaxInfo {
  taxId: string;
  vatNumber?: string | null;
  taxExempt: boolean;
  taxSettings: {
    collectTax: boolean;
    taxRate: number;
    taxInclusive: boolean;
    taxDisplayName: string;
  };
}

export interface VendorSettings {
  autoApproveProducts: boolean;
  autoProcessOrders: boolean;
  enableReviews: boolean;
  enableQA: boolean;
  minimumOrderAmount?: number | null;
  maxProcessingDays: number;
  returnPolicy?: string | null;
  privacyPolicy?: string | null;
  termsOfService?: string | null;
  customDomain?: string | null;
  seoSettings: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
  };
  notificationSettings: VendorNotificationSettings;
  displaySettings: VendorDisplaySettings;
}

export interface VendorNotificationSettings {
  newOrderEmail: boolean;
  newOrderSMS: boolean;
  lowStockEmail: boolean;
  lowStockSMS: boolean;
  reviewEmail: boolean;
  payoutEmail: boolean;
  systemEmail: boolean;
}

export interface VendorDisplaySettings {
  showContactInfo: boolean;
  showSocialLinks: boolean;
  showOperatingHours: boolean;
  showReviews: boolean;
  showProductCount: boolean;
  theme: 'default' | 'minimal' | 'modern' | 'classic';
  primaryColor: string;
  secondaryColor: string;
}

export interface VendorSocialLinks {
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  website?: string | null;
}

export interface VendorOperatingHours {
  monday?: DayHours | null;
  tuesday?: DayHours | null;
  wednesday?: DayHours | null;
  thursday?: DayHours | null;
  friday?: DayHours | null;
  saturday?: DayHours | null;
  sunday?: DayHours | null;
  timezone: string;
  specialHours?: SpecialHours[] | null;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string; // Format: "HH:mm"
  closeTime: string; // Format: "HH:mm"
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface SpecialHours {
  date: string; // Format: "YYYY-MM-DD"
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  description?: string | null;
}

export interface VendorShippingInfo {
  freeShippingEnabled: boolean;
  freeShippingMinAmount?: number | null;
  localDeliveryEnabled: boolean;
  localDeliveryRadius?: number | null; // in kilometers
  localDeliveryFee?: number | null;
  internationalShippingEnabled: boolean;
  processingTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
  shippingRates: VendorShippingRate[];
}

export interface VendorShippingRate {
  id: string;
  name: string;
  description?: string | null;
  rate: number;
  freeThreshold?: number | null;
  estimatedDays: {
    min: number;
    max: number;
  };
  regions: string[]; // Country codes
  weightLimits?: {
    min: number;
    max: number;
    unit: 'kg' | 'lb';
  } | null;
}

export interface VendorMetrics {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  totalEarnings: number;
  pendingPayouts: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  returnRate: number;
  totalViews: number;
  followerCount: number;
  joinedDate: Date;
  lastActiveDate?: Date | null;
}

export interface VendorAnalytics {
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    lastMonth: number;
    growthPercentage: number;
  };
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  products: {
    total: number;
    published: number;
    draft: number;
    outOfStock: number;
    lowStock: number;
  };
  traffic: {
    totalViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  salesChart: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  reference?: string | null;
  notes?: string | null;
  processedAt?: Date | null;
  processedBy?: string | null;
  failureReason?: string | null;
  ordersIncluded: string[]; // Order IDs
  createdAt: Date;
  updatedAt: Date;
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  CHECK = 'CHECK',
  CRYPTO = 'CRYPTO',
}

export interface VendorRegistrationRequest {
  storeName: string;
  storeDescription?: string;
  type: VendorType;
  businessInfo: Omit<VendorBusinessInfo, 'address'> & {
    address: Omit<VendorAddress, 'coordinates'>;
  };
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface VendorUpdateRequest {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  storeBanner?: string;
  businessInfo?: Partial<VendorBusinessInfo>;
  bankInfo?: Partial<VendorBankInfo>;
  taxInfo?: Partial<VendorTaxInfo>;
  settings?: Partial<VendorSettings>;
  socialLinks?: Partial<VendorSocialLinks>;
  operatingHours?: Partial<VendorOperatingHours>;
  shippingInfo?: Partial<VendorShippingInfo>;
}

export interface VendorApprovalRequest {
  vendorId: string;
  status: VendorStatus.APPROVED | VendorStatus.REJECTED;
  notes?: string;
  commissionRate?: number;
}

export interface VendorListFilters {
  status?: VendorStatus;
  type?: VendorType;
  subscriptionPlan?: SubscriptionPlan;
  search?: string;
  country?: string;
  verifiedOnly?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'storeName' | 'totalSales' | 'totalOrders' | 'averageRating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface VendorReview {
  id: string;
  vendorId: string;
  userId: string;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isVerifiedPurchase: boolean;
  response?: VendorReviewResponse | null;
  helpful: number;
  reported: number;
  status: 'PUBLISHED' | 'PENDING' | 'HIDDEN' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface VendorReviewResponse {
  message: string;
  respondedAt: Date;
  respondedBy: string;
}

export interface VendorSubscription {
  id: string;
  vendorId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  startDate: Date;
  endDate?: Date | null;
  autoRenew: boolean;
  amount: number;
  currency: string;
  features: string[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    storageGB: number;
    supportLevel: 'BASIC' | 'PRIORITY' | 'DEDICATED';
  };
  createdAt: Date;
  updatedAt: Date;
}