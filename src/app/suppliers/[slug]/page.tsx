import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { suppliers, supplierProducts, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import SupplierProfileView from '@/components/suppliers/SupplierProfileView';
import { generateSupplierMetadata } from '@/lib/seo/supplier-metadata';
import { SupplierJsonLd } from '@/components/seo/SupplierJsonLd';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.slug, params.slug),
    with: {
      category: true,
      products: true,
    },
  });

  if (!supplier) {
    return {
      title: 'Supplier Not Found',
      description: 'This supplier profile does not exist.',
    };
  }

  return generateSupplierMetadata(supplier);
}

// Generate static params for ISR
export async function generateStaticParams() {
  const topSuppliers = await db
    .select({ slug: suppliers.slug })
    .from(suppliers)
    .where(eq(suppliers.is_active, true))
    .limit(1000);

  return topSuppliers.map((supplier) => ({
    slug: supplier.slug,
  }));
}

export default async function SupplierProfilePage({ params }: PageProps) {
  const supplier = await db.query.suppliers.findFirst({
    where: eq(suppliers.slug, params.slug),
    with: {
      category: true,
      products: {
        limit: 12,
        orderBy: (products, { desc }) => [desc(products.is_featured)],
      },
    },
  });

  if (!supplier) {
    notFound();
  }

  // Increment view count
  await db
    .update(suppliers)
    .set({ 
      profile_views: supplier.profile_views + 1,
      last_viewed_at: new Date(),
    })
    .where(eq(suppliers.id, supplier.id));

  return (
    <>
      {/* JSON-LD for Rich Snippets */}
      <SupplierJsonLd supplier={supplier} />
      
      {/* Main Profile Component */}
      <SupplierProfileView 
        supplier={supplier} 
        isClaimable={!supplier.is_claimed}
      />
    </>
  );
}

// Revalidate every hour for fresh data
export const revalidate = 3600;
