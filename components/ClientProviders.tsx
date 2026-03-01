'use client';

import { ReactNode } from 'react';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { AuthProvider } from '@/app/contexts/AuthContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardProvider>
        {children}
      </DashboardProvider>
    </AuthProvider>
  );
}
