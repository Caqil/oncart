export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  RETURNED = 'RETURNED',
  FAILED = 'FAILED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  DISPUTED = 'DISPUTED',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
  PROCESSED = 'PROCESSED',
  COMPLETED = 'COMPLETED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Customer information
  customer: OrderCustomer;
  
  // Addresses
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  
  // Shipping
  shippingMethod?: OrderShippingMethod | null;
  estimatedDelivery?: Date | null;
  actualDelivery?: Date | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  
  // Payment
  paymentMethod?: OrderPaymentMethod | null;
  transactionId?: string | null;
  
  // Coupons & Discounts
  appliedCoupons: AppliedCoupon[];
  
  // Notes
  customerNotes?: string | null;
  adminNotes?: string | null;
  
  // Metadata
  source: 'web' | 'mobile' | 'api' | 'admin';
  ipAddress?: string | null;
  userAgent?: string | null;
  
  // Timestamps
  placedAt: Date;
  confirmedAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  
  // Computed fields
  itemCount: number;
  canCancel: boolean;
  canReturn: boolean;
  canRefund: boolean;
  daysUntilAutoComplete: number;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  vendorId: string;
  
  // Product info (snapshot at time of order)
  name: string;
  sku: string;
  image?: string | null;
  
  // Pricing
  price: number;
  comparePrice?: number | null;
  quantity: number;
  total: number;
  
  // Variant info
  variantOptions?: VariantOptionSnapshot[] | null;
  
  // Digital product info
  digitalFiles?: OrderDigitalFile[] | null;
  downloadCount: number;
  downloadExpiry?: Date | null;
  
  // Status
  fulfillmentStatus: FulfillmentStatus;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  
  // Relations
  product: {
    id: string;
    name: string;
    slug: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  };
  vendor: {
    id: string;
    storeName: string;
    storeSlug: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantOptionSnapshot {
  name: string; // e.g., "Color"
  value: string; // e.g., "Red"
  colorCode?: string | null;
}

export interface OrderDigitalFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface OrderShippingMethod {
  id: string;
  name: string;
  description?: string | null;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  trackingEnabled: boolean;
}

export interface OrderPaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery' | 'wallet';
  provider: string;
  last4?: string | null;
  brand?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  discountAmount: number;
  appliedTo: 'ORDER' | 'SHIPPING' | 'ITEM';
}

export interface OrderHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus | null;
  fulfillmentStatus?: FulfillmentStatus | null;
  comment?: string | null;
  isCustomerVisible: boolean;
  createdBy?: string | null;
  createdAt: Date;
}

export interface OrderRefund {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  method: 'original' | 'store_credit' | 'bank_transfer';
  transactionId?: string | null;
  processedBy?: string | null;
  processedAt?: Date | null;
  failureReason?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  items: OrderRefundItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderRefundItem {
  id: string;
  orderItemId: string;
  quantity: number;
  amount: number;
  reason: string;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  returnNumber: string;
  reason: string;
  status: ReturnStatus;
  items: OrderReturnItem[];
  customer: OrderCustomer;
  returnAddress?: OrderAddress | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  estimatedReceival?: Date | null;
  actualReceival?: Date | null;
  inspectionNotes?: string | null;
  refund?: OrderRefund | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  images?: string[] | null;
  requestedAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason: string;
  condition: 'NEW' | 'USED' | 'DAMAGED' | 'DEFECTIVE';
  images?: string[] | null;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddress: Omit<OrderAddress, 'id'>;
  billingAddress?: Omit<OrderAddress, 'id'>;
  shippingMethodId?: string;
  paymentMethodId?: string;
  couponCodes?: string[];
  customerNotes?: string;
  guestInfo?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  adminNotes?: string;
  notifyCustomer?: boolean;
}

export interface OrderListFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  vendorId?: string;
  customerId?: string;
  search?: string; // Order number, customer name, email
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  sortBy?: 'orderNumber' | 'total' | 'placedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderAnalytics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalCustomers: number;
    conversionRate: number;
    returnRate: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  paymentsByStatus: Record<PaymentStatus, number>;
  fulfillmentByStatus: Record<FulfillmentStatus, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    storeName: string;
    orders: number;
    revenue: number;
  }>;
  salesChart: Array<{
    date: string;
    orders: number;
    revenue: number;
    customers: number;
  }>;
  geographicData: Array<{
    country: string;
    orders: number;
    revenue: number;
  }>;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  commission: number;
  earnings: number;
  currency: string;
  placedAt: Date;
  estimatedDelivery?: Date | null;
  trackingNumber?: string | null;
  canUpdateStatus: boolean;
  canAddTracking: boolean;
}

export interface OrderNotification {
  type: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  vendorEmails: string[];
  adminEmails: string[];
  data: Record<string, any>;
}

export interface OrderEmailTemplate {
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, any>;
}

export interface ShippingLabel {
  id: string;
  orderId: string;
  carrier: string;
  service: string;
  trackingNumber: string;
  labelUrl: string;
  cost: number;
  currency: string;
  estimatedDelivery: Date;
  createdAt: Date;
}

export interface OrderInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  issuedAt: Date;
  dueAt?: Date | null;
  paidAt?: Date | null;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  pdfUrl?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}