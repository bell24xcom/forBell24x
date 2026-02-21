'use client';

/**
 * LaunchBanner — shown site-wide when NEXT_PUBLIC_LAUNCH_MODE=true
 * Displayed as a slim top bar: "🚀 Mumbai Pilot Phase — Controlled Live Test"
 */
export default function LaunchBanner() {
  const launchCity     = process.env.NEXT_PUBLIC_LAUNCH_CITY     || 'Mumbai';
  const launchCategory = process.env.NEXT_PUBLIC_LAUNCH_CATEGORY || '';

  return (
    <div className="w-full bg-amber-500 text-amber-950 text-center text-xs font-semibold py-1.5 px-4 z-50">
      🚀 <span className="font-bold">Pilot Phase — {launchCity}</span>
      {launchCategory && <span> · {launchCategory} category</span>}
      {' '}— Controlled live test. Invite only.
    </div>
  );
}
