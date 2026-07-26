import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

// Canonical strips the `?redirect=` query param — every deep-link variant of
// this login page (redirect=/rfq/x, redirect=/dashboard, ...) is the same
// content, so they all collapse onto the bare URL instead of splitting signal.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/auth/phone-email` },
};

export default function PhoneEmailAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
