'use client';
<<<<<<< HEAD
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  loginMethod?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phoneNumber: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
=======

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  // Every user can be both buyer and supplier
  isBuyer: boolean;
  isSupplier: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, otp: string) => Promise<void>;
  logout: () => void;
  sendOTP: (mobile: string) => Promise<boolean>;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
<<<<<<< HEAD
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('bell24h_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('bell24h_user');
      } finally {
        setLoading(false);
=======
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        const token =
          localStorage.getItem('auth_token') || localStorage.getItem('authToken');
        const demoMode = localStorage.getItem('demoMode');
        
        if (token) {
          // If demo mode, set user directly
          if (demoMode === 'true' || token.startsWith('demo_auth_token_')) {
            setUser({
              id: 'demo-user-1',
              name: 'Demo User',
              mobile: '9999999999',
              email: 'demo@bell24h.com',
              isBuyer: true,
              isSupplier: true,
            });
            setIsLoading(false);
            return;
          }

          // Verify token with backend
          try {
            const response = await fetch('/api/auth/verify', {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData.success && userData.user) {
                setUser(userData.user);
              } else {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('authToken');
                }
              }
            } else {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('authToken');
              }
            }
          } catch (fetchError) {
            // If verify API fails, don't crash - just clear token
            console.warn('Auth verify API not available:', fetchError);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('authToken');
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Don't crash on auth check failure
      } finally {
        setIsLoading(false);
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      }
    };

    checkAuth();
  }, []);

<<<<<<< HEAD
  const sendOTP = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const data = await response.json();
      console.log('OTP sent successfully:', data);
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phoneNumber: string, otp: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid OTP');
      }

      const data = await response.json();
      
      // Store user session
      localStorage.setItem('bell24h_user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Remove user session
      localStorage.removeItem('bell24h_user');
      setUser(null);
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    sendOTP,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
=======
  const sendOTP = async (mobile: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Send OTP failed:', error);
      return false;
    }
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        // Store token (only on client side)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('authToken', data.token);
        }
        
        // Set user data
        setUser({
          id: data.user?.id || '1',
          name: data.user?.name || 'User',
          mobile: mobile,
          email: data.user?.email,
          isBuyer: true, // Every user can be a buyer
          isSupplier: true, // Every user can be a supplier
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Verify OTP failed:', error);
      return false;
    }
  };

  const login = async (mobile: string, otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      const success = await verifyOTP(mobile, otp);
      if (success) {
        router.push('/dashboard');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('demoMode');
    }
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        sendOTP,
        verifyOTP,
      }}
    >
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      {children}
    </AuthContext.Provider>
  );
}

<<<<<<< HEAD
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
=======
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
