import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Star, CheckCircle } from 'lucide-react';
import ClaimForm from './ClaimForm';

interface PageProps {
  params: { token: string };
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = params;

  const supplier = await prisma.user.findUnique({
    where: { claimToken: token },
    select: {
      id: true,
      name: true,
      company: true,
      location: true,
      gstNumber: true,
      udyamNumber: true,
      isClaimed: true,
      claimedAt: true,
    },
  });

  if (!supplier) {
    notFound();
  }

  const companyName = supplier.company || supplier.name || 'Your Business';

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white">Bell<span className="text-indigo-400">24h</span></span>
          <p className="text-slate-400 text-sm mt-1">India's AI-Powered B2B Marketplace</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          {supplier.isClaimed ? (
            /* Already claimed state */
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Profile Already Claimed</h1>
              <p className="text-slate-400 text-sm">
                <strong className="text-white">{companyName}</strong> has already been claimed on{' '}
                {supplier.claimedAt ? new Date(supplier.claimedAt).toLocaleDateString('en-IN') : 'Bell24h'}.
              </p>
              <a
                href="/auth/login"
                className="min-h-[44px] inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg px-6 transition-colors"
              >
                Log in to your account
              </a>
            </div>
          ) : (
            /* Claim flow */
            <>
              {/* Supplier info card */}
              <div className="bg-slate-700/40 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-white font-semibold truncate">{companyName}</h2>
                    {supplier.location && (
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {supplier.location}
                      </p>
                    )}
                    {supplier.gstNumber && (
                      <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3" />
                        GST Registered
                      </p>
                    )}
                    {supplier.udyamNumber && (
                      <p className="text-blue-400 text-xs flex items-center gap-1 mt-0.5">
                        <CheckCircle className="w-3 h-3" />
                        Udyam Registered
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <h1 className="text-lg font-bold text-white mb-1">Claim Your Business Profile</h1>
              <p className="text-slate-400 text-sm mb-6">
                Verify your phone number to take ownership of this profile and start receiving buyer inquiries.
              </p>

              <ClaimForm token={token} companyName={companyName} />

              <p className="text-xs text-slate-500 text-center mt-4">
                By claiming, you agree to Bell24h's{' '}
                <a href="/terms" className="text-indigo-400 hover:underline">Terms of Service</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
