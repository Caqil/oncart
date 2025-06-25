import { UserRole, UserStatus, Gender, AuthProvider } from './auth';

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  bio?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  website?: string | null;
  socialLinks?: SocialLinks | null;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  marketing: MarketingPreferences;
}

export interface NotificationPreferences {
  email: EmailNotifications;
  push: PushNotifications;
  sms: SMSNotifications;
}

export interface EmailNotifications {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  securityAlerts: boolean;
  productRecommendations: boolean;
  priceDropAlerts: boolean;
  backInStock: boolean;
  reviewReminders: boolean;
}

export interface PushNotifications {
  orderUpdates: boolean;
  promotions: boolean;
  securityAlerts: boolean;
  priceDropAlerts: boolean;
  backInStock: boolean;
}

export interface SMSNotifications {
  orderUpdates: boolean;
  securityAlerts: boolean;
  deliveryUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  allowMessageFromStrangers: boolean;
  shareDataForRecommendations: boolean;
  trackingConsent: boolean;
}

export interface MarketingPreferences {
  emailMarketing: boolean;
  smsMarketing: boolean;
  personalizedAds: boolean;
  thirdPartySharing: boolean;
}

export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
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
  instructions?: string | null;
  coordinates?: Coordinates | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  OTHER = 'OTHER',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  location?: string | null;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string | null;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  totalSaved: number;
  favoriteCategories: string[];
  loyaltyPoints: number;
  memberSince: Date;
  lastOrderDate?: Date | null;
  averageOrderValue: number;
  reviewsCount: number;
  averageRating: number;
}

export interface RecentlyViewed {
  id: string;
  userId: string;
  productId: string;
  viewedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    comparePrice?: number | null;
  };
}

export interface UserFollowing {
  id: string;
  followerId: string;
  followingId: string;
  followingType: 'USER' | 'VENDOR' | 'BRAND';
  createdAt: Date;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export enum NotificationType {
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PRICE_DROP = 'PRICE_DROP',
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  PROMOTION = 'PROMOTION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  NEWSLETTER = 'NEWSLETTER',
  SYSTEM = 'SYSTEM',
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  status?: UserStatus;
  provider?: AuthProvider;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  socialLinks?: Partial<SocialLinks>;
}

export interface CreateAddressRequest {
  type: AddressType;
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  instructions?: string;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

export interface UserListFilters {
  role?: UserRole;
  status?: UserStatus;
  provider?: AuthProvider;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  usersByCountry: Record<string, number>;
  userGrowth: Array<{
    date: string;
    total: number;
    new: number;
  }>;
}