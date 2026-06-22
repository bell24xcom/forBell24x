'use client';

import { MapPin } from 'lucide-react';

export default function TrustIndicators() {
  return (
    <section className="bg-[#0a1128] border-b border-white/10">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-cyan-300 text-sm font-bold mb-4">
            <MapPin className="w-4 h-4" />
            Live in Mumbai · Bhiwandi · Kalamboli
          </div>
          <p className="text-gray-400 text-base">
            Verified suppliers and buyers actively trading across Maharashtra
          </p>
        </div>
      </div>
    </section>
  );
}
