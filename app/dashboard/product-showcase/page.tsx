'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ProductShowcaseRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/supplier/products/add'); }, [router]);
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
      Redirecting…
    </div>
  );
}
