import { Metadata } from 'next';
import Link from 'next/link';
import { listAreas } from '@/src/lib/bom/location';

export const metadata: Metadata = {
  title: { absolute: 'Industrial Areas & Business Pulse | VyaparSethu' },
  description:
    'Explore India\'s industrial clusters — live trade pulse, verified suppliers, and category intelligence for Kalamboli, Bhiwandi, Taloja, and more.',
  alternates: { canonical: 'https://www.vyaparsethu.com/location' },
};

export default function LocationIndexPage() {
  const areas = listAreas();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <span className="text-slate-300">Industrial Areas</span>
        </nav>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-full px-4 py-1.5 text-xs text-[#10b981] font-medium mb-4">
            Location Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Industrial Area Business Pulse</h1>
          <p className="text-slate-400 text-lg max-w-3xl">
            Every cluster has its own economic rhythm — requirements posted, quotes received, deals closed.
            Pick your industrial area to see what&apos;s moving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {areas.map((area) => (
            <Link
              key={area.key}
              href={`/location/${area.key}`}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-[#10b981]/40 transition-colors group"
            >
              <h2 className="text-white font-semibold mb-1 group-hover:text-[#10b981] transition-colors">
                {area.fullName}
              </h2>
              <p className="text-slate-400 text-xs mb-3">{area.state}</p>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{area.description}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-[#D4AF37]">View Business Pulse →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
