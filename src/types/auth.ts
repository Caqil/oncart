import { NotificationPreferences, UserPreferences } from "./user";

// src/types/auth.ts - Fixed circular reference
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  BANNED = 'BANNED',
}

export enum AuthProvider {
  CREDENTIALS = 'CREDENTIALS',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  GITHUB = 'GITHUB',
  APPLE = 'APPLE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

// Main User interface for our application
export interface AppUser {
  id: string;
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  providerId?: string | null;
  password?: string | null;
  phone?: string | null;
  preferences?: UserPreferences | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  preferredLanguage: string;
  preferredCurrency: string;
  timezone?: string | null;
  lastLoginAt?: Date | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// NextAuth specific user type
export interface NextAuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  status: UserStatus;
  provider: AuthProvider;
  emailVerified?: Date | null;
  phone?: string | null;
  preferredLanguage: string;
  preferredCurrency: string;
  twoFactorEnabled: boolean;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: AppUser;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user: AppUser;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  token: string;
  code: string;
}

export interface AuthResponse {
  user: AppUser;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider: AuthProvider;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  users: AppUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  role: UserRole | null;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AppUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<AppUser> }
  | { type: 'SET_LOADING'; payload: boolean };

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat: number;
  exp: number;
}