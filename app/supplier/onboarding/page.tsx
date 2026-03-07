'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Steel & Metals', 'Industrial Machinery', 'Packaging & Printing',
  'Electrical & Electronics', 'Chemicals & Pharma', 'Textiles & Apparel',
  'Construction Materials', 'Auto Parts & Components', 'Plastics & Rubber',
  'Office Supplies & Furniture', 'Food Processing Equipment', 'Paper & Stationery',
  'Agricultural Products', 'Glass & Ceramics', 'Wood & Timber',
  'Leather & Footwear', 'Optical & Instruments', 'Sporting Goods',
  'Medical Equipment', 'IT & Electronics',
];

const BUSINESS_TYPES = ['Manufacturer', 'Distributor', 'Trader', 'Service Provider', 'Wholesaler'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

interface StepIndicatorProps {
  current: number;
  total: number;
}

function StepIndicator({ current, total }: StepIndicatorProps) {
  const labels = ['Business Details', 'Categories & Location', 'Company Description'];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className={`flex items-center gap-2 ${i < labels.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                i + 1 < current ? 'bg-green-500 text-white'
                : i + 1 === current ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-400'
              }`}>
                {i + 1 < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i + 1 === current ? 'text-white' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 ${i + 1 < current ? 'bg-green-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 data
  const [company, setCompany] = useState('');
  const [businessType, setBusinessType] = useState('Manufacturer');
  const [gstNumber, setGstNumber] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [gstError, setGstError] = useState('');

  // Step 2 data
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState('');

  // Step 3 data
  const [description, setDescription] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const verifyGST = async () => {
    if (!gstNumber || gstNumber.length !== 15) {
      setGstError('GST number must be 15 characters');
      return;
    }
    setGstError('');
    try {
      const res = await fetch('/api/gst/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: gstNumber }),
      });
      const data = await res.json();
      if (data.success || data.verified) {
        setGstVerified(true);
        if (data.companyName && !company) setCompany(data.companyName);
        setGstError('');
      } else {
        setGstError('Could not verify GST number — it will be marked as self-reported');
        setGstVerified(false);
      }
    } catch {
      setGstError('Verification failed — will be saved as self-reported');
    }
  };

  const generateDescription = async () => {
    if (!company || selectedCategories.length === 0) {
      setError('Please complete Steps 1 & 2 before generating a description.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/sparkle', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write a professional 3-sentence B2B company description for "${company}", a ${businessType} specializing in ${selectedCategories.slice(0, 3).join(', ')} based in ${city || 'India'}. Keep it factual, professional, and under 150 words.`,
        }),
      });
      const data = await res.json();
      if (data.result || data.text || data.content) {
        setDescription(data.result || data.text || data.content);
      }
    } catch {
      // Fallback description
      setDescription(`${company} is a ${businessType.toLowerCase()} specializing in ${selectedCategories.slice(0, 2).join(' and ')}. We offer quality products with reliable delivery across India. Contact us for competitive quotes on your procurement requirements.`);
    } finally {
      setAiLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!company.trim()) { setError('Company name is required'); return; }
    }
    if (step === 2) {
      if (selectedCategories.length === 0) { setError('Select at least one category'); return; }
      if (!city.trim()) { setError('City is required'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (description.trim().length < 30) {
      setError('Please write at least 30 characters for the description');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/supplier/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          businessType,
          gstNumber: gstNumber || null,
          gstVerified,
          udyamNumber: udyamNumber || null,
          yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
          categories: selectedCategories,
          city,
          state,
          pinCode: pinCode || null,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard?onboarded=1');
      } else {
        setError(data.error || 'Failed to save. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔔</div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Supplier Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Takes 2 minutes — helps buyers find and trust you</p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Business Details</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name *</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Patel Steel Industries Pvt Ltd"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBusinessType(bt)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      businessType === bt
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                GST Number
                <span className="ml-2 text-xs text-indigo-400">→ Get Verified ✓ badge</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => { setGstNumber(e.target.value.toUpperCase()); setGstVerified(false); }}
                  placeholder="27AAAPP9753F2ZF"
                  maxLength={15}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={verifyGST}
                  disabled={!gstNumber || gstNumber.length !== 15}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Verify
                </button>
              </div>
              {gstVerified && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> GST verified successfully
                </p>
              )}
              {gstError && <p className="text-amber-400 text-xs mt-1">{gstError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Udyam Number</label>
                <input
                  type="text"
                  value={udyamNumber}
                  onChange={e => setUdyamNumber(e.target.value.toUpperCase())}
                  placeholder="UDYAM-MH-00-0000000"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Years in Business</label>
                <input
                  type="number"
                  value={yearsInBusiness}
                  onChange={e => setYearsInBusiness(e.target.value)}
                  placeholder="e.g. 8"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Categories & Location */}
        {step === 2 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Categories & Location</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product Categories *
                <span className="ml-2 text-xs text-slate-500">({selectedCategories.length} selected)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-2 rounded-lg text-xs text-left font-medium transition-colors ${
                      selectedCategories.includes(cat)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">State *</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Pin Code</label>
              <input
                type="text"
                value={pinCode}
                onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="400001"
                maxLength={6}
                className="w-48 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Company Description</h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Tell buyers about your business *
                </label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 rounded-lg hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI Generate ✨
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your business — what you manufacture/supply, your quality standards, delivery capability, certifications, etc."
                rows={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">{description.length} characters (min 30)</p>
            </div>

            {/* Summary */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 text-sm space-y-1.5">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Your Profile Summary</p>
              <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Company:</span><span className="text-white">{company}</span></div>
              <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Type:</span><span className="text-slate-300">{businessType}</span></div>
              <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Location:</span><span className="text-slate-300">{city}, {state}</span></div>
              <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">Categories:</span><span className="text-slate-300">{selectedCategories.length} selected</span></div>
              {gstVerified && <div className="flex gap-2"><span className="text-slate-500 w-28 shrink-0">GST:</span><span className="text-green-400">✓ Verified</span></div>}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors min-h-[44px]"
            >
              ← Back
            </button>
          )}

          <button
            type="button"
            onClick={step < 3 ? nextStep : handleSubmit}
            disabled={saving || aiLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors min-h-[44px]"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : step < 3 ? (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Complete Setup</>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-slate-500 hover:text-slate-400 underline transition-colors"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
