import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AuthState, 
  AuthAction, 
  UserRole, 
  UserStatus,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordRequest,
  TwoFactorVerification,
  UserPermissions,
  AppUser
} from '@/types/auth';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<AppUser>) => void;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
  enableTwoFactor: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  verifyTwoFactor: (data: TwoFactorVerification) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
  
  // Utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  getUserPermissions: () => UserPermissions;
  isEmailVerified: () => boolean;
  canAccessAdmin: () => boolean;
  canAccessVendor: () => boolean;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Session management
  checkSession: () => Promise<void>;
  extendSession: () => Promise<void>;
  getSessionInfo: () => {
    isActive: boolean;
    expiresAt: Date | null;
    lastActivity: Date | null;
  };
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  permissions: [],
  role: null,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Authentication actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null } as Partial<AuthState>);
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }
          
          const { user, permissions } = await response.json();
          
          set({
            user,
            isAuthenticated: true,
            permissions,
            role: user.role,
            isLoading: false,
            error: null,
          } as Partial<AuthState>);
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          } as Partial<AuthState>);
          throw error;
        }
      },
      
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null } as Partial<AuthState>);
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }
          
          const { user, permissions } = await response.json();
          
          set({
            user,
            isAuthenticated: true,
            permissions,
            role: user.role,
            isLoading: false,
            error: null,
          } as Partial<AuthState>);
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          } as Partial<AuthState>);
          throw error;
        }
      },
      
      logout: () => {
        // Clear auth state
        set(initialState);
        
        // Call logout API
        fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
        
        // Clear other stores that depend on auth
        // Note: This will be handled by the stores themselves via subscriptions
      },
      
      refreshToken: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          
          if (!response.ok) {
            throw new Error('Token refresh failed');
          }
          
          const { user, permissions } = await response.json();
          
          set({
            user,
            isAuthenticated: true,
            permissions,
            role: user.role,
          } as Partial<AuthState>);
          
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },
      
      updateUser: (userData: Partial<AppUser>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser } as Partial<AuthState>);
      },
      
      changePassword: async (passwordData: ChangePasswordRequest) => {
        set({ isLoading: true, error: null } as Partial<AuthState>);
        
        try {
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Password change failed');
          }
          
          set({ isLoading: false, error: null } as Partial<AuthState>);
          
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Password change failed' 
          } as Partial<AuthState>);
          throw error;
        }
      },
      
      enableTwoFactor: async () => {
        const response = await fetch('/api/auth/2fa/enable', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to enable 2FA');
        }
        
        return response.json();
      },
      
      verifyTwoFactor: async (data: TwoFactorVerification) => {
        const response = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('2FA verification failed');
        }
        
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, twoFactorEnabled: true } 
          } as Partial<AuthState>);
        }
      },
      
      disableTwoFactor: async (code: string) => {
        const response = await fetch('/api/auth/2fa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to disable 2FA');
        }
        
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, twoFactorEnabled: false } 
          } as Partial<AuthState>);
        }
      },
      
      // Utility functions
      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },
      
      hasRole: (role: UserRole | UserRole[]) => {
        const currentRole = get().role;
        if (!currentRole) return false;
        
        if (Array.isArray(role)) {
          return role.includes(currentRole);
        }
        
        return currentRole === role;
      },
      
      getUserPermissions: (): UserPermissions => {
        const { permissions, role } = get();
        
        return {
          canRead: permissions.includes('read') || role === UserRole.SUPER_ADMIN,
          canWrite: permissions.includes('write') || role === UserRole.SUPER_ADMIN,
          canUpdate: permissions.includes('update') || role === UserRole.SUPER_ADMIN,
          canDelete: permissions.includes('delete') || role === UserRole.SUPER_ADMIN,
          canManage: permissions.includes('manage') || role === UserRole.SUPER_ADMIN,
        };
      },
      
      isEmailVerified: () => {
        const user = get().user;
        return user ? !!user.emailVerified : false;
      },
      
      canAccessAdmin: () => {
        const { role } = get();
        return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
      },
      
      canAccessVendor: () => {
        const { role } = get();
        return role === UserRole.VENDOR || get().canAccessAdmin();
      },
      
      // Loading and error management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading } as Partial<AuthState>);
      },
      
      setError: (error: string | null) => {
        set({ error } as Partial<AuthState>);
      },
      
      clearError: () => {
        set({ error: null } as Partial<AuthState>);
      },
      
      // Session management
      checkSession: async () => {
        try {
          const response = await fetch('/api/auth/session', {
            credentials: 'include',
          });
          
          if (response.ok) {
            const { user, permissions } = await response.json();
            set({
              user,
              isAuthenticated: true,
              permissions,
              role: user.role,
            } as Partial<AuthState>);
          } else {
            // Session invalid, clear auth state
            set(initialState);
          }
        } catch (error) {
          console.error('Session check failed:', error);
          set(initialState);
        }
      },
      
      extendSession: async () => {
        try {
          await fetch('/api/auth/extend-session', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Failed to extend session:', error);
        }
      },
      
      getSessionInfo: () => {
        const user = get().user;
        const isAuthenticated = get().isAuthenticated;
        
        return {
          isActive: isAuthenticated,
          expiresAt: null, // Would come from JWT or session data
          lastActivity: user?.lastLoginAt || null,
        };
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        role: state.role,
      }),
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => useAuthStore((state) => state.role);
export const usePermissions = () => useAuthStore((state) => state.permissions);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);