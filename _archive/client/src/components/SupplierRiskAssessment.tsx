'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity, Eye, Download, Filter, Search } from 'lucide-react';

interface SupplierRisk {
  id: number;
  name: string;
  category: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  financialHealth: number;
  deliveryHistory: number;
  qualityScore: number;
  complianceScore: number;
  marketStability: number;
  lastAssessment: string;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
  nextReviewDate: string;
}

interface RiskFactors {
  financialHealth: number;
  deliveryHistory: number;
  qualityScore: number;
  complianceScore: number;
  marketStability: number;
}

interface RiskWeights {
  financialHealth: number;
  deliveryHistory: number;
  qualityScore: number;
  complianceScore: number;
  marketStability: number;
}

export default function SupplierRiskAssessment() {
  const [suppliers, setSuppliers] = useState<SupplierRisk[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'riskScore' | 'name' | 'lastAssessment'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchRiskAssessmentData();
  }, []);

  useEffect(() => {
    filterAndSortSuppliers();
  }, [suppliers, searchTerm, selectedRiskLevel, selectedCategory, sortBy, sortOrder]);

  const fetchRiskAssessmentData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/analytics/supplier-risk-assessment');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching risk assessment data:', error);
      // Fallback to mock data
      setSuppliers(generateMockRiskAssessmentData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRiskAssessmentData = (): SupplierRisk[] => [
    {
      id: 1,
      name: 'TechCorp Industries',
      category: 'Electronics',
      riskScore: 23,
      riskLevel: 'low',
      financialHealth: 92,
      deliveryHistory: 96,
      qualityScore: 94,
      complianceScore: 89,
      marketStability: 88,
      lastAssessment: '2024-01-15',
      trend: 'improving',
      recommendations: ['Maintain current quality standards', 'Consider expanding to new markets'],
      nextReviewDate: '2024-04-15'
    },
    {
      id: 2,
      name: 'Global Manufacturing Ltd',
      category: 'Automotive',
      riskScore: 67,
      riskLevel: 'medium',
      financialHealth: 58,
      deliveryHistory: 72,
      qualityScore: 68,
      complianceScore: 65,
      marketStability: 62,
      lastAssessment: '2024-01-10',
      trend: 'declining',
      recommendations: ['Improve financial stability', 'Enhance quality control processes', 'Strengthen compliance'],
      nextReviewDate: '2024-02-10'
    },
    {
      id: 3,
      name: 'Precision Parts Co',
      category: 'Machinery',
      riskScore: 18,
      riskLevel: 'low',
      financialHealth: 95,
      deliveryHistory: 98,
      qualityScore: 96,
      complianceScore: 92,
      marketStability: 94,
      lastAssessment: '2024-01-12',
      trend: 'stable',
      recommendations: ['Continue excellent performance', 'Share best practices with other suppliers'],
      nextReviewDate: '2024-04-12'
    },
    {
      id: 4,
      name: 'Innovation Labs',
      category: 'Pharmaceuticals',
      riskScore: 45,
      riskLevel: 'medium',
      financialHealth: 78,
      deliveryHistory: 82,
      qualityScore: 85,
      complianceScore: 88,
      marketStability: 72,
      lastAssessment: '2024-01-08',
      trend: 'improving',
      recommendations: ['Focus on market stability', 'Maintain compliance standards'],
      nextReviewDate: '2024-03-08'
    },
    {
      id: 5,
      name: 'Quality First Manufacturing',
      category: 'Textiles',
      riskScore: 34,
      riskLevel: 'low',
      financialHealth: 85,
      deliveryHistory: 88,
      qualityScore: 91,
      complianceScore: 87,
      marketStability: 82,
      lastAssessment: '2024-01-14',
      trend: 'stable',
      recommendations: ['Monitor market conditions', 'Maintain quality standards'],
      nextReviewDate: '2024-04-14'
    },
    {
      id: 6,
      name: 'Rapid Solutions Inc',
      category: 'Electronics',
      riskScore: 78,
      riskLevel: 'high',
      financialHealth: 45,
      deliveryHistory: 62,
      qualityScore: 58,
      complianceScore: 52,
      marketStability: 48,
      lastAssessment: '2024-01-05',
      trend: 'declining',
      recommendations: ['Immediate financial review required', 'Implement quality improvement plan', 'Address compliance issues'],
      nextReviewDate: '2024-01-20'
    },
    {
      id: 7,
      name: 'Steady Supply Co',
      category: 'Chemicals',
      riskScore: 89,
      riskLevel: 'critical',
      financialHealth: 32,
      deliveryHistory: 45,
      qualityScore: 42,
      complianceScore: 38,
      marketStability: 35,
      lastAssessment: '2024-01-02',
      trend: 'declining',
      recommendations: ['Immediate intervention required', 'Consider supplier replacement', 'Financial restructuring needed'],
      nextReviewDate: '2024-01-15'
    },
    {
      id: 8,
      name: 'Reliable Components',
      category: 'Automotive',
      riskScore: 28,
      riskLevel: 'low',
      financialHealth: 88,
      deliveryHistory: 91,
      qualityScore: 89,
      complianceScore: 85,
      marketStability: 86,
      lastAssessment: '2024-01-11',
      trend: 'improving',
      recommendations: ['Continue current performance', 'Explore new opportunities'],
      nextReviewDate: '2024-04-11'
    }
  ];

  const filterAndSortSuppliers = () => {
    let filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRiskLevel = selectedRiskLevel === 'all' || supplier.riskLevel === selectedRiskLevel;
      const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
      
      return matchesSearch && matchesRiskLevel && matchesCategory;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'lastAssessment') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSuppliers(filtered);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const calculateRiskScore = (factors: RiskFactors, weights: RiskWeights): number => {
    const weightedScore = 
      (factors.financialHealth * weights.financialHealth) +
      (factors.deliveryHistory * weights.deliveryHistory) +
      (factors.qualityScore * weights.qualityScore) +
      (factors.complianceScore * weights.complianceScore) +
      (factors.marketStability * weights.marketStability);
    
    return Math.round(weightedScore);
  };

  const getRiskSummary = () => {
    const total = filteredSuppliers.length;
    const low = filteredSuppliers.filter(s => s.riskLevel === 'low').length;
    const medium = filteredSuppliers.filter(s => s.riskLevel === 'medium').length;
    const high = filteredSuppliers.filter(s => s.riskLevel === 'high').length;
    const critical = filteredSuppliers.filter(s => s.riskLevel === 'critical').length;

    return { total, low, medium, high, critical };
  };

  const riskSummary = getRiskSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Risk Assessment</h1>
          <p className="text-gray-600">Monitor and manage supplier risk levels proactively</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{riskSummary.total}</div>
          <div className="text-sm text-gray-600">Total Suppliers</div>
        </div>
        <div className="bg-green-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{riskSummary.low}</div>
          <div className="text-sm text-green-600">Low Risk</div>
        </div>
        <div className="bg-yellow-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{riskSummary.medium}</div>
          <div className="text-sm text-yellow-600">Medium Risk</div>
        </div>
        <div className="bg-orange-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{riskSummary.high}</div>
          <div className="text-sm text-orange-600">High Risk</div>
        </div>
        <div className="bg-red-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{riskSummary.critical}</div>
          <div className="text-sm text-red-600">Critical Risk</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Automotive">Automotive</option>
              <option value="Machinery">Machinery</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Textiles">Textiles</option>
              <option value="Chemicals">Chemicals</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="riskScore">Risk Score</option>
              <option value="name">Name</option>
              <option value="lastAssessment">Last Assessment</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => setSortOrder('asc')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              sortOrder === 'asc' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ascending
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              sortOrder === 'desc' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Descending
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Metrics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500">ID: {supplier.id}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.category}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRiskLevelIcon(supplier.riskLevel)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(supplier.riskLevel)}`}>
                        {supplier.riskLevel}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.riskScore}</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          supplier.riskScore <= 25 ? 'bg-green-500' :
                          supplier.riskScore <= 50 ? 'bg-yellow-500' :
                          supplier.riskScore <= 75 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${supplier.riskScore}%` }}
                      ></div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Financial:</span>
                        <span className={`font-medium ${
                          supplier.financialHealth >= 80 ? 'text-green-600' :
                          supplier.financialHealth >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {supplier.financialHealth}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quality:</span>
                        <span className={`font-medium ${
                          supplier.qualityScore >= 80 ? 'text-green-600' :
                          supplier.qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {supplier.qualityScore}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Compliance:</span>
                        <span className={`font-medium ${
                          supplier.complianceScore >= 80 ? 'text-green-600' :
                          supplier.complianceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {supplier.complianceScore}%
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(supplier.trend)}
                      <span className={`text-sm font-medium capitalize ${
                        supplier.trend === 'improving' ? 'text-green-600' :
                        supplier.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {supplier.trend}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.nextReviewDate}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(supplier.nextReviewDate) <= new Date() ? 'Overdue' : 'Upcoming'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Assessment Guidelines */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Risk Levels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span><strong>Low (0-25):</strong> Excellent performance, minimal risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span><strong>Medium (26-50):</strong> Good performance, some areas for improvement</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span><strong>High (51-75):</strong> Requires attention, intervention recommended</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span><strong>Critical (76-100):</strong> Immediate action required</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Assessment Factors</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Financial Health:</strong> 25% weight - Company stability and financial performance</div>
              <div><strong>Delivery History:</strong> 25% weight - On-time delivery and reliability</div>
              <div><strong>Quality Score:</strong> 20% weight - Product/service quality metrics</div>
              <div><strong>Compliance Score:</strong> 20% weight - Regulatory and certification compliance</div>
              <div><strong>Market Stability:</strong> 10% weight - Market position and industry trends</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
