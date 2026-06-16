'use client';
import { useAuth } from '@/src/app/contexts/AuthContext';

interface Props {
  category?: string;
  city?: string;
}

export default function BlogCapture({ category, city }: Props) {
  const { isAuthenticated, openCaptureModal } = useAuth();
  if (isAuthenticated) return null;

  const label = category && city
    ? `Get ${category} Supplier Quotes from ${city}`
    : category
    ? `Get ${category} Supplier Quotes`
    : 'Get Free Supplier Quotes on VyaparSethu';

  return (
    <div className="my-10 bg-[#001f3f] border border-[#D4AF37]/30 rounded-2xl p-7 not-prose">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xl shrink-0">⚡</div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base mb-1">{label}</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Post your Requirement free — verified suppliers respond with competitive quotes within 24 hours.
            Every deal is covered by Protected Payment (escrow).
          </p>
          <button
            onClick={() => openCaptureModal({
              action: 'post-rfq',
              label,
              category,
              city,
              redirectTo: category ? `/rfq/create?category=${category.toLowerCase().replace(/ /g, '-')}` : '/rfq/create',
            })}
            className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Post a Requirement — Free →
          </button>
        </div>
      </div>
    </div>
  );
}
