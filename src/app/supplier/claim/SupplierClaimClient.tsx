'use client';
import { useAuth } from '@/src/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { saveIntent } from '@/src/lib/intent';

interface Props {
  category?: string;
  city?: string;
  claimToken?: string;
}

export default function SupplierClaimClient({ category, city, claimToken }: Props) {
  const { isAuthenticated, openCaptureModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard?tab=supplier&onboarding=1');
  }, [isAuthenticated, router]);

  const handleClaim = () => {
    // A claim token means this is an outreach deep-link (see
    // src/app/api/admin/outreach/bulk-wa/route.ts). Claim completion for a
    // token must go through the same verify/complete pair the plain
    // /claim/[token] flow already uses (src/app/claim/[token]/ClaimForm.tsx)
    // — that page has its own OTP UI, so the generic capture modal below is
    // only for the no-token case.
    if (claimToken) {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      const qs = params.toString();
      router.push(`/claim/${claimToken}${qs ? `?${qs}` : ''}`);
      return;
    }

    const label = category && city
      ? `Claim Supplier Profile — ${category} in ${city}`
      : 'Claim Free Verified Supplier Profile';

    saveIntent({
      action: 'supplier-claim',
      label,
      category,
      city,
      redirectTo: '/dashboard?tab=supplier&onboarding=1',
    });

    openCaptureModal({ action: 'supplier-claim', label, category, city });
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
      <h2 className="text-white font-bold text-xl mb-2">Register Free</h2>
      <p className="text-slate-400 text-sm mb-8">Enter your mobile — OTP sent instantly. No password, no forms, no listing fee.</p>

      {/* Preview of what they get */}
      {category && (
        <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl px-5 py-4 mb-6">
          <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">Matching your profile</p>
          <p className="text-white text-sm font-medium">{category} Supplier</p>
          {city && <p className="text-slate-400 text-xs">{city} cluster</p>}
        </div>
      )}

      <button
        onClick={handleClaim}
        className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-bold py-4 rounded-xl text-base transition-colors mb-4"
      >
        Claim Free Profile — Enter Mobile →
      </button>

      <p className="text-slate-500 text-xs text-center leading-relaxed">
        By registering you agree to our{' '}
        <a href="/legal/terms-of-service" className="underline">Terms</a> and{' '}
        <a href="/legal/privacy-policy" className="underline">Privacy Policy</a>.
        We process your data per DPDP Act 2023.
      </p>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <p className="text-slate-500 text-xs text-center mb-3">Trusted by suppliers in</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Kalamboli', 'Bhiwandi', 'Taloja', 'Surat', 'Ludhiana', 'Coimbatore'].map(c => (
            <span key={c} className="text-xs text-slate-400 bg-slate-700/40 px-2.5 py-1 rounded-full">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
