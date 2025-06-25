export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
  SQUARE = 'SQUARE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  WALLET = 'WALLET',
  CRYPTO = 'CRYPTO',
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CASH = 'CASH',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  BUY_NOW_PAY_LATER = 'BUY_NOW_PAY_LATER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  DISPUTED = 'DISPUTED',
  CHARGEBACK = 'CHARGEBACK',
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
  DISPUTE = 'DISPUTE',
  AUTHORIZATION = 'AUTHORIZATION',
  CAPTURE = 'CAPTURE',
  VOID = 'VOID',
}

export interface PaymentMethod {
  id: string;
  userId: string;
  provider: PaymentProvider;
  type: PaymentMethodType;
  isDefault: boolean;
  isActive: boolean;
  
  // Card details (for card payments)
  last4?: string | null;
  brand?: string | null; // visa, mastercard, amex, etc.
  expiryMonth?: number | null;
  expiryYear?: number | null;
  fingerprint?: string | null;
  
  // Bank account details (for bank transfers)
  bankName?: string | null;
  accountType?: 'CHECKING' | 'SAVINGS' | null;
  routingNumber?: string | null;
  
  // Digital wallet details
  walletType?: string | null; // apple_pay, google_pay, etc.
  
  // Billing address
  billingAddress?: PaymentBillingAddress | null;
  
  // Provider-specific data
  providerData?: Record<string, any> | null;
  
  // Metadata
  nickname?: string | null;
  metadata?: Record<string, any> | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentBillingAddress {
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

export interface Payment {
  id: string;
  orderId: string;
  userId?: string | null;
  provider: PaymentProvider;
  type: PaymentMethodType;
  status: PaymentStatus;
  
  // Amount details
  amount: number;
  currency: string;
  amountReceived?: number | null;
  amountRefunded: number;
  
  // Payment method
  paymentMethodId?: string | null;
  paymentMethod?: PaymentMethodSnapshot | null;
  
  // Transaction details
  transactionId?: string | null;
  providerTransactionId?: string | null;
  providerPaymentId?: string | null;
  authorizationCode?: string | null;
  
  // Fees
  processingFee: number;
  applicationFee: number;
  
  // Risk assessment
  riskScore?: number | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  fraudDetected: boolean;
  
  // Billing
  billingAddress?: PaymentBillingAddress | null;
  
  // Metadata
  description?: string | null;
  metadata?: Record<string, any> | null;
  failureReason?: string | null;
  failureCode?: string | null;
  
  // Webhooks and events
  webhookEventId?: string | null;
  
  // Timestamps
  authorizedAt?: Date | null;
  capturedAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  order: {
    id: string;
    orderNumber: string;
    total: number;
  };
  refunds?: PaymentRefund[] | null;
  disputes?: PaymentDispute[] | null;
}

export interface PaymentMethodSnapshot {
  type: PaymentMethodType;
  provider: PaymentProvider;
  last4?: string | null;
  brand?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  walletType?: string | null;
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  providerRefundId?: string | null;
  failureReason?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDispute {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'WARNING_NEEDS_RESPONSE' | 'WARNING_UNDER_REVIEW' | 'WARNING_CLOSED' | 'NEEDS_RESPONSE' | 'UNDER_REVIEW' | 'CHARGE_REFUNDED' | 'WON' | 'LOST';
  evidenceDueBy?: Date | null;
  evidenceSubmitted: boolean;
  providerDisputeId: string;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: 'REQUIRES_PAYMENT_METHOD' | 'REQUIRES_CONFIRMATION' | 'REQUIRES_ACTION' | 'PROCESSING' | 'REQUIRES_CAPTURE' | 'CANCELLED' | 'SUCCEEDED';
  clientSecret: string;
  paymentMethods: string[]; // Allowed payment method types
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentConfiguration {
  provider: PaymentProvider;
  isEnabled: boolean;
  isTestMode: boolean;
  supportedMethods: PaymentMethodType[];
  supportedCurrencies: string[];
  minimumAmount?: number | null;
  maximumAmount?: number | null;
  processingFee: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    cap?: number | null;
  };
  settings: PaymentProviderSettings;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProviderSettings {
  // Stripe
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  
  // PayPal
  paypalClientId?: string;
  paypalClientSecret?: string;
  paypalWebhookId?: string;
  
  // Razorpay
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  
  // Square
  squareApplicationId?: string;
  squareAccessToken?: string;
  squareWebhookSignatureKey?: string;
  squareEnvironment?: 'SANDBOX' | 'PRODUCTION';
  
  // Additional settings
  [key: string]: any;
}

export interface CreatePaymentMethodRequest {
  provider: PaymentProvider;
  type: PaymentMethodType;
  token?: string; // Provider token
  billingAddress?: PaymentBillingAddress;
  nickname?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodRequest {
  nickname?: string;
  isDefault?: boolean;
  billingAddress?: PaymentBillingAddress;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  provider: PaymentProvider;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentRequest {
  paymentId: string;
  orderId: string;
  paymentMethodId?: string;
  confirmationData?: Record<string, any>;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, any>;
}

export interface PaymentWebhook {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  eventId: string;
  data: Record<string, any>;
  processed: boolean;
  processedAt?: Date | null;
  attempts: number;
  lastAttemptAt?: Date | null;
  error?: string | null;
  createdAt: Date;
}

export interface PaymentAnalytics {
  overview: {
    totalPayments: number;
    totalVolume: number;
    successRate: number;
    averageAmount: number;
    totalFees: number;
    netVolume: number;
  };
  byProvider: Array<{
    provider: PaymentProvider;
    count: number;
    volume: number;
    successRate: number;
    averageAmount: number;
  }>;
  byMethod: Array<{
    method: PaymentMethodType;
    count: number;
    volume: number;
    successRate: number;
  }>;
  byCurrency: Array<{
    currency: string;
    count: number;
    volume: number;
  }>;
  failures: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  volumeChart: Array<{
    date: string;
    volume: number;
    count: number;
    successRate: number;
  }>;
  fraudMetrics: {
    totalDisputes: number;
    disputeRate: number;
    chargebackRate: number;
    fraudulentPayments: number;
  };
}

export interface PaymentReconciliation {
  id: string;
  date: Date;
  provider: PaymentProvider;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  status: 'MATCHED' | 'DISCREPANCY' | 'PENDING' | 'RESOLVED';
  discrepancies: PaymentDiscrepancy[];
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDiscrepancy {
  type: 'MISSING_PAYMENT' | 'EXTRA_PAYMENT' | 'AMOUNT_MISMATCH' | 'DUPLICATE';
  paymentId?: string | null;
  expectedAmount?: number | null;
  actualAmount?: number | null;
  description: string;
  resolved: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  nickname: string;
  provider: PaymentProvider;
  type: PaymentMethodType;
  last4?: string | null;
  brand?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  isDefault: boolean;
  isExpired: boolean;
  createdAt: Date;
}

export interface PaymentPreferences {
  defaultPaymentMethodId?: string | null;
  autoSavePaymentMethods: boolean;
  enableOneClickPayments: boolean;
  preferredCurrency: string;
  allowInternationalCards: boolean;
  require3DS: boolean;
  enableWalletPayments: boolean;
}

export interface PaymentSecurity {
  fraudDetection: boolean;
  riskThreshold: number;
  requireCVV: boolean;
  requireAVS: boolean;
  enable3DS: boolean;
  force3DSForInternational: boolean;
  blockVPN: boolean;
  blockTor: boolean;
  enableVelocityChecks: boolean;
  maxAttemptsPerHour: number;
  enableGeolocationChecks: boolean;
  blockedCountries: string[];
  allowedCountries: string[];
}

export interface InstallmentPlan {
  id: string;
  paymentId: string;
  totalAmount: number;
  installmentAmount: number;
  installmentCount: number;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  interestRate: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';
  nextPaymentDate: Date;
  installments: InstallmentPayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InstallmentPayment {
  id: string;
  planId: string;
  dueDate: Date;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';
  paidAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
}