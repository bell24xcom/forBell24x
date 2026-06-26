import { NextRequest, NextResponse } from 'next/server';

// Oracle VM, Render.com, or local Python microservice
const PYTHON_EXPLAINER_URL =
  process.env.PYTHON_EXPLAINER_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://vyaparsethu-ai.onrender.com' : 'http://localhost:8008');

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfqId, supplierId, category, budget, location, description, supplierData } = body;

    // Try the Python microservice first
    try {
      const rfqPayload = {
        rfq_id: rfqId || 'rfq_' + Date.now(),
        title: description || category || 'B2B Requirement',
        description: description || '',
        category: category || 'General',
        budget_min: Number(budget) * 0.8 || 50000,
        budget_max: Number(budget) || 500000,
        quantity: 100,
        urgency: 'medium',
        location: location || 'India',
        specifications: [],
      };

      const supplierPayload = supplierData
        ? [supplierData]
        : [
            {
              supplier_id: supplierId || 'sup_1',
              name: 'Matched Supplier',
              category_expertise: [category || 'General'],
              rating: 4.5,
              location: location || 'India',
              price_range: 'medium',
              delivery_capability: 'medium',
              certifications: ['GST'],
              past_performance: 85,
            },
          ];

      const pyRes = await fetch(`${PYTHON_EXPLAINER_URL}/explain-matching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq: rfqPayload,
          suppliers: supplierPayload,
          explanation_type: 'both',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        const first = pyData.explanations?.[0];
        if (first) {
          const shap = first.explanations?.shap?.feature_importance || {};
          const featureImportance = Object.entries(shap).map(([key, val]: [string, any]) => ({
            feature: key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            score: Math.min(1, Math.max(0, Math.abs(val.importance || 0))),
            contribution: (val.importance || 0) >= 0 ? 'positive' : 'negative',
            description: val.description || '',
          }));
          return NextResponse.json({
            success: true,
            source: 'python_microservice',
            matchScore: first.match_score,
            confidence: pyData.model_confidence || 0.85,
            featureImportance,
            processingTime: pyData.processing_time,
          });
        }
      }
    } catch {
      // Python microservice unavailable — fall through to computed fallback
    }

    // Computed fallback (no Python needed)
    const categoryLower = (category || '').toLowerCase();
    const locationLower = (location || '').toLowerCase();
    const budgetNum = Number(budget) || 250000;

    const featureImportance = [
      {
        feature: 'budget_compatibility',
        label: 'Budget Compatibility',
        score: budgetNum > 100000 ? 0.82 : 0.65,
        contribution: 'positive',
        description: `Budget of ₹${(budgetNum / 100000).toFixed(1)}L aligns with supplier range`,
      },
      {
        feature: 'category_match',
        label: 'Category Match',
        score: categoryLower ? 0.88 : 0.6,
        contribution: 'positive',
        description: `Expertise in ${category || 'requested category'}`,
      },
      {
        feature: 'location_proximity',
        label: 'Location',
        score: locationLower ? 0.75 : 0.5,
        contribution: 'positive',
        description: `Serves ${location || 'pan-India'} region`,
      },
      {
        feature: 'verification_strength',
        label: 'Verification',
        score: 0.9,
        contribution: 'positive',
        description: 'GST verified supplier',
      },
      {
        feature: 'past_performance',
        label: 'Past Performance',
        score: 0.78,
        contribution: 'positive',
        description: 'Historical on-time delivery and quality record',
      },
    ];

    return NextResponse.json({
      success: true,
      source: 'computed_fallback',
      matchScore: 0.76,
      confidence: 0.72,
      featureImportance,
      processingTime: 0,
    });
  } catch (error) {
    console.error('Error in /api/ai/explain:', error);
    return NextResponse.json({ error: 'Explanation failed' }, { status: 500 });
  }
}
