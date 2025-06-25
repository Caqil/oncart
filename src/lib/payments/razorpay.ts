// src/lib/payments/razorpay.ts

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
} from '@/types/payment';
import { Order } from '@/types/order';

// Razorpay-specific types
export interface RazorpayConfig extends PaymentProviderSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  isTestMode: boolean;
  businessName?: string;
  businessDescription?: string;
  businessLogo?: string;
  themeColor?: string;
  autoCapture?: boolean;
  enableUPI?: boolean;
  enableNetbanking?: boolean;
  enableWallets?: boolean;
  enableEMI?: boolean;
  enableCardSaving?: boolean;
}

export interface RazorpayOrderData {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayPaymentData {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
}

export interface RazorpayRefundData {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, any>;
  receipt?: string;
  acquirer_data?: Record<string, any>;
  status: string;
  speed_processed?: string;
  speed_requested?: string;
  created_at: number;
}

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPaymentData;
    };
    order?: {
      entity: RazorpayOrderData;
    };
    refund?: {
      entity: RazorpayRefundData;
    };
  };
  created_at: number;
}

export interface RazorpayCustomerData {
  id: string;
  entity: string;
  name: string;
  email: string;
  contact: string;
  gstin?: string;
  notes: Record<string, any>;
  created_at: number;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler?: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  retry?: {
    enabled?: boolean;
  };
  timeout?: number;
  remember_customer?: boolean;
  readonly?: {
    email?: boolean;
    contact?: boolean;
    name?: boolean;
  };
  hidden?: {
    email?: boolean;
    contact?: boolean;
  };
  send_sms_hash?: boolean;
  allow_rotation?: boolean;
  recurring?: boolean;
  callback_url?: string;
  redirect?: boolean;
}

// Enhanced error handling
export class RazorpayError extends Error {
  public code?: string;
  public field?: string;
  public source?: string;
  public step?: string;
  public reason?: string;
  public statusCode?: number;

  constructor(
    message: string,
    code?: string,
    field?: string,
    source?: string,
    step?: string,
    reason?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'RazorpayError';
    this.code = code;
    this.field = field;
    this.source = source;
    this.step = step;
    this.reason = reason;
    this.statusCode = statusCode;
  }
}

// Main Razorpay payment provider class
export class RazorpayPaymentProvider {
  private config: RazorpayConfig;
  private isInitialized = false;
  private baseUrl: string;

  constructor(config: RazorpayConfig) {
    this.config = config;
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  // Initialize Razorpay client
  async initialize(): Promise<boolean> {
    try {
      // Test the connection with a simple API call
      await this.healthCheck();
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Razorpay:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Test API call - get account details
      const response = await this.makeRequest('GET', '/account');
      return response.ok;
    } catch (error) {
      console.error('Razorpay health check failed:', error);
      return false;
    }
  }

  // Create payment intent (Razorpay Order)
  async createPaymentIntent(request: CreatePaymentRequest): Promise<PaymentIntent> {
    this.ensureInitialized();

    try {
      const orderData = {
        amount: Math.round(request.amount * 100), // Convert to paise
        currency: request.currency.toUpperCase(),
        receipt: `receipt_${request.orderId}`,
        notes: {
          orderId: request.orderId,
          ...request.metadata,
        },
        payment_capture: this.config.autoCapture !== false ? 1 : 0,
      };

      const response = await this.makeRequest('POST', '/orders', orderData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to create Razorpay order',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const order: RazorpayOrderData = await response.json();
      return this.mapRazorpayOrderToPaymentIntent(order, request);
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Process payment (Capture Razorpay Payment)
  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    this.ensureInitialized();

    try {
      // If we have confirmation data, it means payment was completed on frontend
      if (request.confirmationData) {
        const paymentId = request.confirmationData.razorpay_payment_id;
        const signature = request.confirmationData.razorpay_signature;
        
        // Verify payment signature
        const isValid = this.verifyPaymentSignature(
          request.paymentId, // order_id
          paymentId,
          signature
        );

        if (!isValid) {
          throw new RazorpayError('Invalid payment signature', 'SIGNATURE_VERIFICATION_FAILED');
        }

        // Fetch payment details
        return await this.getPaymentStatus(paymentId);
      }

      // If no confirmation data, just fetch the order status
      const response = await this.makeRequest('GET', `/orders/${request.paymentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to process Razorpay payment',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const order: RazorpayOrderData = await response.json();
      return this.mapRazorpayOrderToPayment(order, request.orderId);
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Capture payment (for manual capture)
  async capturePayment(paymentId: string, amount?: number): Promise<Payment> {
    this.ensureInitialized();

    try {
      const captureData: any = {
        amount: amount ? Math.round(amount * 100) : undefined,
      };

      const response = await this.makeRequest('POST', `/payments/${paymentId}/capture`, captureData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to capture Razorpay payment',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const payment: RazorpayPaymentData = await response.json();
      return this.mapRazorpayPaymentToPayment(payment);
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Refund payment
  async refundPayment(request: RefundPaymentRequest): Promise<PaymentRefund> {
    this.ensureInitialized();

    try {
      const refundData: any = {
        notes: {
          reason: request.reason,
          ...request.metadata,
        },
      };

      if (request.amount) {
        refundData.amount = Math.round(request.amount * 100);
      }

      const response = await this.makeRequest('POST', `/payments/${request.paymentId}/refund`, refundData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to refund Razorpay payment',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const refund: RazorpayRefundData = await response.json();
      return {
        id: refund.id,
        paymentId: request.paymentId,
        amount: refund.amount / 100,
        currency: refund.currency,
        reason: request.reason,
        status: this.mapRazorpayRefundStatus(refund.status),
        providerRefundId: refund.id,
        metadata: request.metadata,
        createdAt: new Date(refund.created_at * 1000),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    this.ensureInitialized();

    try {
      const response = await this.makeRequest('GET', `/payments/${paymentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to get Razorpay payment status',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const payment: RazorpayPaymentData = await response.json();
      return this.mapRazorpayPaymentToPayment(payment);
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Create customer
  async createCustomer(data: {
    name: string;
    email: string;
    contact: string;
    notes?: Record<string, any>;
  }): Promise<string> {
    this.ensureInitialized();

    try {
      const customerData = {
        name: data.name,
        email: data.email,
        contact: data.contact,
        notes: data.notes || {},
      };

      const response = await this.makeRequest('POST', '/customers', customerData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new RazorpayError(
          error.error?.description || 'Failed to create Razorpay customer',
          error.error?.code,
          error.error?.field,
          error.error?.source,
          error.error?.step,
          error.error?.reason,
          response.status
        );
      }

      const customer: RazorpayCustomerData = await response.json();
      return customer.id;
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Generate checkout options for frontend
  generateCheckoutOptions(
    order: RazorpayOrderData,
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    },
    callbackUrl?: string
  ): RazorpayCheckoutOptions {
    return {
      key: this.config.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: this.config.businessName || 'Payment',
      description: this.config.businessDescription || 'Order Payment',
      image: this.config.businessLogo,
      order_id: order.id,
      prefill: userDetails ? {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact,
      } : undefined,
      notes: order.notes,
      theme: {
        color: this.config.themeColor || '#3399cc',
      },
      modal: {
        ondismiss: () => {
          console.log('Checkout form closed');
        },
      },
      retry: {
        enabled: true,
      },
      timeout: 300, // 5 minutes
      remember_customer: this.config.enableCardSaving,
      callback_url: callbackUrl,
      redirect: !!callbackUrl,
    };
  }

  // Handle webhooks
  async handleWebhook(payload: string, signature: string): Promise<{
    type: string;
    data: any;
    event: RazorpayWebhookEvent;
  }> {
    this.ensureInitialized();

    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new RazorpayError('Invalid webhook signature', 'WEBHOOK_VERIFICATION_FAILED');
      }

      const event: RazorpayWebhookEvent = JSON.parse(payload);

      return {
        type: this.mapWebhookEventType(event.event),
        data: event.payload,
        event,
      };
    } catch (error: any) {
      throw this.handleRazorpayError(error);
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.config.razorpayKeySecret)
        .update(body)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  // Verify webhook signature
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.razorpayWebhookSecret)
        .update(payload)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  // Make HTTP request to Razorpay API
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<Response> {
    const credentials = Buffer.from(
      `${this.config.razorpayKeyId}:${this.config.razorpayKeySecret}`
    ).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    return fetch(`${this.baseUrl}${endpoint}`, options);
  }

  // Mapping functions
  private mapRazorpayOrderToPaymentIntent(order: RazorpayOrderData, request: CreatePaymentRequest): PaymentIntent {
    return {
      id: order.id,
      amount: request.amount,
      currency: request.currency.toUpperCase(),
      provider: PaymentProvider.RAZORPAY,
      status: this.mapRazorpayOrderStatus(order.status),
      clientSecret: order.id, // Razorpay uses order ID as reference
      paymentMethods: this.getSupportedPaymentMethods(),
      metadata: request.metadata,
      createdAt: new Date(order.created_at * 1000),
      updatedAt: new Date(),
    };
  }

  private mapRazorpayOrderToPayment(order: RazorpayOrderData, orderId: string): Payment {
    return {
      id: order.id,
      orderId,
      provider: PaymentProvider.RAZORPAY,
      type: PaymentMethodType.DIGITAL_WALLET, // Default, would be updated with actual payment method
      status: this.mapRazorpayOrderStatusToPaymentStatus(order.status),
      amount: order.amount / 100,
      currency: order.currency,
      amountReceived: order.amount_paid / 100,
      amountRefunded: 0,
      transactionId: order.id,
      providerTransactionId: order.id,
      providerPaymentId: order.id,
      processingFee: 0,
      applicationFee: 0,
      riskLevel: 'LOW',
      fraudDetected: false,
      metadata: order.notes,
      createdAt: new Date(order.created_at * 1000),
      updatedAt: new Date(),
      order: {
        id: orderId,
        orderNumber: order.receipt,
        total: order.amount / 100,
      },
    };
  }

  private mapRazorpayPaymentToPayment(payment: RazorpayPaymentData): Payment {
    return {
      id: payment.id,
      orderId: payment.notes?.orderId || payment.order_id,
      provider: PaymentProvider.RAZORPAY,
      type: this.mapRazorpayPaymentMethod(payment.method),
      status: this.mapRazorpayPaymentStatus(payment.status),
      amount: payment.amount / 100,
      currency: payment.currency,
      amountReceived: payment.amount / 100,
      amountRefunded: payment.amount_refunded / 100,
      transactionId: payment.id,
      providerTransactionId: payment.id,
      providerPaymentId: payment.id,
      processingFee: (payment.fee || 0) / 100,
      applicationFee: 0,
      riskLevel: payment.international ? 'MEDIUM' : 'LOW',
      fraudDetected: false,
      paymentMethod: this.createPaymentMethodSnapshot(payment),
      metadata: payment.notes,
      failureReason: payment.error_description,
      failureCode: payment.error_code,
      capturedAt: payment.captured ? new Date(payment.created_at * 1000) : undefined,
      createdAt: new Date(payment.created_at * 1000),
      updatedAt: new Date(),
      order: {
        id: payment.order_id,
        orderNumber: '',
        total: payment.amount / 100,
      },
    };
  }

  private createPaymentMethodSnapshot(payment: RazorpayPaymentData): PaymentMethodSnapshot {
    return {
      type: this.mapRazorpayPaymentMethod(payment.method),
      provider: PaymentProvider.RAZORPAY,
      last4: payment.card_id ? undefined : undefined, // Razorpay doesn't always provide card details
      brand: undefined,
      walletType: payment.wallet,
    };
  }

  // Get supported payment methods
  private getSupportedPaymentMethods(): string[] {
    const methods = ['card'];
    
    if (this.config.enableUPI) methods.push('upi');
    if (this.config.enableNetbanking) methods.push('netbanking');
    if (this.config.enableWallets) methods.push('wallet');
    if (this.config.enableEMI) methods.push('emi');
    
    return methods;
  }

  // Status mapping functions
  private mapRazorpayOrderStatus(status: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      'created': 'REQUIRES_PAYMENT_METHOD',
      'attempted': 'PROCESSING',
      'paid': 'SUCCEEDED',
    };
    return statusMap[status] || 'PROCESSING';
  }

  private mapRazorpayOrderStatusToPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'created': PaymentStatus.PENDING,
      'attempted': PaymentStatus.PROCESSING,
      'paid': PaymentStatus.COMPLETED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }

  private mapRazorpayPaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'created': PaymentStatus.PENDING,
      'authorized': PaymentStatus.AUTHORIZED,
      'captured': PaymentStatus.COMPLETED,
      'refunded': PaymentStatus.REFUNDED,
      'failed': PaymentStatus.FAILED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }

  private mapRazorpayRefundStatus(status: string): PaymentRefund['status'] {
    const statusMap: Record<string, PaymentRefund['status']> = {
      'pending': 'PENDING',
      'processed': 'SUCCEEDED',
      'failed': 'FAILED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapRazorpayPaymentMethod(method: string): PaymentMethodType {
    const methodMap: Record<string, PaymentMethodType> = {
      'card': PaymentMethodType.CREDIT_CARD,
      'netbanking': PaymentMethodType.BANK_ACCOUNT,
      'wallet': PaymentMethodType.DIGITAL_WALLET,
      'upi': PaymentMethodType.DIGITAL_WALLET,
      'emi': PaymentMethodType.BUY_NOW_PAY_LATER,
      'paylater': PaymentMethodType.BUY_NOW_PAY_LATER,
    };
    return methodMap[method] || PaymentMethodType.DIGITAL_WALLET;
  }

  private mapWebhookEventType(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      'payment.authorized': 'PAYMENT_AUTHORIZED',
      'payment.captured': 'PAYMENT_CAPTURED',
      'payment.failed': 'PAYMENT_FAILED',
      'order.paid': 'ORDER_PAID',
      'refund.created': 'REFUND_CREATED',
      'refund.processed': 'REFUND_PROCESSED',
      'refund.failed': 'REFUND_FAILED',
      'subscription.charged': 'SUBSCRIPTION_CHARGED',
      'subscription.cancelled': 'SUBSCRIPTION_CANCELLED',
      'subscription.halted': 'SUBSCRIPTION_HALTED',
    };
    return eventTypeMap[eventType] || eventType.toUpperCase().replace('.', '_');
  }

  // Utility functions
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Razorpay provider not initialized. Call initialize() first.');
    }
  }

  // Error handling
  private handleRazorpayError(error: any): RazorpayError {
    if (error instanceof RazorpayError) {
      return error;
    }

    return new RazorpayError(
      error.message || 'Unknown Razorpay error',
      error.code,
      error.field,
      error.source,
      error.step,
      error.reason,
      error.statusCode
    );
  }
}

// Utility functions for Razorpay integration
export class RazorpayUtils {
  // Convert amount to paise (smallest currency unit)
  static toPaise(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert paise to rupees
  static fromPaise(paise: number): number {
    return paise / 100;
  }

  // Validate Razorpay webhook event
  static isValidWebhookEvent(event: any): event is RazorpayWebhookEvent {
    return (
      event &&
      typeof event.entity === 'string' &&
      typeof event.account_id === 'string' &&
      typeof event.event === 'string' &&
      event.payload &&
      typeof event.created_at === 'number'
    );
  }

  // Extract order ID from Razorpay webhook
  static extractOrderIdFromWebhook(event: RazorpayWebhookEvent): string | null {
    try {
      return (
        event.payload.payment?.entity.notes?.orderId ||
        event.payload.order?.entity.notes?.orderId ||
        event.payload.payment?.entity.order_id ||
        null
      );
    } catch {
      return null;
    }
  }

  // Generate payment signature for verification
  static generatePaymentSignature(
    orderId: string,
    paymentId: string,
    secret: string
  ): string {
    const crypto = require('crypto');
    const body = `${orderId}|${paymentId}`;
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  // Verify payment signature
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expectedSignature = RazorpayUtils.generatePaymentSignature(orderId, paymentId, secret);
      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  // Format Indian phone number for Razorpay
  static formatIndianPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with +91, remove the country code
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2);
    }
    
    // If it's already 10 digits, return as is
    if (cleaned.length === 10) {
      return cleaned;
    }
    
    return phone; // Return original if can't format
  }

  // Get supported currencies for Razorpay
  static getSupportedCurrencies(): string[] {
    return ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED', 'MYR'];
  }

  // Check if currency supports EMI
  static supportsEMI(currency: string): boolean {
    return currency === 'INR';
  }

  // Get EMI options for amount
  static getEMIOptions(amount: number): Array<{ tenure: number; interest: number }> {
    if (amount < 1000) return []; // Minimum amount for EMI
    
    return [
      { tenure: 3, interest: 12 },
      { tenure: 6, interest: 13 },
      { tenure: 9, interest: 14 },
      { tenure: 12, interest: 15 },
      { tenure: 18, interest: 16 },
      { tenure: 24, interest: 17 },
    ];
  }

  // Calculate EMI amount
  static calculateEMI(principal: number, rate: number, tenure: number): number {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                 (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  }
}

// Razorpay checkout integration helpers
export class RazorpayCheckout {
  // Load Razorpay checkout script
  static loadCheckoutScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Open checkout modal
  static async openCheckout(options: RazorpayCheckoutOptions): Promise<any> {
    const isLoaded = await RazorpayCheckout.loadCheckoutScript();
    
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay checkout script');
    }

    return new Promise((resolve, reject) => {
      const rzp = new (window as any).Razorpay({
        ...options,
        handler: (response: any) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      });

      rzp.open();
    });
  }

  // Handle payment success
  static handlePaymentSuccess(response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }): {
    paymentId: string;
    orderId: string;
    signature: string;
  } {
    return {
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
    };
  }
}

// Default Razorpay service instance
let defaultRazorpayService: RazorpayPaymentProvider | null = null;

export function initializeRazorpayService(config: RazorpayConfig): RazorpayPaymentProvider {
  defaultRazorpayService = new RazorpayPaymentProvider(config);
  return defaultRazorpayService;
}

export function getRazorpayService(): RazorpayPaymentProvider {
  if (!defaultRazorpayService) {
    throw new Error('Razorpay service not initialized. Call initializeRazorpayService() first.');
  }
  return defaultRazorpayService;
}

export default RazorpayPaymentProvider;