import type { Metadata } from 'next';
import { buildSupplierMetadata, fetchSupplierForSeo, supplierJsonLd } from '@/src/lib/supplier-seo';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return buildSupplierMetadata(params.id);
}

export default async function SupplierProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const data = await fetchSupplierForSeo(params.id);
  const jsonLd = data
    ? supplierJsonLd(
        params.id,
        data.companyName,
        data.user.location,
        data.categories,
        data.products,
      )
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
