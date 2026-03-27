'use client';

import { Mic, Video, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="bg-[#0a1128] border-t border-white/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Procurement?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
          Join thousands of businesses using Bell24h for faster, smarter B2B transactions
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          <Link 
            href="/rfq/voice"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 inline-flex items-center gap-2 transition-colors shadow-lg"
          >
            <Mic className="w-5 h-5" />
            Try Voice RFQ
          </Link>
          
          <Link 
            href="/rfq/video"
            className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-lg font-bold hover:bg-white/20 inline-flex items-center gap-2 transition-colors backdrop-blur-sm"
          >
            <Video className="w-5 h-5" />
            Try Video RFQ
          </Link>
          
          <Link 
            href="/rfq/create"
            className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-lg font-bold hover:bg-white/20 inline-flex items-center gap-2 transition-colors backdrop-blur-sm"
          >
            <FileText className="w-5 h-5" />
            Try Text RFQ
          </Link>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-white/80 text-lg">
          <span>or</span>
          <Link 
            href="/auth/register"
            className="font-medium hover:text-white inline-flex items-center gap-1 underline underline-offset-4"
          >
            Sign up for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="mt-8 text-white/60 text-sm">
          No credit card required • Free to start • Cancel anytime
        </div>
      </div>
    </section>
  );
}
