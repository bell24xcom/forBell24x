'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

const HIDE_ON = ['/dashboard', '/admin', '/supplier'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (HIDE_ON.some(p => pathname?.startsWith(p))) return null;
  return <Header />;
}
