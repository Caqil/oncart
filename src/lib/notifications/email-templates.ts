// src/lib/notifications/email-templates.ts

import { EmailTemplate } from '@/types/settings';
import { Order } from '@/types/order';
import { AppUser } from '@/types/auth';
import { Product } from '@/types/product';
import { Vendor } from '@/types/vendor';
import { NotificationType } from '@/types/user';

// Email template categories
export enum EmailTemplateCategory {
  TRANSACTIONAL = 'TRANSACTIONAL',
  MARKETING = 'MARKETING',
  SYSTEM = 'SYSTEM',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

// Email template types aligned with NotificationType
export enum EmailTemplateType {
  // Order related
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  ORDER_RETURN_APPROVED = 'ORDER_RETURN_APPROVED',
  
  // Payment related
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYOUT_PROCESSED = 'PAYOUT_PROCESSED',
  
  // User management
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  
  // Vendor related
  VENDOR_APPLICATION_APPROVED = 'VENDOR_APPLICATION_APPROVED',
  VENDOR_APPLICATION_REJECTED = 'VENDOR_APPLICATION_REJECTED',
  VENDOR_PAYOUT_NOTIFICATION = 'VENDOR_PAYOUT_NOTIFICATION',
  VENDOR_NEW_ORDER = 'VENDOR_NEW_ORDER',
  VENDOR_PRODUCT_APPROVED = 'VENDOR_PRODUCT_APPROVED',
  VENDOR_PRODUCT_REJECTED = 'VENDOR_PRODUCT_REJECTED',
  
  // Customer notifications
  PRICE_DROP = 'PRICE_DROP',
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  WISHLIST_SALE = 'WISHLIST_SALE',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  CART_ABANDONMENT = 'CART_ABANDONMENT',
  
  // Marketing
  NEWSLETTER = 'NEWSLETTER',
  PROMOTION = 'PROMOTION',
  PRODUCT_RECOMMENDATION = 'PRODUCT_RECOMMENDATION',
  SEASONAL_SALE = 'SEASONAL_SALE',
  
  // System
  SECURITY_ALERT = 'SECURITY_ALERT',
  MAINTENANCE_NOTIFICATION = 'MAINTENANCE_NOTIFICATION',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  BACKUP_NOTIFICATION = 'BACKUP_NOTIFICATION',
}

// Enhanced email template interface
export interface EmailTemplateDefinition extends EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  category: EmailTemplateCategory;
  description?: string;
  isSystem: boolean;
  canEdit: boolean;
  previewData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Email template variable types
export interface EmailVariables {
  // Site variables
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  logoUrl: string;
  
  // User variables
  user?: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    displayName?: string;
  };
  
  // Order variables
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    shippingAddress: Record<string, string>;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
  
  // Product variables
  product?: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    currency: string;
    image?: string;
    url: string;
  };
  
  // Vendor variables
  vendor?: {
    id: string;
    storeName: string;
    ownerName: string;
    email: string;
    storeUrl: string;
    logo?: string;
  };
  
  // Security variables
  token?: string;
  resetUrl?: string;
  verificationUrl?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  
  // Custom variables
  [key: string]: any;
}

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateType, EmailTemplateDefinition> = {
  [EmailTemplateType.ORDER_CONFIRMED]: {
    id: 'order_confirmed',
    name: 'Order Confirmation',
    type: EmailTemplateType.ORDER_CONFIRMED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Order Confirmed #{{order.orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #333; text-align: center;">Order Confirmed! 🎉</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{user.name}},</p>
          <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order Details</h3>
            <p><strong>Order Number:</strong> #{{order.orderNumber}}</p>
            <p><strong>Order Total:</strong> {{order.total}} {{order.currency}}</p>
            <p><strong>Status:</strong> {{order.status}}</p>
          </div>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>Items Ordered:</h3>
          {{#each order.items}}
          <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <div style="display: flex; align-items: center;">
              {{#if image}}
              <img src="{{image}}" alt="{{name}}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">
              {{/if}}
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: bold;">{{name}}</p>
                <p style="margin: 5px 0; color: #666;">Quantity: {{quantity}}</p>
                <p style="margin: 5px 0; font-weight: bold;">{{price}} {{../order.currency}}</p>
              </div>
            </div>
          </div>
          {{/each}}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address:</h3>
          <p>{{order.shippingAddress.firstName}} {{order.shippingAddress.lastName}}</p>
          <p>{{order.shippingAddress.addressLine1}}</p>
          {{#if order.shippingAddress.addressLine2}}
          <p>{{order.shippingAddress.addressLine2}}</p>
          {{/if}}
          <p>{{order.shippingAddress.city}}, {{order.shippingAddress.state}} {{order.shippingAddress.postalCode}}</p>
          <p>{{order.shippingAddress.country}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{siteUrl}}/orders/{{order.id}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Your Order</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Need help? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          <p>{{siteName}} Team</p>
        </div>
      </div>
    `,
    textContent: `
      Order Confirmed #{{order.orderNumber}}
      
      Hi {{user.name}},
      
      Thank you for your order! We've received your order and are preparing it for shipment.
      
      Order Details:
      Order Number: #{{order.orderNumber}}
      Order Total: {{order.total}} {{order.currency}}
      Status: {{order.status}}
      
      Items Ordered:
      {{#each order.items}}
      - {{name}} x {{quantity}} - {{price}} {{../order.currency}}
      {{/each}}
      
      Shipping Address:
      {{order.shippingAddress.firstName}} {{order.shippingAddress.lastName}}
      {{order.shippingAddress.addressLine1}}
      {{#if order.shippingAddress.addressLine2}}{{order.shippingAddress.addressLine2}}{{/if}}
      {{order.shippingAddress.city}}, {{order.shippingAddress.state}} {{order.shippingAddress.postalCode}}
      {{order.shippingAddress.country}}
      
      Track your order: {{siteUrl}}/orders/{{order.id}}
      
      Need help? Contact us at {{supportEmail}}
      
      {{siteName}} Team
    `,
    isActive: true,
    variables: ['siteName', 'siteUrl', 'supportEmail', 'logoUrl', 'user.name', 'order.orderNumber', 'order.total', 'order.currency', 'order.status', 'order.items', 'order.shippingAddress', 'order.id'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when an order is confirmed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.ORDER_SHIPPED]: {
    id: 'order_shipped',
    name: 'Order Shipped',
    type: EmailTemplateType.ORDER_SHIPPED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Your order #{{order.orderNumber}} has shipped! 📦',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #28a745; text-align: center;">Your order is on its way! 📦</h1>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{user.name}},</p>
          <p>Great news! Your order #{{order.orderNumber}} has been shipped and is on its way to you.</p>
          
          {{#if order.trackingNumber}}
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0;">Tracking Information</h3>
            <p><strong>Tracking Number:</strong> {{order.trackingNumber}}</p>
            {{#if order.estimatedDelivery}}
            <p><strong>Estimated Delivery:</strong> {{order.estimatedDelivery}}</p>
            {{/if}}
          </div>
          {{/if}}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          {{#if order.trackingUrl}}
          <a href="{{order.trackingUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">Track Package</a>
          {{/if}}
          <a href="{{siteUrl}}/orders/{{order.id}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Questions about your order? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          <p>{{siteName}} Team</p>
        </div>
      </div>
    `,
    textContent: `
      Your order #{{order.orderNumber}} has shipped!
      
      Hi {{user.name}},
      
      Great news! Your order #{{order.orderNumber}} has been shipped and is on its way to you.
      
      {{#if order.trackingNumber}}
      Tracking Number: {{order.trackingNumber}}
      {{#if order.estimatedDelivery}}
      Estimated Delivery: {{order.estimatedDelivery}}
      {{/if}}
      {{#if order.trackingUrl}}
      Track your package: {{order.trackingUrl}}
      {{/if}}
      {{/if}}
      
      View your order: {{siteUrl}}/orders/{{order.id}}
      
      Questions about your order? Contact us at {{supportEmail}}
      
      {{siteName}} Team
    `,
    isActive: true,
    variables: ['siteName', 'siteUrl', 'supportEmail', 'logoUrl', 'user.name', 'order.orderNumber', 'order.id', 'order.trackingNumber', 'order.trackingUrl', 'order.estimatedDelivery'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when an order is shipped',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.WELCOME]: {
    id: 'welcome',
    name: 'Welcome Email',
    type: EmailTemplateType.WELCOME,
    category: EmailTemplateCategory.CUSTOMER,
    subject: 'Welcome to {{siteName}}! 🎉',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #333; text-align: center;">Welcome to {{siteName}}! 🎉</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{user.firstName || user.name}},</p>
          <p>Welcome to {{siteName}}! We're excited to have you join our community of savvy shoppers.</p>
          
          <p>Here's what you can do with your new account:</p>
          <ul>
            <li>🛍️ Shop from thousands of products</li>
            <li>📱 Track your orders in real-time</li>
            <li>❤️ Save items to your wishlist</li>
            <li>⭐ Leave reviews and earn rewards</li>
            <li>🎯 Get personalized recommendations</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{siteUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Start Shopping</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Need help getting started? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          <p>Happy shopping!<br>The {{siteName}} Team</p>
        </div>
      </div>
    `,
    textContent: `
      Welcome to {{siteName}}!
      
      Hi {{user.firstName || user.name}},
      
      Welcome to {{siteName}}! We're excited to have you join our community of savvy shoppers.
      
      Here's what you can do with your new account:
      - Shop from thousands of products
      - Track your orders in real-time
      - Save items to your wishlist
      - Leave reviews and earn rewards
      - Get personalized recommendations
      
      Start shopping: {{siteUrl}}
      
      Need help getting started? Contact us at {{supportEmail}}
      
      Happy shopping!
      The {{siteName}} Team
    `,
    isActive: true,
    variables: ['siteName', 'siteUrl', 'supportEmail', 'logoUrl', 'user.firstName', 'user.name'],
    isSystem: true,
    canEdit: true,
    description: 'Sent to new users after registration',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PASSWORD_RESET]: {
    id: 'password_reset',
    name: 'Password Reset',
    type: EmailTemplateType.PASSWORD_RESET,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Reset your {{siteName}} password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{user.name}},</p>
          <p>We received a request to reset your password for your {{siteName}} account.</p>
          
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>Request details:</strong></p>
            <p>📅 Time: {{timestamp}}</p>
            <p>🌍 Location: {{location || 'Unknown'}}</p>
            <p>💻 Device: {{device || 'Unknown'}}</p>
          </div>
          
          <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset My Password</a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Need help? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          <p>{{siteName}} Security Team</p>
        </div>
      </div>
    `,
    textContent: `
      Reset Your Password
      
      Hi {{user.name}},
      
      We received a request to reset your password for your {{siteName}} account.
      
      Request details:
      Time: {{timestamp}}
      Location: {{location || 'Unknown'}}
      Device: {{device || 'Unknown'}}
      
      If you didn't request this, you can safely ignore this email. Your password won't be changed.
      
      Reset your password: {{resetUrl}}
      
      This link will expire in 1 hour for security reasons.
      
      Need help? Contact us at {{supportEmail}}
      
      {{siteName}} Security Team
    `,
    isActive: true,
    variables: ['siteName', 'supportEmail', 'logoUrl', 'user.name', 'resetUrl', 'timestamp', 'location', 'device'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when user requests password reset',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_APPLICATION_APPROVED]: {
    id: 'vendor_approved',
    name: 'Vendor Application Approved',
    type: EmailTemplateType.VENDOR_APPLICATION_APPROVED,
    category: EmailTemplateCategory.VENDOR,
    subject: '🎉 Your vendor application has been approved!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #28a745; text-align: center;">Congratulations! 🎉</h1>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{vendor.ownerName}},</p>
          <p>We're excited to let you know that your vendor application for <strong>"{{vendor.storeName}}"</strong> has been approved!</p>
          
          <p>Your store is now live on {{siteName}} and you can start selling immediately.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3>What you can do now:</h3>
          <ul>
            <li>📦 Add products to your store</li>
            <li>📊 Manage orders and inventory</li>
            <li>💰 Track your earnings and analytics</li>
            <li>⚙️ Customize your store settings</li>
            <li>🎯 Set up promotional campaigns</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{vendor.dashboardUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">Go to Dashboard</a>
          <a href="{{vendor.storeUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Store</a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Questions? Our vendor support team is here to help at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          <p>Welcome to the {{siteName}} family!</p>
        </div>
      </div>
    `,
    textContent: `
      Congratulations! Your vendor application has been approved!
      
      Hi {{vendor.ownerName}},
      
      We're excited to let you know that your vendor application for "{{vendor.storeName}}" has been approved!
      
      Your store is now live on {{siteName}} and you can start selling immediately.
      
      What you can do now:
      - Add products to your store
      - Manage orders and inventory
      - Track your earnings and analytics
      - Customize your store settings
      - Set up promotional campaigns
      
      Go to Dashboard: {{vendor.dashboardUrl}}
      View Store: {{vendor.storeUrl}}
      
      Questions? Our vendor support team is here to help at {{supportEmail}}
      
      Welcome to the {{siteName}} family!
    `,
    isActive: true,
    variables: ['siteName', 'supportEmail', 'logoUrl', 'vendor.ownerName', 'vendor.storeName', 'vendor.dashboardUrl', 'vendor.storeUrl'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor application is approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PRICE_DROP]: {
    id: 'price_drop',
    name: 'Price Drop Alert',
    type: EmailTemplateType.PRICE_DROP,
    category: EmailTemplateCategory.MARKETING,
    subject: '💰 Price Drop Alert: {{product.name}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{logoUrl}}" alt="{{siteName}}" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #e74c3c; text-align: center;">Price Drop Alert! 💰</h1>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Hi {{user.name}},</p>
          <p>Great news! The price has dropped on an item in your wishlist.</p>
        </div>
        
        <div style="border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; align-items: center;">
            {{#if product.image}}
            <img src="{{product.image}}" alt="{{product.name}}" style="width: 120px; height: 120px; object-fit: cover; margin-right: 20px; border-radius: 4px;">
            {{/if}}
            <div style="flex: 1;">
              <h3 style="margin: 0 0 10px 0; color: #333;">{{product.name}}</h3>
              <div style="margin: 10px 0;">
                {{#if product.comparePrice}}
                <span style="text-decoration: line-through; color: #999; font-size: 18px;">{{product.comparePrice}} {{product.currency}}</span>
                {{/if}}
                <span style="color: #e74c3c; font-size: 24px; font-weight: bold; margin-left: 10px;">{{product.price}} {{product.currency}}</span>
              </div>
              {{#if discount}}
              <div style="background: #e74c3c; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold;">
                {{discount}}% OFF
              </div>
              {{/if}}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{product.url}}" style="background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 18px;">Buy Now</a>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">Hurry! Prices can change at any time.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
          <p>Don't want these alerts? <a href="{{unsubscribeUrl}}">Unsubscribe here</a></p>
          <p>{{siteName}} Team</p>
        </div>
      </div>
    `,
    textContent: `
      Price Drop Alert! {{product.name}}
      
      Hi {{user.name}},
      
      Great news! The price has dropped on an item in your wishlist.
      
      Product: {{product.name}}
      {{#if product.comparePrice}}
      Was: {{product.comparePrice}} {{product.currency}}
      {{/if}}
      Now: {{product.price}} {{product.currency}}
      {{#if discount}}
      Discount: {{discount}}% OFF
      {{/if}}
      
      Buy now: {{product.url}}
      
      Hurry! Prices can change at any time.
      
      Don't want these alerts? Unsubscribe: {{unsubscribeUrl}}
      
      {{siteName}} Team
    `,
    isActive: true,
    variables: ['siteName', 'logoUrl', 'user.name', 'product.name', 'product.price', 'product.comparePrice', 'product.currency', 'product.image', 'product.url', 'discount', 'unsubscribeUrl'],
    isSystem: false,
    canEdit: true,
    description: 'Sent when a wishlist item price drops',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Placeholder templates for other types
  [EmailTemplateType.ORDER_DELIVERED]: {
    id: 'order_delivered',
    name: 'Order Delivered',
    type: EmailTemplateType.ORDER_DELIVERED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Your order #{{order.orderNumber}} has been delivered! ✅',
    htmlContent: '<div>Order delivered template</div>',
    textContent: 'Order delivered text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when order is delivered',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.ORDER_CANCELLED]: {
    id: 'order_cancelled',
    name: 'Order Cancelled',
    type: EmailTemplateType.ORDER_CANCELLED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Order #{{order.orderNumber}} has been cancelled',
    htmlContent: '<div>Order cancelled template</div>',
    textContent: 'Order cancelled text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when order is cancelled',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Add more placeholder templates for remaining types...
  [EmailTemplateType.ORDER_REFUNDED]: {
    id: 'order_refunded',
    name: 'Order Refunded',
    type: EmailTemplateType.ORDER_REFUNDED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Refund processed for order #{{order.orderNumber}}',
    htmlContent: '<div>Order refunded template</div>',
    textContent: 'Order refunded text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when order refund is processed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.ORDER_RETURN_APPROVED]: {
    id: 'order_return_approved',
    name: 'Return Approved',
    type: EmailTemplateType.ORDER_RETURN_APPROVED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Return approved for order #{{order.orderNumber}}',
    htmlContent: '<div>Return approved template</div>',
    textContent: 'Return approved text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when return is approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PAYMENT_SUCCESS]: {
    id: 'payment_success',
    name: 'Payment Success',
    type: EmailTemplateType.PAYMENT_SUCCESS,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Payment successful for order #{{order.orderNumber}}',
    htmlContent: '<div>Payment success template</div>',
    textContent: 'Payment success text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when payment is successful',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PAYMENT_FAILED]: {
    id: 'payment_failed',
    name: 'Payment Failed',
    type: EmailTemplateType.PAYMENT_FAILED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Payment failed for order #{{order.orderNumber}}',
    htmlContent: '<div>Payment failed template</div>',
    textContent: 'Payment failed text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when payment fails',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PAYMENT_REFUNDED]: {
    id: 'payment_refunded',
    name: 'Payment Refunded',
    type: EmailTemplateType.PAYMENT_REFUNDED,
    category: EmailTemplateCategory.TRANSACTIONAL,
    subject: 'Payment refunded for order #{{order.orderNumber}}',
    htmlContent: '<div>Payment refunded template</div>',
    textContent: 'Payment refunded text',
    isActive: true,
    variables: ['order.orderNumber'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when payment is refunded',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PAYOUT_PROCESSED]: {
    id: 'payout_processed',
    name: 'Payout Processed',
    type: EmailTemplateType.PAYOUT_PROCESSED,
    category: EmailTemplateCategory.VENDOR,
    subject: 'Your payout has been processed',
    htmlContent: '<div>Payout processed template</div>',
    textContent: 'Payout processed text',
    isActive: true,
    variables: ['vendor.ownerName'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor payout is processed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.EMAIL_VERIFICATION]: {
    id: 'email_verification',
    name: 'Email Verification',
    type: EmailTemplateType.EMAIL_VERIFICATION,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Verify your email address',
    htmlContent: '<div>Email verification template</div>',
    textContent: 'Email verification text',
    isActive: true,
    variables: ['user.name', 'verificationUrl'],
    isSystem: true,
    canEdit: false,
    description: 'Sent for email verification',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.ACCOUNT_ACTIVATED]: {
    id: 'account_activated',
    name: 'Account Activated',
    type: EmailTemplateType.ACCOUNT_ACTIVATED,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Your account has been activated',
    htmlContent: '<div>Account activated template</div>',
    textContent: 'Account activated text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when account is activated',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.ACCOUNT_SUSPENDED]: {
    id: 'account_suspended',
    name: 'Account Suspended',
    type: EmailTemplateType.ACCOUNT_SUSPENDED,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Your account has been suspended',
    htmlContent: '<div>Account suspended template</div>',
    textContent: 'Account suspended text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when account is suspended',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.TWO_FACTOR_ENABLED]: {
    id: 'two_factor_enabled',
    name: 'Two Factor Enabled',
    type: EmailTemplateType.TWO_FACTOR_ENABLED,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Two-factor authentication enabled',
    htmlContent: '<div>2FA enabled template</div>',
    textContent: '2FA enabled text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'Sent when 2FA is enabled',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_APPLICATION_REJECTED]: {
    id: 'vendor_rejected',
    name: 'Vendor Application Rejected',
    type: EmailTemplateType.VENDOR_APPLICATION_REJECTED,
    category: EmailTemplateCategory.VENDOR,
    subject: 'Vendor application update',
    htmlContent: '<div>Vendor rejected template</div>',
    textContent: 'Vendor rejected text',
    isActive: true,
    variables: ['vendor.ownerName'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor application is rejected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_PAYOUT_NOTIFICATION]: {
    id: 'vendor_payout_notification',
    name: 'Vendor Payout Notification',
    type: EmailTemplateType.VENDOR_PAYOUT_NOTIFICATION,
    category: EmailTemplateCategory.VENDOR,
    subject: 'Payout notification',
    htmlContent: '<div>Vendor payout notification template</div>',
    textContent: 'Vendor payout notification text',
    isActive: true,
    variables: ['vendor.ownerName'],
    isSystem: true,
    canEdit: true,
    description: 'Sent for vendor payout notifications',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_NEW_ORDER]: {
    id: 'vendor_new_order',
    name: 'Vendor New Order',
    type: EmailTemplateType.VENDOR_NEW_ORDER,
    category: EmailTemplateCategory.VENDOR,
    subject: 'New order received',
    htmlContent: '<div>Vendor new order template</div>',
    textContent: 'Vendor new order text',
    isActive: true,
    variables: ['vendor.ownerName', 'order.orderNumber'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor receives new order',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_PRODUCT_APPROVED]: {
    id: 'vendor_product_approved',
    name: 'Product Approved',
    type: EmailTemplateType.VENDOR_PRODUCT_APPROVED,
    category: EmailTemplateCategory.VENDOR,
    subject: 'Product approved',
    htmlContent: '<div>Product approved template</div>',
    textContent: 'Product approved text',
    isActive: true,
    variables: ['vendor.ownerName', 'product.name'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor product is approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.VENDOR_PRODUCT_REJECTED]: {
    id: 'vendor_product_rejected',
    name: 'Product Rejected',
    type: EmailTemplateType.VENDOR_PRODUCT_REJECTED,
    category: EmailTemplateCategory.VENDOR,
    subject: 'Product rejected',
    htmlContent: '<div>Product rejected template</div>',
    textContent: 'Product rejected text',
    isActive: true,
    variables: ['vendor.ownerName', 'product.name'],
    isSystem: true,
    canEdit: true,
    description: 'Sent when vendor product is rejected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.BACK_IN_STOCK]: {
    id: 'back_in_stock',
    name: 'Back in Stock',
    type: EmailTemplateType.BACK_IN_STOCK,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Back in stock: {{product.name}}',
    htmlContent: '<div>Back in stock template</div>',
    textContent: 'Back in stock text',
    isActive: true,
    variables: ['user.name', 'product.name'],
    isSystem: false,
    canEdit: true,
    description: 'Sent when product is back in stock',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.WISHLIST_SALE]: {
    id: 'wishlist_sale',
    name: 'Wishlist Sale',
    type: EmailTemplateType.WISHLIST_SALE,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Items in your wishlist are on sale!',
    htmlContent: '<div>Wishlist sale template</div>',
    textContent: 'Wishlist sale text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Sent when wishlist items go on sale',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.REVIEW_REMINDER]: {
    id: 'review_reminder',
    name: 'Review Reminder',
    type: EmailTemplateType.REVIEW_REMINDER,
    category: EmailTemplateCategory.CUSTOMER,
    subject: 'How was your recent purchase?',
    htmlContent: '<div>Review reminder template</div>',
    textContent: 'Review reminder text',
    isActive: true,
    variables: ['user.name', 'order.orderNumber'],
    isSystem: false,
    canEdit: true,
    description: 'Sent to remind customers to leave reviews',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.CART_ABANDONMENT]: {
    id: 'cart_abandonment',
    name: 'Cart Abandonment',
    type: EmailTemplateType.CART_ABANDONMENT,
    category: EmailTemplateCategory.MARKETING,
    subject: 'You left something in your cart',
    htmlContent: '<div>Cart abandonment template</div>',
    textContent: 'Cart abandonment text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Sent for abandoned cart recovery',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.NEWSLETTER]: {
    id: 'newsletter',
    name: 'Newsletter',
    type: EmailTemplateType.NEWSLETTER,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Newsletter',
    htmlContent: '<div>Newsletter template</div>',
    textContent: 'Newsletter text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Newsletter template',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PROMOTION]: {
    id: 'promotion',
    name: 'Promotion',
    type: EmailTemplateType.PROMOTION,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Special promotion just for you!',
    htmlContent: '<div>Promotion template</div>',
    textContent: 'Promotion text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Promotional email template',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.PRODUCT_RECOMMENDATION]: {
    id: 'product_recommendation',
    name: 'Product Recommendation',
    type: EmailTemplateType.PRODUCT_RECOMMENDATION,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Products you might like',
    htmlContent: '<div>Product recommendation template</div>',
    textContent: 'Product recommendation text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Product recommendation email',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.SEASONAL_SALE]: {
    id: 'seasonal_sale',
    name: 'Seasonal Sale',
    type: EmailTemplateType.SEASONAL_SALE,
    category: EmailTemplateCategory.MARKETING,
    subject: 'Seasonal sale - Limited time only!',
    htmlContent: '<div>Seasonal sale template</div>',
    textContent: 'Seasonal sale text',
    isActive: true,
    variables: ['user.name'],
    isSystem: false,
    canEdit: true,
    description: 'Seasonal sale promotion email',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.SECURITY_ALERT]: {
    id: 'security_alert',
    name: 'Security Alert',
    type: EmailTemplateType.SECURITY_ALERT,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Security alert for your account',
    htmlContent: '<div>Security alert template</div>',
    textContent: 'Security alert text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'Security alert notification',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.MAINTENANCE_NOTIFICATION]: {
    id: 'maintenance_notification',
    name: 'Maintenance Notification',
    type: EmailTemplateType.MAINTENANCE_NOTIFICATION,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Scheduled maintenance notification',
    htmlContent: '<div>Maintenance notification template</div>',
    textContent: 'Maintenance notification text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'Maintenance notification email',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.SYSTEM_UPDATE]: {
    id: 'system_update',
    name: 'System Update',
    type: EmailTemplateType.SYSTEM_UPDATE,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'System update notification',
    htmlContent: '<div>System update template</div>',
    textContent: 'System update text',
    isActive: true,
    variables: ['user.name'],
    isSystem: true,
    canEdit: false,
    description: 'System update notification',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.LOW_STOCK_ALERT]: {
    id: 'low_stock_alert',
    name: 'Low Stock Alert',
    type: EmailTemplateType.LOW_STOCK_ALERT,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Low stock alert',
    htmlContent: '<div>Low stock alert template</div>',
    textContent: 'Low stock alert text',
    isActive: true,
    variables: ['vendor.ownerName', 'product.name'],
    isSystem: true,
    canEdit: false,
    description: 'Low stock alert for vendors',
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  [EmailTemplateType.BACKUP_NOTIFICATION]: {
    id: 'backup_notification',
    name: 'Backup Notification',
    type: EmailTemplateType.BACKUP_NOTIFICATION,
    category: EmailTemplateCategory.SYSTEM,
    subject: 'Backup notification',
    htmlContent: '<div>Backup notification template</div>',
    textContent: 'Backup notification text',
    isActive: true,
    variables: [],
    isSystem: true,
    canEdit: false,
    description: 'System backup notification',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Email template service
export class EmailTemplateService {
  private templates: Map<string, EmailTemplateDefinition> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates(): void {
    Object.values(DEFAULT_EMAIL_TEMPLATES).forEach(template => {
      this.templates.set(template.type, template);
    });
  }

  // Get template by type
  getTemplate(type: EmailTemplateType): EmailTemplateDefinition | undefined {
    return this.templates.get(type);
  }

  // Get all templates
  getAllTemplates(): EmailTemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  // Get templates by category
  getTemplatesByCategory(category: EmailTemplateCategory): EmailTemplateDefinition[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  // Add or update template
  setTemplate(template: EmailTemplateDefinition): void {
    this.templates.set(template.type, { ...template, updatedAt: new Date() });
  }

  // Remove template
  removeTemplate(type: EmailTemplateType): boolean {
    return this.templates.delete(type);
  }

  // Render template with variables
  renderTemplate(type: EmailTemplateType, variables: EmailVariables): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } | null {
    const template = this.getTemplate(type);
    if (!template || !template.isActive) {
      return null;
    }

    return {
      subject: this.interpolateTemplate(template.subject, variables),
      htmlContent: this.interpolateTemplate(template.htmlContent, variables),
      textContent: this.interpolateTemplate(template.textContent, variables),
    };
  }

  // Interpolate template variables
  private interpolateTemplate(template: string, variables: EmailVariables): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(variables, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  // Get nested object value by path
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      // Handle array notation like order.items[0].name
      if (key.includes('[') && key.includes(']')) {
        const [arrayKey, indexStr] = key.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        return current?.[arrayKey]?.[index];
      }
      return current?.[key];
    }, obj);
  }

  // Validate template
  validateTemplate(template: Partial<EmailTemplateDefinition>): string[] {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!template.subject?.trim()) {
      errors.push('Template subject is required');
    }

    if (!template.htmlContent?.trim()) {
      errors.push('Template HTML content is required');
    }

    if (!template.textContent?.trim()) {
      errors.push('Template text content is required');
    }

    // Validate template variables
    const variables = template.variables || [];
    const htmlVariables = this.extractVariables(template.htmlContent || '');
    const textVariables = this.extractVariables(template.textContent || '');
    const subjectVariables = this.extractVariables(template.subject || '');

    const allUsedVariables = [...new Set([...htmlVariables, ...textVariables, ...subjectVariables])];
    const missingVariables = allUsedVariables.filter(v => !variables.includes(v));

    if (missingVariables.length > 0) {
      errors.push(`Missing variables in template definition: ${missingVariables.join(', ')}`);
    }

    return errors;
  }

  // Extract variables from template content
  private extractVariables(content: string): string[] {
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim());
  }

  // Preview template with sample data
  previewTemplate(type: EmailTemplateType, sampleData?: Partial<EmailVariables>): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } | null {
    const template = this.getTemplate(type);
    if (!template) return null;

    const defaultSampleData: EmailVariables = {
      siteName: 'OnCart',
      siteUrl: 'https://oncart.com',
      supportEmail: 'support@oncart.com',
      logoUrl: 'https://oncart.com/logo.png',
      user: {
        id: 'user_123',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        displayName: 'John D.',
      },
      order: {
        id: 'order_123',
        orderNumber: 'ORD-2025-001',
        status: 'confirmed',
        total: 99.99,
        currency: 'USD',
        items: [
          {
            name: 'Sample Product',
            quantity: 2,
            price: 49.99,
            image: 'https://example.com/product.jpg',
          },
        ],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
        trackingNumber: 'TRK123456789',
        trackingUrl: 'https://tracking.example.com/TRK123456789',
        estimatedDelivery: 'Dec 25, 2025',
      },
      product: {
        id: 'product_123',
        name: 'Sample Product',
        price: 49.99,
        comparePrice: 59.99,
        currency: 'USD',
        image: 'https://example.com/product.jpg',
        url: 'https://oncart.com/product/sample-product',
      },
      vendor: {
        id: 'vendor_123',
        storeName: 'Sample Store',
        ownerName: 'Jane Smith',
        email: 'jane@samplestore.com',
        storeUrl: 'https://oncart.com/store/sample-store',
        logo: 'https://example.com/store-logo.jpg',
      },
      resetUrl: 'https://oncart.com/reset-password?token=abc123',
      verificationUrl: 'https://oncart.com/verify-email?token=abc123',
      unsubscribeUrl: 'https://oncart.com/unsubscribe?token=abc123',
      timestamp: new Date().toLocaleString(),
      location: 'New York, NY',
      device: 'Chrome on Windows',
      discount: 20,
      ...sampleData,
    };

    return this.renderTemplate(type, defaultSampleData);
  }
}