'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Star, Phone, Mail, TrendingUp, TrendingDown } from 'lucide-react';

export default function SupplierRiskPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const suppliers = [
    {
      id: 1,
      name: 'SteelWorks Ltd',
      category: 'Steel & Metal',
      location: 'Mumbai, Maharashtra',
      riskScore: 15,
      riskLevel: 'low',
      rating: 4.8,
      totalOrders: 1250,
      onTimeDelivery: 96,
      qualityScore: 94,
      financialHealth: 'excellent',
      compliance: 'certified',
      lastOrder: '2024-01-10',
      contact: {
        phone: '+91 98765 43210',
        email: 'contact@steelworks.com'
      },
      strengths: ['ISO certified', 'On-time delivery', 'Quality assurance'],
      risks: ['High demand periods may cause delays'],
      recommendations: ['Continue partnership', 'Consider advance orders']
    },
    {
      id: 2,
      name: 'MetalCraft Industries',
      category: 'Steel & Metal',
      location: 'Pune, Maharashtra',
      riskScore: 35,
      riskLevel: 'medium',
      rating: 4.6,
      totalOrders: 890,
      onTimeDelivery: 88,
      qualityScore: 89,
      financialHealth: 'good',
      compliance: 'partial',
      lastOrder: '2024-01-08',
      contact: {
        phone: '+91 98765 43211',
        email: 'sales@metalcraft.com'
      },
      strengths: ['Competitive pricing', 'Custom solutions'],
      risks: ['Occasional delivery delays', 'Limited capacity'],
      recommendations: ['Monitor closely', 'Have backup suppliers']
    },
    {
      id: 3,
      name: 'SteelMax Solutions',
      category: 'Steel & Metal',
      location: 'Delhi, NCR',
      riskScore: 65,
      riskLevel: 'high',
      rating: 4.2,
      totalOrders: 650,
      onTimeDelivery: 78,
      qualityScore: 82,
      financialHealth: 'fair',
      compliance: 'basic',
      lastOrder: '2024-01-05',
      contact: {
        phone: '+91 98765 43212',
        email: 'info@steelmax.com'
      },
      strengths: ['Bulk order expertise', 'Competitive pricing'],
      risks: ['Frequent delays', 'Quality inconsistencies', 'Financial instability'],
      recommendations: ['Reduce dependency', 'Implement strict monitoring']
    }
  ];

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return CheckCircle;
      case 'medium': return Clock;
      case 'high': return AlertTriangle;
      default: return Shield;
    }
  };

  const SupplierCard = ({ supplier }) => {
    const RiskIcon = getRiskIcon(supplier.riskLevel);
    
    return (
      <div 
        className={`bg-white p-6 rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
          selectedSupplier?.id === supplier.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedSupplier(supplier)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{supplier.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {supplier.location}
              </span>
              <span>•</span>
              <span>{supplier.category}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{supplier.rating}</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{supplier.totalOrders} orders</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(supplier.riskLevel)}`}>
              <RiskIcon className="w-4 h-4 mr-1" />
              {supplier.riskLevel.toUpperCase()}
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{supplier.riskScore}</p>
            <p className="text-xs text-gray-500">Risk Score</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">On-Time Delivery</p>
            <p className="text-sm font-medium text-gray-900">{supplier.onTimeDelivery}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Quality Score</p>
            <p className="text-sm font-medium text-gray-900">{supplier.qualityScore}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Financial Health</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{supplier.financialHealth}</p>
          </div>
        </div>
      </div>
    );
  };

  const SupplierDetails = ({ supplier }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Supplier Risk Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
              <span className="text-lg font-bold text-gray-900">{supplier.riskScore}/100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">On-Time Delivery</span>
              <span className="text-sm text-gray-900">{supplier.onTimeDelivery}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Quality Score</span>
              <span className="text-sm text-gray-900">{supplier.qualityScore}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Financial Health</span>
              <span className="text-sm text-gray-900 capitalize">{supplier.financialHealth}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Compliance Status</span>
              <span className="text-sm text-gray-900 capitalize">{supplier.compliance}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{supplier.contact.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{supplier.contact.email}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{supplier.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Strengths</h4>
          <ul className="space-y-2">
            {supplier.strengths.map((strength, index) => (
              <li key={index} className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Risks</h4>
          <ul className="space-y-2">
            {supplier.risks.map((risk, index) => (
              <li key={index} className="flex items-center text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {supplier.recommendations.map((rec, index) => (
              <li key={index} className="flex items-center text-sm text-blue-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Risk Assessment</h1>
          <p className="text-gray-600">Monitor and assess supplier risk levels</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Risk</h3>
          <p className="text-3xl font-bold text-green-600">1</p>
          <p className="text-sm text-gray-600">Suppliers</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Medium Risk</h3>
          <p className="text-3xl font-bold text-yellow-600">1</p>
          <p className="text-sm text-gray-600">Suppliers</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">High Risk</h3>
          <p className="text-3xl font-bold text-red-600">1</p>
          <p className="text-sm text-gray-600">Suppliers</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Risk Score</h3>
          <p className="text-3xl font-bold text-blue-600">38</p>
          <p className="text-sm text-gray-600">Out of 100</p>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Suppliers</h2>
          <div className="space-y-4">
            {suppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </div>

        <div>
          {selectedSupplier ? (
            <SupplierDetails supplier={selectedSupplier} />
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Supplier</h3>
              <p className="text-gray-600">Click on a supplier to view detailed risk analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}