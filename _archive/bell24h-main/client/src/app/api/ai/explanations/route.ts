import { NextRequest, NextResponse } from 'next/server';

// Mock SHAP/LIME data - in production, this would come from your ML pipeline
const mockShapData = [
  {
    feature: 'Financial Stability Score',
    value: 8.5,
    shap_value: 0.234,
    importance: 0.15,
    category: 'Financial'
  },
  {
    feature: 'GST Compliance Status',
    value: 'Valid',
    shap_value: 0.189,
    importance: 0.12,
    category: 'Compliance'
  },
  {
    feature: 'Delivery Performance',
    value: 92.5,
    shap_value: 0.156,
    importance: 0.10,
    category: 'Performance'
  },
  {
    feature: 'Quality Rating',
    value: 4.2,
    shap_value: 0.134,
    importance: 0.09,
    category: 'Performance'
  },
  {
    feature: 'Years in Business',
    value: 8,
    shap_value: 0.098,
    importance: 0.07,
    category: 'Reliability'
  },
  {
    feature: 'Previous RFQ Success Rate',
    value: 85.2,
    shap_value: 0.087,
    importance: 0.06,
    category: 'Performance'
  },
  {
    feature: 'Certification Count',
    value: 5,
    shap_value: 0.076,
    importance: 0.05,
    category: 'Compliance'
  },
  {
    feature: 'Response Time (hours)',
    value: 2.5,
    shap_value: -0.045,
    importance: 0.03,
    category: 'Performance'
  },
  {
    feature: 'Price Competitiveness',
    value: 7.8,
    shap_value: 0.034,
    importance: 0.02,
    category: 'Financial'
  },
  {
    feature: 'Geographic Location',
    value: 'Tier 1 City',
    shap_value: 0.023,
    importance: 0.01,
    category: 'Reliability'
  }
];

const mockLimeData = [
  {
    feature: 'Financial Stability Score',
    value: 8.5,
    weight: 0.234,
    explanation: 'High financial stability score indicates strong creditworthiness and ability to fulfill large orders.',
    category: 'Financial',
    confidence: 0.92
  },
  {
    feature: 'GST Compliance Status',
    value: 'Valid',
    weight: 0.189,
    explanation: 'Valid GST registration ensures tax compliance and reduces legal risks for transactions.',
    category: 'Compliance',
    confidence: 0.88
  },
  {
    feature: 'Delivery Performance',
    value: 92.5,
    weight: 0.156,
    explanation: 'Excellent delivery performance history suggests reliable supply chain management.',
    category: 'Performance',
    confidence: 0.85
  },
  {
    feature: 'Quality Rating',
    value: 4.2,
    weight: 0.134,
    explanation: 'High quality rating indicates consistent product/service quality standards.',
    category: 'Performance',
    confidence: 0.82
  },
  {
    feature: 'Years in Business',
    value: 8,
    weight: 0.098,
    explanation: 'Established business with 8 years of experience shows market stability and expertise.',
    category: 'Reliability',
    confidence: 0.78
  },
  {
    feature: 'Previous RFQ Success Rate',
    value: 85.2,
    weight: 0.087,
    explanation: 'High success rate in previous RFQs demonstrates proven track record.',
    category: 'Performance',
    confidence: 0.75
  },
  {
    feature: 'Certification Count',
    value: 5,
    weight: 0.076,
    explanation: 'Multiple certifications indicate commitment to quality standards and compliance.',
    category: 'Compliance',
    confidence: 0.72
  },
  {
    feature: 'Response Time (hours)',
    value: 2.5,
    weight: -0.045,
    explanation: 'Slightly slower response time compared to industry average may impact urgency.',
    category: 'Performance',
    confidence: 0.68
  },
  {
    feature: 'Price Competitiveness',
    value: 7.8,
    weight: 0.034,
    explanation: 'Good price competitiveness offers value for money in the market.',
    category: 'Financial',
    confidence: 0.65
  },
  {
    feature: 'Geographic Location',
    value: 'Tier 1 City',
    weight: 0.023,
    explanation: 'Location in tier 1 city provides better infrastructure and logistics support.',
    category: 'Reliability',
    confidence: 0.62
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const rfqId = searchParams.get('rfqId');
    const type = searchParams.get('type') || 'both'; // 'shap', 'lime', or 'both'

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Fetch supplier data from database
    // 2. Run SHAP/LIME analysis using your ML pipeline
    // 3. Return actual computed values

    // For now, return mock data with some randomization
    const response: any = {
      supplierId,
      rfqId,
      timestamp: new Date().toISOString(),
      prediction: {
        score: 8.7,
        confidence: 0.89,
        recommendation: 'Highly Recommended',
        reasoning: 'Strong financial stability, excellent compliance record, and proven performance history make this supplier highly suitable for your RFQ requirements.'
      }
    };

    if (type === 'shap' || type === 'both') {
      response.shap = {
        data: mockShapData,
        summary: {
          totalFeatures: mockShapData.length,
          positiveFeatures: mockShapData.filter(d => d.shap_value > 0).length,
          negativeFeatures: mockShapData.filter(d => d.shap_value < 0).length,
          maxImportance: Math.max(...mockShapData.map(d => d.importance)),
          avgConfidence: 0.85
        }
      };
    }

    if (type === 'lime' || type === 'both') {
      response.lime = {
        data: mockLimeData,
        summary: {
          totalFeatures: mockLimeData.length,
          supportingFeatures: mockLimeData.filter(d => d.weight > 0).length,
          opposingFeatures: mockLimeData.filter(d => d.weight < 0).length,
          avgConfidence: mockLimeData.reduce((sum, d) => sum + d.confidence, 0) / mockLimeData.length
        }
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching AI explanations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI explanations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, rfqId, features } = body;

    if (!supplierId || !features) {
      return NextResponse.json(
        { error: 'Supplier ID and features are required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Validate the input features
    // 2. Run real-time SHAP/LIME analysis
    // 3. Store results in database
    // 4. Return computed explanations

    // For now, return mock response
    const response = {
      supplierId,
      rfqId,
      timestamp: new Date().toISOString(),
      status: 'success',
      message: 'AI explanations computed successfully',
      shap: {
        data: mockShapData,
        summary: {
          totalFeatures: mockShapData.length,
          positiveFeatures: mockShapData.filter(d => d.shap_value > 0).length,
          negativeFeatures: mockShapData.filter(d => d.shap_value < 0).length
        }
      },
      lime: {
        data: mockLimeData,
        summary: {
          totalFeatures: mockLimeData.length,
          supportingFeatures: mockLimeData.filter(d => d.weight > 0).length,
          opposingFeatures: mockLimeData.filter(d => d.weight < 0).length
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error computing AI explanations:', error);
    return NextResponse.json(
      { error: 'Failed to compute AI explanations' },
      { status: 500 }
    );
  }
}
