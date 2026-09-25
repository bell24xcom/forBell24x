import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';
import type { SupplierPreferences } from '@/src/lib/supplier-products';
import SuppliersClient, { type SupplierCard, type SuppliersPagination } from './SuppliersClient';

/**
 * SEO fix (Task 2, SEO_PHASE_2_SSR_AND_SITEMAP): this page used to be
 * 'use client' with an empty initial state and a useEffect fetch — the
 * first-byte HTML had no real content (~950 chars, no supplier names),
 * which Google was treating as a soft 404 (339 "Discovered - currently
 * not indexed" URLs traced back to pages like this one). It is now an
 * async Server Component: the first page of suppliers is fetched here,
 * server-side, and rendered directly into the HTML. The existing
 * client-side search/filter UI is preserved in SuppliersClient, seeded
 * with this server-fetched data instead of starting empty.
 */
export const revalidate = 3600;

const PAGE_SIZE = 24;

interface Props {
  searchParams: { page?: string };
}

function parsePage(searchParams: Props['searchParams']): number {
  const n = parseInt(searchParams?.page || '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage(searchParams);
  const canonical = page > 1 ? `${SITE_URL}/suppliers?page=${page}` : `${SITE_URL}/suppliers`;
  const title =
    page > 1
      ? `Find Verified B2B Suppliers in India — Page ${page} | VyaparSethu`
      : 'Find Verified B2B Suppliers in India | VyaparSethu';
  const description =
    page > 1
      ? `Browse GST and Udyam verified B2B suppliers across India — page ${page}. Post a Requirement and get competitive quotes with Protected Payment.`
      : 'Browse GST and Udyam verified B2B suppliers across India by category and location. Post a Requirement and get competitive quotes with Protected Payment.';

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'VyaparSethu',
    },
  };
}

async function getSuppliers(page: number): Promise<{
  suppliers: SupplierCard[];
  pagination: SuppliersPagination;
}> {
  const skip = (page - 1) * PAGE_SIZE;
  const where = { role: 'SUPPLIER' as const, isActive: true };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        company: true,
        location: true,
        isVerified: true,
        trustScore: true,
        preferences: true,
      },
      orderBy: { trustScore: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const suppliers: SupplierCard[] = rows.map((s) => {
    const prefs = (s.preferences ?? {}) as SupplierPreferences;
    const cats = Array.isArray(prefs.categories) ? prefs.categories : [];
    return {
      id: s.id,
      name: s.name,
      company: s.company,
      location: s.location,
      isVerified: s.isVerified,
      trustScore: s.trustScore,
      categories: cats.slice(0, 2),
    };
  });

  return {
    suppliers,
    pagination: {
      page,
      limit: PAGE_SIZE,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export default async function SuppliersPage({ searchParams }: Props) {
  const page = parsePage(searchParams);
  const { suppliers, pagination } = await getSuppliers(page);

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Verified B2B Suppliers Across India</h1>
          <p className="text-lg text-slate-300 mb-8 max-w-3xl">
            VyaparSethu connects buyers across India with GST and Udyam verified suppliers
            spanning steel and metals, textiles, electronics, machinery, chemicals, and
            hundreds of other categories. Every supplier listed here has been checked
            against real business registration details, so you know who you are dealing
            with before the first message is sent. Post a Requirement by voice, text, or
            video in minutes, and receive competitive quotes from verified suppliers ready
            to trade — with Protected Payment keeping your money safe until both sides
            deliver. Use the search box or category filter below to narrow the list to
            your industry and city. Whether you are sourcing raw materials for a factory
            floor or components for assembly, this directory keeps you one click away from
            a real, verified supplier network across India.
          </p>
        </div>

        <section className="py-4">
          <div className="container mx-auto px-0">
            <SuppliersClient initialSuppliers={suppliers} initialPagination={pagination} />

            {pagination.totalPages > 1 && (
              <nav aria-label="Supplier directory pages" className="flex justify-center mt-10">
                <ul className="flex flex-wrap items-center gap-2">
                  {pagination.hasPrev && (
                    <li>
                      <Link
                        href={page - 1 === 1 ? '/suppliers' : `/suppliers?page=${page - 1}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-slate-200 hover:bg-slate-900"
                      >
                        Previous
                      </Link>
                    </li>
                  )}
                  <li className="px-3 py-2 text-slate-300">
                    Page {page} of {pagination.totalPages}
                  </li>
                  {pagination.hasNext && (
                    <li>
                      <Link
                        href={`/suppliers?page=${page + 1}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-slate-200 hover:bg-slate-900"
                      >
                        Next
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
