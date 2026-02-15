'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building,
  TrendingUp,
  Users,
  Target,
  BarChart3
} from 'lucide-react';

interface ScrapedCompany {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  source: string;
  sourceUrl: string;
  trustScore: number;
  isVerified: boolean;
  scrapedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'CLAIMED';
  dataQuality: number;
  extractionProof: {
    originalData: string;
    extractedFields: string[];
    confidence: number;
  };
  googleSearchResults?: {
    ranking: number;
    searchTerm: string;
    url: string;
  }[];
  bingSearchResults?: {
    ranking: number;
    searchTerm: string;
    url: string;
  }[];
}

export default function ScrapedDataPage() {
  const [companies, setCompanies] = useState<ScrapedCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<ScrapedCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API call
  useEffect(() => {
    const mockCompanies: ScrapedCompany[] = [
      {
        id: 'comp_1',
        name: 'Steel Solutions Pvt Ltd',
        category: 'Steel & Metal',
        phone: '+91-9876543210',
        email: 'contact@steelsolutions.com',
        address: 'Industrial Area, Mumbai, Maharashtra',
        website: 'https://steelsolutions.com',
        source: 'IndiaMART',
        sourceUrl: 'https://www.indiamart.com/steelsolutions',
        trustScore: 85,
        isVerified: true,
        scrapedAt: '2025-09-19T10:30:00Z',
        status: 'ACTIVE',
        dataQuality: 92,
        extractionProof: {
          originalData: 'Steel Solutions Pvt Ltd - Leading manufacturer of steel products...',
          extractedFields: ['name', 'phone', 'email', 'address', 'website'],
          confidence: 95
        },
        googleSearchResults: [
          { ranking: 3, searchTerm: 'steel solutions mumbai', url: 'https://google.com/search?q=steel+solutions+mumbai' },
          { ranking: 7, searchTerm: 'steel manufacturers mumbai', url: 'https://google.com/search?q=steel+manufacturers+mumbai' }
        ],
        bingSearchResults: [
          { ranking: 2, searchTerm: 'steel solutions mumbai', url: 'https://bing.com/search?q=steel+solutions+mumbai' },
          { ranking: 5, searchTerm: 'steel manufacturers mumbai', url: 'https://bing.com/search?q=steel+manufacturers+mumbai' }
        ]
      },
      {
        id: 'comp_2',
        name: 'Textile Excellence Ltd',
        category: 'Textiles & Fabrics',
        phone: '+91-8765432109',
        email: 'info@textileexcellence.com',
        address: 'Textile Park, Surat, Gujarat',
        website: 'https://textileexcellence.com',
        source: 'JustDial',
        sourceUrl: 'https://www.justdial.com/textileexcellence',
        trustScore: 78,
        isVerified: false,
        scrapedAt: '2025-09-19T09:15:00Z',
        status: 'PENDING',
        dataQuality: 87,
        extractionProof: {
          originalData: 'Textile Excellence Ltd - Premium textile manufacturer...',
          extractedFields: ['name', 'phone', 'email', 'address'],
          confidence: 88
        },
        googleSearchResults: [
          { ranking: 4, searchTerm: 'textile excellence surat', url: 'https://google.com/search?q=textile+excellence+surat' },
          { ranking: 8, searchTerm: 'textile manufacturers gujarat', url: 'https://google.com/search?q=textile+manufacturers+gujarat' }
        ],
        bingSearchResults: [
          { ranking: 3, searchTerm: 'textile excellence surat', url: 'https://bing.com/search?q=textile+excellence+surat' },
          { ranking: 6, searchTerm: 'textile manufacturers gujarat', url: 'https://bing.com/search?q=textile+manufacturers+gujarat' }
        ]
      },
      {
        id: 'comp_3',
        name: 'ElectroTech Industries',
        category: 'Electronics & Electrical',
        phone: '+91-7654321098',
        email: 'sales@electrotech.com',
        address: 'Tech Park, Bangalore, Karnataka',
        website: 'https://electrotech.com',
        source: 'TradeIndia',
        sourceUrl: 'https://www.tradeindia.com/electrotech',
        trustScore: 92,
        isVerified: true,
        scrapedAt: '2025-09-19T08:45:00Z',
        status: 'CLAIMED',
        dataQuality: 95,
        extractionProof: {
          originalData: 'ElectroTech Industries - Advanced electronics solutions...',
          extractedFields: ['name', 'phone', 'email', 'address', 'website', 'category'],
          confidence: 97
        },
        googleSearchResults: [
          { ranking: 1, searchTerm: 'electrotech bangalore', url: 'https://google.com/search?q=electrotech+bangalore' },
          { ranking: 2, searchTerm: 'electronics manufacturers bangalore', url: 'https://google.com/search?q=electronics+manufacturers+bangalore' }
        ],
        bingSearchResults: [
          { ranking: 1, searchTerm: 'electrotech bangalore', url: 'https://bing.com/search?q=electrotech+bangalore' },
          { ranking: 3, searchTerm: 'electronics manufacturers bangalore', url: 'https://bing.com/search?q=electronics+manufacturers+bangalore' }
        ]
      }
    ];

    setCompanies(mockCompanies);
    setFilteredCompanies(mockCompanies);
    setIsLoading(false);
  }, []);

  // Filter companies based on search and filters
  useEffect(() => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(company => company.source === selectedSource);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(company => company.category === selectedCategory);
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, selectedSource, selectedCategory]);

  const generateProfile = async (companyId: string) => {
    try {
      const response = await fetch('/api/admin/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      
      if (response.ok) {
        alert('Profile generated successfully! Company can now be claimed.');
      } else {
        alert('Failed to generate profile. Please try again.');
      }
    } catch (error) {
      console.error('Error generating profile:', error);
      alert('Error generating profile. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CLAIMED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'IndiaMART': return '🏢';
      case 'JustDial': return '📞';
      case 'TradeIndia': return '🌐';
      case 'ExportersIndia': return '🚢';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scraped data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Scraped Data Verification & Proof
          </h1>
          <p className="text-xl text-gray-700">
            Monitor scraped companies with source verification and quality metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scraped</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">Companies scraped</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Sources</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.isVerified).length}
              </div>
              <p className="text-xs text-muted-foreground">Source verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Quality</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.dataQuality >= 90).length}
              </div>
              <p className="text-xs text-muted-foreground">90%+ quality score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.status === 'CLAIMED').length}
              </div>
              <p className="text-xs text-muted-foreground">Companies claimed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Sources</option>
                  <option value="IndiaMART">IndiaMART</option>
                  <option value="JustDial">JustDial</option>
                  <option value="TradeIndia">TradeIndia</option>
                  <option value="ExportersIndia">ExportersIndia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="Steel & Metal">Steel & Metal</option>
                  <option value="Textiles & Fabrics">Textiles & Fabrics</option>
                  <option value="Electronics & Electrical">Electronics & Electrical</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getSourceIcon(company.source)}</div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{company.category}</span>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                        {company.isVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateProfile(company.id)}
                    >
                      Generate Profile
                    </Button>
                    <Button size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Company Details */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{company.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Source Verification */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Source Verification
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Platform:</span> {company.source}
                      </div>
                      <div>
                        <span className="font-medium">Source URL:</span>
                        <a href={company.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          View Original
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Scraped:</span> {new Date(company.scrapedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Trust Score:</span> {company.trustScore}%
                      </div>
                      <div>
                        <span className="font-medium">Data Quality:</span> {company.dataQuality}%
                      </div>
                    </div>
                  </div>

                  {/* Search Engine Results */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Search Engine Presence
                    </h4>
                    <div className="space-y-3">
                      {/* Google Results */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Google Search:</span>
                          <Badge variant="outline">Rank {company.googleSearchResults?.[0]?.ranking || 'N/A'}</Badge>
                        </div>
                        {company.googleSearchResults?.slice(0, 2).map((result, index) => (
                          <div key={index} className="text-xs text-gray-600 ml-2">
                            "{result.searchTerm}" - Rank {result.ranking}
                          </div>
                        ))}
                      </div>

                      {/* Bing Results */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Bing Search:</span>
                          <Badge variant="outline">Rank {company.bingSearchResults?.[0]?.ranking || 'N/A'}</Badge>
                        </div>
                        {company.bingSearchResults?.slice(0, 2).map((result, index) => (
                          <div key={index} className="text-xs text-gray-600 ml-2">
                            "{result.searchTerm}" - Rank {result.ranking}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extraction Proof */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Extraction Proof</h5>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Confidence:</strong> {company.extractionProof.confidence}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Extracted Fields:</strong> {company.extractionProof.extractedFields.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Original Data Sample:</strong> {company.extractionProof.originalData.substring(0, 100)}...
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
