// Intent storage — persists what the user was trying to do before login,
// so we can resume exactly there after OTP verification.

export interface CaptureIntent {
  action: 'post-rfq' | 'contact-supplier' | 'browse' | 'supplier-claim' | 'save-tool';
  label: string;        // shown inside the modal headline
  redirectTo?: string;  // URL to push after login
  category?: string;
  city?: string;
  supplierId?: string;
}

const INTENT_KEY = 'vyapar_intent';
const ENGAGEMENT_KEY = 'vyapar_engagement';

export function saveIntent(intent: CaptureIntent) {
  try { localStorage.setItem(INTENT_KEY, JSON.stringify(intent)); } catch { /* ignore */ }
}

export function loadIntent(): CaptureIntent | null {
  try {
    const raw = localStorage.getItem(INTENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearIntent() {
  try { localStorage.removeItem(INTENT_KEY); } catch { /* ignore */ }
}

// Track engagement signals: pages seen, time spent, category interest
export interface Engagement {
  pagesViewed: number;
  lastCategory?: string;
  lastCity?: string;
  firstVisit: number;
  returningVisitor: boolean;
}

export function trackEngagement(update: Partial<Engagement>) {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_KEY);
    const current: Engagement = raw ? JSON.parse(raw) : { pagesViewed: 0, firstVisit: Date.now(), returningVisitor: false };
    const next = { ...current, ...update, pagesViewed: (current.pagesViewed || 0) + 1 };
    localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(next));
    return next;
  } catch { return null; }
}

export function getEngagement(): Engagement | null {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
