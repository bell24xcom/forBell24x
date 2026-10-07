import { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

// pricing/page.tsx is a client component, which cannot export `metadata` itself.
// This layout only overrides the canonical; title/description/OG/robots stay
// inherited from the root layout exactly as before.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/pricing` },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
