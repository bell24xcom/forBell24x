'use client';
import { useState, useEffect } from 'react';

type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'vyaparsethu_cookie_consent_v1';

function loadConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  // localStorage persists across sessions; sessionStorage covers incognito (tab-scoped)
  // and browsers that block localStorage in strict privacy mode.
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

function saveConsent(state: ConsentState) {
  const json = JSON.stringify(state);
  // Write to both: localStorage for persistence, sessionStorage as incognito fallback.
  try { localStorage.setItem(STORAGE_KEY, json); } catch { /* blocked in strict privacy mode */ }
  try { sessionStorage.setItem(STORAGE_KEY, json); } catch { /* last resort */ }
  // Persist server-side (fire-and-forget)
  fetch('/api/compliance/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose: 'cookie_consent',
      method: 'cookie_banner',
      granted: state.analytics || state.marketing,
      meta: state,
    }),
  }).catch(() => {});
}

export default function CookieBanner() {
  const [show, setShow]         = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs]       = useState<ConsentState>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    if (!loadConsent()) setShow(true);
  }, []);

  if (!show) return null;

  const accept = (all: boolean) => {
    const state: ConsentState = { essential: true, analytics: all, marketing: all };
    saveConsent(state);
    setShow(false);
  };

  const saveCustom = () => {
    saveConsent(prefs);
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-900 border-t border-slate-700/60 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {!customize ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-slate-300 text-sm flex-1">
              We use cookies to operate the platform and, with your consent, to understand usage patterns.
              No tracking cookies are set until you accept.{' '}
              <a href="/cookies" className="text-indigo-400 hover:underline">Cookie Policy</a>
            </p>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => setCustomize(true)}
                className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 hover:border-slate-400 rounded-lg transition-colors"
              >
                Customize
              </button>
              <button
                onClick={() => accept(false)}
                className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 hover:border-slate-400 rounded-lg transition-colors"
              >
                Reject Optional
              </button>
              <button
                onClick={() => accept(true)}
                className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white font-semibold text-sm">Cookie Preferences</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex items-start gap-2 opacity-60">
                <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-white text-sm font-medium">Essential</p>
                  <p className="text-slate-400 text-xs">Always active — required for login, OTP, and payments.</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))}
                  className="mt-0.5 h-4 w-4"
                />
                <div>
                  <p className="text-white text-sm font-medium">Analytics</p>
                  <p className="text-slate-400 text-xs">Page views and usage patterns (no personal data sold).</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))}
                  className="mt-0.5 h-4 w-4"
                />
                <div>
                  <p className="text-white text-sm font-medium">Marketing</p>
                  <p className="text-slate-400 text-xs">Personalised outreach relevant to your trade category.</p>
                </div>
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveCustom} className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors">
                Save Preferences
              </button>
              <button onClick={() => setCustomize(false)} className="px-3 py-1.5 text-sm border border-slate-600 text-slate-300 rounded-lg">
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
