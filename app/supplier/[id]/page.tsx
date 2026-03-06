'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, MapPin, Shield, Package, Calendar, Award, Star, CheckCircle } from 'lucide-react';
import TrustScore from '@/components/ui/TrustScore';
import WhatsAppShare from '@/components/ui/WhatsAppShare';

interface SupplierData {
  id: string;
  name: string;
  company: string;
  location: string;
  gstVerified: boolean;
  trustScore: number;
  profileComplete: number;
  responseRate: number;
  dealsCompleted: number;
  wonQuotes: number;
  totalQuotes: number;
  createdAt: string;
  preferences: {
    categories: string[];
    cities: string[];
  };
}

export default function PublicSupplierPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/supplier/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setSupplier(data.supplier);
        else setError(data.error || 'Supplier not found');
      })
      .catch(() => setError('Failed to load supplier profile'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">{error || 'Supplier not found'}</p>
          <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300 text-sm">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const memberSince = new Date(supplier.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const displayName = supplier.company || supplier.name || 'Supplier';
  const initials = displayName[0]?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6">
          ← Back
        </button>
      </div>

      {/* Company Header */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-700 to-purple-700"></div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-5 flex-wrap">
              <div className="w-24 h-24 bg-slate-900 border-4 border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 pt-14">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                  {supplier.gstVerified && (
                    <span className="flex items-center gap-1 bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium border border-green-800">
                      <Shield className="w-3 h-3" /> GST Verified
                    </span>
                  )}
                </div>
                {supplier.name && supplier.company && (
                  <p className="text-slate-400 text-sm mt-1">{supplier.name}</p>
                )}
                {supplier.location && (
                  <p className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {supplier.location}
                  </p>
                )}
              </div>
              {/* Share button */}
              <div className="pt-14">
                <WhatsAppShare
                  rfqTitle={`Supplier Profile: ${displayName}`}
                  rfqId={`supplier/${supplier.id}`}
                  category={supplier.preferences.categories[0]}
                  location={supplier.location}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{supplier.trustScore}</p>
            <p className="text-slate-400 text-xs">Trust Score</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <Award className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{supplier.wonQuotes}</p>
            <p className="text-slate-400 text-xs">Quotes Won</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <CheckCircle className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{supplier.dealsCompleted}</p>
            <p className="text-slate-400 text-xs">Deals Done</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">{memberSince}</p>
            <p className="text-slate-400 text-xs">Member Since</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Trust Score full view */}
          <div className="md:col-span-2">
            <TrustScore
              score={supplier.trustScore}
              gstVerified={supplier.gstVerified}
              profileComplete={supplier.profileComplete}
              responseRate={supplier.responseRate}
              dealsCompleted={supplier.dealsCompleted}
            />
          </div>

          {/* CTA Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> Request Quote
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Need products or services from {displayName}? Post an RFQ and they'll submit a competitive quote.
              </p>
              <Link
                href="/rfq/create"
                className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg font-semibold text-sm transition-colors min-h-[44px] flex items-center justify-center"
              >
                Request Quote from {displayName.split(' ')[0]}
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        {supplier.preferences.categories.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" /> Categories Served
            </h3>
            <div className="flex flex-wrap gap-2">
              {supplier.preferences.categories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Locations */}
        {supplier.preferences.cities.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" /> Delivery Locations
            </h3>
            <div className="flex flex-wrap gap-2">
              {supplier.preferences.cities.map(city => (
                <span key={city} className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-full text-sm border border-green-800">
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
