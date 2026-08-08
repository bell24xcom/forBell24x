import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

// `page.tsx` is 'use client' (live supplier search/filter UI) and cannot
// export metadata itself, so it silently inherited the root layout's
// title/description/canonical (i.e. declared the homepage as its own
// canonical). Verified live 8 Aug 2026: /suppliers served the homepage's
// <title> and <link rel="canonical" href="https://www.vyaparsethu.com">
// despite being a distinct, sitemapped, footer-linked directory page —
// exactly the kind of self-declared-wrong-canonical Google flags as
// "Duplicate, Google chose different canonical than user."
export const metadata: Metadata = {
  title: { absolute: 'Find Verified B2B Suppliers in India | VyaparSethu' },
  description:
    'Browse GST and Udyam verified B2B suppliers across India by category and location. Post a Requirement and get competitive quotes with Protected Payment.',
  alternates: { canonical: `${SITE_URL}/suppliers` },
  openGraph: {
    title: 'Find Verified B2B Suppliers in India | VyaparSethu',
    description: 'Browse GST and Udyam verified B2B suppliers across India by category and location.',
    url: `${SITE_URL}/suppliers`,
    siteName: 'VyaparSethu',
  },
};

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
