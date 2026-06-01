'use client';

import { Rocket, MapPin } from 'lucide-react';

export default function TrustIndicators() {
  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-cyan-600 dark:text-cyan-300 text-sm font-bold mb-4">
            <Rocket className="w-4 h-4" />
            Launching Soon — Reserve your category
          </div>
          <p className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-base">
            <MapPin className="w-4 h-4 text-cyan-500" />
            Currently onboarding: Mumbai-Kalamboli-Bhiwandi cluster
          </p>
        </div>
      </div>
    </section>
  );
}
