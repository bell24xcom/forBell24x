import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RFQ Marketplace — Browse Active Procurement Requests | Bell24h',
  description: 'Browse active RFQs from Indian manufacturers and businesses. Submit competitive quotes and win deals. 450+ product categories.',
  alternates: {
    canonical: '/marketplace',
  },
  openGraph: {
    title: 'B2B RFQ Marketplace | Bell24h',
    description: 'Browse active procurement requests and submit quotes. Steel, chemicals, machinery, textiles and more.',
    url: '/marketplace',
    images: [
      {
        url: '/og-marketplace.png',
        width: 1200,
        height: 630,
        alt: 'Bell24h B2B Marketplace',
      },
    ],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
