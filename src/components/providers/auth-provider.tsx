"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "next-auth";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  newsletter?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  // Update user when session changes
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User);
      setError(null);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      setError(null);

      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error;
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      if (result?.ok) {
        toast.success("Welcome back!");
        return true;
      }

      return false;
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
      setUser(null);
      setError(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error("Logout failed");
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setError(null);

      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        toast.error("Passwords do not match");
        return false;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          acceptTerms: data.acceptTerms,
          acceptPrivacy: data.acceptPrivacy,
          newsletter: data.newsletter,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      toast.success(
        "Account created successfully! Please check your email for verification."
      );
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Profile update failed");
      }

      // Update the session
      await update();
      setUser(result.user);
      toast.success("Profile updated successfully");
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Profile update failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Password reset failed");
      }

      toast.success("Password reset instructions sent to your email");
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Password reset failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Email verification failed");
      }

      toast.success("Email verified successfully");
      await update(); // Refresh session
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Email verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const resendVerification = async (): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend verification");
      }

      toast.success("Verification email sent");
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to resend verification";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user?.role) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const refreshUser = async (): Promise<void> => {
    try {
      await update();
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    verifyEmail,
    resendVerification,
    checkPermission,
    hasRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
