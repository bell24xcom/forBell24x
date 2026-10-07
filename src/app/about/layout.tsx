import { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

// about/page.tsx is a client component, which cannot export `metadata` itself.
// This layout only overrides the canonical; title/description/OG/robots stay
// inherited from the root layout exactly as before.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
