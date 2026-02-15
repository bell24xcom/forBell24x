import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for success predictions
  const predictions = [
    {
      id: 1,
      supplierName: 'TechCorp Industries',
      successRate: 92,
      confidence: 0.89,
      riskFactors: ['Seasonal demand fluctuations'],
      recommendations: ['Increase inventory during peak seasons', 'Strengthen quality control'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      supplierName: 'Global Manufacturing Ltd',
      successRate: 78,
      confidence: 0.76,
      riskFactors: ['Supply chain disruptions', 'Quality inconsistencies'],
      recommendations: ['Diversify suppliers', 'Implement stricter QC protocols'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 3,
      supplierName: 'Precision Parts Co',
      successRate: 95,
      confidence: 0.94,
      riskFactors: ['High competition for capacity'],
      recommendations: ['Secure long-term contracts', 'Maintain premium pricing'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 4,
      supplierName: 'Innovation Labs',
      successRate: 88,
      confidence: 0.82,
      riskFactors: ['Rapid technology changes'],
      recommendations: ['Invest in R&D', 'Build flexible production lines'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 5,
      supplierName: 'Quality First Manufacturing',
      successRate: 91,
      confidence: 0.87,
      riskFactors: ['Labor shortage'],
      recommendations: ['Improve employee retention', 'Automate repetitive tasks'],
      lastUpdated: '2024-01-15'
    }
  ];

  return NextResponse.json(predictions);
}
