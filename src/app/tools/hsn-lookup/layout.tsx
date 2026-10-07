import { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

// page.tsx is a client component, which cannot export `metadata` itself (see
// its own note). This layout only overrides the canonical; title/description/
// OG/robots stay inherited from the root layout exactly as before.
export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/tools/hsn-lookup` },
};

export default function HsnLookupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
