'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { GuestRFQManager, GuestRFQ } from '@/lib/rfq/GuestRFQManager';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const GuestBanner: React.FC = () => {
  const [guestRfqs, setGuestRfqs] = useState<GuestRFQ[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rfqs = GuestRFQManager.getGuestRFQs();
    if (rfqs.length > 0) {
      setGuestRfqs(rfqs);
      setIsVisible(true);
      fetchInsights(rfqs[0]);
    }
  }, []);

  const fetchInsights = async (rfq: GuestRFQ) => {
    setLoading(true);
    try {
      // Trigger Agent Zero scouting (Test Mode)
      const res = await fetch('/api/rfq/guest-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(GuestRFQManager.getGuestRFQs().map(r => r.id === rfq.id ? r : null)[0]) // Simple extraction
      });
      const data = await res.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (e) {
      console.error('Failed to fetch guest insights:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || guestRfqs.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg mb-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm relative">
            <Sparkles className={`w-6 h-6 text-yellow-300 ${loading ? 'animate-pulse' : ''}`} />
            {loading && (
              <div className="absolute inset-0 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {insights 
                ? `Agent Zero found ${insights.foundSuppliers} matching suppliers!` 
                : `Analyzing your ${guestRfqs[0].category} request...`
              }
            </h3>
            <p className="text-white/80 text-sm">
              {insights 
                ? `Ready to negotiate for your requirement in ${guestRfqs[0].city}. Sign up to unlock quotes.` 
                : `Agent Zero is scouting manufacturers in ${guestRfqs[0].city} to find you the best price.`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/auth/signup?callback=/dashboard&guest=true" className="flex-1 md:flex-none">
            <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 font-bold border-none shadow-md">
              Unlock {insights ? insights.foundSuppliers : ''} Quotes <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
