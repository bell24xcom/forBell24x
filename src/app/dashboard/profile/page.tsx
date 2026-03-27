'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('bell24h_user') || '{}');
      if (user.role === 'SUPPLIER' || user.role === 'supplier') {
        router.replace('/supplier/profile/edit');
      } else {
        router.replace('/dashboard/settings');
      }
    } catch {
      router.replace('/dashboard/settings');
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
      Redirecting…
    </div>
  );
}
