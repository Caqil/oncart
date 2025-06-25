import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { EmailSettings, EmailTemplate } from '@/types/settings';

// Email provider types
export type EmailProvider = 'smtp' | 'sendgrid' | 'mailgun' | 'resend' | 'ses';

export interface EmailConfig {
  provider: EmailProvider;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  
  // SMTP Configuration
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  
  // Provider API Keys
  apiKey?: string;
  
  // SendGrid specific
  sendgridApiKey?: string;
  
  // Mailgun specific
  mailgunApiKey?: string;
  mailgunDomain?: string;
  
  // AWS SES specific
  sesAccessKeyId?: string;
  sesSecretAccessKey?: string;
  sesRegion?: string;
}

// Email template data types
export interface WelcomeEmailData {
  user: {
    name: string;
    email: string;
  };
  verificationUrl?: string;
  loginUrl: string;
}

export interface OrderConfirmationData {
  order: {
    orderNumber: string;
    total: number;
    currency: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  customer: {
    name: string;
    email: string;
  };
  trackingUrl?: string;
}

export interface VendorApprovalData {
  vendor: {
    storeName: string;
    ownerName: string;
    email: string;
  };
  status: 'approved' | 'rejected';
  reason?: string;
  dashboardUrl: string;
}

export interface PasswordResetData {
  user: {
    name: string;
    email: string;
  };
  resetUrl: string;
  expiresIn: string;
}

export interface PayoutNotificationData {
  vendor: {
    storeName: string;
    ownerName: string;
    email: string;
  };
  payout: {
    amount: number;
    currency: string;
    method: string;
    date: Date;
  };
}

// Email service class
export class EmailService {
  private config: EmailConfig;
  private transporter?: nodemailer.Transporter;
  private resend?: Resend;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initialize();
  }

  private async initialize() {
    switch (this.config.provider) {
      case 'smtp':
        if (this.config.smtp) {
          this.transporter = nodemailer.createTransporter({
            host: this.config.smtp.host,
            port: this.config.smtp.port,
            secure: this.config.smtp.secure,
            auth: this.config.smtp.auth,
          });
        }
        break;
        
      case 'resend':
        if (this.config.apiKey) {
          this.resend = new Resend(this.config.apiKey);
        }
        break;
        
      case 'sendgrid':
        // Initialize SendGrid
        break;
        
      case 'mailgun':
        // Initialize Mailgun
        break;
        
      case 'ses':
        // Initialize AWS SES
        break;
    }
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>
  ): Promise<boolean> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      switch (this.config.provider) {
        case 'smtp':
          return await this.sendWithSMTP(recipients, subject, html, text, attachments);
          
        case 'resend':
          return await this.sendWithResend(recipients, subject, html, text, attachments);
          
        case 'sendgrid':
          return await this.sendWithSendGrid(recipients, subject, html, text, attachments);
          
        case 'mailgun':
          return await this.sendWithMailgun(recipients, subject, html, text, attachments);
          
        case 'ses':
          return await this.sendWithSES(recipients, subject, html, text, attachments);
          
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendWithSMTP(
    to: string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized');
    }

    await this.transporter.sendMail({
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to: to.join(', '),
      replyTo: this.config.replyToEmail,
      subject,
      html,
      text,
      attachments,
    });

    return true;
  }

  private async sendWithResend(
    to: string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    if (!this.resend) {
      throw new Error('Resend not initialized');
    }

    await this.resend.emails.send({
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to,
      subject,
      html,
      text,
      attachments,
    });

    return true;
  }

  private async sendWithSendGrid(
    to: string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    // SendGrid implementation
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.config.sendgridApiKey);

    const msg = {
      to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject,
      html,
      text,
      attachments,
    };

    await sgMail.send(msg);
    return true;
  }

  private async sendWithMailgun(
    to: string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    // Mailgun implementation
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: this.config.mailgunApiKey,
    });

    await mg.messages.create(this.config.mailgunDomain, {
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to: to.join(', '),
      subject,
      html,
      text,
      attachment: attachments,
    });

    return true;
  }

  private async sendWithSES(
    to: string[],
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    // AWS SES implementation
    const AWS = require('aws-sdk');
    
    const ses = new AWS.SES({
      accessKeyId: this.config.sesAccessKeyId,
      secretAccessKey: this.config.sesSecretAccessKey,
      region: this.config.sesRegion,
    });

    const params = {
      Source: `${this.config.fromName} <${this.config.fromEmail}>`,
      Destination: { ToAddresses: to },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
          Text: { Data: text || '' },
        },
      },
    };

    await ses.sendEmail(params).promise();
    return true;
  }

  async testConnection(): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'smtp':
          if (this.transporter) {
            await this.transporter.verify();
          }
          break;
          
        case 'resend':
          // Test Resend connection
          await this.sendEmail(
            this.config.fromEmail,
            'Test Connection',
            '<p>Test email</p>',
            'Test email'
          );
          break;
          
        default:
          // Other providers test implementations
          break;
      }
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Email template engine
export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  loadTemplate(name: string, template: EmailTemplate) {
    this.templates.set(name, template);
  }

  loadTemplates(templates: Record<string, EmailTemplate>) {
    Object.entries(templates).forEach(([name, template]) => {
      this.loadTemplate(name, template);
    });
  }

  render(templateName: string, data: Record<string, any>): { subject: string; html: string; text: string } {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    return {
      subject: this.interpolate(template.subject, data),
      html: this.interpolate(template.htmlContent, data),
      text: this.interpolate(template.textContent, data),
    };
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Email templates
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to {{siteName}}!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to {{siteName}}, {{user.name}}!</h1>
        <p>We're excited to have you on board. Your account has been created successfully.</p>
        {{#if verificationUrl}}
        <p>Please verify your email address by clicking the button below:</p>
        <a href="{{verificationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        {{/if}}
        <p>Get started by exploring our platform:</p>
        <a href="{{loginUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The {{siteName}} Team</p>
      </div>
    `,
    textContent: `
      Welcome to {{siteName}}, {{user.name}}!
      
      We're excited to have you on board. Your account has been created successfully.
      
      {{#if verificationUrl}}
      Please verify your email address: {{verificationUrl}}
      {{/if}}
      
      Get started: {{loginUrl}}
      
      Best regards,
      The {{siteName}} Team
    `,
    isActive: true,
    variables: ['siteName', 'user.name', 'verificationUrl', 'loginUrl'],
  },

  orderConfirmation: {
    subject: 'Order Confirmation #{{order.orderNumber}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Order Confirmation</h1>
        <p>Hi {{customer.name}},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Order #{{order.orderNumber}}</h2>
          <p><strong>Total: {{order.total}} {{order.currency}}</strong></p>
          
          <h3>Items Ordered:</h3>
          {{#each order.items}}
          <div style="border-bottom: 1px solid #dee2e6; padding: 10px 0;">
            <p>{{name}} x {{quantity}} - {{price}} {{../order.currency}}</p>
          </div>
          {{/each}}
        </div>
        
        {{#if trackingUrl}}
        <p>Track your order: <a href="{{trackingUrl}}">{{trackingUrl}}</a></p>
        {{/if}}
        
        <p>We'll send you another email when your order ships.</p>
        
        <p>Thank you for shopping with us!</p>
      </div>
    `,
    textContent: `
      Order Confirmation #{{order.orderNumber}}
      
      Hi {{customer.name}},
      
      Thank you for your order! Here are the details:
      
      Order #{{order.orderNumber}}
      Total: {{order.total}} {{order.currency}}
      
      Items Ordered:
      {{#each order.items}}
      {{name}} x {{quantity}} - {{price}} {{../order.currency}}
      {{/each}}
      
      {{#if trackingUrl}}
      Track your order: {{trackingUrl}}
      {{/if}}
      
      Thank you for shopping with us!
    `,
    isActive: true,
    variables: ['customer.name', 'order.orderNumber', 'order.total', 'order.currency', 'order.items', 'trackingUrl'],
  },

  vendorApproval: {
    subject: 'Vendor Application {{status}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Vendor Application Update</h1>
        <p>Hi {{vendor.ownerName}},</p>
        
        {{#if (eq status 'approved')}}
        <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>🎉 Congratulations! Your vendor application has been approved!</h2>
          <p>Your store "{{vendor.storeName}}" is now live on our platform.</p>
        </div>
        
        <p>You can now:</p>
        <ul>
          <li>Add products to your store</li>
          <li>Manage orders</li>
          <li>View analytics and earnings</li>
        </ul>
        
        <a href="{{dashboardUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Vendor Dashboard</a>
        {{else}}
        <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Application Status: {{status}}</h2>
          {{#if reason}}
          <p><strong>Reason:</strong> {{reason}}</p>
          {{/if}}
        </div>
        
        <p>You can reapply or contact our support team for more information.</p>
        {{/if}}
        
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    textContent: `
      Vendor Application Update
      
      Hi {{vendor.ownerName}},
      
      {{#if (eq status 'approved')}}
      Congratulations! Your vendor application has been approved!
      Your store "{{vendor.storeName}}" is now live on our platform.
      
      Go to Vendor Dashboard: {{dashboardUrl}}
      {{else}}
      Application Status: {{status}}
      {{#if reason}}
      Reason: {{reason}}
      {{/if}}
      {{/if}}
      
      Best regards,
      The Team
    `,
    isActive: true,
    variables: ['vendor.ownerName', 'vendor.storeName', 'status', 'reason', 'dashboardUrl'],
  },

  passwordReset: {
    subject: 'Reset Your Password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>Hi {{user.name}},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <a href="{{resetUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        
        <p>This link will expire in {{expiresIn}}.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    textContent: `
      Password Reset Request
      
      Hi {{user.name}},
      
      We received a request to reset your password.
      
      Reset your password: {{resetUrl}}
      
      This link will expire in {{expiresIn}}.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      The Team
    `,
    isActive: true,
    variables: ['user.name', 'resetUrl', 'expiresIn'],
  },

  payoutNotification: {
    subject: 'Payout Processed - {{payout.amount}} {{payout.currency}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payout Processed</h1>
        <p>Hi {{vendor.ownerName}},</p>
        <p>Your payout has been processed successfully!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Payout Details</h2>
          <p><strong>Amount:</strong> {{payout.amount}} {{payout.currency}}</p>
          <p><strong>Method:</strong> {{payout.method}}</p>
          <p><strong>Date:</strong> {{payout.date}}</p>
          <p><strong>Store:</strong> {{vendor.storeName}}</p>
        </div>
        
        <p>The funds should appear in your account within 1-3 business days depending on your payout method.</p>
        
        <p>Best regards,<br>The Team</p>
      </div>
    `,
    textContent: `
      Payout Processed
      
      Hi {{vendor.ownerName}},
      
      Your payout has been processed successfully!
      
      Payout Details:
      Amount: {{payout.amount}} {{payout.currency}}
      Method: {{payout.method}}
      Date: {{payout.date}}
      Store: {{vendor.storeName}}
      
      The funds should appear in your account within 1-3 business days.
      
      Best regards,
      The Team
    `,
    isActive: true,
    variables: ['vendor.ownerName', 'vendor.storeName', 'payout.amount', 'payout.currency', 'payout.method', 'payout.date'],
  },
};

// Email service factory
export function createEmailService(config: EmailConfig): EmailService {
  return new EmailService(config);
}

// Email template engine factory
export function createTemplateEngine(): EmailTemplateEngine {
  const engine = new EmailTemplateEngine();
  engine.loadTemplates(EMAIL_TEMPLATES);
  return engine;
}

// Helper functions for common email operations
export async function sendWelcomeEmail(
  emailService: EmailService,
  templateEngine: EmailTemplateEngine,
  data: WelcomeEmailData
): Promise<boolean> {
  const { subject, html, text } = templateEngine.render('welcome', data);
  return emailService.sendEmail(data.user.email, subject, html, text);
}

export async function sendOrderConfirmationEmail(
  emailService: EmailService,
  templateEngine: EmailTemplateEngine,
  data: OrderConfirmationData
): Promise<boolean> {
  const { subject, html, text } = templateEngine.render('orderConfirmation', data);
  return emailService.sendEmail(data.customer.email, subject, html, text);
}

export async function sendVendorApprovalEmail(
  emailService: EmailService,
  templateEngine: EmailTemplateEngine,
  data: VendorApprovalData
): Promise<boolean> {
  const { subject, html, text } = templateEngine.render('vendorApproval', data);
  return emailService.sendEmail(data.vendor.email, subject, html, text);
}

export async function sendPasswordResetEmail(
  emailService: EmailService,
  templateEngine: EmailTemplateEngine,
  data: PasswordResetData
): Promise<boolean> {
  const { subject, html, text } = templateEngine.render('passwordReset', data);
  return emailService.sendEmail(data.user.email, subject, html, text);
}

export async function sendPayoutNotificationEmail(
  emailService: EmailService,
  templateEngine: EmailTemplateEngine,
  data: PayoutNotificationData
): Promise<boolean> {
  const { subject, html, text } = templateEngine.render('payoutNotification', data);
  return emailService.sendEmail(data.vendor.email, subject, html, text);
}

// Default email service instance
let defaultEmailService: EmailService | null = null;
let defaultTemplateEngine: EmailTemplateEngine | null = null;

export function initializeEmailService(config: EmailConfig) {
  defaultEmailService = createEmailService(config);
  defaultTemplateEngine = createTemplateEngine();
}

export function getEmailService(): EmailService {
  if (!defaultEmailService) {
    throw new Error('Email service not initialized. Call initializeEmailService() first.');
  }
  return defaultEmailService;
}

export function getTemplateEngine(): EmailTemplateEngine {
  if (!defaultTemplateEngine) {
    throw new Error('Template engine not initialized. Call initializeEmailService() first.');
  }
  return defaultTemplateEngine;
}