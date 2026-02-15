import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="admin-layout">
        {children}
      </div>
    </ErrorBoundary>
  );
}
