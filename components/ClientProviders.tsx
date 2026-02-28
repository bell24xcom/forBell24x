'use client';

import { ReactNode } from 'react';
import { DashboardProvider } from '@/contexts/DashboardContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  );
}
