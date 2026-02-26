'use client';
import SupplierNav from '@/components/supplier/SupplierNav';

import React, { useState } from 'react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Receipt, Building2, FileText, Upload, Save, Download } from 'lucide-react';

export default function GSTPage() {
  const [formData, setFormData] = useState({
    gstin: '',
    panNumber: '',
    legalName: '',
    tradeName: '',
    registrationType: '',
    registrationDate: '',
    status: 'Active',
    address: '',
    state: '',
    pincode: '',
    businessType: '',
    taxPayerType: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement API call to save GST information
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('GST information saved successfully!');
    } catch (error) {
      console.error('Error saving GST information:', error);
      alert('Failed to save GST information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDashboardLayout>
        <SupplierNav />
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-8 h-8" />
            GST & Tax Information
          </h1>
          <p className="text-slate-300 mt-1">Manage your GST registration and tax details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl shadow-sm border border-slate-700 p-6 space-y-6">
          {/* GST Registration Details */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              GST Registration Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GSTIN (GST Identification Number) *
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  placeholder="15-character GSTIN"
                  maxLength={15}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Format: 15 characters (e.g., 27AAAAA0000A1Z5)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Legal Name (As per GST) *
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Trade Name
                </label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Registration Type *
                </label>
                <select
                  value={formData.registrationType}
                  onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="regular">Regular</option>
                  <option value="composition">Composition</option>
                  <option value="unregistered">Unregistered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Registration Date *
                </label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Business Address (As per GST)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Tax Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="b2b">B2B (Business to Business)</option>
                  <option value="b2c">B2C (Business to Consumer)</option>
                  <option value="both">Both B2B & B2C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tax Payer Type *
                </label>
                <select
                  value={formData.taxPayerType}
                  onChange={(e) => setFormData({ ...formData, taxPayerType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-700 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="regular">Regular Tax Payer</option>
                  <option value="composition">Composition Tax Payer</option>
                  <option value="unregistered">Unregistered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-700 bg-slate-800 text-white rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300 mb-1">GST Certificate</p>
                <p className="text-xs text-slate-400 mb-3">Upload GST registration certificate</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  Upload File
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-700 bg-slate-800 text-white rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300 mb-1">PAN Card</p>
                <p className="text-xs text-slate-400 mb-3">Upload PAN card copy</p>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2 border border-slate-700 bg-slate-800 text-white text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save GST Information'}
            </button>
          </div>
        </form>
      </div>
    </UserDashboardLayout>
  );
}

