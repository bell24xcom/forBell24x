'use client';

import { useEffect, useState } from 'react';
import { User, Building2, MapPin, CheckCircle, Save } from 'lucide-react';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
  'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik',
  'Coimbatore', 'Rajkot', 'Meerut', 'Faridabad', 'Ghaziabad', 'Gurugram', 'Noida',
];

const B2B_CATEGORIES = [
  'Steel & Metals', 'Textiles & Apparel', 'Electronics & Electrical', 'Construction Materials',
  'Chemicals & Pharmaceuticals', 'Machinery & Equipment', 'Packaging & Printing',
  'Automotive & Components', 'Food & Beverages', 'Agricultural Products',
  'Plastics & Rubber', 'Paper & Wood', 'Minerals & Mining', 'Furniture & Fixtures',
  'IT Hardware & Software',
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  gstNumber: string;
  location: string;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  preferences: {
    categories?: string[];
    cities?: string[];
    [key: string]: unknown;
  } | null;
  _count: { rfqs: number; quotes: number };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: '', company: '', gstNumber: '', location: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success) {
        const u: UserProfile = data.user;
        setProfile(u);
        setForm({
          name: u.name || '',
          company: u.company || '',
          gstNumber: u.gstNumber || '',
          location: u.location || '',
        });
        setSelectedCategories(u.preferences?.categories ?? []);
        setSelectedCities(u.preferences?.cities ?? []);
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preferences: {
            ...profile?.preferences,
            categories: selectedCategories,
            cities: selectedCities,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...data.user } : data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function toggleCity(city: string) {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'matching', label: 'Supplier Matching', icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <div className="bg-slate-800/60 border-b border-slate-700/50 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.name || 'Your Profile'}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-400 text-sm">{profile?.company || 'No company set'}</span>
                {profile?.isVerified && (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-300">{profile?._count.rfqs ?? 0}</div>
              <div className="text-slate-400 text-xs">RFQs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-300">{profile?._count.quotes ?? 0}</div>
              <div className="text-slate-400 text-xs">Quotes Submitted</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={saveProfile}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-slate-800 rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={form.gstNumber}
                    onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location / City</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email (read-only)</label>
                  <input
                    type="text"
                    value={profile?.email || '—'}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone (read-only)</label>
                  <input
                    type="text"
                    value={profile?.phone || '—'}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supplier Matching Tab */}
          {activeTab === 'matching' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="font-semibold mb-1">Categories You Supply</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Select the categories you can fulfill. RFQs in these categories will be matched to you.
                </p>
                <div className="flex flex-wrap gap-2">
                  {B2B_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategories.includes(cat)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="font-semibold mb-1">Cities You Serve</h2>
                <p className="text-slate-400 text-sm mb-4">
                  Select cities where you can deliver. Local matches get priority in RFQ notifications.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_CITIES.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCities.includes(city)
                          ? 'bg-green-700 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                {selectedCities.length > 0 && (
                  <p className="text-green-400 text-xs mt-3">{selectedCities.length} cities selected</p>
                )}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
