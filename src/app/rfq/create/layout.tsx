import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Post an RFQ — Request for Quotation',
  description: 'Create a procurement request in minutes. Specify your requirement, quantity, and budget. Get quotes from verified Indian suppliers.',
  openGraph: {
    title: 'Post an RFQ | Bell24h B2B Marketplace',
    description: 'Post your procurement requirement and receive competitive quotes from verified suppliers.',
    url: `${SITE_URL}/rfq/create`,
  },
};

export default function CreateRFQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
