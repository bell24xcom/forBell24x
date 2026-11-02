import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  return { alternates: { canonical: `${SITE_URL}/rfq/${params.id}` } };
}

export default function RFQDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
