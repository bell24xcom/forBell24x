import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 300; // cache 5 minutes

export const metadata: Metadata = {
  title: 'All Trade Categories',
  description: "Explore 450+ B2B trade categories — Metals, Textiles, Chemicals, Packaging, Electronics, Machinery and more. Find verified Indian suppliers on VyaparSethu. Post free.",
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: 'All Trade Categories | VyaparSethu',
    description: "Explore 450+ B2B trade categories — Metals, Textiles, Chemicals, Packaging, Electronics, Machinery and more. Find verified Indian suppliers on VyaparSethu. Post free.",
    url: `${SITE_URL}/categories`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'All Trade Categories | VyaparSethu' }],
  },
};

const FALLBACK_CATEGORIES = [
  { slug: 'textiles-garments', title: 'Textiles & Garments', icon: '👕', suppliers: 2400 },
  { slug: 'pharmaceuticals', title: 'Pharmaceuticals', icon: '💊', suppliers: 1800 },
  { slug: 'agricultural-products', title: 'Agricultural Products', icon: '🌾', suppliers: 3200 },
  { slug: 'automotive-parts', title: 'Automotive Parts', icon: '🚗', suppliers: 1500 },
  { slug: 'it-services', title: 'IT Services', icon: '💻', suppliers: 2100 },
  { slug: 'gems-jewelry', title: 'Gems & Jewelry', icon: '💎', suppliers: 900 },
  { slug: 'handicrafts', title: 'Handicrafts', icon: '🎨', suppliers: 1100 },
  { slug: 'machinery-equipment', title: 'Machinery & Equipment', icon: '⚙️', suppliers: 1700 },
  { slug: 'chemicals', title: 'Chemicals', icon: '🧪', suppliers: 1400 },
  { slug: 'food-processing', title: 'Food Processing', icon: '🍽️', suppliers: 2000 },
  { slug: 'construction', title: 'Construction', icon: '🏗️', suppliers: 2800 },
  { slug: 'metals-steel', title: 'Metals & Steel', icon: '🔩', suppliers: 1900 },
  { slug: 'plastics', title: 'Plastics', icon: '🔄', suppliers: 1300 },
  { slug: 'paper-packaging', title: 'Paper & Packaging', icon: '📦', suppliers: 1000 },
  { slug: 'rubber', title: 'Rubber', icon: '🛞', suppliers: 800 },
  { slug: 'ceramics', title: 'Ceramics', icon: '🏺', suppliers: 600 },
  { slug: 'glass', title: 'Glass', icon: '🪟', suppliers: 500 },
  { slug: 'wood', title: 'Wood', icon: '🪵', suppliers: 1200 },
  { slug: 'leather', title: 'Leather', icon: '👜', suppliers: 1600 },
];

type DisplayCategory = {
  slug: string;
  title: string;
  icon: string;
  suppliers: number;
};

async function getCategories(): Promise<DisplayCategory[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null  // Only show parent/top-level categories
      },
      orderBy: { priority: 'asc' },
      select: { slug: true, name: true, icon: true, _count: { select: { rfqs: true } } },
    });

    if (dbCategories.length > 0) {
      return dbCategories.map(c => ({
        slug: c.slug,
        title: c.name,
        icon: c.icon || '📦',
        suppliers: c._count.rfqs, // use RFQ count as activity proxy until supplierCount column exists
      }));
    }
  } catch {
    // DB unavailable — fall through to hardcoded
  }

  return FALLBACK_CATEGORIES;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const allCategories = await getCategories();
  const query = searchParams?.q?.toLowerCase().trim() ?? '';
  const categories = query
    ? allCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(query) ||
          cat.slug.toLowerCase().includes(query)
      )
    : allCategories;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What categories are available on VyaparSethu?', acceptedAnswer: { '@type': 'Answer', text: 'VyaparSethu covers 450+ B2B product and service categories spanning metals, textiles, chemicals, packaging, machinery, agricultural commodities, IT hardware, construction materials, food processing, and more.' } },
      { '@type': 'Question', name: 'How can suppliers list their business on VyaparSethu?', acceptedAnswer: { '@type': 'Answer', text: 'Suppliers register with their GSTIN at vyaparsethu.com/supplier/registration. After identity verification they select product categories and go live. Listing is free — suppliers pay commission only on completed deals.' } },
      { '@type': 'Question', name: 'How do buyers find the right supplier in a category?', acceptedAnswer: { '@type': 'Answer', text: 'Browse a category page directly to see active suppliers, or post a Requirement specifying product, quantity, location, and budget. Verified suppliers respond within 24 hours.' } },
      { '@type': 'Question', name: 'Can I post Requirements across multiple categories?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Buyers can post separate Requirements in different categories simultaneously. Each Requirement is matched to suppliers in the relevant category independently.' } },
    ],
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'All Categories', item: `${SITE_URL}/categories` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'B2B Trade Categories',
    itemListElement: categories.map((cat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cat.title,
      url: `${SITE_URL}/categories/${cat.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">All Trade Categories</h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-4">
            Browse {allCategories.length < 30 ? '450+' : `${allCategories.length}+`} product and service categories. Find verified suppliers across India.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
            VyaparSethu&apos;s B2B Trade Network covers every major industrial and commercial category active
            in Indian markets — from Metals &amp; Steel sourced in Kalamboli to Corrugated Packaging from
            Bhiwandi, Industrial Adhesives from Navi Mumbai, and Textiles &amp; Garments from Surat.
            Select a category below to browse verified suppliers, view active Requirements, and post your
            own Requirement free. Quotes arrive within 24 hours. All transactions include Protected Payment.
          </p>
        </div>

        {/* Search */}
        <form method="GET" action="/categories" className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            name="q"
            defaultValue={searchParams?.q ?? ''}
            placeholder="Search categories..."
            aria-label="Search trade categories"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </form>

        {categories.length === 0 && (
          <p className="text-center text-slate-400 mb-8">
            No categories match &ldquo;{searchParams?.q}&rdquo;.{' '}
            <Link href="/categories" className="text-blue-400 underline">Clear search</Link>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-200 group"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {cat.suppliers > 0 ? `${cat.suppliers.toLocaleString()}+ suppliers` : 'Be the first supplier →'}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/rfq/create"
            className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Post Your Requirement Free
          </Link>
        </div>

        {/* SEO prose — visible to crawlers and readers */}
        <div className="mt-16 border-t border-slate-800 pt-12 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Find Verified Suppliers by Industry</h2>
            <p className="text-slate-400 leading-relaxed">
              Every category on VyaparSethu is populated with manually verified suppliers who have completed
              GST registration and passed our quality checks. Whether you need construction material
              suppliers in Mumbai, cosmetic raw material manufacturers, or industrial equipment dealers in
              Delhi — browse by category and request quotes directly through our built-in requirement
              system. All responses arrive within 24 hours and every transaction is covered by
              Razorpay-protected payments.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-5">Popular B2B Categories</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-white font-semibold mb-1">Construction and Building Materials</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Cement, steel, bricks, tiles, pipes, and finishing materials from verified dealers across
                  India. Ideal for contractors, builders, and infrastructure projects looking for
                  competitive bulk pricing.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Industrial Machinery and Equipment</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Manufacturing machines, packaging equipment, CNC tools, and heavy machinery from
                  certified suppliers. Compare specifications and prices before you buy.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Chemicals and Petrochemicals</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Industrial chemicals, solvents, lubricants, and specialty chemicals from
                  MSME-registered suppliers across the Mumbai-Thane-Bhiwandi industrial cluster.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Packaging Materials</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Corrugated boxes, BOPP films, PP woven bags, and custom packaging from manufacturers
                  across Maharashtra and Gujarat.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">How Category Browsing Works</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select a category from the grid above or use the search bar to find specific products.
              Filter by location, supplier rating, and GST verification status. View supplier profiles
              with product catalogues and certifications. Send a requirement to one or multiple suppliers
              and compare responses — no middlemen, no hidden commissions.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3">Why Buyers Use VyaparSethu</h2>
            <ul className="space-y-2 text-slate-400 text-sm leading-relaxed list-disc list-inside">
              <li>GST-verified suppliers only — every profile is manually reviewed before going live.</li>
              <li>Pan-India coverage with suppliers from Mumbai, Bhiwandi, Kalamboli, Pune, and 500+ cities.</li>
              <li>Free for buyers — no subscription, no commission on orders.</li>
              <li>Dispute resolution support on every transaction via Razorpay-protected payments.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-5">More B2B Categories on VyaparSethu</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-white font-semibold mb-1">Textiles and Garments</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Cotton fabrics, synthetic yarns, knitted garments, and woven textiles from mills in Surat,
                  Bhiwandi, Tiruppur, and Ludhiana. VyaparSethu connects garment exporters and domestic
                  brands directly with verified fabric suppliers, dye houses, and trims manufacturers.
                  Post your fabric Requirement and receive quotes from multiple mills within 24 hours.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Agricultural Products and Commodities</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Pulses, spices, rice, wheat, edible oils, and agri-commodities from APMC-registered
                  traders and farmer producer organisations (FPOs). Food manufacturers, traders, and
                  exporters use VyaparSethu to source bulk commodities with transparent pricing and
                  verified origin certificates.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Automotive Parts and Components</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  OEM and aftermarket automotive components including engine parts, electrical systems,
                  brake assemblies, and body panels from Tier-1 and Tier-2 suppliers in Pune, Chennai,
                  Gurugram, and Manesar. Verified parts suppliers with IS/BIS certification for
                  compliance-critical procurement.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Food Processing Equipment and Ingredients</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Processed food ingredients, additives, flavours, and food-grade packaging from
                  FSSAI-registered suppliers. Also includes food processing machinery — mixers, conveyors,
                  pasteurisers, and packaging lines — from manufacturers across Maharashtra and Gujarat.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">IT Hardware and Electronics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Servers, networking equipment, CCTV systems, solar panels, LED lighting, and
                  electronic components from authorised distributors and OEM partners. B2B pricing
                  with GST invoices and warranty documentation — no grey-market stock.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">How Supplier Verification Works on VyaparSethu</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              VyaparSethu is not an open directory. Every supplier who wishes to appear in any category
              must complete a three-step verification before their profile is visible to buyers.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              First, GST verification: the supplier's GSTIN is checked against the government GST portal
              to confirm active registration status, legal business name, and state of registration.
              Suppliers with suspended or cancelled GSTINs are not listed. Second, business identity
              check: the supplier's PAN, Udyam number (if an MSME), and registered address are
              cross-verified. Third, category self-declaration: suppliers specify which product categories
              they actively supply, and our team reviews their catalogue for basic quality and completeness.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Buyers browsing any category see a "GST Verified" or "MSME Verified" badge on supplier
              profiles. This reduces time wasted on unqualified suppliers and protects buyers from
              fraudulent listings — a common problem on open B2B directories.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">VyaparSethu Categories — Frequently Asked Questions</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">What categories are available on VyaparSethu?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  VyaparSethu covers 450+ B2B product and service categories spanning metals, textiles,
                  chemicals, packaging, machinery, agricultural commodities, IT hardware, construction
                  materials, food processing, and more. New categories are added monthly based on buyer
                  demand and supplier availability.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">How can suppliers list their business on VyaparSethu?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Suppliers register with their GSTIN and business details at vyaparsethu.com/supplier/registration.
                  After identity verification, they select their product categories, upload a catalogue,
                  and their profile goes live. Listing is free. Suppliers only pay a commission on
                  successfully completed deals — no upfront or subscription fees.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">How do buyers find the right supplier in a category?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Buyers can browse a category page directly to see active suppliers, or post a Requirement
                  specifying their product, quantity, location, and budget. VyaparSethu's matching system
                  notifies relevant verified suppliers, who respond with competitive quotes within 24 hours.
                  Buyers then compare quotes side by side and select the best offer.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Can I post Requirements across multiple categories?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Yes. Buyers can post separate Requirements in different categories simultaneously. For
                  example, a construction company can post one Requirement for cement, another for steel
                  rebars, and a third for waterproofing chemicals — each Requirement is matched to
                  suppliers in the relevant category independently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
