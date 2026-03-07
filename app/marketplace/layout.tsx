import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RFQ Marketplace — Browse Active Procurement Requests',
  description: 'Browse active RFQs from Indian manufacturers and businesses. Submit competitive quotes and win deals. 450+ product categories.',
  openGraph: {
    title: 'B2B RFQ Marketplace | Bell24h',
    description: 'Browse active procurement requests and submit quotes. Steel, chemicals, machinery, textiles and more.',
    url: 'https://bell24h.com/marketplace',
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
