// src/lib/payments/stripe.ts

import {
  PaymentProvider,
  PaymentMethodType,
  PaymentStatus,
  TransactionType,
  PaymentProviderSettings,
  CreatePaymentRequest,
  ProcessPaymentRequest,
  RefundPaymentRequest,
  CreatePaymentMethodRequest,
  PaymentIntent,
  Payment,
  PaymentRefund,
  PaymentMethod,
  PaymentBillingAddress,
  PaymentMethodSnapshot,
  PaymentDispute,
} from '@/types/payment';
import { Order } from '@/types/order';

// Stripe-specific types
export interface StripeConfig extends PaymentProviderSettings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  isTestMode: boolean;
  apiVersion?: string;
  accountId?: string;
  applicationFeePercent?: number;
  automaticPaymentMethods?: boolean;
  captureMethod?: 'automatic' | 'manual';
  confirmationMethod?: 'automatic' | 'manual';
}

export interface StripePaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    network: string;
  };
  billing_details?: {
    address?: {
      city: string;
      country: string;
      line1: string;
      line2?: string;
      postal_code: string;
      state: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
}

export interface StripePaymentIntentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, any>;
  payment_method?: string;
  charges?: {
    data: Array<{
      id: string;
      amount: number;
      amount_refunded: number;
      currency: string;
      status: string;
      outcome?: {
        risk_level: string;
        risk_score: number;
      };
      balance_transaction?: {
        fee: number;
        fee_details: Array<{
          type: string;
          amount: number;
        }>;
      };
    }>;
  };
  latest_charge?: string;
  created: number;
  updated?: number;
}

export interface StripeCustomerData {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  metadata?: Record<string, any>;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

// Enhanced error handling
export class StripeError extends Error {
  public code?: string;
  public type?: string;
  public statusCode?: number;
  public requestId?: string;

  constructor(
    message: string,
    code?: string,
    type?: string,
    statusCode?: number,
    requestId?: string
  ) {
    super(message);
    this.name = 'StripeError';
    this.code = code;
    this.type = type;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

// Main Stripe payment provider class
export class StripePaymentProvider {
  private stripe: any;
  private config: StripeConfig;
  private isInitialized = false;

  constructor(config: StripeConfig) {
    this.config = config;
  }

  // Initialize Stripe client
  async initialize(): Promise<boolean> {
    try {
      // Import Stripe library
      const Stripe = require('stripe');
      
      this.stripe = new Stripe(this.config.stripeSecretKey, {
        apiVersion: this.config.apiVersion || '2023-10-16',
        typescript: true,
        stripeAccount: this.config.accountId,
      });

      // Test the connection
      await this.healthCheck();
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }
      
      await this.stripe.balance.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe health check failed:', error);
      return false;
    }
  }

  // Create payment intent
  async createPaymentIntent(request: CreatePaymentRequest): Promise<PaymentIntent> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        payment_method_types: this.getSupportedPaymentMethods(),
        capture_method: this.config.captureMethod || 'automatic',
        confirmation_method: this.config.confirmationMethod || 'automatic',
        metadata: {
          orderId: request.orderId,
          ...request.metadata,
        },
        ...(this.config.automaticPaymentMethods && {
          automatic_payment_methods: { enabled: true },
        }),
        ...(request.returnUrl && { return_url: request.returnUrl }),
        ...(this.config.applicationFeePercent && {
          application_fee_amount: Math.round(
            request.amount * 100 * (this.config.applicationFeePercent / 100)
          ),
        }),
      });

      return this.mapStripePaymentIntentToPaymentIntent(intent);
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Process payment
  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    this.ensureInitialized();

    try {
      let intent;

      if (request.paymentMethodId) {
        // Confirm with payment method
        intent = await this.stripe.paymentIntents.confirm(request.paymentId, {
          payment_method: request.paymentMethodId,
          return_url: request.confirmationData?.returnUrl,
        });
      } else if (request.confirmationData) {
        // Confirm with additional data (e.g., for 3D Secure)
        intent = await this.stripe.paymentIntents.confirm(
          request.paymentId,
          request.confirmationData
        );
      } else {
        // Just retrieve the intent
        intent = await this.stripe.paymentIntents.retrieve(request.paymentId);
      }

      return this.mapStripePaymentIntentToPayment(intent, request.orderId);
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Capture payment (for manual capture)
  async capturePayment(paymentId: string, amount?: number): Promise<Payment> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.capture(paymentId, {
        ...(amount && { amount_to_capture: Math.round(amount * 100) }),
      });

      return this.mapStripePaymentIntentToPayment(intent, intent.metadata?.orderId || '');
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Cancel payment
  async cancelPayment(paymentId: string): Promise<Payment> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentId);
      return this.mapStripePaymentIntentToPayment(intent, intent.metadata?.orderId || '');
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Refund payment
  async refundPayment(request: RefundPaymentRequest): Promise<PaymentRefund> {
    this.ensureInitialized();

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: request.paymentId,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        reason: this.mapRefundReason(request.reason),
        metadata: request.metadata || {},
      });

      return {
        id: refund.id,
        paymentId: request.paymentId,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
        reason: request.reason,
        status: this.mapStripeRefundStatus(refund.status),
        providerRefundId: refund.id,
        failureReason: refund.failure_reason || undefined,
        metadata: request.metadata,
        createdAt: new Date(refund.created * 1000),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentId, {
        expand: ['latest_charge', 'payment_method'],
      });

      return this.mapStripePaymentIntentToPayment(intent, intent.metadata?.orderId || '');
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Create payment method
  async createPaymentMethod(request: CreatePaymentMethodRequest & { customerId?: string }): Promise<PaymentMethod> {
    this.ensureInitialized();

    try {
      let paymentMethod;

      if (request.token) {
        // Use existing payment method token
        paymentMethod = await this.stripe.paymentMethods.retrieve(request.token);
      } else {
        throw new Error('Payment method token is required for Stripe');
      }

      // Attach to customer if provided
      if (request.customerId) {
        await this.stripe.paymentMethods.attach(paymentMethod.id, {
          customer: request.customerId,
        });
      }

      return this.mapStripePaymentMethodToPaymentMethod(paymentMethod, request);
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Create customer
  async createCustomer(data: {
    email?: string;
    name?: string;
    phone?: string;
    address?: PaymentBillingAddress;
    metadata?: Record<string, any>;
  }): Promise<string> {
    this.ensureInitialized();

    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address ? {
          line1: data.address.addressLine1,
          line2: data.address.addressLine2,
          city: data.address.city,
          state: data.address.state,
          postal_code: data.address.postalCode,
          country: data.address.country,
        } : undefined,
        metadata: data.metadata,
      });

      return customer.id;
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Handle webhooks
  async handleWebhook(payload: string | Buffer, signature: string): Promise<{
    type: string;
    data: any;
    event: StripeWebhookEvent;
  }> {
    this.ensureInitialized();

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.stripeWebhookSecret
      );

      const webhookData = {
        type: this.mapWebhookEventType(event.type),
        data: event.data.object,
        event,
      };

      return webhookData;
    } catch (error: any) {
      throw this.handleStripeError(error);
    }
  }

  // Get supported payment methods
  private getSupportedPaymentMethods(): string[] {
    const methods = ['card'];
    
    if (this.config.automaticPaymentMethods) {
      return ['card', 'link', 'us_bank_account'];
    }
    
    return methods;
  }

  // Map Stripe payment intent to our PaymentIntent type
  private mapStripePaymentIntentToPaymentIntent(intent: StripePaymentIntentData): PaymentIntent {
    return {
      id: intent.id,
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      provider: PaymentProvider.STRIPE,
      status: this.mapStripePaymentIntentStatus(intent.status),
      clientSecret: intent.client_secret,
      paymentMethods: this.getSupportedPaymentMethods(),
      metadata: intent.metadata,
      createdAt: new Date(intent.created * 1000),
      updatedAt: new Date(),
    };
  }

  // Map Stripe payment intent to our Payment type
  private mapStripePaymentIntentToPayment(intent: StripePaymentIntentData, orderId: string): Payment {
    const charge = intent.charges?.data?.[0];
    const outcome = charge?.outcome;
    const balanceTransaction = charge?.balance_transaction;

    return {
      id: intent.id,
      orderId,
      provider: PaymentProvider.STRIPE,
      type: this.mapStripePaymentMethodType(intent.payment_method),
      status: this.mapStripePaymentStatus(intent.status),
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      amountReceived: charge ? charge.amount / 100 : undefined,
      amountRefunded: charge ? charge.amount_refunded / 100 : 0,
      transactionId: intent.id,
      providerTransactionId: charge?.id,
      providerPaymentId: intent.id,
      processingFee: balanceTransaction ? balanceTransaction.fee / 100 : 0,
      applicationFee: 0, // Would need to be calculated based on your fee structure
      riskScore: outcome?.risk_score,
      riskLevel: this.mapStripeRiskLevel(outcome?.risk_level),
      fraudDetected: outcome?.risk_level === 'high',
      metadata: intent.metadata,
      authorizedAt: intent.status === 'requires_capture' ? new Date(intent.created * 1000) : undefined,
      capturedAt: intent.status === 'succeeded' ? new Date(intent.created * 1000) : undefined,
      failedAt: intent.status === 'payment_failed' ? new Date() : undefined,
      createdAt: new Date(intent.created * 1000),
      updatedAt: new Date(),
      order: {
        id: orderId,
        orderNumber: '', // Would need to be fetched separately
        total: intent.amount / 100,
      },
    };
  }

  // Map Stripe payment method to our PaymentMethod type
  private mapStripePaymentMethodToPaymentMethod(
    stripePaymentMethod: StripePaymentMethodData,
    request: CreatePaymentMethodRequest & { customerId?: string }
  ): PaymentMethod {
    return {
      id: stripePaymentMethod.id,
      userId: request.customerId || '', // Would need user ID mapping
      provider: PaymentProvider.STRIPE,
      type: this.mapStripePaymentMethodTypeToEnum(stripePaymentMethod.type),
      isDefault: request.isDefault || false,
      isActive: true,
      last4: stripePaymentMethod.card?.last4,
      brand: stripePaymentMethod.card?.brand,
      expiryMonth: stripePaymentMethod.card?.exp_month,
      expiryYear: stripePaymentMethod.card?.exp_year,
      fingerprint: stripePaymentMethod.card?.fingerprint,
      billingAddress: this.mapStripeBillingAddress(stripePaymentMethod.billing_details?.address),
      providerData: stripePaymentMethod,
      nickname: request.nickname,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Status mapping functions
  private mapStripePaymentIntentStatus(status: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      'requires_payment_method': 'REQUIRES_PAYMENT_METHOD',
      'requires_confirmation': 'REQUIRES_CONFIRMATION',
      'requires_action': 'REQUIRES_ACTION',
      'processing': 'PROCESSING',
      'requires_capture': 'REQUIRES_CAPTURE',
      'canceled': 'CANCELLED',
      'succeeded': 'SUCCEEDED',
    };
    return statusMap[status] || 'PROCESSING';
  }

  private mapStripePaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'requires_payment_method': PaymentStatus.PENDING,
      'requires_confirmation': PaymentStatus.PENDING,
      'requires_action': PaymentStatus.PENDING,
      'processing': PaymentStatus.PROCESSING,
      'requires_capture': PaymentStatus.AUTHORIZED,
      'canceled': PaymentStatus.CANCELLED,
      'succeeded': PaymentStatus.COMPLETED,
      'payment_failed': PaymentStatus.FAILED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }

  private mapStripeRefundStatus(status: string): PaymentRefund['status'] {
    const statusMap: Record<string, PaymentRefund['status']> = {
      'pending': 'PENDING',
      'succeeded': 'SUCCEEDED',
      'failed': 'FAILED',
      'canceled': 'CANCELLED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapStripePaymentMethodType(paymentMethod: any): PaymentMethodType {
    if (typeof paymentMethod === 'string') {
      // If it's just a string ID, default to credit card
      return PaymentMethodType.CREDIT_CARD;
    }
    
    const typeMap: Record<string, PaymentMethodType> = {
      'card': PaymentMethodType.CREDIT_CARD,
      'us_bank_account': PaymentMethodType.BANK_ACCOUNT,
      'link': PaymentMethodType.DIGITAL_WALLET,
      'apple_pay': PaymentMethodType.DIGITAL_WALLET,
      'google_pay': PaymentMethodType.DIGITAL_WALLET,
    };
    
    return typeMap[paymentMethod?.type] || PaymentMethodType.CREDIT_CARD;
  }

  private mapStripePaymentMethodTypeToEnum(type: string): PaymentMethodType {
    const typeMap: Record<string, PaymentMethodType> = {
      'card': PaymentMethodType.CREDIT_CARD,
      'us_bank_account': PaymentMethodType.BANK_ACCOUNT,
      'link': PaymentMethodType.DIGITAL_WALLET,
    };
    return typeMap[type] || PaymentMethodType.CREDIT_CARD;
  }

  private mapStripeRiskLevel(riskLevel?: string): Payment['riskLevel'] {
    const riskMap: Record<string, Payment['riskLevel']> = {
      'low': 'LOW',
      'normal': 'MEDIUM',
      'high': 'HIGH',
      'elevated': 'HIGH',
    };
    return riskLevel ? riskMap[riskLevel] || 'MEDIUM' : undefined;
  }

  private mapStripeBillingAddress(address?: any): PaymentBillingAddress | undefined {
    if (!address) return undefined;

    return {
      firstName: '', // Stripe doesn't separate first/last name
      lastName: '',
      addressLine1: address.line1 || '',
      addressLine2: address.line2,
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postal_code || '',
      country: address.country || '',
    };
  }

  private mapRefundReason(reason: string): string {
    const reasonMap: Record<string, string> = {
      'duplicate': 'duplicate',
      'fraudulent': 'fraudulent',
      'requested_by_customer': 'requested_by_customer',
    };
    return reasonMap[reason] || 'requested_by_customer';
  }

  private mapWebhookEventType(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      'payment_intent.succeeded': 'PAYMENT_SUCCEEDED',
      'payment_intent.payment_failed': 'PAYMENT_FAILED',
      'payment_intent.canceled': 'PAYMENT_CANCELLED',
      'payment_intent.requires_action': 'PAYMENT_REQUIRES_ACTION',
      'charge.dispute.created': 'DISPUTE_CREATED',
      'invoice.payment_succeeded': 'SUBSCRIPTION_PAYMENT_SUCCEEDED',
      'customer.subscription.deleted': 'SUBSCRIPTION_CANCELLED',
    };
    return eventTypeMap[eventType] || eventType.toUpperCase();
  }

  // Error handling
  private handleStripeError(error: any): StripeError {
    return new StripeError(
      error.message || 'Unknown Stripe error',
      error.code,
      error.type,
      error.statusCode,
      error.requestId
    );
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.stripe) {
      throw new Error('Stripe provider not initialized. Call initialize() first.');
    }
  }
}

// Utility functions for Stripe integration
export class StripeUtils {
  // Format amount for Stripe (convert to cents)
  static formatAmount(amount: number, currency: string): number {
    // Zero-decimal currencies (like JPY) don't need multiplication
    const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return Math.round(amount);
    }
    
    return Math.round(amount * 100);
  }

  // Parse amount from Stripe (convert from cents)
  static parseAmount(amount: number, currency: string): number {
    const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return amount;
    }
    
    return amount / 100;
  }

  // Validate Stripe webhook signature
  static validateWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(''); // Empty key for utility functions
      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch {
      return false;
    }
  }

  // Generate idempotency key
  static generateIdempotencyKey(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// Default Stripe service instance
let defaultStripeService: StripePaymentProvider | null = null;

export function initializeStripeService(config: StripeConfig): StripePaymentProvider {
  defaultStripeService = new StripePaymentProvider(config);
  return defaultStripeService;
}

export function getStripeService(): StripePaymentProvider {
  if (!defaultStripeService) {
    throw new Error('Stripe service not initialized. Call initializeStripeService() first.');
  }
  return defaultStripeService;
}

export default StripePaymentProvider;