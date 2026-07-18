/**
 * Supplier products stored in User.preferences.products (no separate Product table).
 */

export interface SupplierProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
}

export interface SupplierPreferences {
  categories?: string[];
  cities?: string[];
  products?: SupplierProduct[];
  description?: string;
  businessType?: string;
  website?: string;
  employees?: string;
  annualRevenue?: string;
  address?: string;
  [key: string]: unknown;
}

export function slugifyProduct(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function normalizeProducts(raw: unknown): SupplierProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is Record<string, unknown> => p && typeof p === 'object')
    .map((p, i) => {
      const name = String(p.name ?? '').trim();
      if (!name) return null;
      const slug = String(p.slug ?? slugifyProduct(name));
      return {
        id: String(p.id ?? `prod-${i}-${slug}`),
        name,
        slug,
        description: p.description ? String(p.description) : undefined,
        category: p.category ? String(p.category) : undefined,
        imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
        price: typeof p.price === 'number' ? p.price : undefined,
      };
    })
    .filter((p): p is SupplierProduct => p !== null);
}

export function productPublicPath(supplierId: string, slug: string): string {
  return `/supplier/${supplierId}/products/${slug}`;
}
