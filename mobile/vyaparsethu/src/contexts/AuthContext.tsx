import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, clearToken, getToken, setToken as saveToken } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  isVerified: boolean;
}

interface OtpResult {
  success: boolean;
  message: string;
  devOtp?: string;
}

interface VerifyResult {
  success: boolean;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<OtpResult>;
  verifyOtp: (phone: string, otp: string) => Promise<VerifyResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; user: AuthUser }>('/api/profile');
      if (res.success) setUser(res.user);
    } catch {
      // profile fetch failing doesn't necessarily mean the session is dead —
      // leave the existing user state alone rather than logging out on a
      // transient network error.
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const res = await apiFetch<{ success: boolean; user: AuthUser }>('/api/profile');
          if (res.success) setUser(res.user);
        } catch {
          await clearToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    return apiFetch<OtpResult>('/api/auth/otp/send', {
      method: 'POST',
      body: { phone },
      auth: false,
    });
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const res = await apiFetch<VerifyResult & { user?: AuthUser; token?: string }>(
      '/api/auth/otp/verify',
      { method: 'POST', body: { phone, otp }, auth: false },
    );
    if (res.success && res.token && res.user) {
      await saveToken(res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
