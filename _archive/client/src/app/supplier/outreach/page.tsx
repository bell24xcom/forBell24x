'use client';

import React, { useState } from 'react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Mail, MessageSquare, Send, Users, FileText, Download } from 'lucide-react';

/**
 * Supplier Outreach Management Page
 * Item 21: Recruit Early Adopters
 */

export default function SupplierOutreachPage() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [outreachType, setOutreachType] = useState<'email' | 'sms' | 'both'>('email');
  const [template, setTemplate] = useState<'initial' | 'followUp'>('initial');
  const [loading, setLoading] = useState(false);

  const handleSendOutreach = async () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/supplier/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierIds: selectedSuppliers,
          type: outreachType,
          template
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Outreach sent to ${data.sent} suppliers successfully!`);
        setSelectedSuppliers([]);
      }
    } catch (error) {
      console.error('Outreach error:', error);
      alert('Failed to send outreach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Supplier Outreach
          </h1>
          <p className="text-gray-600 mt-1">Recruit early adopters - Target: 100 suppliers (Month 1)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Outreach Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outreach Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setOutreachType('email')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    outreachType === 'email' ? 'bg-[#0070f3] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  onClick={() => setOutreachType('sms')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    outreachType === 'sms' ? 'bg-[#0070f3] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  SMS
                </button>
                <button
                  onClick={() => setOutreachType('both')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    outreachType === 'both' ? 'bg-[#0070f3] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Both
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as 'initial' | 'followUp')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
              >
                <option value="initial">Initial Outreach</option>
                <option value="followUp">Follow-up Reminder</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold text-gray-900">{selectedSuppliers.length}</span> suppliers
                </p>
              </div>
              <button
                onClick={handleSendOutreach}
                disabled={loading || selectedSuppliers.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Sending...' : 'Send Outreach'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Supplier List</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-5 h-5" />
              Export List
            </button>
          </div>

          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Supplier list will be loaded here</p>
            <p className="text-sm mt-2">Connect to database to view unclaimed suppliers</p>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}

