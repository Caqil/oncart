// src/lib/auth.ts - Fixed without circular references
import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { 
  AppUser, 
  UserRole, 
  UserStatus,
  AuthProvider,
  LoginCredentials,
  RegisterCredentials
} from '@/types/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: {
            profile: true,
            roles: {
              include: {
                permissions: true
              }
            }
          }
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED) {
          throw new Error('Account is suspended or banned');
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return transformPrismaUserToNextAuthUser(user);
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider !== 'credentials') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! }
        });

        if (existingUser) {
          // Link account if user exists
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account!.type,
              provider: account!.provider,
              providerAccountId: account!.providerAccountId,
              access_token: account!.access_token,
              refresh_token: account!.refresh_token,
              expires_at: account!.expires_at,
              token_type: account!.token_type,
              scope: account!.scope,
              id_token: account!.id_token,
            }
          });
          
          return true;
        } else {
          // Create new user for OAuth
          const newUser = await createOAuthUser(user, account!.provider);
          user.id = newUser.id;
          return true;
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        // First time JWT is created
        token.sub = user.id;
        token.email = user.email!;
        token.role = user.role;
        token.status = user.status;
        token.permissions = await getUserPermissions(user.id);
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token.sub) {
        // Fetch fresh user data
        const user = await db.user.findUnique({
          where: { id: token.sub },
          include: {
            profile: true,
            roles: {
              include: {
                permissions: true
              }
            }
          }
        });

        if (user) {
          session.user = transformPrismaUserToNextAuthUser(user);
        }
      }
      
      return session;
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      // Log sign in event
      await logUserActivity(user.id, 'SIGN_IN', {
        provider: account?.provider,
        ip: undefined, // Will be added by middleware
      });
    },
    
    async signOut({ session, token }) {
      if (token?.sub) {
        await logUserActivity(token.sub, 'SIGN_OUT', {});
      }
    }
  }
};

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(credentials: RegisterCredentials): Promise<AppUser> {
  const existingUser = await db.user.findUnique({
    where: { email: credentials.email }
  });

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const hashedPassword = await hashPassword(credentials.password);

  const user = await db.user.create({
    data: {
      email: credentials.email,
      name: credentials.name,
      password: hashedPassword,
      phone: credentials.phone,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      provider: AuthProvider.CREDENTIALS,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      twoFactorEnabled: false,
      profile: {
        create: {
          firstName: credentials.name.split(' ')[0],
          lastName: credentials.name.split(' ')[1] || '',
        }
      }
    },
    include: {
      profile: true,
      roles: {
        include: {
          permissions: true
        }
      }
    }
  });

  // Send welcome email if requested
  if (credentials.newsletter) {
    // Add to newsletter logic here
  }

  return transformPrismaUserToAppUser(user);
}

export async function createOAuthUser(user: NextAuthUser, provider: string): Promise<NextAuthUser> {
  const newUser = await db.user.create({
    data: {
      email: user.email!,
      name: user.name || '',
      image: user.image,
      emailVerified: new Date(),
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      provider: provider.toUpperCase() as AuthProvider,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      twoFactorEnabled: false,
      profile: {
        create: {
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ')[1] || '',
        }
      }
    },
    include: {
      profile: true,
      roles: {
        include: {
          permissions: true
        }
      }
    }
  });

  return transformPrismaUserToNextAuthUser(newUser);
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!user) return [];

  // Super admin has all permissions
  if (user.role === UserRole.SUPER_ADMIN) {
    return ['*']; // Wildcard permission
  }

  const permissions = user.roles.flatMap(role => 
    role.permissions.map(permission => permission.name as string)
  );

  return [...new Set(permissions)] as string[];
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  
  // Check for wildcard permission (super admin)
  if (permissions.includes('*')) return true;
  
  // Check for specific permission
  return permissions.includes(permission);
}

export async function hasRole(userId: string, role: UserRole | UserRole[]): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { role }
  });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { status }
  });
}

export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    }
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) return false;

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null
    }
  });

  return true;
}

export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) return null;

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires
    }
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await db.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) return false;

  const hashedPassword = await hashPassword(newPassword);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  return true;
}

export async function logUserActivity(
  userId: string, 
  action: string, 
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await db.userActivity.create({
      data: {
        userId,
        action,
        resource: 'AUTH',
        metadata,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
      }
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

export async function getUserSessions(userId: string) {
  return db.session.findMany({
    where: { userId },
    orderBy: { expires: 'desc' }
  });
}

export async function revokeUserSession(sessionToken: string): Promise<void> {
  await db.session.delete({
    where: { sessionToken }
  });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({
    where: { userId }
  });
}

// Two-Factor Authentication
export async function generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
  const speakeasy = require('speakeasy');
  const QRCode = require('qrcode');

  const secret = speakeasy.generateSecret({
    name: `ECommerce:${userId}`,
    issuer: 'Multi-Vendor ECommerce',
    length: 32
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  // Store secret temporarily (not enabled until verified)
  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret.base32 }
  });

  return {
    secret: secret.base32,
    qrCode
  };
}

export async function verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
  const speakeasy = require('speakeasy');

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true }
  });

  if (!user?.twoFactorSecret) return false;

  return speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });
}

export async function enableTwoFactor(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true }
  });
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { 
      twoFactorEnabled: false,
      twoFactorSecret: null
    }
  });
}

// Helper to transform Prisma user to NextAuth User type
function transformPrismaUserToNextAuthUser(prismaUser: any): NextAuthUser {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    emailVerified: prismaUser.emailVerified,
    name: prismaUser.name,
    image: prismaUser.image,
    role: prismaUser.role,
    status: prismaUser.status,
    provider: prismaUser.provider,
    phone: prismaUser.phone,
    preferredLanguage: prismaUser.preferredLanguage,
    preferredCurrency: prismaUser.preferredCurrency,
    twoFactorEnabled: prismaUser.twoFactorEnabled,
  };
}

// Helper to transform Prisma user to our AppUser type
function transformPrismaUserToAppUser(prismaUser: any): AppUser {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    emailVerified: prismaUser.emailVerified,
    name: prismaUser.name,
    image: prismaUser.image,
    role: prismaUser.role,
    status: prismaUser.status,
    provider: prismaUser.provider,
    phone: prismaUser.phone,
    dateOfBirth: prismaUser.dateOfBirth,
    gender: prismaUser.gender,
    preferredLanguage: prismaUser.preferredLanguage,
    preferredCurrency: prismaUser.preferredCurrency,
    timezone: prismaUser.timezone,
    lastLoginAt: prismaUser.lastLoginAt,
    twoFactorEnabled: prismaUser.twoFactorEnabled,
    twoFactorSecret: prismaUser.twoFactorSecret,
    passwordResetToken: prismaUser.passwordResetToken,
    passwordResetExpires: prismaUser.passwordResetExpires,
    emailVerificationToken: prismaUser.emailVerificationToken,
    emailVerificationExpires: prismaUser.emailVerificationExpires,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  };
}