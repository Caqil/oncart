// src/lib/payments/paypal.ts

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

// PayPal-specific types
export interface PayPalConfig extends PaymentProviderSettings {
  paypalClientId: string;
  paypalClientSecret: string;
  paypalWebhookId: string;
  isTestMode: boolean;
  environment?: 'sandbox' | 'live';
  brandName?: string;
  returnUrl?: string;
  cancelUrl?: string;
  enableShippingAddress?: boolean;
  enableBillingAddress?: boolean;
  userAction?: 'continue' | 'pay_now';
}

export interface PayPalOrderData {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        create_time: string;
        update_time: string;
      }>;
      refunds?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  create_time: string;
  update_time: string;
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  create_time: string;
  resource_type: string;
  event_version: string;
  summary: string;
  resource: any;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  nonce: string;
}

export interface PayPalPaymentSource {
  paypal?: {
    email_address?: string;
    account_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
    address?: {
      address_line_1?: string;
      address_line_2?: string;
      admin_area_2?: string;
      admin_area_1?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  card?: {
    last_four?: string;
    brand?: string;
    type?: string;
  };
}

// Enhanced error handling
export class PayPalError extends Error {
  public code?: string;
  public details?: Array<{
    field?: string;
    value?: string;
    location?: string;
    issue: string;
    description: string;
  }>;
  public debugId?: string;
  public statusCode?: number;

  constructor(
    message: string,
    code?: string,
    details?: any[],
    debugId?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'PayPalError';
    this.code = code;
    this.details = details;
    this.debugId = debugId;
    this.statusCode = statusCode;
  }
}

// Main PayPal payment provider class
export class PayPalPaymentProvider {
  private config: PayPalConfig;
  private accessToken?: string;
  private tokenExpiresAt?: Date;
  private isInitialized = false;
  private baseUrl: string;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.baseUrl = config.isTestMode 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  // Initialize PayPal client
  async initialize(): Promise<boolean> {
    try {
      // Get access token
      await this.getAccessToken();
      
      // Test the connection
      await this.healthCheck();
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize PayPal:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }
      
      // Test API call - get webhook list
      const response = await fetch(`${this.baseUrl}/v1/notifications/webhooks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('PayPal health check failed:', error);
      return false;
    }
  }

  // Get access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.paypalClientId}:${this.config.paypalClientSecret}`
      ).toString('base64');

      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
      }

      const data: PayPalAccessToken = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000); // 1 minute buffer

      return this.accessToken;
    } catch (error: any) {
      throw new PayPalError('Failed to obtain access token', 'AUTHENTICATION_FAILURE');
    }
  }

  // Create payment intent (PayPal Order)
  async createPaymentIntent(request: CreatePaymentRequest): Promise<PaymentIntent> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: request.orderId,
          amount: {
            currency_code: request.currency.toUpperCase(),
            value: request.amount.toFixed(2),
          },
          custom_id: request.orderId,
        }],
        application_context: {
          brand_name: this.config.brandName,
          landing_page: 'NO_PREFERENCE',
          user_action: this.config.userAction || 'continue',
          return_url: request.returnUrl || this.config.returnUrl,
          cancel_url: this.config.cancelUrl,
          shipping_preference: this.config.enableShippingAddress ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
        },
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': this.generateIdempotencyKey(request.orderId),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to create PayPal order',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const order: PayPalOrderData = await response.json();
      return this.mapPayPalOrderToPaymentIntent(order, request);
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Process payment (Capture PayPal Order)
  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      // Capture the order
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${request.paymentId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': this.generateIdempotencyKey(`capture-${request.paymentId}`),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to capture PayPal order',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const order: PayPalOrderData = await response.json();
      return this.mapPayPalOrderToPayment(order, request.orderId);
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Authorize payment (without capture)
  async authorizePayment(paymentId: string): Promise<Payment> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentId}/authorize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': this.generateIdempotencyKey(`auth-${paymentId}`),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to authorize PayPal order',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const order: PayPalOrderData = await response.json();
      return this.mapPayPalOrderToPayment(order, order.purchase_units[0]?.reference_id || '');
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Capture authorized payment
  async capturePayment(authorizationId: string, amount?: number): Promise<Payment> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      const captureData: any = {};
      
      if (amount) {
        captureData.amount = {
          currency_code: 'USD', // This should be dynamic
          value: amount.toFixed(2),
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/authorizations/${authorizationId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': this.generateIdempotencyKey(`capture-auth-${authorizationId}`),
        },
        body: JSON.stringify(captureData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to capture PayPal authorization',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const capture = await response.json();
      return this.mapPayPalCaptureToPayment(capture);
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Refund payment
  async refundPayment(request: RefundPaymentRequest): Promise<PaymentRefund> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      const refundData: any = {
        note_to_payer: request.reason,
      };

      if (request.amount) {
        refundData.amount = {
          currency_code: 'USD', // This should be dynamic
          value: request.amount.toFixed(2),
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${request.paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': this.generateIdempotencyKey(`refund-${request.paymentId}`),
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to refund PayPal payment',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const refund = await response.json();
      return {
        id: refund.id,
        paymentId: request.paymentId,
        amount: parseFloat(refund.amount.value),
        currency: refund.amount.currency_code,
        reason: request.reason,
        status: this.mapPayPalRefundStatus(refund.status),
        providerRefundId: refund.id,
        metadata: request.metadata,
        createdAt: new Date(refund.create_time),
        updatedAt: new Date(refund.update_time || refund.create_time),
      };
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    this.ensureInitialized();
    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new PayPalError(
          error.message || 'Failed to get PayPal order status',
          error.name,
          error.details,
          error.debug_id,
          response.status
        );
      }

      const order: PayPalOrderData = await response.json();
      return this.mapPayPalOrderToPayment(order, order.purchase_units[0]?.reference_id || '');
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Handle webhooks
  async handleWebhook(payload: string, headers: Record<string, string>): Promise<{
    type: string;
    data: any;
    event: PayPalWebhookEvent;
  }> {
    this.ensureInitialized();

    try {
      // Verify webhook signature
      const isValid = await this.verifyWebhookSignature(payload, headers);
      if (!isValid) {
        throw new PayPalError('Invalid webhook signature', 'WEBHOOK_VERIFICATION_FAILED');
      }

      const event: PayPalWebhookEvent = JSON.parse(payload);

      return {
        type: this.mapWebhookEventType(event.event_type),
        data: event.resource,
        event,
      };
    } catch (error: any) {
      throw this.handlePayPalError(error);
    }
  }

  // Verify webhook signature
  private async verifyWebhookSignature(payload: string, headers: Record<string, string>): Promise<boolean> {
    try {
      await this.ensureValidToken();

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: this.config.paypalWebhookId,
        webhook_event: JSON.parse(payload),
      };

      const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  }

  // Mapping functions
  private mapPayPalOrderToPaymentIntent(order: PayPalOrderData, request: CreatePaymentRequest): PaymentIntent {
    const approveLink = order.links?.find(link => link.rel === 'approve');
    
    return {
      id: order.id,
      amount: request.amount,
      currency: request.currency.toUpperCase(),
      provider: PaymentProvider.PAYPAL,
      status: this.mapPayPalOrderStatus(order.status),
      clientSecret: approveLink?.href || '', // PayPal uses approve URL instead of client secret
      paymentMethods: ['paypal'],
      metadata: request.metadata,
      createdAt: new Date(order.create_time),
      updatedAt: new Date(order.update_time || order.create_time),
    };
  }

  private mapPayPalOrderToPayment(order: PayPalOrderData, orderId: string): Payment {
    const purchaseUnit = order.purchase_units[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const refunds = purchaseUnit?.payments?.refunds || [];
    
    const totalRefunded = refunds.reduce((sum, refund) => {
      return sum + parseFloat(refund.amount.value);
    }, 0);

    return {
      id: order.id,
      orderId,
      provider: PaymentProvider.PAYPAL,
      type: PaymentMethodType.DIGITAL_WALLET,
      status: this.mapPayPalPaymentStatus(order.status, capture?.status),
      amount: parseFloat(purchaseUnit.amount.value),
      currency: purchaseUnit.amount.currency_code,
      amountReceived: capture ? parseFloat(capture.amount.value) : undefined,
      amountRefunded: totalRefunded,
      transactionId: order.id,
      providerTransactionId: capture?.id,
      providerPaymentId: order.id,
      processingFee: 0, // PayPal fees would need separate API call
      applicationFee: 0,
      riskLevel: 'LOW', // PayPal handles fraud detection
      fraudDetected: false,
      capturedAt: capture ? new Date(capture.create_time) : undefined,
      createdAt: new Date(order.create_time),
      updatedAt: new Date(order.update_time || order.create_time),
      order: {
        id: orderId,
        orderNumber: '', // Would need to be fetched separately
        total: parseFloat(purchaseUnit.amount.value),
      },
    };
  }

  private mapPayPalCaptureToPayment(capture: any): Payment {
    return {
      id: capture.id,
      orderId: capture.custom_id || '',
      provider: PaymentProvider.PAYPAL,
      type: PaymentMethodType.DIGITAL_WALLET,
      status: this.mapPayPalCaptureStatus(capture.status),
      amount: parseFloat(capture.amount.value),
      currency: capture.amount.currency_code,
      amountReceived: parseFloat(capture.amount.value),
      amountRefunded: 0,
      transactionId: capture.id,
      providerTransactionId: capture.id,
      providerPaymentId: capture.id,
      processingFee: 0,
      applicationFee: 0,
      riskLevel: 'LOW',
      fraudDetected: false,
      capturedAt: new Date(capture.create_time),
      createdAt: new Date(capture.create_time),
      updatedAt: new Date(capture.update_time || capture.create_time),
      order: {
        id: capture.custom_id || '',
        orderNumber: '',
        total: parseFloat(capture.amount.value),
      },
    };
  }

  // Status mapping functions
  private mapPayPalOrderStatus(status: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      'CREATED': 'REQUIRES_PAYMENT_METHOD',
      'SAVED': 'REQUIRES_CONFIRMATION',
      'APPROVED': 'REQUIRES_CAPTURE',
      'VOIDED': 'CANCELLED',
      'COMPLETED': 'SUCCEEDED',
      'PAYER_ACTION_REQUIRED': 'REQUIRES_ACTION',
    };
    return statusMap[status] || 'PROCESSING';
  }

  private mapPayPalPaymentStatus(orderStatus: string, captureStatus?: string): PaymentStatus {
    if (captureStatus) {
      const captureStatusMap: Record<string, PaymentStatus> = {
        'COMPLETED': PaymentStatus.COMPLETED,
        'DECLINED': PaymentStatus.FAILED,
        'PARTIALLY_REFUNDED': PaymentStatus.PARTIALLY_REFUNDED,
        'REFUNDED': PaymentStatus.REFUNDED,
        'PENDING': PaymentStatus.PROCESSING,
      };
      return captureStatusMap[captureStatus] || PaymentStatus.PROCESSING;
    }

    const orderStatusMap: Record<string, PaymentStatus> = {
      'CREATED': PaymentStatus.PENDING,
      'SAVED': PaymentStatus.PENDING,
      'APPROVED': PaymentStatus.AUTHORIZED,
      'VOIDED': PaymentStatus.CANCELLED,
      'COMPLETED': PaymentStatus.COMPLETED,
      'PAYER_ACTION_REQUIRED': PaymentStatus.PENDING,
    };
    return orderStatusMap[orderStatus] || PaymentStatus.PENDING;
  }

  private mapPayPalCaptureStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'COMPLETED': PaymentStatus.COMPLETED,
      'DECLINED': PaymentStatus.FAILED,
      'PARTIALLY_REFUNDED': PaymentStatus.PARTIALLY_REFUNDED,
      'REFUNDED': PaymentStatus.REFUNDED,
      'PENDING': PaymentStatus.PROCESSING,
    };
    return statusMap[status] || PaymentStatus.PROCESSING;
  }

  private mapPayPalRefundStatus(status: string): PaymentRefund['status'] {
    const statusMap: Record<string, PaymentRefund['status']> = {
      'CANCELLED': 'CANCELLED',
      'PENDING': 'PENDING',
      'COMPLETED': 'SUCCEEDED',
      'FAILED': 'FAILED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapWebhookEventType(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      'PAYMENT.CAPTURE.COMPLETED': 'PAYMENT_COMPLETED',
      'PAYMENT.CAPTURE.DENIED': 'PAYMENT_FAILED',
      'PAYMENT.CAPTURE.PENDING': 'PAYMENT_PENDING',
      'PAYMENT.CAPTURE.REFUNDED': 'PAYMENT_REFUNDED',
      'CHECKOUT.ORDER.APPROVED': 'ORDER_APPROVED',
      'CHECKOUT.ORDER.COMPLETED': 'ORDER_COMPLETED',
      'BILLING.SUBSCRIPTION.CANCELLED': 'SUBSCRIPTION_CANCELLED',
      'BILLING.SUBSCRIPTION.SUSPENDED': 'SUBSCRIPTION_SUSPENDED',
    };
    return eventTypeMap[eventType] || eventType.replace('.', '_');
  }

  // Utility functions
  private generateIdempotencyKey(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data + Date.now()).digest('hex').substring(0, 32);
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiresAt || new Date() >= this.tokenExpiresAt) {
      await this.getAccessToken();
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('PayPal provider not initialized. Call initialize() first.');
    }
  }

  // Error handling
  private handlePayPalError(error: any): PayPalError {
    if (error instanceof PayPalError) {
      return error;
    }

    return new PayPalError(
      error.message || 'Unknown PayPal error',
      error.code || error.name,
      error.details,
      error.debug_id,
      error.statusCode
    );
  }
}

// Utility functions for PayPal integration
export class PayPalUtils {
  // Validate PayPal webhook event
  static isValidWebhookEvent(event: any): event is PayPalWebhookEvent {
    return (
      event &&
      typeof event.id === 'string' &&
      typeof event.event_type === 'string' &&
      typeof event.create_time === 'string' &&
      event.resource
    );
  }

  // Extract order ID from PayPal webhook
  static extractOrderIdFromWebhook(event: PayPalWebhookEvent): string | null {
    try {
      // Try different possible locations for order/reference ID
      return (
        event.resource?.custom_id ||
        event.resource?.invoice_id ||
        event.resource?.purchase_units?.[0]?.reference_id ||
        event.resource?.supplementary_data?.related_ids?.order_id ||
        null
      );
    } catch {
      return null;
    }
  }

  // Format currency for PayPal
  static formatCurrency(amount: number, currency: string): string {
    // PayPal expects specific decimal places for different currencies
    const decimalPlaces = PayPalUtils.getCurrencyDecimalPlaces(currency);
    return amount.toFixed(decimalPlaces);
  }

  // Get decimal places for currency
  private static getCurrencyDecimalPlaces(currency: string): number {
    const zeroDecimalCurrencies = ['JPY', 'KRW', 'TWD', 'CLP', 'ISK'];
    const threeDecimalCurrencies = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'];
    
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
      return 0;
    } else if (threeDecimalCurrencies.includes(currency.toUpperCase())) {
      return 3;
    }
    return 2;
  }

  // Generate PayPal return URL with order information
  static generateReturnUrl(baseUrl: string, orderId: string, token?: string): string {
    const url = new URL(`${baseUrl}/payment/paypal/return`);
    url.searchParams.set('orderId', orderId);
    if (token) {
      url.searchParams.set('token', token);
    }
    return url.toString();
  }

  // Generate PayPal cancel URL
  static generateCancelUrl(baseUrl: string, orderId: string): string {
    const url = new URL(`${baseUrl}/payment/paypal/cancel`);
    url.searchParams.set('orderId', orderId);
    return url.toString();
  }

  // Parse PayPal error response
  static parseErrorResponse(response: any): {
    message: string;
    code?: string;
    details?: string[];
  } {
    const details: string[] = [];
    
    if (response.details && Array.isArray(response.details)) {
      response.details.forEach((detail: any) => {
        if (detail.description) {
          details.push(detail.description);
        }
      });
    }

    return {
      message: response.message || 'PayPal error occurred',
      code: response.name,
      details: details.length > 0 ? details : undefined,
    };
  }
}

// PayPal webhook signature verification
export class PayPalWebhookVerification {
  static async verifySignature(
    payload: string,
    headers: Record<string, string>,
    webhookId: string,
    accessToken: string,
    environment: 'sandbox' | 'live' = 'sandbox'
  ): Promise<boolean> {
    try {
      const baseUrl = environment === 'live' 
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(payload),
      };

      const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  }
}

// Default PayPal service instance
let defaultPayPalService: PayPalPaymentProvider | null = null;

export function initializePayPalService(config: PayPalConfig): PayPalPaymentProvider {
  defaultPayPalService = new PayPalPaymentProvider(config);
  return defaultPayPalService;
}

export function getPayPalService(): PayPalPaymentProvider {
  if (!defaultPayPalService) {
    throw new Error('PayPal service not initialized. Call initializePayPalService() first.');
  }
  return defaultPayPalService;
}

export default PayPalPaymentProvider;