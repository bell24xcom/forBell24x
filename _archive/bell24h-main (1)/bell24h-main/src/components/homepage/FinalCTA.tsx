"use client";

import { Mic, Video, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="bg-blue-600 py-24 md:py-32">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to Transform Your Procurement?</h2>
        <p className="text-xl md:text-2xl text-white/90 mb-16 max-w-4xl mx-auto">Join thousands of businesses using Bell24h for faster, smarter B2B transactions</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link href="/rfq/voice" className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all inline-flex items-center gap-3 text-lg">
            <Mic className="w-6 h-6" />
            Try Voice RFQ
          </Link>
          <Link href="/rfq/video" className="px-10 py-5 bg-white/10 text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transition-all inline-flex items-center gap-3 text-lg">
            <Video className="w-6 h-6" />
            Try Video RFQ
          </Link>
          <Link href="/rfq/create" className="px-10 py-5 bg-white/10 text-white border-2 border-white rounded-xl font-bold hover:bg-white/20 transition-all inline-flex items-center gap-3 text-lg">
            <FileText className="w-6 h-6" />
            Try Text RFQ
          </Link>
        </div>
        <div className="flex items-center justify-center gap-3 text-white/80 text-xl mb-12">
          <span>or</span>
          <Link href="/auth/register" className="font-bold hover:text-white inline-flex items-center gap-2 underline underline-offset-4">
            Sign up for free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-white/60 text-lg">No credit card required • Free to start • Cancel anytime</div>
      </div>
    </section>
  );
}
