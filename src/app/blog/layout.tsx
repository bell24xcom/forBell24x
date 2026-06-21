import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — B2B Procurement Insights | VyaparSethu',
  description: 'Expert guides on B2B procurement, RFQ best practices, supplier verification, and manufacturing trends in India.',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
