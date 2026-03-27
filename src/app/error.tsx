'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[Bell24h Error]', error.message, error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
      <div className="text-center max-w-md px-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">We're working on fixing this. Please try again.</p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
