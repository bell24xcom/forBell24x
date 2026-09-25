import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';
import { OG_DEFAULTS } from '@/lib/og-defaults';
import RFQDetailClient from './RFQDetailClient';

/**
 * SEO fix (Task 3, SEO_PHASE_2_SSR_AND_SITEMAP): this page used to be
 * 'use client' with a null initial state and a useEffect fetch — every
 * /rfq/[id] URL sent the same ~818-char shell regardless of which RFQ it
 * was, which Google flagged as "Duplicate, Google chose different
 * canonical" across 18 URLs. It is now an async Server Component: the
 * RFQ's public, non-personal fields (title, category, quantity/unit,
 * requirement location, status, posted date) are fetched here,
 * server-side, and seeded into the client component's initial state so
 * the first-byte HTML is real and distinct per RFQ. Buyer identity
 * (name/company/phone) is deliberately NOT selected here — it stays on
 * the client component's own existing post-mount fetch, unchanged.
 */
export const revalidate = 3600;

const INDEXABLE_STATUSES = new Set(['ACTIVE', 'OPEN', 'QUOTED']);

interface Props {
  params: { id: string };
}

// Public, non-personal RFQ fields only — no `user` relation selected.
const SAFE_RFQ_SELECT = {
  id: true,
  slug: true,
  title: true,
  category: true,
  description: true,
  quantity: true,
  unit: true,
  maxBudget: true,
  timeline: true,
  urgency: true,
  type: true,
  videoUrl: true,
  location: true,
  createdAt: true,
  views: true,
  status: true,
  createdBy: true,
} as const;

async function getSafeRFQ(param: string) {
  return prisma.rFQ.findFirst({
    where: {
      isPublic: true,
      OR: [{ id: param }, { slug: param }],
    },
    select: SAFE_RFQ_SELECT,
  });
}

function isIndexable(rfq: NonNullable<Awaited<ReturnType<typeof getSafeRFQ>>>): boolean {
  return (
    INDEXABLE_STATUSES.has(rfq.status) &&
    !!rfq.title &&
    !!rfq.quantity &&
    !!rfq.unit &&
    !!rfq.category
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rfq = await getSafeRFQ(params.id);
  if (!rfq) return { title: 'Requirement Not Found | VyaparSethu' };

  const city = rfq.location?.trim() || 'India';
  const categoryLabel = rfq.category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const title = `${rfq.title.trim()} – ${rfq.quantity} ${rfq.unit} | Buy Requirement in ${city} | VyaparSethu`;
  const statusLabel = rfq.status.charAt(0) + rfq.status.slice(1).toLowerCase();
  const postedDate = new Date(rfq.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const description = `Buy ${rfq.quantity} ${rfq.unit} of ${categoryLabel} in ${city}. Status: ${statusLabel}. Posted ${postedDate} on VyaparSethu — get verified supplier quotes with Protected Payment.`;

  const indexable = isIndexable(rfq);

  return {
    title: { absolute: title },
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      url: `${SITE_URL}/rfq/${params.id}`,
    },
  };
}

export default async function RFQDetailPage({ params }: Props) {
  const rfq = await getSafeRFQ(params.id);

  if (!rfq) {
    notFound();
  }

  return <RFQDetailClient initialRFQ={rfq} />;
}
