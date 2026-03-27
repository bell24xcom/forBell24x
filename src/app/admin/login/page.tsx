'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginRedirect() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Admin now uses the main app auth system (phone OTP).
    // Preserve any ?redirect= param so the user lands on the right admin page after login.
    const redirect = searchParams.get('redirect') || '/admin';
    router.replace(`/auth/phone-email?redirect=${encodeURIComponent(redirect)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-300 text-sm">Redirecting to login…</p>
        <p className="text-slate-500 text-xs">Admin access uses your Bell24h phone login.</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginRedirect />
    </Suspense>
  );
}
