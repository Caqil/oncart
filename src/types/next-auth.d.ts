// src/types/next-auth.d.ts
import { UserRole, UserStatus, AuthProvider } from '@/types/auth';

declare module 'next-auth' {
  interface User {
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
    permissions: string[];
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    permissions: string[];
  }
}
