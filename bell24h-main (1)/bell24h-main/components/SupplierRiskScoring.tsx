'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, Badge, Bar, BarChart3, Calendar, Card, CardContent, CardHeader, CardTitle, CheckCircle, Clock, DollarSign, FileText, Line, Progress, RiskFactors, Shield, Star, SupplierData, Tabs, TabsContent, TabsList, TabsTrigger, TrendingDown, TrendingUp, Users } from 'lucide-react';;;
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SupplierData {
  id: string;
  name: string;
  category: string;
  location: string;
  establishedYear: number;
  totalOrders: number;
  completedOrders: number;
  lateDeliveries: number;
  averageRating: number;
  complianceScore: number;
  financialStability: number;
  userFeedback: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastOrderDate: string;
  totalValue: number;
  certifications: string[];
  insurance: boolean;
  gstVerified: boolean;
  bankVerified: boolean;
}

interface RiskFactors {
  deliveryPerformance: number;
  complianceScore: number;
  financialStability: number;
  userFeedback: number;
  orderHistory: number;
  certifications: number;
  verificationStatus: number;
}

interface RiskTrend {
  date: string;
  riskScore: number;
  deliveryPerformance: number;
  complianceScore: number;
  financialStability: number;
}

interface RiskRecommendation {
  factor: string;
  currentScore: number;
  targetScore: number;
  improvement: string;
  priority: 'high' | 'medium' | 'low';
}

export const SupplierRiskScoring: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierData | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactors | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrend[]>([]);
  const [recommendations, setRecommendations] = useState<RiskRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Calculate risk score using Aladin-inspired algorithm
  const calculateRiskScore = (supplier: SupplierData): number => {
    const deliveryRate = supplier.lateDeliveries / supplier.totalOrders;
    const completionRate = supplier.completedOrders / supplier.totalOrders;
    
    const riskScore = (
      0.4 * (1 - deliveryRate) * 100 + // Delivery performance (40%)
      0.3 * supplier.complianceScore + // Compliance score (30%)
      0.2 * supplier.financialStability + // Financial stability (20%)
      0.1 * supplier.userFeedback // User feedback (10%)
    );
    
    return Math.max(0, Math.min(100, riskScore));
  };

  // Determine risk level
  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    return 'high';
  };

  // Get risk color
  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
    }
  };

  // Get risk icon
  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low: return <CheckCircle className="h-4 w-4" />;
      case medium&apos;: return <Clock className="h-4 w-4" />;
      case &apos;high': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Load suppliers data
  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/suppliers/risk-analysis');
        const data = await response.json();
        
        // Calculate risk scores for all suppliers
        const suppliersWithRisk = data.map((supplier: any) => ({
          ...supplier,
          riskScore: calculateRiskScore(supplier),
          riskLevel: getRiskLevel(calculateRiskScore(supplier)),
        }));
        
        setSuppliers(suppliersWithRisk);
        
        if (suppliersWithRisk.length > 0) {
          setSelectedSupplier(suppliersWithRisk[0]);
          loadSupplierDetails(suppliersWithRisk[0].id);
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Load detailed supplier information
  const loadSupplierDetails = async (supplierId: string) => {
    try {
      const [riskFactorsRes, riskTrendRes, recommendationsRes] = await Promise.all([
        fetch(`/api/suppliers/${supplierId}/risk-factors`),
        fetch(`/api/suppliers/${supplierId}/risk-trend`),
        fetch(`/api/suppliers/${supplierId}/risk-recommendations`),
      ]);

      const [riskFactorsData, riskTrendData, recommendationsData] = await Promise.all([
        riskFactorsRes.json(),
        riskTrendRes.json(),
        recommendationsRes.json(),
      ]);

      setRiskFactors(riskFactorsData);
      setRiskTrend(riskTrendData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading supplier details:', error);
    }
  };

  // Filter suppliers by risk level
  const filteredSuppliers = suppliers.filter(supplier => 
    filter === 'all' || supplier.riskLevel === filter
  );

  // Chart data for risk trend
  const riskTrendData = {
    labels: riskTrend.map(item => item.date),
    datasets: [
      {
        label: 'Risk Score',
        data: riskTrend.map(item => item.riskScore),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Delivery Performance',
        data: riskTrend.map(item => item.deliveryPerformance),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Compliance Score',
        data: riskTrend.map(item => item.complianceScore),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for risk factors
  const riskFactorsData = {
    labels: riskFactors ? Object.keys(riskFactors) : [],
    datasets: [
      {
        label: 'Current Score',
        data: riskFactors ? Object.values(riskFactors) : [],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(132, 204, 22, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplier Risk Scoring</h1>
          <p className="text-gray-600">AI-powered risk assessment using Aladin-inspired algorithms</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      loadSupplierDetails(supplier.id);
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSupplier?.id === supplier.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{supplier.name}</h3>
                      <Badge className={getRiskColor(supplier.riskLevel)}>
                        {getRiskIcon(supplier.riskLevel)}
                        <span className="ml-1">{supplier.riskLevel.toUpperCase()}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{supplier.category}</span>
                      <span>{supplier.riskScore.toFixed(1)}/100</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={supplier.riskScore} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="lg:col-span-2">
          {selectedSupplier && (
            <div className="space-y-6">
              {/* Supplier Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedSupplier.name}</CardTitle>
                    <Badge className={getRiskColor(selectedSupplier.riskLevel)}>
                      {getRiskIcon(selectedSupplier.riskLevel)}
                      <span className="ml-1">{selectedSupplier.riskLevel.toUpperCase()} RISK</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedSupplier.riskScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Risk Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedSupplier.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedSupplier.totalOrders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">₹{selectedSupplier.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Total Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="factors">Risk Factors</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedSupplier.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedSupplier.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Established:</span>
                          <span className="font-medium">{selectedSupplier.establishedYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Order:</span>
                          <span className="font-medium">{selectedSupplier.lastOrderDate}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Verification Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">GST Verified:</span>
                          <Badge className={selectedSupplier.gstVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedSupplier.gstVerified ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bank Verified:</span>
                          <Badge className={selectedSupplier.bankVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedSupplier.bankVerified ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <Badge className={selectedSupplier.insurance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedSupplier.insurance ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Certifications:</span>
                          <span className="font-medium">{selectedSupplier.certifications.length}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {((selectedSupplier.completedOrders / selectedSupplier.totalOrders) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Completion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {((selectedSupplier.lateDeliveries / selectedSupplier.totalOrders) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Late Delivery Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {selectedSupplier.complianceScore.toFixed(1)}/100
                          </div>
                          <div className="text-sm text-gray-600">Compliance Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Risk Factors Tab */}
                <TabsContent value="factors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Factor Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Bar data={riskFactorsData} options={chartOptions} />
                      </div>
                      {riskFactors && (
                        <div className="mt-6 space-y-4">
                          {Object.entries(riskFactors).map(([factor, score]) => (
                            <div key={factor} className="flex items-center justify-between">
                              <span className="font-medium capitalize">
                                {factor.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress value={score} className="w-32" />
                                <span className="text-sm font-medium">{score.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <Line data={riskTrendData} options={chartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Improvement Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                          <div key={index} className={`p-4 border rounded-lg ${
                            rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                            rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-green-200 bg-green-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{rec.factor}</h3>
                              <Badge className={
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {rec.priority.toUpperCase()} PRIORITY
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Current: {rec.currentScore.toFixed(1)}</span>
                              <span className="text-sm text-gray-600">Target: {rec.targetScore.toFixed(1)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{rec.improvement}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
