import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { rfq, suppliers, explanation_type } = await request.json();

    // Mock AI explainability response for now
    // In production, this would call your actual AI service
    const mockExplanations = suppliers.map((supplier: any) => ({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.name,
      match_score: Math.random() * 0.3 + 0.7, // Random score between 0.7-1.0
      explanations: {
        shap: {
          feature_importance: {
            'location_match': Math.random() * 0.4 + 0.3,
            'category_expertise': Math.random() * 0.4 + 0.4,
            'price_range': Math.random() * 0.3 + 0.2,
            'past_performance': Math.random() * 0.3 + 0.3,
            'certifications': Math.random() * 0.2 + 0.1,
          },
          global_impact: Math.random() * 0.2 + 0.8,
        },
        lime: {
          local_importance: {
            'supplier_location': supplier.location === rfq.location ? 0.9 : 0.3,
            'category_match': supplier.category_expertise.includes(rfq.category) ? 0.8 : 0.2,
            'budget_alignment': 
              supplier.price_range === 'low' && rfq.budget_min <= 500000 ? 0.9 :
              supplier.price_range === 'medium' && rfq.budget_min <= 800000 ? 0.8 :
              supplier.price_range === 'high' && rfq.budget_max >= 1000000 ? 0.7 : 0.4,
            'delivery_capability': supplier.delivery_capability === 'fast' ? 0.8 : 0.6,
          },
          confidence_score: Math.random() * 0.2 + 0.8,
        },
      },
    }));

    // Sort by match score (highest first)
    mockExplanations.sort((a: any, b: any) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      data: {
        explanations: mockExplanations,
        metadata: {
          model_version: 'mock-v1.0',
          explanation_type: explanation_type || 'both',
          timestamp: new Date().toISOString(),
          rfq_processed: rfq.rfq_id,
          suppliers_analyzed: suppliers.length,
        },
      },
    });

  } catch (error) {
    console.error('AI Explainability API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate AI explanations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Explainability API is running',
    endpoints: {
      POST: '/api/ai-explainability',
      description: 'Generate AI explanations for supplier-RFQ matching',
    },
  });
}
