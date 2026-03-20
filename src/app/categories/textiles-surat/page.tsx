'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileText, Building2, MapPin, Shield, Star, CheckCircle, ShoppingCart, Mic, Video, X } from 'lucide-react';
import { VideoRFQ } from '@/components/rfq/VideoRFQ';
import { GuestRFQManager } from '@/lib/rfq/GuestRFQManager';

const Page = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const category = "Textiles";
  const city = "Surat";
  const cityLocal = "Surat";

  const handleVideoComplete = (blob: Blob, metadata: any) => {
    // Save to guest storage for "Try Without Login" flow
    GuestRFQManager.saveGuestRFQ({
      type: 'video',
      category,
      city,
      data: {
        blobSize: blob.size,
        metadata
      }
    });
    // In a real flow, we'd also trigger an upload to Cloudinary here
  };

  const h1 = `${category} Suppliers & Manufacturers in ${city} | Bell24h`;
  const metaDescription = `Find top ${category} suppliers and manufacturers in ${city}. Connect with verified businesses for bulk export and domestic needs on Bell24h. Post your RFQ today!`;
  const intro = `Explore a vast network of ${category.toLowerCase()} suppliers and manufacturers in ${city}, famously known as India's textile capital. Surat is a global powerhouse for textile production, offering everything from raw materials to finished garments. Bell24h connects you with Surat's finest businesses, renowned for their quality craftsmanship and competitive pricing, serving both domestic Indian markets and international export demands. Discover the heart of India's ${category.toLowerCase()} industry and fulfill your sourcing needs efficiently on our B2B platform.`;
  const productTypes = [
    "Polyester Fabrics",
    "Cotton Textiles",
    "Denim",
    "Silk Sarees",
    "Embroidery Work"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Meta description placeholder */}
      <title>{h1}</title>
      <meta name="description" content={metaDescription} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Content Area */}
        <main className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden p-8">

          {/* H1 Title */}
          <h1 className="text-4xl font-extrabold text-white mb-4">{h1}</h1>
          <p className="text-slate-300 mb-8">{metaDescription}</p>

          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">About {category} Suppliers in {city}</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {intro}
            </p>
          </section>

          {/* Top Local Product Types */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Top Local {category} Products in {city}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productTypes.map((product, index) => (
                <li key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{product}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Why use Bell24h? Section */}
          <section className="mb-10 bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" /> Why use Bell24h for {category}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-400" /> Voice RFQs
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Quickly articulate your specific needs for {category} products via voice. Our AI transcribes and analyzes your request, ensuring clarity and speed, perfect for urgent requirements in busy markets like Surat.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-400" /> Video RFQs
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  Showcase intricate {category} product specifications or quality standards visually. Video RFQs provide unparalleled clarity, reducing miscommunication and speeding up the sourcing process for export-ready goods.
                </p>
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" /> Try Video RFQ
                </button>
              </div>
            </div>
          </section>

          {/* Video RFQ Modal */}
          {showVideoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
                <VideoRFQ 
                  category={category} 
                  city={city} 
                  onCancel={() => setShowVideoModal(false)}
                  onComplete={handleVideoComplete}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <section className="text-center">
            <Link
              href="/voice-rfq"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 text-lg min-h-[44px] flex items-center justify-center"
            >
              Post your {category} RFQ now — free
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Page;
