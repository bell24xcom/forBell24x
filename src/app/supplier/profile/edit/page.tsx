'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, MapPin, Shield, Star, Package, Phone, Mail,
  Camera, ChevronDown, X, Plus, CheckCircle, AlertCircle
} from 'lucide-react';

const B2B_CATEGORIES = [
  'Steel & Metals', 'Textiles & Apparel', 'Electronics & Electrical', 'Construction Materials',
  'Chemicals & Pharmaceuticals', 'Machinery & Equipment', 'Packaging & Printing',
  'Automotive & Components', 'Food & Beverages', 'Agricultural Products',
  'Plastics & Rubber', 'Paper & Wood', 'Minerals & Mining', 'Furniture & Fixtures',
  'IT Hardware & Software', 'Medical Equipment', 'Leather & Footwear', 'Gems & Jewellery',
  'Sports & Fitness', 'Home & Garden',
];

const BUSINESS_TYPES = ['Manufacturer', 'Distributor', 'Trader', 'Service Provider', 'Wholesaler'];
const EMPLOYEE_RANGES = ['1-10', '11-50', '51-200', '200+'];
const REVENUE_RANGES = ['Below 50L', '50L - 1Cr', '1Cr - 5Cr', '5Cr - 10Cr', '10Cr+'];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstStatus, setGstStatus] = useState<{ msg: string; type: 'success' | 'warn' | 'error' } | null>(null);

  const handleGstVerify = async () => {
    const gst = formData.gstNumber?.trim().toUpperCase();
    if (!gst || gst.length !== 15) {
      setGstStatus({ msg: 'Enter a 15-character GST number first', type: 'error' });
      return;
    }
    setGstVerifying(true);
    setGstStatus(null);
    try {
      const res = await fetch('/api/gst/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstNumber: gst }),
      });
      const data = await res.json();
      if (data.success) {
        const { legalName, tradeName, state, status } = data.gstData;
        const updates: Partial<typeof formData> = { state: state || formData.state };
        if (legalName && !formData.companyName) updates.companyName = legalName;
        else if (tradeName && !formData.companyName) updates.companyName = tradeName;
        setFormData(prev => ({ ...prev, ...updates }));
        setGstStatus({
          msg: data.verified
            ? `✓ Verified: ${legalName || tradeName || status} (${state})`
            : `Format valid — State: ${state}. ${data.note || ''}`,
          type: data.verified ? 'success' : 'warn',
        });
      } else {
        setGstStatus({ msg: data.error || 'Verification failed', type: 'error' });
      }
    } catch {
      setGstStatus({ msg: 'Network error', type: 'error' });
    } finally {
      setGstVerifying(false);
    }
  };

  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    gstNumber: '',
    udyamNumber: '',
    yearsInBusiness: '',
    employees: '',
    annualRevenue: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    city: '',
    state: '',
    address: '',
    categories: [] as string[],
  });

  const [trustScore] = useState({
    overall: 65,
    profileComplete: 40,
    gstVerified: false,
    responseTime: 70,
    deliveryHistory: 0,
    reviews: 0,
  });

  // Load user data on mount
  useEffect(() => {
    const userData = localStorage.getItem('bell24h_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          companyName: user.company || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.location || '',
        }));
      } catch (e) { /* ignore parse errors */ }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/supplier/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = (cat: string) => {
    if (formData.categories.length >= 5) return;
    if (!formData.categories.includes(cat)) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, cat] }));
    }
    setShowCategoryDropdown(false);
  };

  const removeCategory = (cat: string) => {
    setFormData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }));
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
          &larr; Back
        </button>

        {/* Success Banner */}
        {saveSuccess && (
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION 1: Company Header */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-emerald-500 transition-colors">
                <Camera className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  className="text-2xl font-bold bg-transparent text-white border-none outline-none w-full placeholder-gray-600"
                />
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {formData.businessType && (
                    <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800">{formData.businessType}</span>
                  )}
                  {formData.city && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" /> {formData.city}{formData.state ? `, ${formData.state}` : ''}
                    </span>
                  )}
                  {trustScore.gstVerified && (
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> GST Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Business Details */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Business Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company Name</label>
                <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className={inputClass} placeholder="Digitex Studio Pvt Ltd" />
              </div>
              <div>
                <label className={labelClass}>Business Type</label>
                <select value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} className={inputClass}>
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>GST Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => { setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() }); setGstStatus(null); }}
                    className={`${inputClass} flex-1`}
                    placeholder="27AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  <button
                    type="button"
                    onClick={handleGstVerify}
                    disabled={gstVerifying}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg whitespace-nowrap transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {gstVerifying ? '…' : 'Auto-fill'}
                  </button>
                </div>
                {gstStatus && (
                  <p className={`text-xs mt-1 ${
                    gstStatus.type === 'success' ? 'text-emerald-400' :
                    gstStatus.type === 'warn' ? 'text-amber-400' : 'text-red-400'
                  }`}>{gstStatus.msg}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Udyam Registration (Optional)</label>
                <input type="text" value={formData.udyamNumber} onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value })} className={inputClass} placeholder="UDYAM-XX-00-0000000" />
              </div>
              <div>
                <label className={labelClass}>Years in Business</label>
                <input type="number" value={formData.yearsInBusiness} onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })} className={inputClass} placeholder="5" min="0" />
              </div>
              <div>
                <label className={labelClass}>Number of Employees</label>
                <select value={formData.employees} onChange={(e) => setFormData({ ...formData, employees: e.target.value })} className={inputClass}>
                  <option value="">Select range</option>
                  {EMPLOYEE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Annual Revenue Range</label>
                <select value={formData.annualRevenue} onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })} className={inputClass}>
                  <option value="">Select range</option>
                  {REVENUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Website (Optional)</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={inputClass} placeholder="https://yourcompany.com" />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Company Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} h-24 resize-none`} placeholder="Describe your business, products, and specializations (min 50 characters)..." />
            </div>
          </div>

          {/* SECTION 3: Categories Served */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" /> Categories Served
            </h2>
            <p className="text-gray-400 text-sm mb-4">Select up to 5 categories you serve ({formData.categories.length}/5)</p>

            {/* Selected categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.categories.map(cat => (
                <span key={cat} className="flex items-center gap-1.5 bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded-full text-sm border border-emerald-800">
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} className="hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {formData.categories.length < 5 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-1.5 bg-gray-800 text-gray-400 hover:text-white px-3 py-1.5 rounded-full text-sm border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                      {B2B_CATEGORIES.filter(c => !formData.categories.includes(c)).map(cat => (
                        <button key={cat} type="button" onClick={() => addCategory(cat)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Trust Score Breakdown */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" /> Trust Score Breakdown
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="text-center flex-shrink-0">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">{trustScore.overall}</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">out of 100</p>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {[
                  { label: 'Profile Complete', value: trustScore.profileComplete, color: 'bg-amber-500', tip: 'Fill all business details' },
                  { label: 'GST Verified', value: trustScore.gstVerified ? 100 : 0, color: 'bg-green-500', tip: 'Verify your GST number' },
                  { label: 'Response Time', value: trustScore.responseTime, color: 'bg-blue-500', tip: 'Respond to RFQs quickly' },
                  { label: 'Delivery History', value: trustScore.deliveryHistory, color: 'bg-purple-500', tip: 'Complete deals on time' },
                  { label: 'Reviews', value: trustScore.reviews, color: 'bg-pink-500', tip: 'Get positive buyer reviews' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-28 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2.5">
                        <div className={`${item.color} rounded-full h-2.5 transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                      <span className="text-gray-500 text-xs w-10 text-right">{item.value}%</span>
                    </div>
                    <p className="text-gray-300 text-xs ml-[7.5rem] mt-0.5">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Product Showcase Preview */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" /> Product Showcase
              </h2>
              <Link href="/supplier/products/showcase" className="text-blue-400 text-sm hover:text-blue-300">
                Manage Products &rarr;
              </Link>
            </div>
            <div className="text-center py-6">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No products added yet</p>
              <Link href="/supplier/products/add" className="inline-flex items-center gap-1.5 mt-3 text-blue-400 text-sm hover:text-blue-300">
                <Plus className="w-4 h-4" /> Add Your First Product
              </Link>
            </div>
          </div>

          {/* SECTION 6: Contact Information */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="contact@company.com" />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number (Optional)</label>
                <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className={inputClass} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} placeholder="Mumbai" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={inputClass} placeholder="Maharashtra" />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Office Address</label>
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Full office address..." />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
