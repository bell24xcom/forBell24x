'use client';

<<<<<<< HEAD
import { generateRFQReport } from '@/lib/napkin-pdf';
import { calculateTrafficPricing, getPricingDisplay } from '@/lib/traffic-pricing';
import { Brain, CheckCircle, FileText, Mic, Star, TrendingUp, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import React, { useEffect, useState, Suspense } from 'react';

interface RFQForm {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  unit: string;
  budget: number;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  specifications: string;
  attachments: File[];
}

interface SupplierSuggestion {
  id: string;
  name: string;
  brandName: string;
  logoUrl: string;
  aiScore: number;
  trafficTier: string;
  roles: string[];
  specialties: string[];
  rating: number;
  responseTime: string;
  priceRange: [number, number];
}

function RFQCreationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillProductId = searchParams.get('product');

  const [form, setForm] = useState<RFQForm>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    quantity: 1,
    unit: 'pieces',
    budget: 0,
    deadline: '',
    priority: 'MEDIUM',
    specifications: '',
    attachments: [],
  });

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState<SupplierSuggestion[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingPreview, setPricingPreview] = useState<any>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);

  // Mock supplier suggestions
  const mockSuppliers: SupplierSuggestion[] = [
    {
      id: 'supplier1',
      name: 'SteelCorp Industries',
      brandName: 'SteelCorp',
      logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      aiScore: 95,
      trafficTier: 'GOLD',
      roles: ['supplier', 'manufacturer'],
      specialties: ['Steel', 'Alloys', 'Industrial'],
      rating: 4.8,
      responseTime: '2-4 hours',
      priceRange: [40000, 60000],
    },
    {
      id: 'supplier2',
      name: 'AluTech Solutions',
      brandName: 'AluTech',
      logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      aiScore: 87,
      trafficTier: 'SILVER',
      roles: ['supplier'],
      specialties: ['Aluminum', 'Lightweight Materials'],
      rating: 4.5,
      responseTime: '4-6 hours',
      priceRange: [30000, 45000],
    },
    {
      id: 'supplier3',
      name: 'CopperMax Industries',
      brandName: 'CopperMax',
      logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
      aiScore: 92,
      trafficTier: 'PLATINUM',
      roles: ['supplier', 'manufacturer', 'msme'],
      specialties: ['Copper', 'Electrical', 'Thermal'],
      rating: 4.9,
      responseTime: '1-2 hours',
      priceRange: [25000, 40000],
    },
  ];

  useEffect(() => {
    // If product is pre-filled, load its details
    if (prefillProductId) {
      // In a real app, fetch product details
      console.log('Pre-filling product:', prefillProductId);
    }

    // Generate initial AI suggestions
    generateAISuggestions();
  }, [prefillProductId]);

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const suggestions = [
        'Consider specifying material grade requirements for better supplier matching',
        'Include delivery timeline preferences to optimize logistics',
        'Mention quality certifications needed for compliance',
        'Specify packaging requirements for safe transportation',
      ];

      setAiSuggestions(suggestions);
      setSupplierSuggestions(mockSuppliers);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const calculatePricingPreview = () => {
    if (!form.category || !form.quantity) return;

    const config = {
      basePrice: form.budget / form.quantity,
      impressions: 100, // Sample data
      clicks: 10,
      conversions: 2,
      trafficTier: 'GOLD' as const,
      category: form.category,
      msmeDiscount: true,
    };

    const pricing = calculateTrafficPricing(config);
    const display = getPricingDisplay(pricing);
    setPricingPreview({ ...pricing, display });
  };

  const handleFormChange = (field: keyof RFQForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Recalculate pricing when relevant fields change
    if (['category', 'quantity', 'budget'].includes(field)) {
      calculatePricingPreview();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setForm(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const handleVoiceInput = () => {
    setVoiceRecording(true);
    // In a real app, implement voice recording and transcription
    setTimeout(() => {
      setVoiceRecording(false);
      // Simulate voice transcription - REPLACE instead of APPEND
      const voiceText = 'Need high-quality steel for construction project';
      setForm(prev => ({
        ...prev,
        description: prev.description.trim() === '' 
          ? voiceText 
          : prev.description + ' ' + voiceText,
      }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate RFQ report
      const reportData = {
        rfqId: 'rfq-' + Date.now(),
        title: form.title,
        category: form.category,
        quantity: form.quantity,
        unit: form.unit,
        budget: form.budget,
        deadline: new Date(form.deadline),
        priceTrend: {
          dates: ['2024-01-01', '2024-01-15', '2024-01-30'],
          prices: [45000, 48000, 52000],
          trend: 'up' as const,
          percentageChange: 15.6,
          marketAverage: 47000,
        },
        competitorAnalysis: supplierSuggestions.map(s => ({
          name: s.name,
          price: s.priceRange[1],
          rating: s.rating,
          deliveryTime: 7,
          riskScore: 100 - s.aiScore,
        })),
        aiRecommendations: aiSuggestions,
        marketInsights: [
          {
            type: 'price' as const,
            title: 'Market Price Trend',
            description: 'Steel prices are trending upward due to increased demand',
            impact: 'negative' as const,
            confidence: 85,
          },
        ],
        responses: supplierSuggestions.map(s => ({
          supplierId: s.id,
          supplierName: s.name,
          price: s.priceRange[1],
          quantity: form.quantity,
          deliveryTime: 7,
          aiScore: s.aiScore,
          riskScore: 100 - s.aiScore,
          status: 'pending' as const,
        })),
      };

      // Generate report
      await generateRFQReport(reportData);

      // Redirect to RFQ management
      router.push('/dashboard/rfq');
    } catch (error) {
      console.error('Error creating RFQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrafficTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-purple-500';
      case 'GOLD':
        return 'bg-yellow-500';
      case 'SILVER':
        return 'bg-gray-500';
      case 'BRONZE':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
=======
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Separate component that uses useSearchParams (must be wrapped in Suspense)
function RFQCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqType = searchParams?.get('type') || 'text'; // text, voice, video

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    deadline: '',
    category: '',
    budget: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: rfqType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to the created RFQ or RFQ list
        router.push(`/rfq/${data.rfqId || ''}`);
      } else {
        setError(data.message || 'Failed to create RFQ. Please try again.');
      }
    } catch (err) {
      console.error('Error creating RFQ:', err);
      setError('An error occurred while creating the RFQ. Please try again.');
    } finally {
      setLoading(false);
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    }
  };

  return (
<<<<<<< HEAD
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
      <PageHeader
        title="Create RFQ"
        subtitle="AI-powered Request for Quotation with smart supplier matching"
        showBackButton={true}
        showHomeButton={true}
        showDashboardButton={true}
      />

      <div className='container mx-auto px-4 py-8'>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Form */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Basic Information */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                    <FileText className='w-5 h-5 mr-2' />
                    Basic Information
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        RFQ Title *
                      </label>
                      <input
                        type='text'
                        value={form.title}
                        onChange={e => handleFormChange('title', e.target.value)}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        placeholder='Enter RFQ title'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Priority *
                      </label>
                      <select
                        value={form.priority}
                        onChange={e => handleFormChange('priority', e.target.value)}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        required
                      >
                        <option value='LOW'>Low</option>
                        <option value='MEDIUM'>Medium</option>
                        <option value='HIGH'>High</option>
                        <option value='URGENT'>Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description with Voice Input */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Description *</label>
                    <button
                      type='button'
                      onClick={handleVoiceInput}
                      disabled={voiceRecording}
                      className='flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors'
                    >
                      <Mic className='w-4 h-4' />
                      {voiceRecording ? 'Recording...' : 'Voice Input'}
                    </button>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={e => handleFormChange('description', e.target.value)}
                    rows={4}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Describe your requirements in detail...'
                    required
                  />
                </div>

                {/* Category and Specifications */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={e => handleFormChange('category', e.target.value)}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      required
                    >
                      <option value=''>Select category</option>
                      <option value='steel'>Steel</option>
                      <option value='aluminum'>Aluminum</option>
                      <option value='copper'>Copper</option>
                      <option value='machinery'>Machinery</option>
                      <option value='electronics'>Electronics</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Subcategory
                    </label>
                    <input
                      type='text'
                      value={form.subcategory}
                      onChange={e => handleFormChange('subcategory', e.target.value)}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter subcategory'
                    />
                  </div>
                </div>

                {/* Quantity and Budget */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quantity *
                    </label>
                    <input
                      type='number'
                      value={form.quantity}
                      onChange={e => handleFormChange('quantity', parseInt(e.target.value))}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='1'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Unit</label>
                    <select
                      value={form.unit}
                      onChange={e => handleFormChange('unit', e.target.value)}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='pieces'>Pieces</option>
                      <option value='kg'>Kilograms</option>
                      <option value='tons'>Tons</option>
                      <option value='meters'>Meters</option>
                      <option value='units'>Units</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Budget (₹) *
                    </label>
                    <input
                      type='number'
                      value={form.budget}
                      onChange={e => handleFormChange('budget', parseFloat(e.target.value))}
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      min='0'
                      required
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Deadline *</label>
                  <input
                    type='date'
                    value={form.deadline}
                    onChange={e => handleFormChange('deadline', e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Technical Specifications
                  </label>
                  <textarea
                    value={form.specifications}
                    onChange={e => handleFormChange('specifications', e.target.value)}
                    rows={3}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Enter technical specifications, quality requirements, etc.'
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Attachments
                  </label>
                  <input
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    accept='.pdf,.doc,.docx,.jpg,.png'
                  />
                  {form.attachments.length > 0 && (
                    <div className='mt-2'>
                      <p className='text-sm text-gray-600'>Attached files:</p>
                      <ul className='text-sm text-gray-500'>
                        {form.attachments.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      Creating RFQ...
                    </>
                  ) : (
                    <>
                      <FileText className='w-5 h-5' />
                      Create RFQ
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* AI Sidebar */}
          <div className='space-y-6'>
            {/* AI Suggestions */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <Brain className='w-5 h-5 mr-2 text-purple-600' />
                AI Suggestions
                {isGeneratingAI && (
                  <div className='ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600'></div>
                )}
              </h3>

              <div className='space-y-3'>
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className='flex items-start gap-3 p-3 bg-purple-50 rounded-lg'>
                    <CheckCircle className='w-4 h-4 text-purple-600 mt-0.5' />
                    <p className='text-sm text-purple-800'>{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic-Based Pricing Preview */}
            {pricingPreview && (
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                  <TrendingUp className='w-5 h-5 mr-2 text-blue-600' />
                  Pricing Preview
                </h3>

                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Base Price:</span>
                    <span className='text-sm text-gray-500 line-through'>
                      ₹{pricingPreview.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Traffic Price:</span>
                    <span className='text-sm font-bold text-blue-600'>
                      ₹{pricingPreview.trafficPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-600'>Traffic Boost:</span>
                    <span className='text-sm text-green-600'>
                      +{pricingPreview.display.trafficMultiplier}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Supplier Suggestions */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <Users className='w-5 h-5 mr-2 text-green-600' />
                AI-Matched Suppliers
              </h3>

              <div className='space-y-4'>
                {supplierSuggestions.map(supplier => (
                  <div key={supplier.id} className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <img
                        src={supplier.logoUrl}
                        alt={supplier.brandName}
                        className='w-8 h-8 rounded-full'
                      />
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900'>{supplier.brandName}</h4>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`${getTrafficTierColor(supplier.trafficTier)} text-white px-2 py-1 rounded-full text-xs`}
                          >
                            {supplier.trafficTier}
                          </span>
                          <div className='flex items-center gap-1'>
                            <Star className='w-3 h-3 text-yellow-500 fill-current' />
                            <span className='text-xs text-gray-600'>{supplier.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-bold text-green-600'>{supplier.aiScore}%</div>
                        <div className='text-xs text-gray-500'>AI Score</div>
                      </div>
                    </div>

                    <div className='space-y-2 text-xs text-gray-600'>
                      <div className='flex justify-between'>
                        <span>Response Time:</span>
                        <span>{supplier.responseTime}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Price Range:</span>
                        <span>
                          ₹{supplier.priceRange[0].toLocaleString()} - ₹
                          {supplier.priceRange[1].toLocaleString()}
                        </span>
                      </div>
                      <div className='flex gap-1'>
                        {supplier.specialties.map((specialty, index) => (
                          <span key={index} className='px-2 py-1 bg-gray-100 rounded text-xs'>
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
=======
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/rfq"
            className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block flex items-center gap-2"
          >
            ← Back to RFQs
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create New RFQ</h1>
          <p className="text-gray-400">
            {rfqType === 'voice' && 'Create a voice-based RFQ'}
            {rfqType === 'video' && 'Create a video-based RFQ'}
            {rfqType === 'text' && 'Create a text-based RFQ'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Product/Service Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="e.g., 1000 units of CNC machined parts"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description *
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="Detailed requirements, specifications, quality standards..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Quantity *
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., 1000 units"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., Manufacturing, Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Budget Range
              </label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
                placeholder="e.g., ₹50,000 - ₹1,00,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              placeholder="e.g., Mumbai, Maharashtra"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Submit RFQ'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/rfq')}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default function RFQCreationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RFQ creation...</p>
        </div>
      </div>
    }>
      <RFQCreationContent />
    </Suspense>
  );
}
=======
// Main component with Suspense wrapper (required for useSearchParams)
export default function CreateRFQPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a1128] flex items-center justify-center">
          <div className="text-cyan-400">Loading form...</div>
        </div>
      }
    >
      <RFQCreateForm />
    </Suspense>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
