import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildProductMetadata, fetchSupplierForSeo, productJsonLd } from '@/lib/supplier-seo';

export async function generateMetadata({ params }: { params: { id: string; slug: string } }) {
  return buildProductMetadata(params.id, params.slug);
}

export default async function SupplierProductPage({ params }: { params: { id: string; slug: string } }) {
  const data = await fetchSupplierForSeo(params.id);
  if (!data) notFound();

  const product = data.products.find(p => p.slug === params.slug);
  if (!product) notFound();

  const jsonLd = productJsonLd(params.id, data.companyName, product);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href={`/supplier/${params.id}`} className="text-slate-400 hover:text-white text-sm">
          ← {data.companyName}
        </Link>
        <h1 className="text-2xl font-bold mt-4">{product.name}</h1>
        {product.category && (
          <p className="text-indigo-400 text-sm mt-1">{product.category}</p>
        )}
        <p className="text-slate-300 mt-4 leading-relaxed">
          {product.description || `Bulk ${product.name} from ${data.companyName}. Request a competitive B2B quote on VyaparSethu.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/rfq/create?supplier=${params.id}&product=${encodeURIComponent(product.name)}`}
            className="px-5 py-2.5 bg-[#D4AF37] text-[#001f3f] font-bold rounded-lg text-sm"
          >
            Request Quote
          </Link>
          <Link href={`/supplier/${params.id}`} className="px-5 py-2.5 border border-slate-600 rounded-lg text-sm text-slate-300">
            View Supplier Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
