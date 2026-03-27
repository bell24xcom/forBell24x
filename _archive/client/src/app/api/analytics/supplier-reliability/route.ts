import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for supplier reliability
  const reliabilityData = [
    {
      id: 1,
      name: 'TechCorp Industries',
      reliabilityScore: 87,
      trend: 'improving',
      riskLevel: 'low',
      keyMetrics: {
        onTimeDelivery: 94,
        qualityRating: 4.2,
        complianceScore: 92,
        financialHealth: 85
      }
    },
    {
      id: 2,
      name: 'Global Manufacturing Ltd',
      reliabilityScore: 72,
      trend: 'declining',
      riskLevel: 'medium',
      keyMetrics: {
        onTimeDelivery: 78,
        qualityRating: 3.8,
        complianceScore: 75,
        financialHealth: 68
      }
    },
    {
      id: 3,
      name: 'Precision Parts Co',
      reliabilityScore: 94,
      trend: 'stable',
      riskLevel: 'low',
      keyMetrics: {
        onTimeDelivery: 96,
        qualityRating: 4.6,
        complianceScore: 95,
        financialHealth: 92
      }
    },
    {
      id: 4,
      name: 'Innovation Labs',
      reliabilityScore: 79,
      trend: 'improving',
      riskLevel: 'medium',
      keyMetrics: {
        onTimeDelivery: 82,
        qualityRating: 4.1,
        complianceScore: 78,
        financialHealth: 75
      }
    },
    {
      id: 5,
      name: 'Quality First Manufacturing',
      reliabilityScore: 91,
      trend: 'stable',
      riskLevel: 'low',
      keyMetrics: {
        onTimeDelivery: 93,
        qualityRating: 4.5,
        complianceScore: 89,
        financialHealth: 88
      }
    }
  ];

  return NextResponse.json(reliabilityData);
}
