'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phone?: string;
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phone: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  sendOTP: (phone: string) => Promise<{ devOtp?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
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
      }
    };

    checkAuth();
  }, []);

  const sendOTP = async (phone: string): Promise<{ devOtp?: string }> => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return { devOtp: data.devOtp };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store user session — backend returns { success, user, token }
      localStorage.setItem('bell24h_user', JSON.stringify(data.user));
      setUser(data.user);

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

      // Clear httpOnly cookie via server-side logout endpoint
      await fetch('/api/auth/logout', { method: 'POST' });

      // Remove client-side session
      localStorage.removeItem('bell24h_user');
      setUser(null);

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if server call fails
      localStorage.removeItem('bell24h_user');
      setUser(null);
      router.push('/');
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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
