export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  BULK_DISCOUNT = 'BULK_DISCOUNT',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  DEPLETED = 'DEPLETED',
  SCHEDULED = 'SCHEDULED',
  PAUSED = 'PAUSED',
}

export enum DiscountAppliesTo {
  ALL_PRODUCTS = 'ALL_PRODUCTS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
  SPECIFIC_CATEGORIES = 'SPECIFIC_CATEGORIES',
  SPECIFIC_BRANDS = 'SPECIFIC_BRANDS',
  SPECIFIC_VENDORS = 'SPECIFIC_VENDORS',
  ORDER_TOTAL = 'ORDER_TOTAL',
  SHIPPING = 'SHIPPING',
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: CouponType;
  status: CouponStatus;
  
  // Discount details
  value: number; // Percentage or fixed amount
  currency?: string | null; // For fixed amount coupons
  appliesTo: DiscountAppliesTo;
  
  // Usage limits
  usageLimit?: number | null; // Total usage limit
  usageLimitPerCustomer?: number | null;
  currentUsage: number;
  
  // Minimum requirements
  minimumAmount?: number | null;
  minimumQuantity?: number | null;
  
  // Maximum discount (for percentage coupons)
  maximumDiscount?: number | null;
  
  // Date restrictions
  startsAt?: Date | null;
  expiresAt?: Date | null;
  
  // Customer restrictions
  customerEligibility: CustomerEligibility;
  firstTimeCustomersOnly: boolean;
  
  // Product/category restrictions
  applicableProducts: string[]; // Product IDs
  excludedProducts: string[]; // Product IDs
  applicableCategories: string[]; // Category IDs
  excludedCategories: string[]; // Category IDs
  applicableBrands: string[]; // Brand IDs
  excludedBrands: string[]; // Brand IDs
  applicableVendors: string[]; // Vendor IDs
  excludedVendors: string[]; // Vendor IDs
  
  // Buy X Get Y specific
  buyXGetYConfig?: BuyXGetYConfig | null;
  
  // Bulk discount specific
  bulkDiscountConfig?: BulkDiscountConfig | null;
  
  // Stackability
  canStackWithOtherCoupons: boolean;
  excludedCouponIds: string[];
  
  // Auto-apply settings
  autoApply: boolean;
  autoApplyConditions?: AutoApplyConditions | null;
  
  // Visibility
  isPublic: boolean;
  showOnStorefront: boolean;
  
  // Vendor-specific (for marketplace)
  vendorId?: string | null;
  isVendorCoupon: boolean;
  
  // Generated coupons
  isGenerated: boolean;
  generatedFrom?: string | null; // Parent coupon ID
  
  // Metadata
  source: 'ADMIN' | 'VENDOR' | 'API' | 'CAMPAIGN' | 'AUTOMATED';
  campaignId?: string | null;
  tags: string[];
  internalNotes?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  
  // Relations
  vendor?: {
    id: string;
    storeName: string;
  } | null;
  
  // Computed fields
  isActive: boolean;
  isExpired: boolean;
  isDepleted: boolean;
  remainingUses?: number | null;
  usagePercentage: number;
}

export interface CustomerEligibility {
  type: 'ALL' | 'SPECIFIC_CUSTOMERS' | 'CUSTOMER_GROUPS' | 'SEGMENTS';
  customerIds?: string[] | null;
  customerGroupIds?: string[] | null;
  segmentIds?: string[] | null;
  excludedCustomerIds?: string[] | null;
}

export interface BuyXGetYConfig {
  buyQuantity: number;
  getQuantity: number;
  buyProductIds?: string[] | null; // If empty, applies to any product
  getProductIds?: string[] | null; // If empty, same as buy products
  getDiscountType: 'FREE' | 'PERCENTAGE' | 'FIXED_AMOUNT';
  getDiscountValue?: number | null; // For percentage or fixed amount
  maxApplications?: number | null; // How many times the offer can apply in one order
}

export interface BulkDiscountConfig {
  tiers: BulkDiscountTier[];
  basedOn: 'QUANTITY' | 'AMOUNT';
}

export interface BulkDiscountTier {
  threshold: number; // Quantity or amount threshold
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
}

export interface AutoApplyConditions {
  minimumAmount?: number | null;
  minimumQuantity?: number | null;
  specificProducts?: string[] | null;
  specificCategories?: string[] | null;
  customerGroups?: string[] | null;
  newCustomersOnly?: boolean | null;
  priority: number; // Lower number = higher priority
}

export interface CouponUsage {
  id: string;
  couponId: string;
  orderId: string;
  userId?: string | null;
  usedAt: Date;
  discountAmount: number;
  currency: string;
  orderTotal: number;
  
  // Relations
  coupon: {
    id: string;
    code: string;
    type: CouponType;
  };
  order: {
    id: string;
    orderNumber: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CouponValidation {
  isValid: boolean;
  coupon?: Coupon | null;
  discountAmount?: number | null;
  errors: CouponValidationError[];
  warnings: CouponValidationWarning[];
}

export interface CouponValidationError {
  code: string;
  message: string;
  type: 'INVALID_CODE' | 'EXPIRED' | 'DEPLETED' | 'NOT_STARTED' | 'USAGE_LIMIT_EXCEEDED' | 
        'MIN_AMOUNT_NOT_MET' | 'MIN_QUANTITY_NOT_MET' | 'CUSTOMER_NOT_ELIGIBLE' | 
        'PRODUCTS_NOT_APPLICABLE' | 'CANNOT_STACK' | 'INACTIVE';
}

export interface CouponValidationWarning {
  code: string;
  message: string;
  type: 'NEAR_EXPIRY' | 'LIMITED_USES_REMAINING' | 'FIRST_TIME_ONLY' | 'VENDOR_SPECIFIC';
}

export interface CreateCouponRequest {
  code?: string; // If not provided, will be auto-generated
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  currency?: string;
  appliesTo: DiscountAppliesTo;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  minimumAmount?: number;
  minimumQuantity?: number;
  maximumDiscount?: number;
  startsAt?: Date;
  expiresAt?: Date;
  customerEligibility?: CustomerEligibility;
  firstTimeCustomersOnly?: boolean;
  applicableProducts?: string[];
  excludedProducts?: string[];
  applicableCategories?: string[];
  excludedCategories?: string[];
  applicableBrands?: string[];
  excludedBrands?: string[];
  applicableVendors?: string[];
  excludedVendors?: string[];
  buyXGetYConfig?: BuyXGetYConfig;
  bulkDiscountConfig?: BulkDiscountConfig;
  canStackWithOtherCoupons?: boolean;
  excludedCouponIds?: string[];
  autoApply?: boolean;
  autoApplyConditions?: AutoApplyConditions;
  isPublic?: boolean;
  showOnStorefront?: boolean;
  vendorId?: string;
  tags?: string[];
  internalNotes?: string;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  id: string;
  status?: CouponStatus;
}

export interface CouponListFilters {
  status?: CouponStatus;
  type?: CouponType;
  vendorId?: string;
  search?: string; // Search by code, name, description
  isExpired?: boolean;
  isDepleted?: boolean;
  isPublic?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  usageMin?: number;
  usageMax?: number;
  sortBy?: 'code' | 'name' | 'value' | 'usage' | 'expiresAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CouponAnalytics {
  overview: {
    totalCoupons: number;
    activeCoupons: number;
    totalUsage: number;
    totalDiscountGiven: number;
    averageDiscountAmount: number;
    conversionRate: number;
  };
  topCoupons: Array<{
    couponId: string;
    code: string;
    usage: number;
    discountGiven: number;
    conversionRate: number;
    revenue: number;
  }>;
  couponPerformance: Array<{
    couponId: string;
    code: string;
    type: CouponType;
    impressions: number;
    usage: number;
    conversionRate: number;
    averageOrderValue: number;
    totalDiscount: number;
    roi: number;
  }>;
  usageTrends: Array<{
    date: string;
    totalUsage: number;
    uniqueUsers: number;
    discountAmount: number;
    orderValue: number;
  }>;
  customerInsights: {
    newCustomersAcquired: number;
    returningCustomers: number;
    averageLifetimeValue: number;
    retentionRate: number;
  };
  discountDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface CouponCampaign {
  id: string;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  
  // Campaign details
  objective: 'ACQUISITION' | 'RETENTION' | 'REACTIVATION' | 'UPSELL' | 'CLEARANCE';
  targetAudience: TargetAudience;
  
  // Coupons in this campaign
  couponIds: string[];
  
  // Distribution settings
  distributionChannels: DistributionChannel[];
  
  // Schedule
  startsAt: Date;
  endsAt?: Date | null;
  
  // Budget and limits
  totalBudget?: number | null;
  spentBudget: number;
  maxCouponsToGenerate?: number | null;
  generatedCoupons: number;
  
  // Performance tracking
  metrics: CampaignMetrics;
  
  // Auto-generation settings
  autoGenerate: boolean;
  generationTemplate?: CouponGenerationTemplate | null;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TargetAudience {
  customerGroups?: string[] | null;
  segments?: string[] | null;
  newCustomers?: boolean | null;
  inactiveCustomers?: boolean | null;
  highValueCustomers?: boolean | null;
  geographicRegions?: string[] | null;
  ageRange?: {
    min: number;
    max: number;
  } | null;
  purchaseHistory?: {
    categories?: string[] | null;
    brands?: string[] | null;
    minAmount?: number | null;
    maxAmount?: number | null;
    timeframe?: 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'LAST_YEAR' | null;
  } | null;
}

export interface DistributionChannel {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'POPUP' | 'BANNER' | 'SOCIAL' | 'AFFILIATE';
  isActive: boolean;
  settings: Record<string, any>;
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  recipientCount?: number | null;
  deliveredCount?: number | null;
  openRate?: number | null;
  clickRate?: number | null;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  couponsGenerated: number;
  couponsUsed: number;
  conversionRate: number;
  revenueGenerated: number;
  discountGiven: number;
  roi: number;
  newCustomersAcquired: number;
  averageOrderValue: number;
}

export interface CouponGenerationTemplate {
  prefix?: string | null;
  suffix?: string | null;
  length: number;
  includeNumbers: boolean;
  includeLetters: boolean;
  excludeSimilarChars: boolean; // Exclude 0, O, I, l, etc.
  pattern?: string | null; // e.g., "XXX-XXX-XXX"
  expiryDays?: number | null;
  usageLimit?: number | null;
}

export interface GeneratedCoupon {
  id: string;
  code: string;
  campaignId?: string | null;
  parentCouponId: string;
  assignedTo?: string | null; // User ID if assigned to specific customer
  generatedAt: Date;
  usedAt?: Date | null;
  isUsed: boolean;
  expiresAt?: Date | null;
}

export interface CouponABTest {
  id: string;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  
  // Test configuration
  variants: CouponTestVariant[];
  trafficAllocation: number[]; // Percentage for each variant
  
  // Test parameters
  hypothesis: string;
  successMetric: 'USAGE_RATE' | 'CONVERSION_RATE' | 'REVENUE' | 'AOV';
  duration?: number | null; // Days
  minSampleSize?: number | null;
  confidenceLevel: number; // 90, 95, 99
  
  // Results
  results?: ABTestResults | null;
  
  // Schedule
  startsAt: Date;
  endsAt?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CouponTestVariant {
  id: string;
  name: string;
  couponId: string;
  isControl: boolean;
  trafficPercentage: number;
  
  // Metrics
  impressions: number;
  usage: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

export interface ABTestResults {
  winner?: string | null; // Variant ID
  confidence: number;
  significantDifference: boolean;
  metrics: Record<string, {
    control: number;
    variant: number;
    improvement: number;
    pValue: number;
  }>;
  recommendation: string;
  completedAt: Date;
}

export interface CouponTemplate {
  id: string;
  name: string;
  description?: string | null;
  category: 'WELCOME' | 'ABANDONED_CART' | 'BIRTHDAY' | 'LOYALTY' | 'SEASONAL' | 'CLEARANCE';
  template: Omit<CreateCouponRequest, 'code' | 'name'>;
  isActive: boolean;
  usageCount: number;
  
  // Variables that can be customized
  variables: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    defaultValue?: any;
    required: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponRecommendation {
  type: 'INCREASE_USAGE' | 'REDUCE_DISCOUNT' | 'EXTEND_EXPIRY' | 'TARGET_AUDIENCE' | 'COMBINE_OFFERS';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number;
  data: Record<string, any>;
}