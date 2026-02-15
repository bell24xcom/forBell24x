'use client';

import { useState, useEffect } from 'react';
import { Eye, Unlock, Phone, Mail, MapPin, Calendar, DollarSign, CreditCard } from 'lucide-react';
import CreditPurchase from '@/components/CreditPurchase';

interface Lead {
  id: string;
  category: string;
  product: string;
  quantity: string | null;
  budget: number | null;
  buyerName: string;
  buyerCompany: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  description: string | null;
  urgency: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  contactHidden: boolean;
  unlocked: boolean;
}

export default function SupplierLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchUserCredits();
  }, []);

  const fetchLeads = async () => {
    try {
      // In a real app, this would fetch from /api/supplier/leads
      // For demo, we'll create mock data
      const mockLeads: Lead[] = [
        {
          id: '1',
          category: 'Electronics',
          product: 'Industrial IoT Sensors',
          quantity: '100 units',
          budget: 500000,
          buyerName: 'Rajesh Kumar',
          buyerCompany: 'TechCorp Industries',
          buyerEmail: 'rajesh@techcorp.com',
          buyerPhone: '+91 98765 43210',
          description: 'Need temperature and humidity sensors for manufacturing facility',
          urgency: 'immediate',
          location: 'Mumbai',
          status: 'new',
          createdAt: new Date().toISOString(),
          contactHidden: true,
          unlocked: false
        },
        {
          id: '2',
          category: 'Manufacturing',
          product: 'Textile Machinery',
          quantity: '2 machines',
          budget: 1500000,
          buyerName: 'Priya Sharma',
          buyerCompany: 'FashionCorp Ltd',
          buyerEmail: 'priya@fashioncorp.com',
          buyerPhone: '+91 98765 43211',
          description: 'Looking for automated weaving machines',
          urgency: '30days',
          location: 'Delhi',
          status: 'new',
          createdAt: new Date().toISOString(),
          contactHidden: true,
          unlocked: false
        }
      ];
      setLeads(mockLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      // In a real app, this would fetch from /api/user/credits
      setUserCredits(5); // Mock credits
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleUnlockLead = async (leadId: string) => {
    if (userCredits < 1) {
      setShowPurchase(true);
      return;
    }

    try {
      const response = await fetch('/api/leads/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          supplierId: 'demo-supplier-123' // In real app, get from auth context
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Update the lead in the list
        setLeads(leads.map(lead => 
          lead.id === leadId 
            ? { ...lead, unlocked: true, contactHidden: false }
            : lead
        ));
        setUserCredits(userCredits - 1);
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to unlock lead. Please try again.');
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'immediate':
        return 'text-red-600 bg-red-100';
      case '30days':
        return 'text-yellow-600 bg-yellow-100';
      case '60days':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Leads</h1>
              <p className="mt-2 text-gray-600">Find and unlock buyer requirements</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Credits:</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">{userCredits}</span>
                </div>
              </div>
              <button
                onClick={() => setShowPurchase(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{lead.product}</h3>
                    <p className="text-sm text-gray-600">{lead.category}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(lead.urgency)}`}>
                    {lead.urgency || 'Not specified'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {lead.budget ? `₹${lead.budget.toLocaleString()}` : 'Budget not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {lead.location || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {lead.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{lead.description}</p>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.buyerName}</p>
                      {lead.buyerCompany && (
                        <p className="text-sm text-gray-600">{lead.buyerCompany}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {lead.unlocked ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Unlock className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">Lead Unlocked</span>
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Phone: {lead.buyerPhone}</p>
                        <p>Email: {lead.buyerEmail}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUnlockLead(lead.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Lead (1 Credit)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedLead.product}</h4>
                    <p className="text-sm text-gray-600">{selectedLead.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Buyer</label>
                      <p className="text-sm text-gray-900">{selectedLead.buyerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <p className="text-sm text-gray-900">{selectedLead.buyerCompany || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Budget</label>
                      <p className="text-sm text-gray-900">
                        {selectedLead.budget ? `₹${selectedLead.budget.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Quantity</label>
                      <p className="text-sm text-gray-900">{selectedLead.quantity || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {selectedLead.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900">{selectedLead.description}</p>
                    </div>
                  )}
                  
                  {selectedLead.unlocked ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Contact Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{selectedLead.buyerPhone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">{selectedLead.buyerEmail}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Unlock this lead to view contact details and start communicating with the buyer.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credit Purchase Modal */}
        {showPurchase && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Purchase Credits</h3>
                  <button
                    onClick={() => setShowPurchase(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <CreditPurchase 
                  userId="demo-supplier-123"
                  onSuccess={() => {
                    setShowPurchase(false);
                    fetchUserCredits();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
