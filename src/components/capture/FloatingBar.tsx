'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/app/contexts/AuthContext';
import { trackEngagement, getEngagement } from '@/src/lib/intent';

// Context-aware copy per page type
function getBarCopy(pathname: string): { headline: string; sub: string; intentLabel: string } {
  if (pathname.includes('/suppliers/') && pathname.split('/').length === 4) {
    const city = pathname.split('/')[2];
    const cat = pathname.split('/')[3];
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    const catName = cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      headline: `Get Free ${catName} Quotes from ${cityName}`,
      sub: 'Verified suppliers · 24h response · Protected Payment',
      intentLabel: `Get ${catName} Quotes from ${cityName} Suppliers`,
    };
  }
  if (pathname.startsWith('/suppliers/')) {
    const city = pathname.split('/')[2];
    const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : '';
    return {
      headline: `Source from ${cityName} Suppliers — Free`,
      sub: '3+ quotes · Verified · Protected Payment',
      intentLabel: `Source from ${cityName} Suppliers`,
    };
  }
  if (pathname.startsWith('/blog/')) {
    return {
      headline: 'Get Supplier Quotes for This Category',
      sub: 'Post a Requirement free — 3+ verified suppliers quote in 24h',
      intentLabel: 'Get Free Supplier Quotes',
    };
  }
  if (pathname.startsWith('/tools/')) {
    return {
      headline: 'Find Verified Suppliers — Free',
      sub: 'Post your Requirement in 90 seconds · Protected Payment',
      intentLabel: 'Find Verified Suppliers',
    };
  }
  if (pathname.startsWith('/faq') || pathname.startsWith('/compare')) {
    return {
      headline: 'Ready to Source Safely?',
      sub: 'Post a Requirement free · Quotes in 24h · Protected Payment',
      intentLabel: 'Start Sourcing on VyaparSethu',
    };
  }
  return {
    headline: 'Source from Verified Indian Suppliers',
    sub: 'Free · 24h Quotes · Protected Payment',
    intentLabel: 'Get Free Supplier Quotes',
  };
}

export default function FloatingBar() {
  const { isAuthenticated, openCaptureModal } = useAuth();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show on auth, dashboard, onboarding pages
    const hidePaths = ['/dashboard', '/onboarding', '/auth', '/login', '/signup', '/admin'];
    if (hidePaths.some(p => pathname.startsWith(p))) return;
    if (isAuthenticated || dismissed) return;

    trackEngagement({
      lastCategory: pathname.includes('/suppliers/') ? pathname.split('/')[3] : undefined,
      lastCity: pathname.includes('/suppliers/') ? pathname.split('/')[2] : undefined,
    });

    // Check returning visitor — show immediately
    const eng = getEngagement();
    if (eng && eng.pagesViewed > 1) {
      setVisible(true);
      return;
    }

    // First visit: show after 35 seconds OR 60% scroll
    const timer = setTimeout(() => setVisible(true), 35000);

    const onScroll = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.6) { setVisible(true); clearTimeout(timer); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [pathname, isAuthenticated, dismissed]);

  if (isAuthenticated || !visible || dismissed) return null;

  const { headline, sub, intentLabel } = getBarCopy(pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="max-w-2xl mx-auto bg-[#001f3f] border border-[#D4AF37]/40 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-snug truncate">{headline}</p>
          <p className="text-slate-400 text-xs mt-0.5 hidden sm:block">{sub}</p>
        </div>
        <button
          onClick={() => openCaptureModal({ action: 'post-rfq', label: intentLabel })}
          className="shrink-0 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          Start Free →
        </button>
        <button
          onClick={() => { setDismissed(true); setVisible(false); }}
          className="shrink-0 text-slate-500 hover:text-slate-300 text-lg leading-none ml-1"
          aria-label="Dismiss"
        >×</button>
      </div>
    </div>
  );
}
