import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  // Verified live (8 Aug 2026): a nonexistent id rendered the client page's
  // "Supplier not found" copy but the route still answered HTTP 200 — a
  // textbook Soft 404 for Google. fetchSupplierForSeo now only returns null
  // for ids that truly don't exist (see comment there), so this is safe to
  // gate on without 404ing real dual-role (buyer-role) profiles.
  if (!data) notFound();
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
