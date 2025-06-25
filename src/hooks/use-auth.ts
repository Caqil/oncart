import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  AppUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserRole,
  UserStatus
} from '@/types/auth';
import { API_ROUTES } from '@/lib/constants';
import { User } from 'next-auth';

interface UseAuthReturn {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  role: UserRole | null;
  status: UserStatus | null;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<boolean>;
  resetPassword: (request: ResetPasswordRequest) => Promise<boolean>;
  changePassword: (request: ChangePasswordRequest) => Promise<boolean>;
  updateProfile: (data: Partial<AppUser>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    permissions: [],
    role: null,
    error: null,
  });
  useEffect(() => {
  const convertSessionUserToAppUser = (sessionUser: User | undefined): AppUser | null => {
    if (!sessionUser) return null;
    
    return {
      ...sessionUser,
      createdAt: new Date(), // These would come from your backend
      updatedAt: new Date(),
      dateOfBirth: null,
      gender: null,
      timezone: null,
      lastLoginAt: null,
      twoFactorSecret: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      password: null,
    } as AppUser;
  };

  const convertedUser = convertSessionUserToAppUser(session?.user);
  
  setAuthState(prev => ({
    ...prev,
    user: convertedUser,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    role: session?.user?.role || null,
    permissions: session?.user?.permissions || [],
  }));
}, [session, status]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthState(prev => ({ ...prev, error: result.error!, isLoading: false }));
        toast.error(result.error);
        return false;
      }

      toast.success('Successfully logged in');
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`${API_ROUTES.AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful. Please verify your email.');
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        permissions: [],
        role: null,
        error: null,
      });
      toast.success('Successfully logged out');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  }, []);

  const forgotPassword = useCallback(async (request: ForgotPasswordRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ROUTES.AUTH}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      toast.success('Password reset email sent');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (request: ResetPasswordRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ROUTES.AUTH}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      toast.success('Password reset successful');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Password reset failed');
      return false;
    }
  }, []);

  const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ROUTES.AUTH}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      toast.success('Password changed successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Password change failed');
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<AppUser>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ROUTES.USERS}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Profile update failed');
      }

      await update();
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
      return false;
    }
  }, [update]);

  const refreshUser = useCallback(async (): Promise<void> => {
    await update();
  }, [update]);

  const hasPermission = useCallback((permission: string): boolean => {
    return authState.permissions.includes(permission);
  }, [authState.permissions]);

  const hasRole = useCallback((role: UserRole): boolean => {
    return authState.role === role;
  }, [authState.role]);

  const canAccess = useCallback((resource: string, action: string): boolean => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission) || authState.role === UserRole.SUPER_ADMIN;
  }, [hasPermission, authState.role]);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    role: authState.role,
    status: authState.user?.status || null,
    permissions: authState.permissions,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    refreshUser,
    hasPermission,
    hasRole,
    canAccess,
  };
}