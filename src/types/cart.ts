export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  appliedCoupons: AppliedCartCoupon[];
  selectedShippingMethodId?: string | null;
  estimatedDelivery?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  
  // Product snapshot
  product: CartProductInfo;
  variant?: CartVariantInfo | null;
  
  // Pricing
  unitPrice: number;
  comparePrice?: number | null;
  totalPrice: number;
  
  // Availability
  isAvailable: boolean;
  maxQuantity: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  
  // Vendor info
  vendor: CartVendorInfo;
  
  // Shipping
  shippingRequired: boolean;
  shippingCost?: number | null;
  
  addedAt: Date;
  updatedAt: Date;
}

export interface CartProductInfo {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  isActive: boolean;
  
  // Pricing
  price: number;
  comparePrice?: number | null;
  
  // Inventory
  trackQuantity: boolean;
  quantity: number;
  allowBackorder: boolean;
  
  // Shipping
  shippingRequired: boolean;
  weight?: number | null;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'CM' | 'IN';
  } | null;
}

export interface CartVariantInfo {
  id: string;
  sku: string;
  price?: number | null;
  comparePrice?: number | null;
  quantity: number;
  image?: string | null;
  isActive: boolean;
  
  // Variant options
  optionValues: Array<{
    optionName: string;
    value: string;
    colorCode?: string | null;
  }>;
  
  // Physical attributes
  weight?: number | null;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'CM' | 'IN';
  } | null;
}

export interface CartVendorInfo {
  id: string;
  storeName: string;
  storeSlug: string;
  isVerified: boolean;
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED';
  
  // Shipping info
  shippingRates?: Array<{
    id: string;
    name: string;
    rate: number;
    freeThreshold?: number | null;
    estimatedDays: {
      min: number;
      max: number;
    };
  }> | null;
  
  // Processing time
  processingTime: {
    min: number;
    max: number;
    unit: 'days' | 'hours';
  };
}

export interface AppliedCartCoupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discountAmount: number;
  appliedTo: 'CART' | 'SHIPPING' | 'ITEM';
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  applicableItems?: string[] | null; // Product IDs
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  savings: number;
  estimatedDelivery?: Date | null;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  replaceQuantity?: boolean;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface RemoveCartItemRequest {
  itemId: string;
}

export interface ApplyCouponRequest {
  code: string;
}

export interface RemoveCouponRequest {
  couponId: string;
}

export interface CartValidation {
  isValid: boolean;
  errors: CartValidationError[];
  warnings: CartValidationWarning[];
}

export interface CartValidationError {
  type: 'ITEM_UNAVAILABLE' | 'INSUFFICIENT_STOCK' | 'PRICE_CHANGED' | 'VENDOR_INACTIVE' | 'PRODUCT_DISCONTINUED';
  itemId: string;
  message: string;
  currentValue?: any;
  expectedValue?: any;
}

export interface CartValidationWarning {
  type: 'LOW_STOCK' | 'PRICE_INCREASE' | 'SHIPPING_CHANGE' | 'COUPON_EXPIRING';
  itemId?: string;
  message: string;
  details?: any;
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string | null;
  cost: number;
  freeThreshold?: number | null;
  estimatedDays: {
    min: number;
    max: number;
  };
  trackingEnabled: boolean;
  
  // Vendor-specific rates
  vendorRates?: Array<{
    vendorId: string;
    rate: number;
    processingTime: {
      min: number;
      max: number;
      unit: 'days' | 'hours';
    };
  }> | null;
}

export interface CartShippingCalculation {
  shippingAddress: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
  options: ShippingOption[];
  totalWeight: number;
  totalDimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'CM' | 'IN';
  };
  estimatedDelivery: Date;
}

export interface SavedCart {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  currency: string;
  isPublic: boolean;
  shareToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartRecommendations {
  frequentlyBoughtTogether: Array<{
    productId: string;
    name: string;
    price: number;
    image: string;
    confidence: number;
  }>;
  relatedProducts: Array<{
    productId: string;
    name: string;
    price: number;
    image: string;
    reason: 'SAME_CATEGORY' | 'SAME_BRAND' | 'SIMILAR_CUSTOMERS' | 'PRICE_RANGE';
  }>;
  upsells: Array<{
    productId: string;
    name: string;
    price: number;
    image: string;
    reason: string;
    savings?: number | null;
  }>;
}

export interface CartAbandonmentData {
  cartId: string;
  userId?: string | null;
  email?: string | null;
  itemCount: number;
  total: number;
  currency: string;
  abandonedAt: Date;
  remindersSent: number;
  lastReminderSent?: Date | null;
  recoveredAt?: Date | null;
  recoveredOrderId?: string | null;
  source: 'web' | 'mobile' | 'email_reminder';
}

export interface CartRecoveryEmail {
  id: string;
  cartId: string;
  email: string;
  template: 'FIRST_REMINDER' | 'SECOND_REMINDER' | 'FINAL_REMINDER' | 'DISCOUNT_OFFER';
  sentAt: Date;
  openedAt?: Date | null;
  clickedAt?: Date | null;
  convertedAt?: Date | null;
  discountCode?: string | null;
}

export interface QuickOrder {
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface BulkAddToCart {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  replaceCart?: boolean;
}

export interface CartMergeConflict {
  guestItem: CartItem;
  userItem: CartItem;
  resolution: 'KEEP_GUEST' | 'KEEP_USER' | 'MERGE_QUANTITIES' | 'KEEP_BOTH';
}

export interface CartMergeRequest {
  guestCartId: string;
  conflicts: CartMergeConflict[];
}

export interface CartPreferences {
  autoSave: boolean;
  persistAcrossSessions: boolean;
  enableRecommendations: boolean;
  showStockWarnings: boolean;
  autoRemoveUnavailable: boolean;
  defaultShippingMethod?: string | null;
  maxItemsBeforeWarning: number;
}

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  pendingOperations: number;
}

export type CartAction =
  | { type: 'LOAD_CART_START' }
  | { type: 'LOAD_CART_SUCCESS'; payload: Cart }
  | { type: 'LOAD_CART_ERROR'; payload: string }
  | { type: 'ADD_ITEM_START' }
  | { type: 'ADD_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'ADD_ITEM_ERROR'; payload: string }
  | { type: 'UPDATE_ITEM_START' }
  | { type: 'UPDATE_ITEM_SUCCESS'; payload: CartItem }
  | { type: 'UPDATE_ITEM_ERROR'; payload: string }
  | { type: 'REMOVE_ITEM_START' }
  | { type: 'REMOVE_ITEM_SUCCESS'; payload: string }
  | { type: 'REMOVE_ITEM_ERROR'; payload: string }
  | { type: 'APPLY_COUPON_START' }
  | { type: 'APPLY_COUPON_SUCCESS'; payload: AppliedCartCoupon }
  | { type: 'APPLY_COUPON_ERROR'; payload: string }
  | { type: 'REMOVE_COUPON_START' }
  | { type: 'REMOVE_COUPON_SUCCESS'; payload: string }
  | { type: 'REMOVE_COUPON_ERROR'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SHIPPING_METHOD'; payload: string }
  | { type: 'VALIDATE_CART'; payload: CartValidation };

export interface CartAnalytics {
  totalCarts: number;
  activeCarts: number;
  abandonedCarts: number;
  abandonmentRate: number;
  averageCartValue: number;
  averageItemsPerCart: number;
  conversionRate: number;
  topAbandonedProducts: Array<{
    productId: string;
    name: string;
    abandonmentCount: number;
    abandonmentRate: number;
  }>;
  cartValueDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    abandonmentRate: number;
  }>;
  geographicData: Array<{
    country: string;
    carts: number;
    abandonmentRate: number;
  }>;
}

export interface CartOptimizationSuggestions {
  reduceAbandonmentRate: string[];
  increaseAverageOrderValue: string[];
  improveConversionRate: string[];
  enhanceUserExperience: string[];
}