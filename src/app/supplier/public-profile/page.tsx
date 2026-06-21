'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  Building2, MapPin, Shield, Star, Package, Phone, Mail,
  Globe, CheckCircle, Award, Users, Calendar, Eye
} from 'lucide-react';
import TrustScore from '@/components/ui/TrustScore';
import WhatsAppShare from '@/components/ui/WhatsAppShare';

interface ProfileData {
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  gstNumber: string;
  udyamNumber: string;
  isVerified: boolean;
  trustScore: number;
  role: string;
  plan: string;
  createdAt: string;
  preferences: {
    categories?: string[];
    cities?: string[];
  } | null;
  _count: {
    rfqs: number;
    quotes: number;
  };
}

export default function PublicProfilePreview() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteStats, setQuoteStats] = useState({ won: 0, total: 0, trustScore: 0, gstVerified: false, profileComplete: 0, responseRate: 0, dealsCompleted: 0 });

  useEffect(() => {
    fetchProfile();
    fetchQuoteStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuoteStats = async () => {
    try {
      const res = await fetch('/api/supplier/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setQuoteStats({
          won: data.stats.wonQuotes,
          total: data.stats.totalQuotes,
          trustScore: data.stats.trustScore ?? 0,
          gstVerified: data.stats.gstVerified ?? false,
          profileComplete: data.stats.profileComplete ?? 0,
          responseRate: data.stats.responseRateNum ?? 0,
          dealsCompleted: data.stats.dealsCompleted ?? 0,
        });
      }
    } catch {}
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">Could not load profile. Please log in again.</p>
        </div>
      </DashboardLayout>
    );
  }

  const trustScore = profile.trustScore || 0;
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
          ← Back
        </button>

        {/* Preview Banner */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-blue-300 font-medium">Public Profile Preview</p>
            <p className="text-blue-400/70 text-sm">This is how buyers see your profile on Bell24h</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <WhatsAppShare
              rfqTitle={`Supplier: ${profile.company || profile.name}`}
              rfqId={`supplier/profile`}
              category={profile.preferences?.categories?.[0]}
              location={profile.location}
              size="sm"
            />
            <button
              onClick={() => router.push('/supplier/profile/edit')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Company Header Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-700 to-purple-700"></div>
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 bg-slate-900 border-4 border-slate-800 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                {profile.company?.[0]?.toUpperCase() || profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 pt-14">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{profile.company || profile.name || 'Company Name'}</h1>
                  {profile.isVerified && (
                    <span className="flex items-center gap-1 bg-green-900/40 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium border border-green-800">
                      <Shield className="w-3 h-3" /> GST Verified
                    </span>
                  )}
                </div>
                {profile.name && profile.company && (
                  <p className="text-slate-400 text-sm mt-1">{profile.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-white">{profile.gstVerified ? 'GST Verified' : 'Verification Pending'}</p>
            <p className="text-slate-400 text-xs">Identity Status</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{quoteStats.won}</p>
            <p className="text-slate-400 text-xs">Quotes Won</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{quoteStats.total}</p>
            <p className="text-slate-400 text-xs">Total Quotes</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm font-bold text-white">{memberSince}</p>
            <p className="text-slate-400 text-xs">Member Since</p>
          </div>
        </div>

        {/* Full Trust Score */}
        <TrustScore
          score={quoteStats.trustScore || trustScore}
          gstVerified={quoteStats.gstVerified || !!profile.gstNumber}
          profileComplete={quoteStats.profileComplete}
          responseRate={quoteStats.responseRate}
          dealsCompleted={quoteStats.dealsCompleted}
        />

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Business Details
            </h3>
            <div className="space-y-3 text-sm">
              {profile.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">{profile.location}</span>
                </div>
              )}
              {profile.gstNumber && (
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs">GST: </span>
                    <span className="text-slate-300 font-mono">{profile.gstNumber}</span>
                  </div>
                </div>
              )}
              {profile.udyamNumber && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs">Udyam: </span>
                    <span className="text-slate-300 font-mono">{profile.udyamNumber}</span>
                  </div>
                </div>
              )}
              {profile.plan && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">Plan: {profile.plan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" /> Contact
            </h3>
            <div className="space-y-3 text-sm">
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">{profile.phone}</span>
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300">{profile.email}</span>
                </div>
              )}
            </div>

            {/* CTA for buyers */}
            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-800 rounded-lg">
              <p className="text-emerald-400 text-sm font-medium mb-2">Buyers see this button:</p>
              <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold text-sm cursor-default">
                Request Quote from {profile.company || 'this Supplier'}
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        {profile.preferences?.categories && profile.preferences.categories.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" /> Categories Served
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.categories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-800">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cities */}
        {profile.preferences?.cities && profile.preferences.cities.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" /> Delivery Locations
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.cities.map(city => (
                <span key={city} className="px-3 py-1.5 bg-green-900/30 text-green-300 rounded-full text-sm border border-green-800">
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Completeness Tip */}
        {(!profile.gstNumber || !profile.location || !profile.company) && (
          <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-6">
            <h3 className="text-amber-300 font-semibold mb-2">Complete your profile to attract more buyers</h3>
            <ul className="text-amber-400/80 text-sm space-y-1">
              {!profile.company && <li>- Add your company name</li>}
              {!profile.gstNumber && <li>- Verify your GST number</li>}
              {!profile.location && <li>- Add your location/city</li>}
              {(!profile.preferences?.categories || profile.preferences.categories.length === 0) && <li>- Select categories you serve</li>}
            </ul>
            <button
              onClick={() => router.push('/supplier/profile/edit')}
              className="mt-4 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
