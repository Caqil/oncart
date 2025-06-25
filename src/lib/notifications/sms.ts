// src/lib/notifications/sms.ts

import { Order } from '@/types/order';
import { AppUser } from '@/types/auth';
import { Product } from '@/types/product';
import { Vendor } from '@/types/vendor';
import { SMSNotifications } from '@/types/user';

// SMS provider types
export enum SMSProvider {
  TWILIO = 'TWILIO',
  NEXMO = 'NEXMO', // Now Vonage
  CLICKSEND = 'CLICKSEND',
  AWS_SNS = 'AWS_SNS',
  MESSAGEBIRD = 'MESSAGEBIRD',
  TEXTLOCAL = 'TEXTLOCAL',
  FAST2SMS = 'FAST2SMS',
}

// SMS configuration interface
export interface SMSConfig {
  provider: SMSProvider;
  isTestMode: boolean;
  
  // Twilio
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  
  // Nexmo/Vonage
  nexmoApiKey?: string;
  nexmoApiSecret?: string;
  nexmoFromNumber?: string;
  
  // ClickSend
  clicksendUsername?: string;
  clicksendApiKey?: string;
  
  // AWS SNS
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  
  // MessageBird
  messagebirdApiKey?: string;
  messagebirdOriginator?: string;
  
  // TextLocal
  textlocalApiKey?: string;
  textlocalSender?: string;
  
  // Fast2SMS
  fast2smsApiKey?: string;
  fast2smsRoute?: string;
  fast2smsSenderId?: string;
  
  // Rate limiting
  maxRetries: number;
  retryDelay: number; // milliseconds
  
  // Message settings
  maxMessageLength: number;
  enableUnicodeSupport: boolean;
  enableDeliveryReports: boolean;
  
  // Webhook settings
  webhookUrl?: string;
  webhookSecret?: string;
}

// SMS message interface
export interface SMSMessage {
  to: string | string[];
  message: string;
  from?: string;
  type?: 'transactional' | 'promotional' | 'otp';
  priority?: 'high' | 'normal' | 'low';
  scheduledAt?: Date;
  validityPeriod?: number; // minutes
  deliveryReportUrl?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

// SMS response interface
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  messageIds?: string[];
  cost?: number;
  currency?: string;
  remainingBalance?: number;
  provider: SMSProvider;
  sentAt: Date;
  errorCode?: string;
  errorMessage?: string;
  deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'pending';
}

// SMS template types aligned with notification types
export enum SMSTemplateType {
  // Order notifications
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_OUT_FOR_DELIVERY = 'ORDER_OUT_FOR_DELIVERY',
  
  // Payment notifications
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  
  // Security notifications
  OTP_VERIFICATION = 'OTP_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOGIN_ALERT = 'LOGIN_ALERT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Vendor notifications
  VENDOR_NEW_ORDER = 'VENDOR_NEW_ORDER',
  VENDOR_PAYOUT = 'VENDOR_PAYOUT',
  VENDOR_LOW_STOCK = 'VENDOR_LOW_STOCK',
  
  // Customer notifications
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  PRICE_DROP = 'PRICE_DROP',
  PROMOTION = 'PROMOTION',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  
  // System notifications
  MAINTENANCE_ALERT = 'MAINTENANCE_ALERT',
  SERVICE_DISRUPTION = 'SERVICE_DISRUPTION',
}

// SMS template interface
export interface SMSTemplate {
  id: string;
  name: string;
  type: SMSTemplateType;
  message: string;
  variables: string[];
  isActive: boolean;
  category: 'transactional' | 'promotional' | 'otp';
  maxLength: number;
  createdAt: Date;
  updatedAt: Date;
}

// SMS analytics interface
export interface SMSAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalCost: number;
  currency: string;
  deliveryRate: number;
  failureRate: number;
  averageCost: number;
  
  byProvider: Record<SMSProvider, {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  }>;
  
  byType: Record<SMSTemplateType, {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  }>;
  
  byCountry: Array<{
    country: string;
    sent: number;
    delivered: number;
    cost: number;
  }>;
  
  timeSeriesData: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  }>;
}

// Phone number validation and formatting
export class PhoneNumberUtils {
  // Validate phone number format
  static isValid(phoneNumber: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanNumber);
  }

  // Format phone number to E.164 format
  static toE164(phoneNumber: string, defaultCountryCode = '+1'): string {
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Add country code if missing
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.substring(1);
      }
      cleanNumber = defaultCountryCode + cleanNumber;
    }
    
    return cleanNumber;
  }

  // Get country code from phone number
  static getCountryCode(phoneNumber: string): string | null {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (cleanNumber.startsWith('+')) {
      const match = cleanNumber.match(/^\+(\d{1,3})/);
      return match ? `+${match[1]}` : null;
    }
    return null;
  }

  // Check if number is mobile (basic heuristic)
  static isMobile(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    // This is a simplified check - in real implementation, use a proper library
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
  }
}

// Abstract SMS provider base class
export abstract class SMSProviderBase {
  protected config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<boolean>;
  abstract sendSMS(message: SMSMessage): Promise<SMSResponse>;
  abstract getBalance(): Promise<{ balance: number; currency: string }>;
  abstract getDeliveryReport(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'failed' | 'pending';
    deliveredAt?: Date;
    errorCode?: string;
  }>;
  abstract healthCheck(): Promise<boolean>;

  // Template variable interpolation
  protected interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return variables[key.trim()] || match;
    });
  }

  // Message validation
  protected validateMessage(message: SMSMessage): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message.to) {
      errors.push('Recipient phone number is required');
    } else {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      recipients.forEach((phone, index) => {
        if (!PhoneNumberUtils.isValid(phone)) {
          errors.push(`Invalid phone number at index ${index}: ${phone}`);
        }
      });
    }

    if (!message.message?.trim()) {
      errors.push('Message content is required');
    } else if (message.message.length > this.config.maxMessageLength) {
      errors.push(`Message exceeds maximum length of ${this.config.maxMessageLength} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Truncate message if too long
  protected truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }
}

// Twilio SMS provider implementation
export class TwilioSMSProvider extends SMSProviderBase {
  private client: any;

  async initialize(): Promise<boolean> {
    try {
      // In a real implementation, you would import Twilio SDK
      // const twilio = require('twilio');
      // this.client = twilio(this.config.twilioAccountSid, this.config.twilioAuthToken);
      
      // Mock implementation for example
      this.client = {
        messages: {
          create: async (options: any) => ({
            sid: `SM${Date.now()}`,
            status: 'sent',
            to: options.to,
            from: options.from,
            body: options.body,
          }),
        },
        api: {
          v2010: {
            accounts: (sid: string) => ({
              balance: {
                fetch: async () => ({ balance: '25.50', currency: 'USD' }),
              },
            }),
          },
        },
      };
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Twilio SMS provider:', error);
      return false;
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const validation = this.validateMessage(message);
    if (!validation.isValid) {
      return {
        success: false,
        provider: SMSProvider.TWILIO,
        sentAt: new Date(),
        errorMessage: validation.errors.join(', '),
      };
    }

    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const messageIds: string[] = [];

      for (const recipient of recipients) {
        const twilioMessage = await this.client.messages.create({
          body: message.message,
          from: message.from || this.config.twilioFromNumber,
          to: PhoneNumberUtils.toE164(recipient),
          statusCallback: this.config.webhookUrl,
        });

        messageIds.push(twilioMessage.sid);
      }

      return {
        success: true,
        messageId: messageIds[0],
        messageIds,
        provider: SMSProvider.TWILIO,
        sentAt: new Date(),
        deliveryStatus: 'sent',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: SMSProvider.TWILIO,
        sentAt: new Date(),
        errorMessage: error.message,
        errorCode: error.code,
      };
    }
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const balance = await this.client.api.v2010.accounts(this.config.twilioAccountSid).balance.fetch();
      return {
        balance: parseFloat(balance.balance),
        currency: balance.currency,
      };
    } catch (error) {
      throw new Error('Failed to fetch balance from Twilio');
    }
  }

  async getDeliveryReport(messageId: string): Promise<{
    status: 'sent' | 'delivered' | 'failed' | 'pending';
    deliveredAt?: Date;
    errorCode?: string;
  }> {
    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: this.mapTwilioStatus(message.status),
        deliveredAt: message.dateUpdated,
        errorCode: message.errorCode,
      };
    } catch (error) {
      throw new Error(`Failed to get delivery report for message ${messageId}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getBalance();
      return true;
    } catch {
      return false;
    }
  }

  private mapTwilioStatus(status: string): 'sent' | 'delivered' | 'failed' | 'pending' {
    switch (status) {
      case 'delivered':
        return 'delivered';
      case 'sent':
      case 'queued':
        return 'sent';
      case 'failed':
      case 'undelivered':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

// AWS SNS SMS provider implementation
export class AWSSNSSMSProvider extends SMSProviderBase {
  private sns: any;

  async initialize(): Promise<boolean> {
    try {
      // Mock AWS SNS implementation
      this.sns = {
        publish: async (params: any) => ({
          MessageId: `sns-${Date.now()}`,
        }),
        getSMSAttributes: async () => ({
          Attributes: {
            MonthlySpendLimit: '10.00',
            DeliveryStatusSuccessSamplingRate: '100',
          },
        }),
      };
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AWS SNS SMS provider:', error);
      return false;
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    const validation = this.validateMessage(message);
    if (!validation.isValid) {
      return {
        success: false,
        provider: SMSProvider.AWS_SNS,
        sentAt: new Date(),
        errorMessage: validation.errors.join(', '),
      };
    }

    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const messageIds: string[] = [];

      for (const recipient of recipients) {
        const params = {
          Message: message.message,
          PhoneNumber: PhoneNumberUtils.toE164(recipient),
          MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: message.type === 'promotional' ? 'Promotional' : 'Transactional',
            },
          },
        };

        const result = await this.sns.publish(params);
        messageIds.push(result.MessageId);
      }

      return {
        success: true,
        messageId: messageIds[0],
        messageIds,
        provider: SMSProvider.AWS_SNS,
        sentAt: new Date(),
        deliveryStatus: 'sent',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: SMSProvider.AWS_SNS,
        sentAt: new Date(),
        errorMessage: error.message,
      };
    }
  }

  async getBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const attributes = await this.sns.getSMSAttributes();
      return {
        balance: parseFloat(attributes.Attributes.MonthlySpendLimit || '0'),
        currency: 'USD',
      };
    } catch (error) {
      throw new Error('Failed to fetch balance from AWS SNS');
    }
  }

  async getDeliveryReport(): Promise<{
    status: 'sent' | 'delivered' | 'failed' | 'pending';
    deliveredAt?: Date;
    errorCode?: string;
  }> {
    // AWS SNS doesn't provide delivery reports in the same way
    return {
      status: 'sent',
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.sns.getSMSAttributes();
      return true;
    } catch {
      return false;
    }
  }
}

// Default SMS templates
export const DEFAULT_SMS_TEMPLATES: Record<SMSTemplateType, SMSTemplate> = {
  [SMSTemplateType.ORDER_CONFIRMED]: {
    id: 'order_confirmed',
    name: 'Order Confirmed',
    type: SMSTemplateType.ORDER_CONFIRMED,
    message: 'Hi {{user.name}}, your order #{{order.orderNumber}} for {{order.total}} {{order.currency}} has been confirmed. Track: {{trackingUrl}}',
    variables: ['user.name', 'order.orderNumber', 'order.total', 'order.currency', 'trackingUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.ORDER_SHIPPED]: {
    id: 'order_shipped',
    name: 'Order Shipped',
    type: SMSTemplateType.ORDER_SHIPPED,
    message: 'Good news! Your order #{{order.orderNumber}} has shipped. Track: {{order.trackingUrl}} Estimated delivery: {{order.estimatedDelivery}}',
    variables: ['order.orderNumber', 'order.trackingUrl', 'order.estimatedDelivery'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.ORDER_DELIVERED]: {
    id: 'order_delivered',
    name: 'Order Delivered',
    type: SMSTemplateType.ORDER_DELIVERED,
    message: 'Your order #{{order.orderNumber}} has been delivered! We hope you love your purchase. Rate your experience: {{reviewUrl}}',
    variables: ['order.orderNumber', 'reviewUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.ORDER_CANCELLED]: {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    type: SMSTemplateType.ORDER_CANCELLED,
    message: 'Your order #{{order.orderNumber}} has been cancelled. Refund will be processed within 3-5 business days. Questions? Contact support.',
    variables: ['order.orderNumber'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.ORDER_OUT_FOR_DELIVERY]: {
    id: 'order_out_for_delivery',
    name: 'Out for Delivery',
    type: SMSTemplateType.ORDER_OUT_FOR_DELIVERY,
    message: 'Your order #{{order.orderNumber}} is out for delivery! Expect it between {{deliveryWindow}}. Be available to receive it.',
    variables: ['order.orderNumber', 'deliveryWindow'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.OTP_VERIFICATION]: {
    id: 'otp_verification',
    name: 'OTP Verification',
    type: SMSTemplateType.OTP_VERIFICATION,
    message: 'Your {{siteName}} verification code is: {{otp}}. Valid for 10 minutes. Do not share this code with anyone.',
    variables: ['siteName', 'otp'],
    isActive: true,
    category: 'otp',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PASSWORD_RESET]: {
    id: 'password_reset',
    name: 'Password Reset',
    type: SMSTemplateType.PASSWORD_RESET,
    message: 'Password reset requested for your {{siteName}} account. Use code {{resetCode}} or visit {{resetUrl}} Valid for 1 hour.',
    variables: ['siteName', 'resetCode', 'resetUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.LOGIN_ALERT]: {
    id: 'login_alert',
    name: 'Login Alert',
    type: SMSTemplateType.LOGIN_ALERT,
    message: 'New login to your {{siteName}} account from {{location}} at {{timestamp}}. If this wasn\'t you, secure your account immediately.',
    variables: ['siteName', 'location', 'timestamp'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PAYMENT_SUCCESS]: {
    id: 'payment_success',
    name: 'Payment Success',
    type: SMSTemplateType.PAYMENT_SUCCESS,
    message: 'Payment of {{amount}} {{currency}} successful for order #{{order.orderNumber}}. Receipt: {{receiptUrl}}',
    variables: ['amount', 'currency', 'order.orderNumber', 'receiptUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PAYMENT_FAILED]: {
    id: 'payment_failed',
    name: 'Payment Failed',
    type: SMSTemplateType.PAYMENT_FAILED,
    message: 'Payment failed for order #{{order.orderNumber}}. Please try again or use a different payment method. Support: {{supportUrl}}',
    variables: ['order.orderNumber', 'supportUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.BACK_IN_STOCK]: {
    id: 'back_in_stock',
    name: 'Back in Stock',
    type: SMSTemplateType.BACK_IN_STOCK,
    message: 'Good news! {{product.name}} is back in stock at {{product.price}} {{product.currency}}. Shop now: {{product.url}}',
    variables: ['product.name', 'product.price', 'product.currency', 'product.url'],
    isActive: true,
    category: 'promotional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PRICE_DROP]: {
    id: 'price_drop',
    name: 'Price Drop',
    type: SMSTemplateType.PRICE_DROP,
    message: 'Price drop alert! {{product.name}} now {{product.price}} {{product.currency}} (was {{originalPrice}}). Buy now: {{product.url}}',
    variables: ['product.name', 'product.price', 'product.currency', 'originalPrice', 'product.url'],
    isActive: true,
    category: 'promotional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.VENDOR_NEW_ORDER]: {
    id: 'vendor_new_order',
    name: 'Vendor New Order',
    type: SMSTemplateType.VENDOR_NEW_ORDER,
    message: 'New order #{{order.orderNumber}} received! {{itemCount}} items worth {{order.total}} {{order.currency}}. Check your dashboard.',
    variables: ['order.orderNumber', 'itemCount', 'order.total', 'order.currency'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Add placeholder templates for remaining types
  [SMSTemplateType.ACCOUNT_LOCKED]: {
    id: 'account_locked',
    name: 'Account Locked',
    type: SMSTemplateType.ACCOUNT_LOCKED,
    message: 'Your account has been locked due to suspicious activity. Contact support: {{supportUrl}}',
    variables: ['supportUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PAYMENT_REMINDER]: {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    type: SMSTemplateType.PAYMENT_REMINDER,
    message: 'Payment reminder for order #{{order.orderNumber}}. Amount: {{amount}} {{currency}}. Pay now: {{paymentUrl}}',
    variables: ['order.orderNumber', 'amount', 'currency', 'paymentUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.VENDOR_PAYOUT]: {
    id: 'vendor_payout',
    name: 'Vendor Payout',
    type: SMSTemplateType.VENDOR_PAYOUT,
    message: 'Payout of {{amount}} {{currency}} has been processed to your account. Check your dashboard for details.',
    variables: ['amount', 'currency'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.VENDOR_LOW_STOCK]: {
    id: 'vendor_low_stock',
    name: 'Low Stock Alert',
    type: SMSTemplateType.VENDOR_LOW_STOCK,
    message: 'Low stock alert: {{product.name}} has only {{quantity}} units left. Restock soon to avoid out-of-stock.',
    variables: ['product.name', 'quantity'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.PROMOTION]: {
    id: 'promotion',
    name: 'Promotion',
    type: SMSTemplateType.PROMOTION,
    message: 'Special offer! {{discount}}% off your next purchase. Use code {{promoCode}}. Valid until {{expiryDate}}. Shop: {{shopUrl}}',
    variables: ['discount', 'promoCode', 'expiryDate', 'shopUrl'],
    isActive: true,
    category: 'promotional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.APPOINTMENT_REMINDER]: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    type: SMSTemplateType.APPOINTMENT_REMINDER,
    message: 'Reminder: Your appointment on {{date}} at {{time}}. Location: {{location}}. Questions? Call {{phone}}',
    variables: ['date', 'time', 'location', 'phone'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.MAINTENANCE_ALERT]: {
    id: 'maintenance_alert',
    name: 'Maintenance Alert',
    type: SMSTemplateType.MAINTENANCE_ALERT,
    message: 'Scheduled maintenance on {{date}} from {{startTime}} to {{endTime}}. Service may be temporarily unavailable.',
    variables: ['date', 'startTime', 'endTime'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [SMSTemplateType.SERVICE_DISRUPTION]: {
    id: 'service_disruption',
    name: 'Service Disruption',
    type: SMSTemplateType.SERVICE_DISRUPTION,
    message: 'We\'re experiencing technical difficulties. Our team is working to resolve this. Updates: {{statusUrl}}',
    variables: ['statusUrl'],
    isActive: true,
    category: 'transactional',
    maxLength: 160,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// SMS service class
export class SMSService {
  private provider: SMSProviderBase;
  private templates: Map<SMSTemplateType, SMSTemplate> = new Map();
  private analytics!: SMSAnalytics;

  constructor(provider: SMSProviderBase) {
    this.provider = provider;
    this.loadDefaultTemplates();
    this.initializeAnalytics();
  }

  private loadDefaultTemplates(): void {
    Object.values(DEFAULT_SMS_TEMPLATES).forEach(template => {
      this.templates.set(template.type, template);
    });
  }

  private initializeAnalytics(): void {
    this.analytics = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalCost: 0,
      currency: 'USD',
      deliveryRate: 0,
      failureRate: 0,
      averageCost: 0,
      byProvider: {} as any,
      byType: {} as any,
      byCountry: [],
      timeSeriesData: [],
    };
  }

  // Send SMS using template
  async sendTemplatedSMS(
    templateType: SMSTemplateType,
    to: string | string[],
    variables: Record<string, string>,
    options?: {
      from?: string;
      priority?: 'high' | 'normal' | 'low';
      scheduledAt?: Date;
    }
  ): Promise<SMSResponse> {
    const template = this.templates.get(templateType);
    if (!template || !template.isActive) {
      return {
        success: false,
        provider: this.provider['config'].provider,
        sentAt: new Date(),
        errorMessage: `Template ${templateType} not found or inactive`,
      };
    }

    const message = this.interpolateTemplate(template.message, variables);
    
    return this.sendSMS({
      to,
      message,
      type: template.category,
      ...options,
    });
  }

  // Send raw SMS
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      const response = await this.provider.sendSMS(message);
      this.updateAnalytics(response, message);
      return response;
    } catch (error: any) {
      const errorResponse: SMSResponse = {
        success: false,
        provider: this.provider['config'].provider,
        sentAt: new Date(),
        errorMessage: error.message,
      };
      this.updateAnalytics(errorResponse, message);
      return errorResponse;
    }
  }

  // Send bulk SMS
  async sendBulkSMS(
    messages: Array<{
      to: string;
      templateType: SMSTemplateType;
      variables: Record<string, string>;
    }>,
    options: { batchSize?: number; delayBetweenBatches?: number } = {}
  ): Promise<SMSResponse[]> {
    const { batchSize = 100, delayBetweenBatches = 1000 } = options;
    const results: SMSResponse[] = [];

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(msg =>
        this.sendTemplatedSMS(msg.templateType, msg.to, msg.variables)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            provider: this.provider['config'].provider,
            sentAt: new Date(),
            errorMessage: result.reason?.message || 'Unknown error',
          });
        }
      });

      // Delay between batches
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  // Template management
  addTemplate(template: Omit<SMSTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `template_${Date.now()}`;
    const smsTemplate: SMSTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.templates.set(template.type, smsTemplate);
    return id;
  }

  updateTemplate(type: SMSTemplateType, updates: Partial<SMSTemplate>): boolean {
    const template = this.templates.get(type);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.templates.set(type, updatedTemplate);
    return true;
  }

  getTemplate(type: SMSTemplateType): SMSTemplate | undefined {
    return this.templates.get(type);
  }

  getAllTemplates(): SMSTemplate[] {
    return Array.from(this.templates.values());
  }

  // Check user SMS preferences
  private shouldSendSMS(user: AppUser, templateType: SMSTemplateType): boolean {
    const preferences = user.preferences?.notifications?.sms;
    if (!preferences) return false;

    switch (templateType) {
      case SMSTemplateType.ORDER_CONFIRMED:
      case SMSTemplateType.ORDER_SHIPPED:
      case SMSTemplateType.ORDER_DELIVERED:
      case SMSTemplateType.ORDER_CANCELLED:
      case SMSTemplateType.ORDER_OUT_FOR_DELIVERY:
        return preferences.orderUpdates;
      
      case SMSTemplateType.LOGIN_ALERT:
      case SMSTemplateType.PASSWORD_RESET:
      case SMSTemplateType.ACCOUNT_LOCKED:
        return preferences.securityAlerts;
      
      case SMSTemplateType.ORDER_OUT_FOR_DELIVERY:
        return preferences.deliveryUpdates;
      
      default:
        return true; // For OTP and other critical messages
    }
  }

  // Utility methods for common SMS scenarios
  async sendOrderConfirmationSMS(order: Order, user: AppUser): Promise<SMSResponse | null> {
    if (!this.shouldSendSMS(user, SMSTemplateType.ORDER_CONFIRMED) || !user.phone) {
      return null;
    }

    return this.sendTemplatedSMS(SMSTemplateType.ORDER_CONFIRMED, user.phone, {
      'user.name': user.name ?? '',
      'order.orderNumber': order.orderNumber,
      'order.total': order.total.toString(),
      'order.currency': order.currency,
      'trackingUrl': `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
    });
  }

  async sendOTPSMS(phone: string, otp: string, siteName: string): Promise<SMSResponse> {
    return this.sendTemplatedSMS(SMSTemplateType.OTP_VERIFICATION, phone, {
      siteName,
      otp,
    }, { priority: 'high' });
  }

  async sendPriceDropSMS(product: Product, phone: string, originalPrice: number): Promise<SMSResponse> {
    return this.sendTemplatedSMS(SMSTemplateType.PRICE_DROP, phone, {
      'product.name': product.name,
      'product.price': product.price.toString(),
      'product.currency': product.currency,
      'originalPrice': originalPrice.toString(),
      'product.url': `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`,
    });
  }

  // Analytics methods
  getAnalytics(): SMSAnalytics {
    return { ...this.analytics };
  }

  private updateAnalytics(response: SMSResponse, message: SMSMessage): void {
    this.analytics.totalSent++;
    
    if (response.success) {
      this.analytics.totalDelivered++;
    } else {
      this.analytics.totalFailed++;
    }

    if (response.cost) {
      this.analytics.totalCost += response.cost;
    }

    // Update rates
    this.analytics.deliveryRate = (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
    this.analytics.failureRate = (this.analytics.totalFailed / this.analytics.totalSent) * 100;
    this.analytics.averageCost = this.analytics.totalCost / this.analytics.totalSent;
  }

  // Template interpolation
  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(variables, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Provider management
  async getProviderBalance(): Promise<{ balance: number; currency: string }> {
    return this.provider.getBalance();
  }

  async getProviderHealth(): Promise<boolean> {
    return this.provider.healthCheck();
  }
}

// Provider factory
export function createSMSProvider(config: SMSConfig): SMSProviderBase {
  switch (config.provider) {
    case SMSProvider.TWILIO:
      return new TwilioSMSProvider(config);
    case SMSProvider.AWS_SNS:
      return new AWSSNSSMSProvider(config);
    // Add other providers as needed
    default:
      throw new Error(`Unsupported SMS provider: ${config.provider}`);
  }
}

// Default SMS service instance
let defaultSMSService: SMSService | null = null;

export function initializeSMSService(config: SMSConfig): SMSService {
  const provider = createSMSProvider(config);
  defaultSMSService = new SMSService(provider);
  
  return defaultSMSService;
}

export function getSMSService(): SMSService {
  if (!defaultSMSService) {
    throw new Error('SMS service not initialized. Call initializeSMSService() first.');
  }
  return defaultSMSService;
}

export default SMSService;