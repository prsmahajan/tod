"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Account, Client, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

const account = new Account(client);

// Cache keys
const CACHE_KEY = 'tod_auth_user';
const CACHE_EXPIRY_KEY = 'tod_auth_expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Types
interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  phone: string;
  phoneVerification: boolean;
  prefs: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  sendPasswordRecovery: (email: string) => Promise<void>;
  confirmPasswordRecovery: (userId: string, secret: string, password: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to get cached user
function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }

    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

// Helper to set cached user
function setCachedUser(user: User | null) {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(user));
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION));
    } else {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize with cached user for instant UI
  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [loading, setLoading] = useState(() => !getCachedUser());

  // Check user on mount - but don't block if we have cache
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = useCallback(async () => {
    try {
      const session = await account.get();
      const userData = session as unknown as User;
      setUser(userData);
      setCachedUser(userData);
    } catch {
      setUser(null);
      setCachedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const session = await account.get();
      const userData = session as unknown as User;
      setUser(userData);
      setCachedUser(userData);
    } catch {
      setUser(null);
      setCachedUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      const userData = session as unknown as User;
      setUser(userData);
      setCachedUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      const userData = session as unknown as User;
      setUser(userData);
      setCachedUser(userData);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setCachedUser(null);
    } catch (error: any) {
      // Clear local state even if API fails
      setUser(null);
      setCachedUser(null);
      throw new Error(error.message || 'Logout failed');
    }
  }, []);

  const loginWithGoogle = useCallback(async (redirectTo?: string) => {
    try {
      if (redirectTo) {
        localStorage.setItem('authRedirect', redirectTo);
      }
      account.createOAuth2Session(
        'google',
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login?error=oauth_failed`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }, []);

  const sendPasswordRecovery = useCallback(async (email: string) => {
    try {
      await account.createRecovery(email, `${window.location.origin}/reset/confirm`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send recovery email');
    }
  }, []);

  const confirmPasswordRecovery = useCallback(async (userId: string, secret: string, password: string) => {
    try {
      await account.updateRecovery(userId, secret, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    try {
      await account.createVerification(`${window.location.origin}/auth/verify`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification email');
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    sendPasswordRecovery,
    confirmPasswordRecovery,
    sendVerificationEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export account for direct access if needed
export { account, client };
