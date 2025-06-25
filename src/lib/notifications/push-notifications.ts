
import { Order } from '@/types/order';
import { AppUser } from '@/types/auth';
import { Product } from '@/types/product';

// Push notification provider types
export enum PushProvider {
  FIREBASE = 'FIREBASE',
  ONESIGNAL = 'ONESIGNAL',
  PUSHER = 'PUSHER',
  WEB_PUSH = 'WEB_PUSH',
  APPLE_PUSH = 'APPLE_PUSH',
}

export interface PushConfig {
  provider: PushProvider;
  serverKey: string;
  projectId?: string;
  appId?: string;
  senderId?: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  isTestMode: boolean;
  
  // Provider-specific config
  firebaseServiceAccount?: string;
  oneSignalAppId?: string;
  oneSignalApiKey?: string;
  pusherAppId?: string;
  pusherCluster?: string;
  
  // Apple Push Notification specific
  apnKeyId?: string;
  apnTeamId?: string;
  apnPrivateKey?: string;
  apnBundleId?: string;
}

export interface PushMessage {
  userId?: string;
  deviceTokens?: string[];
  topic?: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: number;
  sound?: string;
  data?: Record<string, any>;
  clickAction?: string;
  url?: string;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  ttl?: number; // Time to live in seconds
  scheduledAt?: Date;
  tags?: string[];
  segments?: string[];
}

export interface PushResponse {
  success: boolean;
  messageId?: string;
  successCount?: number;
  failureCount?: number;
  results?: Array<{
    messageId?: string;
    error?: string;
    deviceToken?: string;
  }>;
  provider: PushProvider;
  sentAt: Date;
}

export interface PushSubscription {
  id: string;
  userId: string;
  deviceToken: string;
  platform: 'WEB' | 'IOS' | 'ANDROID';
  browser?: string;
  os?: string;
  deviceInfo?: Record<string, any>;
  isActive: boolean;
  subscribedAt: Date;
  lastUsed?: Date;
  tags?: string[];
  segments?: string[];
}

export interface PushTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  data?: Record<string, any>;
  variables: string[];
  isActive: boolean;
  platform?: 'WEB' | 'IOS' | 'ANDROID' | 'ALL';
  createdAt: Date;
  updatedAt: Date;
}

export interface PushAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  clickRate: number;
  byProvider: Record<PushProvider, {
    sent: number;
    delivered: number;
    clicked: number;
    failed: number;
  }>;
  byPlatform: Record<string, {
    sent: number;
    delivered: number;
    clicked: number;
  }>;
  byTemplate: Array<{
    templateId: string;
    name: string;
    sent: number;
    delivered: number;
    clicked: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    sent: number;
    delivered: number;
    clicked: number;
    failed: number;
  }>;
}

// Abstract Push Provider base class
export abstract class PushProviderBase {
  protected config: PushConfig;
  protected client: any;

  constructor(config: PushConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<boolean>;
  abstract sendPush(message: PushMessage): Promise<PushResponse>;
  abstract sendToDevice(deviceToken: string, message: PushMessage): Promise<PushResponse>;
  abstract sendToTopic(topic: string, message: PushMessage): Promise<PushResponse>;
  abstract sendToUser(userId: string, message: PushMessage): Promise<PushResponse>;
  abstract subscribeToTopic(deviceToken: string, topic: string): Promise<boolean>;
  abstract unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean>;
  abstract healthCheck(): Promise<boolean>;

  // Template variable interpolation
  protected interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return variables[key.trim()] || match;
    });
  }

  // Message validation
  protected validateMessage(message: PushMessage): boolean {
    return !!(message.title && message.body);
  }
}

// Firebase Cloud Messaging Provider
export class FirebasePushProvider extends PushProviderBase {
  async initialize(): Promise<boolean> {
    try {
      const admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        const serviceAccount = JSON.parse(this.config.firebaseServiceAccount || '{}');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: this.config.projectId,
        });
      }
      
      this.client = admin.messaging();
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return false;
    }
  }

  async sendPush(message: PushMessage): Promise<PushResponse> {
    try {
      if (!this.validateMessage(message)) {
        throw new Error('Invalid message format');
      }

      const fcmMessage = this.buildFCMMessage(message);
      
      if (message.deviceTokens && message.deviceTokens.length > 0) {
        return this.sendToMultipleDevices(message.deviceTokens, fcmMessage);
      } else if (message.topic) {
        return this.sendToTopic(message.topic, message);
      } else {
        throw new Error('No target specified (deviceTokens or topic)');
      }
    } catch (error) {
      console.error('Firebase push failed:', error);
      return {
        success: false,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    }
  }

  async sendToDevice(deviceToken: string, message: PushMessage): Promise<PushResponse> {
    try {
      const fcmMessage = {
        ...this.buildFCMMessage(message),
        token: deviceToken,
      };

      const result = await this.client.send(fcmMessage);
      
      return {
        success: true,
        messageId: result,
        successCount: 1,
        failureCount: 0,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Firebase send to device failed:', error);
      return {
        success: false,
        failureCount: 1,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    }
  }

  async sendToTopic(topic: string, message: PushMessage): Promise<PushResponse> {
    try {
      const fcmMessage = {
        ...this.buildFCMMessage(message),
        topic,
      };

      const result = await this.client.send(fcmMessage);
      
      return {
        success: true,
        messageId: result,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Firebase send to topic failed:', error);
      return {
        success: false,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    }
  }

  async sendToUser(userId: string, message: PushMessage): Promise<PushResponse> {
    // Would need to look up user's device tokens from database
    // This is a simplified implementation
    const userDeviceTokens = await this.getUserDeviceTokens(userId);
    
    if (userDeviceTokens.length === 0) {
      return {
        success: false,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    }

    return this.sendToMultipleDevices(userDeviceTokens, this.buildFCMMessage(message));
  }

  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    try {
      await this.client.subscribeToTopic([deviceToken], topic);
      return true;
    } catch (error) {
      console.error('Firebase topic subscription failed:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean> {
    try {
      await this.client.unsubscribeFromTopic([deviceToken], topic);
      return true;
    } catch (error) {
      console.error('Firebase topic unsubscription failed:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to validate a dummy token
      await this.client.send({
        notification: { title: 'test', body: 'test' },
        token: 'dummy_token',
      }, true); // Dry run
      return true;
    } catch (error) {
      // Dry run should fail with invalid token, but service should be healthy
      return error !== 'app/invalid-credential';
    }
  }

  private buildFCMMessage(message: PushMessage): any {
    const fcmMessage: any = {
      notification: {
        title: message.title,
        body: message.body,
      },
      data: message.data || {},
    };

    if (message.icon) fcmMessage.notification.icon = message.icon;
    if (message.image) fcmMessage.notification.image = message.image;
    if (message.clickAction) fcmMessage.notification.click_action = message.clickAction;
    if (message.sound) fcmMessage.notification.sound = message.sound;
    if (message.badge !== undefined) fcmMessage.notification.badge = message.badge.toString();

    // Platform-specific options
    fcmMessage.android = {
      priority: message.priority?.toLowerCase() || 'normal',
      ttl: message.ttl ? `${message.ttl}s` : undefined,
    };

    fcmMessage.apns = {
      payload: {
        aps: {
          badge: message.badge,
          sound: message.sound || 'default',
        },
      },
    };

    fcmMessage.webpush = {
      notification: {
        icon: message.icon,
        image: message.image,
        badge: message.badge,
        actions: message.clickAction ? [
          { action: 'open', title: 'Open' }
        ] : undefined,
      },
    };

    return fcmMessage;
  }

  private async sendToMultipleDevices(deviceTokens: string[], message: any): Promise<PushResponse> {
    try {
      const result = await this.client.sendMulticast({
        tokens: deviceTokens,
        ...message,
      });

      return {
        success: result.failureCount === 0,
        successCount: result.successCount,
        failureCount: result.failureCount,
        results: result.responses.map((response: any, index: number) => ({
          messageId: response.messageId,
          error: response.error?.message,
          deviceToken: deviceTokens[index],
        })),
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Firebase multicast failed:', error);
      return {
        success: false,
        failureCount: deviceTokens.length,
        provider: PushProvider.FIREBASE,
        sentAt: new Date(),
      };
    }
  }

  private async getUserDeviceTokens(userId: string): Promise<string[]> {
    // This would query the database for user's device tokens
    // Simplified implementation
    return [];
  }
}

// OneSignal Provider
export class OneSignalProvider extends PushProviderBase {
  async initialize(): Promise<boolean> {
    try {
      this.client = {
        appId: this.config.oneSignalAppId,
        apiKey: this.config.oneSignalApiKey,
        baseURL: 'https://onesignal.com/api/v1',
      };
      return true;
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
      return false;
    }
  }

  async sendPush(message: PushMessage): Promise<PushResponse> {
    try {
      const payload = this.buildOneSignalPayload(message);
      
      const response = await fetch(`${this.client.baseURL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.client.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.id) {
        return {
          success: true,
          messageId: result.id,
          successCount: result.recipients || 0,
          provider: PushProvider.ONESIGNAL,
          sentAt: new Date(),
        };
      } else {
        throw new Error(result.errors?.join(', ') || 'OneSignal API error');
      }
    } catch (error) {
      console.error('OneSignal push failed:', error);
      return {
        success: false,
        provider: PushProvider.ONESIGNAL,
        sentAt: new Date(),
      };
    }
  }

  async sendToDevice(deviceToken: string, message: PushMessage): Promise<PushResponse> {
    const messageWithDevice = { ...message, deviceTokens: [deviceToken] };
    return this.sendPush(messageWithDevice);
  }

  async sendToTopic(topic: string, message: PushMessage): Promise<PushResponse> {
    const messageWithTopic = { ...message, segments: [topic] };
    return this.sendPush(messageWithTopic);
  }

  async sendToUser(userId: string, message: PushMessage): Promise<PushResponse> {
    const payload = {
      ...this.buildOneSignalPayload(message),
      filters: [{ field: 'external_user_id', value: userId }],
    };

    try {
      const response = await fetch(`${this.client.baseURL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.client.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      return {
        success: !!result.id,
        messageId: result.id,
        provider: PushProvider.ONESIGNAL,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('OneSignal send to user failed:', error);
      return {
        success: false,
        provider: PushProvider.ONESIGNAL,
        sentAt: new Date(),
      };
    }
  }

  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    // OneSignal uses segments/tags instead of topics
    try {
      const response = await fetch(`${this.client.baseURL}/players/${deviceToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.client.apiKey}`,
        },
        body: JSON.stringify({
          tags: { [topic]: 'true' },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('OneSignal topic subscription failed:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.client.baseURL}/players/${deviceToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.client.apiKey}`,
        },
        body: JSON.stringify({
          tags: { [topic]: '' },
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('OneSignal topic unsubscription failed:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.client.baseURL}/apps/${this.client.appId}`, {
        headers: {
          'Authorization': `Basic ${this.client.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('OneSignal health check failed:', error);
      return false;
    }
  }

  private buildOneSignalPayload(message: PushMessage): any {
    const payload: any = {
      app_id: this.client.appId,
      headings: { en: message.title },
      contents: { en: message.body },
      data: message.data || {},
    };

    if (message.deviceTokens) {
      payload.include_player_ids = message.deviceTokens;
    }

    if (message.segments) {
      payload.included_segments = message.segments;
    }

    if (message.tags) {
      payload.filters = message.tags.map(tag => ({ field: 'tag', key: tag, value: 'true' }));
    }

    if (message.icon) payload.large_icon = message.icon;
    if (message.image) payload.big_picture = message.image;
    if (message.url) payload.url = message.url;
    if (message.badge) payload.ios_badgeCount = message.badge;
    if (message.sound) payload.ios_sound = message.sound;
    if (message.scheduledAt) payload.send_after = message.scheduledAt.toISOString();

    return payload;
  }
}

// Web Push Provider (using VAPID)
export class WebPushProvider extends PushProviderBase {
  async initialize(): Promise<boolean> {
    try {
      const webpush = require('web-push');
      
      webpush.setVapidDetails(
        'mailto:support@yoursite.com',
        this.config.vapidPublicKey!,
        this.config.vapidPrivateKey!
      );
      
      this.client = webpush;
      return true;
    } catch (error) {
      console.error('Failed to initialize Web Push:', error);
      return false;
    }
  }

  async sendPush(message: PushMessage): Promise<PushResponse> {
    if (!message.deviceTokens || message.deviceTokens.length === 0) {
      return {
        success: false,
        provider: PushProvider.WEB_PUSH,
        sentAt: new Date(),
      };
    }

    const payload = JSON.stringify({
      title: message.title,
      body: message.body,
      icon: message.icon,
      image: message.image,
      badge: message.badge,
      data: message.data,
      actions: message.clickAction ? [{ action: 'open', title: 'Open' }] : undefined,
    });

    const results = await Promise.allSettled(
      message.deviceTokens.map(token => 
        this.client.sendNotification(JSON.parse(token), payload)
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results: results.map((result, index) => ({
        deviceToken: message.deviceTokens![index],
        error: result.status === 'rejected' ? result.reason.message : undefined,
      })),
      provider: PushProvider.WEB_PUSH,
      sentAt: new Date(),
    };
  }

  async sendToDevice(deviceToken: string, message: PushMessage): Promise<PushResponse> {
    return this.sendPush({ ...message, deviceTokens: [deviceToken] });
  }

  async sendToTopic(topic: string, message: PushMessage): Promise<PushResponse> {
    // Web Push doesn't have native topic support
    // Would need to implement by maintaining topic subscriptions
    throw new Error('Topic messaging not supported by Web Push');
  }

  async sendToUser(userId: string, message: PushMessage): Promise<PushResponse> {
    const userDeviceTokens = await this.getUserDeviceTokens(userId);
    return this.sendPush({ ...message, deviceTokens: userDeviceTokens });
  }

  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    // Custom implementation required
    return false;
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean> {
    // Custom implementation required
    return false;
  }

  async healthCheck(): Promise<boolean> {
    return !!this.client;
  }

  private async getUserDeviceTokens(userId: string): Promise<string[]> {
    // Implementation would query database for user's web push subscriptions
    return [];
  }
}

// Push Notification Service Manager
export class PushNotificationService {
  private provider: PushProviderBase;
  private templates: Map<string, PushTemplate> = new Map();
  private subscriptions: Map<string, PushSubscription[]> = new Map();
  private analytics: PushAnalytics;

  constructor(provider: PushProviderBase) {
    this.provider = provider;
    this.analytics = this.initializeAnalytics();
  }

  async initialize(): Promise<boolean> {
    return this.provider.initialize();
  }

  // Send push notification with template
  async sendPush(
    templateId: string,
    target: {
      userId?: string;
      deviceTokens?: string[];
      topic?: string;
      segments?: string[];
    },
    variables: Record<string, string> = {},
    options: {
      priority?: 'HIGH' | 'NORMAL' | 'LOW';
      scheduledAt?: Date;
      badge?: number;
    } = {}
  ): Promise<PushResponse> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Push template not found: ${templateId}`);
    }

    const message: PushMessage = {
      title: this.interpolateTemplate(template.title, variables),
      body: this.interpolateTemplate(template.body, variables),
      icon: template.icon,
      image: template.image,
      clickAction: template.clickAction,
      data: { ...template.data, templateId },
      ...target,
      ...options,
    };

    const response = await this.provider.sendPush(message);
    this.updateAnalytics(response, templateId);
    
    return response;
  }

  // Send direct push notification
  async sendDirectPush(
    message: PushMessage,
    target: {
      userId?: string;
      deviceTokens?: string[];
      topic?: string;
    }
  ): Promise<PushResponse> {
    const fullMessage = { ...message, ...target };
    const response = await this.provider.sendPush(fullMessage);
    this.updateAnalytics(response);
    
    return response;
  }

  // Send to specific user
  async sendToUser(userId: string, templateId: string, variables: Record<string, string> = {}): Promise<PushResponse> {
    return this.sendPush(templateId, { userId }, variables);
  }

  // Send to topic/segment
  async sendToTopic(topic: string, templateId: string, variables: Record<string, string> = {}): Promise<PushResponse> {
    return this.sendPush(templateId, { topic }, variables);
  }

  // Bulk send to multiple users
  async sendBulkPush(
    recipients: Array<{
      userId: string;
      templateId: string;
      variables?: Record<string, string>;
    }>,
    options: { batchSize?: number; delayBetweenBatches?: number } = {}
  ): Promise<PushResponse[]> {
    const { batchSize = 100, delayBetweenBatches = 1000 } = options;
    const results: PushResponse[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient =>
        this.sendToUser(recipient.userId, recipient.templateId, recipient.variables)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            provider: this.provider.config.provider,
            sentAt: new Date(),
          });
        }
      });

      // Delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  // Template management
  addTemplate(template: Omit<PushTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `template_${Date.now()}`;
    const pushTemplate: PushTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.templates.set(id, pushTemplate);
    return id;
  }

  updateTemplate(id: string, updates: Partial<PushTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.templates.set(id, updatedTemplate);
    return true;
  }

  getTemplate(id: string): PushTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): PushTemplate[] {
    return Array.from(this.templates.values());
  }

  // Subscription management
  async subscribeDevice(subscription: Omit<PushSubscription, 'id' | 'subscribedAt'>): Promise<string> {
    const id = `sub_${Date.now()}`;
    const pushSubscription: PushSubscription = {
      ...subscription,
      id,
      subscribedAt: new Date(),
    };

    const userSubscriptions = this.subscriptions.get(subscription.userId) || [];
    userSubscriptions.push(pushSubscription);
    this.subscriptions.set(subscription.userId, userSubscriptions);

    return id;
  }

  async unsubscribeDevice(userId: string, deviceToken: string): Promise<boolean> {
    const userSubscriptions = this.subscriptions.get(userId);
    if (!userSubscriptions) return false;

    const filteredSubscriptions = userSubscriptions.filter(sub => sub.deviceToken !== deviceToken);
    this.subscriptions.set(userId, filteredSubscriptions);

    return true;
  }

  getUserSubscriptions(userId: string): PushSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  // Topic management
  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    return this.provider.subscribeToTopic(deviceToken, topic);
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean> {
    return this.provider.unsubscribeFromTopic(deviceToken, topic);
  }

  // Analytics
  getAnalytics(): PushAnalytics {
    return this.analytics;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }

  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return variables[key.trim()] || match;
    });
  }

  private initializeAnalytics(): PushAnalytics {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalClicked: 0,
      totalFailed: 0,
      deliveryRate: 0,
      clickRate: 0,
      byProvider: {} as Record<PushProvider, any>,
      byPlatform: {},
      byTemplate: [],
      timeSeriesData: [],
    };
  }

  private updateAnalytics(response: PushResponse, templateId?: string): void {
    this.analytics.totalSent += response.successCount || 1;
    this.analytics.totalFailed += response.failureCount || 0;
    
    // Update rates
    const total = this.analytics.totalSent + this.analytics.totalFailed;
    this.analytics.deliveryRate = total > 0 ? this.analytics.totalSent / total : 0;
    
    // Update provider stats
    if (!this.analytics.byProvider[response.provider]) {
      this.analytics.byProvider[response.provider] = {
        sent: 0,
        delivered: 0,
        clicked: 0,
        failed: 0,
      };
    }
    
    const providerStats = this.analytics.byProvider[response.provider];
    providerStats.sent += response.successCount || 1;
    providerStats.failed += response.failureCount || 0;
  }
}

// Push notification templates for ecommerce
export const PUSH_TEMPLATES = {
  ORDER_CONFIRMATION: {
    name: 'Order Confirmation',
    title: 'Order Confirmed! 🎉',
    body: 'Your order #{{orderNumber}} has been confirmed. Total: {{total}}',
    icon: '/icons/order-confirmed.png',
    clickAction: '/orders/{{orderId}}',
    data: { type: 'order_confirmation' },
    variables: ['orderNumber', 'total', 'orderId'],
    isActive: true,
    platform: 'ALL' as const,
  },
  
  ORDER_SHIPPED: {
    name: 'Order Shipped',
    title: 'Your order is on the way! 🚚',
    body: 'Order #{{orderNumber}} has shipped. Track: {{trackingNumber}}',
    icon: '/icons/shipping.png',
    clickAction: '/orders/{{orderId}}/tracking',
    data: { type: 'order_shipped' },
    variables: ['orderNumber', 'trackingNumber', 'orderId'],
    isActive: true,
    platform: 'ALL' as const,
  },
  
  PRICE_DROP: {
    name: 'Price Drop Alert',
    title: 'Price Drop Alert! 💰',
    body: '{{productName}} is now {{newPrice}} (was {{oldPrice}})',
    icon: '/icons/price-drop.png',
    image: '{{productImage}}',
    clickAction: '/products/{{productId}}',
    data: { type: 'price_drop' },
    variables: ['productName', 'newPrice', 'oldPrice', 'productImage', 'productId'],
    isActive: true,
    platform: 'ALL' as const,
  },
  
  BACK_IN_STOCK: {
    name: 'Back in Stock',
    title: 'Back in Stock! 📦',
    body: '{{productName}} is back in stock. Get yours now!',
    icon: '/icons/in-stock.png',
    image: '{{productImage}}',
    clickAction: '/products/{{productId}}',
    data: { type: 'back_in_stock' },
    variables: ['productName', 'productImage', 'productId'],
    isActive: true,
    platform: 'ALL' as const,
  },
  
  CART_ABANDONMENT: {
    name: 'Cart Abandonment',
    title: 'Don\'t forget your items! 🛒',
    body: 'Complete your purchase and save {{discount}}%',
    icon: '/icons/cart.png',
    clickAction: '/cart',
    data: { type: 'cart_abandonment' },
    variables: ['discount'],
    isActive: true,
    platform: 'ALL' as const,
  },
  
  FLASH_SALE: {
    name: 'Flash Sale',
    title: 'Flash Sale! ⚡',
    body: '{{discount}}% off everything for the next {{hours}} hours!',
    icon: '/icons/sale.png',
    clickAction: '/sales/flash',
    data: { type: 'flash_sale' },
    variables: ['discount', 'hours'],
    isActive: true,
    platform: 'ALL' as const,
  },
};

// Helper functions for common push notifications
export async function sendOrderConfirmationPush(
  pushService: PushNotificationService,
  order: Order,
  user: AppUser
): Promise<PushResponse | null> {
  if (!shouldSendOrderPush(user)) {
    return null;
  }

  return pushService.sendToUser(user.id, 'ORDER_CONFIRMATION', {
    orderNumber: order.orderNumber,
    total: `${order.total} ${order.currency}`,
    orderId: order.id,
  });
}

export async function sendPriceDropPush(
  pushService: PushNotificationService,
  product: Product,
  oldPrice: number,
  userIds: string[]
): Promise<PushResponse[]> {
  const recipients = userIds.map(userId => ({
    userId,
    templateId: 'PRICE_DROP',
    variables: {
      productName: product.name,
      newPrice: `${product.price} ${product.currency}`,
      oldPrice: `${oldPrice} ${product.currency}`,
      productImage: product.images[0]?.url || '',
      productId: product.id,
    },
  }));

  return pushService.sendBulkPush(recipients);
}

// Utility functions
function shouldSendOrderPush(user: AppUser): boolean {
  // Check user's push notification preferences
  return true; // Simplified for example
}

// Provider factory
export function createPushProvider(config: PushConfig): PushProviderBase {
  switch (config.provider) {
    case PushProvider.FIREBASE:
      return new FirebasePushProvider(config);
    case PushProvider.ONESIGNAL:
      return new OneSignalProvider(config);
    case PushProvider.WEB_PUSH:
      return new WebPushProvider(config);
    default:
      throw new Error(`Unsupported push provider: ${config.provider}`);
  }
}

// Default push service instance
let defaultPushService: PushNotificationService | null = null;

export function initializePushService(config: PushConfig): PushNotificationService {
  const provider = createPushProvider(config);
  defaultPushService = new PushNotificationService(provider);
  
  // Load default templates
  Object.entries(PUSH_TEMPLATES).forEach(([key, template]) => {
    defaultPushService!.addTemplate(template);
  });
  
  return defaultPushService;
}

export function getPushService(): PushNotificationService {
  if (!defaultPushService) {
    throw new Error('Push service not initialized. Call initializePushService() first.');
  }
  return defaultPushService;
}

export default PushNotificationService;