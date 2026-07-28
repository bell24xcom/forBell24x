import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { normalizeProducts, type SupplierPreferences } from '@/src/lib/supplier-products';
import { SITE_URL } from '@/lib/site-url';

export async function fetchSupplierForSeo(supplierId: string) {
  const user = await prisma.user.findUnique({
    where: { id: supplierId, role: 'SUPPLIER' },
    select: {
      id: true,
      name: true,
      company: true,
      location: true,
      gstNumber: true,
      udyamNumber: true,
      isVerified: true,
      trustScore: true,
      preferences: true,
      updatedAt: true,
    },
  });
  if (!user) return null;

  const prefs = (user.preferences ?? {}) as SupplierPreferences;
  const products = normalizeProducts(prefs.products);
  const companyName = user.company || user.name || 'Supplier';
  const categories = prefs.categories ?? [];
  const description =
    prefs.description?.slice(0, 160) ||
    `Verified B2B supplier ${companyName}${user.location ? ` in ${user.location}` : ''}. GST${user.gstNumber ? ' verified' : ''}. Browse products and request quotes on VyaparSethu.`;

  return { user, prefs, products, companyName, categories, description };
}

export async function buildSupplierMetadata(supplierId: string): Promise<Metadata> {
  const data = await fetchSupplierForSeo(supplierId);
  if (!data) {
    // `absolute` stops the root layout template ("%s | VyaparSethu") from
    // appending a second brand suffix onto a title that already carries one.
    return { title: { absolute: 'Supplier Not Found | VyaparSethu' } };
  }

  const { companyName, categories, description, products, user } = data;
  const title = `${companyName} — Verified B2B Supplier India | VyaparSethu`;
  const keywords = [
    `${companyName} supplier india`,
    ...categories.map(c => `${c} supplier india`),
    ...products.slice(0, 3).map(p => `${p.name} supplier india`),
    'b2b marketplace india',
    'gst verified supplier',
  ];

  return {
    // `absolute` — the title already ends in "| VyaparSethu"; without this the
    // layout template would append it again ("…VyaparSethu | VyaparSethu").
    title: { absolute: title },
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/supplier/${supplierId}`,
      siteName: 'VyaparSethu',
      type: 'profile',
    },
    alternates: { canonical: `${SITE_URL}/supplier/${supplierId}` },
    robots: user.isVerified || user.gstNumber ? { index: true, follow: true } : { index: true, follow: true },
  };
}

export async function buildProductMetadata(supplierId: string, productSlug: string): Promise<Metadata> {
  const data = await fetchSupplierForSeo(supplierId);
  if (!data) return { title: { absolute: 'Product Not Found | VyaparSethu' } };

  const product = data.products.find(p => p.slug === productSlug);
  if (!product) return { title: { absolute: 'Product Not Found | VyaparSethu' } };

  const title = `${product.name} — ${data.companyName} | B2B Supplier India`;
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} from ${data.companyName}${product.category ? ` (${product.category})` : ''}. Request bulk quote on VyaparSethu.`;

  return {
    title,
    description,
    keywords: [
      `${product.name} supplier india`,
      `${product.name} wholesale india`,
      data.companyName,
      ...(product.category ? [`${product.category} suppliers india`] : []),
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/supplier/${supplierId}/products/${productSlug}`,
      siteName: 'VyaparSethu',
      type: 'website',
    },
    alternates: { canonical: `${SITE_URL}/supplier/${supplierId}/products/${productSlug}` },
  };
}

export function supplierJsonLd(
  supplierId: string,
  companyName: string,
  location: string | null,
  categories: string[],
  products: { name: string; slug: string; description?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    url: `${SITE_URL}/supplier/${supplierId}`,
    ...(location && { address: { '@type': 'PostalAddress', addressLocality: location, addressCountry: 'IN' } }),
    knowsAbout: categories,
    makesOffer: products.slice(0, 10).map(p => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        url: `${SITE_URL}/supplier/${supplierId}/products/${p.slug}`,
      },
    })),
  };
}

export function productJsonLd(
  supplierId: string,
  companyName: string,
  product: { name: string; slug: string; description?: string; category?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    url: `${SITE_URL}/supplier/${supplierId}/products/${product.slug}`,
    brand: { '@type': 'Organization', name: companyName },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      seller: { '@type': 'Organization', name: companyName },
    },
  };
}
