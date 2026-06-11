'use client';
import { useState } from 'react';

export default function DraftBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-amber-900/80 border-b border-amber-600/50 px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-amber-200 font-medium">
        ⚠ Draft — pending advocate review. Do not treat as final legal advice.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-200 font-bold text-lg leading-none flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
