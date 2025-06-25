export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  TIERED = 'TIERED',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  CHECK = 'CHECK',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  STORE_CREDIT = 'STORE_CREDIT',
}

export interface Commission {
  id: string;
  vendorId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  
  // Commission details
  type: CommissionType;
  rate: number; // Percentage or fixed amount
  grossAmount: number; // Order item total
  commissionAmount: number; // Commission earned
  platformFee: number; // Platform's share
  netAmount: number; // Vendor's net earning
  currency: string;
  
  // Status and processing
  status: CommissionStatus;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  
  // Payout information
  payoutId?: string | null;
  paidAt?: Date | null;
  payoutMethod?: PayoutMethod | null;
  
  // Refund handling
  refundedAmount: number;
  refundedAt?: Date | null;
  refundReason?: string | null;
  
  // Tax information
  taxAmount?: number | null;
  taxRate?: number | null;
  taxIncluded: boolean;
  
  // Period tracking
  periodStart: Date;
  periodEnd: Date;
  
  // Metadata
  notes?: string | null;
  metadata?: Record<string, any> | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vendor: {
    id: string;
    storeName: string;
    commissionRate: number;
  };
  order: {
    id: string;
    orderNumber: string;
    placedAt: Date;
    status: string;
  };
  orderItem: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  };
  product: {
    id: string;
    name: string;
    sku: string;
  };
  payout?: {
    id: string;
    status: PayoutStatus;
    method: PayoutMethod;
    processedAt?: Date | null;
  } | null;
}

export interface CommissionRule {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  priority: number;
  
  // Rule conditions
  conditions: CommissionRuleConditions;
  
  // Commission configuration
  commissionConfig: CommissionConfiguration;
  
  // Date range
  validFrom?: Date | null;
  validTo?: Date | null;
  
  // Usage tracking
  usageCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CommissionRuleConditions {
  // Vendor conditions
  vendorIds?: string[] | null;
  vendorTiers?: string[] | null;
  vendorRegions?: string[] | null;
  excludeVendorIds?: string[] | null;
  
  // Product conditions
  productIds?: string[] | null;
  categoryIds?: string[] | null;
  brandIds?: string[] | null;
  excludeProductIds?: string[] | null;
  excludeCategoryIds?: string[] | null;
  
  // Order conditions
  minOrderValue?: number | null;
  maxOrderValue?: number | null;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  
  // Customer conditions
  customerTiers?: string[] | null;
  firstTimeCustomers?: boolean | null;
  
  // Time conditions
  timeOfDay?: {
    start: string; // HH:mm
    end: string; // HH:mm
  } | null;
  daysOfWeek?: number[] | null; // 0-6
  seasonalPeriods?: Array<{
    start: string; // MM-DD
    end: string; // MM-DD
  }> | null;
  
  // Performance conditions
  minSalesVolume?: number | null;
  minRating?: number | null;
  maxReturnRate?: number | null;
}

export interface CommissionConfiguration {
  type: CommissionType;
  
  // Percentage or fixed amount
  rate?: number | null;
  amount?: number | null;
  
  // Tiered commission
  tiers?: CommissionTier[] | null;
  
  // Performance-based commission
  performanceMetrics?: PerformanceMetrics | null;
  
  // Caps and limits
  maxCommissionPerOrder?: number | null;
  maxCommissionPerMonth?: number | null;
  minCommissionThreshold?: number | null;
  
  // Platform fee
  platformFeeRate?: number | null;
  platformFeeAmount?: number | null;
}

export interface CommissionTier {
  threshold: number; // Sales volume threshold
  rate: number; // Commission rate for this tier
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
}

export interface PerformanceMetrics {
  basedOn: 'SALES_VOLUME' | 'ORDER_COUNT' | 'RATING' | 'RETURN_RATE' | 'CONVERSION_RATE';
  tiers: Array<{
    threshold: number;
    multiplier: number; // Multiplier for base commission
  }>;
  evaluationPeriod: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface Payout {
  id: string;
  vendorId: string;
  payoutNumber: string;
  status: PayoutStatus;
  method: PayoutMethod;
  
  // Amount details
  grossAmount: number;
  deductions: PayoutDeduction[];
  netAmount: number;
  currency: string;
  
  // Commission details
  commissionIds: string[];
  commissionCount: number;
  periodStart: Date;
  periodEnd: Date;
  
  // Payment details
  paymentReference?: string | null;
  paymentDetails: PaymentDetails;
  
  // Processing
  processedAt?: Date | null;
  processedBy?: string | null;
  failureReason?: string | null;
  
  // Fees
  processingFee: number;
  transactionFee: number;
  
  // Tax information
  taxAmount?: number | null;
  taxDocumentUrl?: string | null;
  
  // Hold information
  isOnHold: boolean;
  holdReason?: string | null;
  holdUntil?: Date | null;
  
  // Notifications
  notificationsSent: string[]; // ['email', 'sms', 'push']
  
  // Metadata
  notes?: string | null;
  metadata?: Record<string, any> | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vendor: {
    id: string;
    storeName: string;
    email: string;
  };
  commissions: Array<{
    id: string;
    orderId: string;
    amount: number;
    date: Date;
  }>;
}

export interface PayoutDeduction {
  type: 'PROCESSING_FEE' | 'TRANSACTION_FEE' | 'TAX' | 'CHARGEBACK' | 'REFUND' | 'ADJUSTMENT' | 'PENALTY';
  amount: number;
  description: string;
  reference?: string | null;
}

export interface PaymentDetails {
  // Bank transfer
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    accountType: 'CHECKING' | 'SAVINGS';
    swiftCode?: string | null;
  } | null;
  
  // PayPal
  paypalEmail?: string | null;
  
  // Stripe
  stripeAccountId?: string | null;
  
  // Cryptocurrency
  cryptoAddress?: string | null;
  cryptoCurrency?: string | null;
  
  // Store credit
  creditAmount?: number | null;
  creditReference?: string | null;
}

export interface CommissionAnalytics {
  overview: {
    totalCommissions: number;
    totalEarnings: number;
    totalPayouts: number;
    pendingPayouts: number;
    averageCommissionRate: number;
    topEarningVendor: string;
  };
  
  byVendor: Array<{
    vendorId: string;
    storeName: string;
    totalCommissions: number;
    totalEarnings: number;
    averageCommissionRate: number;
    orderCount: number;
    lastPayoutDate?: Date | null;
  }>;
  
  byProduct: Array<{
    productId: string;
    productName: string;
    totalCommissions: number;
    totalEarnings: number;
    orderCount: number;
    averageCommissionRate: number;
  }>;
  
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalCommissions: number;
    totalEarnings: number;
    averageCommissionRate: number;
  }>;
  
  trends: Array<{
    date: string;
    totalCommissions: number;
    totalEarnings: number;
    payoutAmount: number;
    vendorCount: number;
  }>;
  
  payoutMethods: Array<{
    method: PayoutMethod;
    count: number;
    amount: number;
    percentage: number;
  }>;
  
  commissionDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface CommissionStatement {
  id: string;
  vendorId: string;
  statementNumber: string;
  periodStart: Date;
  periodEnd: Date;
  
  // Summary
  summary: {
    totalOrders: number;
    totalSales: number;
    totalCommissions: number;
    totalDeductions: number;
    netEarnings: number;
    currency: string;
  };
  
  // Detailed breakdown
  commissions: Commission[];
  deductions: PayoutDeduction[];
  adjustments: CommissionAdjustment[];
  
  // Status
  status: 'DRAFT' | 'FINAL' | 'DISPUTED';
  issuedAt: Date;
  dueDate?: Date | null;
  
  // Files
  pdfUrl?: string | null;
  csvUrl?: string | null;
  
  // Payments
  associatedPayouts: string[]; // Payout IDs
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionAdjustment {
  id: string;
  vendorId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  reason: string;
  description?: string | null;
  reference?: string | null;
  approvedBy: string;
  appliedAt: Date;
  statementId?: string | null;
  createdAt: Date;
}

export interface VendorEarnings {
  vendorId: string;
  currency: string;
  
  // Current period
  thisMonth: {
    sales: number;
    commissions: number;
    orders: number;
  };
  
  // Previous period
  lastMonth: {
    sales: number;
    commissions: number;
    orders: number;
  };
  
  // Year to date
  yearToDate: {
    sales: number;
    commissions: number;
    orders: number;
  };
  
  // All time
  allTime: {
    sales: number;
    commissions: number;
    orders: number;
  };
  
  // Pending amounts
  pending: {
    commissions: number;
    payouts: number;
  };
  
  // Growth metrics
  growth: {
    salesGrowth: number;
    commissionGrowth: number;
    orderGrowth: number;
  };
  
  // Next payout
  nextPayout?: {
    amount: number;
    scheduledDate: Date;
    method: PayoutMethod;
  } | null;
}

export interface CommissionRule {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  priority: number;
  conditions: CommissionRuleConditions;
  commissionConfig: CommissionConfiguration;
  validFrom?: Date | null;
  validTo?: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateCommissionRuleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  conditions: CommissionRuleConditions;
  commissionConfig: CommissionConfiguration;
  validFrom?: Date;
  validTo?: Date;
}

export interface UpdateCommissionRuleRequest extends Partial<CreateCommissionRuleRequest> {
  id: string;
}

export interface CommissionCalculationResult {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  netAmount: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    effect: string;
  }>;
  breakdown: Array<{
    description: string;
    amount: number;
  }>;
}

export interface BulkPayoutRequest {
  vendorIds: string[];
  payoutMethod: PayoutMethod;
  periodStart?: Date;
  periodEnd?: Date;
  minAmount?: number;
  notes?: string;
}

export interface PayoutSchedule {
  id: string;
  vendorId?: string | null; // If null, applies to all vendors
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';
  dayOfWeek?: number | null; // 0-6 for weekly
  dayOfMonth?: number | null; // 1-31 for monthly
  minAmount: number;
  method: PayoutMethod;
  isActive: boolean;
  nextPayoutDate: Date;
  lastPayoutDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionDispute {
  id: string;
  commissionId: string;
  vendorId: string;
  orderId: string;
  disputeReason: string;
  description: string;
  requestedAmount: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  resolution?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  attachments: string[]; // URLs to supporting documents
  createdAt: Date;
  updatedAt: Date;
}