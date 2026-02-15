import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { suppliers, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bell24h.com';

  // Get all active suppliers for sitemap
  const allSuppliers = await db
    .select({
      slug: suppliers.slug,
      updatedAt: suppliers.updated_at,
    })
    .from(suppliers)
    .where(eq(suppliers.is_active, true));

  // Get all categories
  const allCategories = await db
    .select({
      slug: categories.slug,
      updatedAt: categories.updated_at,
    })
    .from(categories)
    .where(eq(categories.is_active, true));

  const supplierUrls = allSuppliers.map((supplier) => ({
    url: `${baseUrl}/suppliers/${supplier.slug}`,
    lastModified: supplier.updatedAt || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const categoryUrls = allCategories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/suppliers`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...supplierUrls,
    ...categoryUrls,
  ];
}
