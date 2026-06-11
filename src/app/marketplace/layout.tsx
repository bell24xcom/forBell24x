import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Requirement Marketplace — Browse Active Trade Requests | VyaparSethu',
  description: 'Browse active Requirements from Indian manufacturers and businesses. Submit competitive quotes and win deals. 450+ product categories.',
  alternates: {
    canonical: '/marketplace',
  },
  openGraph: {
    title: 'B2B Requirement Marketplace | VyaparSethu',
    description: 'Browse active trade requests and submit quotes. Steel, chemicals, machinery, textiles and more.',
    url: '/marketplace',
    images: [
      {
        url: '/og-marketplace.png',
        width: 1200,
        height: 630,
        alt: 'VyaparSethu B2B Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-marketplace.png'],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
