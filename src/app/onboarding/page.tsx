'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/app/contexts/AuthContext';

const BUYER_CATEGORIES = [
  'Steel & Metals', 'Packaging Materials', 'Chemicals', 'Industrial Machinery',
  'Textiles', 'Electronics', 'Plastics & Rubber', 'Automotive Parts',
  'Construction Materials', 'Industrial Adhesives', 'Food & Beverages', 'Pharmaceuticals',
];

export default function OnboardingPage() {
  const { user, isAuthenticated, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
    if (!loading && isAuthenticated && user?.name) router.replace('/dashboard');
  }, [loading, isAuthenticated, user, router]);

  const handleStep1 = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await updateProfile({ name: name.trim(), role });
    setSaving(false);
    setStep(2);
  };

  const handleStep2 = async () => {
    setSaving(true);
    if (company.trim()) await updateProfile({ company: company.trim() });
    setSaving(false);
    setStep(3);
  };

  const handleFinish = () => {
    router.push(role === 'SUPPLIER' ? '/dashboard?tab=supplier' : '/rfq/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const STEPS = 3;
  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Setup your profile</span>
            <span>Step {step} of {STEPS}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">

          {/* Step 1: Name + Role */}
          {step === 1 && (
            <>
              <h1 className="text-white font-bold text-2xl mb-2">Welcome to VyaparSethu</h1>
              <p className="text-slate-400 text-sm mb-8">Takes 60 seconds. Tell us who you are so we can match you with the right suppliers or buyers.</p>

              <div className="mb-5">
                <label className="block text-slate-300 text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleStep1()}
                  placeholder="e.g. Rajesh Sharma"
                  autoFocus
                  className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div className="mb-8">
                <label className="block text-slate-300 text-sm font-medium mb-3">I am primarily a…</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['BUYER', 'SUPPLIER'] as const).map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`py-4 rounded-xl border text-sm font-semibold transition-colors ${role === r ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-slate-700/30 border-slate-600/40 text-slate-400 hover:border-slate-500'}`}>
                      {r === 'BUYER' ? '🛒 Buyer' : '🏭 Supplier'}
                      <div className="text-xs font-normal mt-1 opacity-70">
                        {r === 'BUYER' ? 'I source products' : 'I sell products'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleStep1} disabled={!name.trim() || saving}
                className="w-full bg-[#D4AF37] hover:bg-[#c4a030] disabled:opacity-40 text-[#001f3f] font-bold py-3.5 rounded-xl text-sm transition-colors">
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            </>
          )}

          {/* Step 2: Business details */}
          {step === 2 && (
            <>
              <h2 className="text-white font-bold text-xl mb-2">Your Business</h2>
              <p className="text-slate-400 text-sm mb-8">Optional — helps suppliers/buyers trust you faster.</p>

              <div className="mb-5">
                <label className="block text-slate-300 text-sm font-medium mb-2">Business / Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Sharma Steel Traders Pvt Ltd"
                  autoFocus
                  className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#D4AF37]/60"
                />
              </div>

              <div className="mb-8">
                <label className="block text-slate-300 text-sm font-medium mb-3">
                  {role === 'BUYER' ? 'What do you typically source?' : 'What do you supply?'}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {BUYER_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat === category ? '' : cat)}
                      className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${category === cat ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-slate-700/20 border-slate-700/40 text-slate-400 hover:border-slate-500'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 border border-slate-600 text-slate-400 hover:text-white py-3.5 rounded-xl text-sm transition-colors">
                  Skip for now
                </button>
                <button onClick={handleStep2} disabled={saving}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#c4a030] disabled:opacity-40 text-[#001f3f] font-bold py-3.5 rounded-xl text-sm transition-colors">
                  {saving ? 'Saving…' : 'Continue →'}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Done + first action */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <h2 className="text-white font-bold text-xl mb-2">You're all set, {user?.name?.split(' ')[0]}!</h2>
                <p className="text-slate-400 text-sm">Your VyaparSethu account is ready. Here's your first action:</p>
              </div>

              {role === 'BUYER' ? (
                <div className="space-y-3 mb-8">
                  <ActionCard
                    icon="📋" title="Post a Requirement — Free"
                    sub="Describe what you need. Verified suppliers quote in 24h."
                    onClick={() => router.push('/rfq/create')}
                    primary
                  />
                  <ActionCard
                    icon="🔍" title="Browse Suppliers by City"
                    sub="Find verified suppliers in Kalamboli, Bhiwandi, Surat & more."
                    onClick={() => router.push('/suppliers')}
                  />
                  <ActionCard
                    icon="🎤" title="Speak Your Requirement (90 sec)"
                    sub="Talk in Hindi or English — AI extracts the specs automatically."
                    onClick={() => router.push('/voice-rfq')}
                  />
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  <ActionCard
                    icon="🏭" title="Complete Your Supplier Profile"
                    sub="Add GSTIN, categories, and business details to get verified."
                    onClick={() => router.push('/dashboard?tab=supplier')}
                    primary
                  />
                  <ActionCard
                    icon="📋" title="Browse Active Requirements"
                    sub="See what buyers are sourcing right now in your category."
                    onClick={() => router.push('/marketplace')}
                  />
                </div>
              )}

              <button onClick={handleFinish}
                className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-bold py-3.5 rounded-xl text-sm transition-colors">
                {role === 'BUYER' ? 'Post My First Requirement →' : 'Complete My Profile →'}
              </button>
            </>
          )}
        </div>

        {/* Skip entirely */}
        {step < 3 && (
          <button onClick={() => router.push('/dashboard')} className="w-full text-slate-500 hover:text-slate-400 text-sm py-3 mt-2 transition-colors">
            Skip for now → go to dashboard
          </button>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, sub, onClick, primary }: { icon: string; title: string; sub: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-start gap-4 px-5 py-4 rounded-xl border transition-colors ${primary ? 'bg-[#001f3f] border-[#D4AF37]/30 hover:border-[#D4AF37]/60' : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600'}`}>
      <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className="text-white font-semibold text-sm">{title}</div>
        <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
      </div>
    </button>
  );
}
