import { NextRequest, NextResponse } from 'next/server';

// Use server-side environment variable for backend API
// In production: https://api.bell24h.com
// In development: http://localhost:8000
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price, lead_time, supplier_rating, distance_km, past_on_time_rate } = body;

    // Map frontend features to backend expected format
    const backendFeatures = {
      price: price || 125000,
      lead_time: lead_time || 7,
      supplier_rating: supplier_rating || 4.8,
      distance_km: distance_km || 89,
      past_on_time_rate: past_on_time_rate || 0.97,
      rfq_length: 100,
      buyer_tier: 2,
      quantity: 300,
      urgency_score: 0.8,
      region: 1,
      negotiations_count: 3,
      previous_orders: 28,
      multimodal_rfq: 1,
      transcript_length: 325,
      industry_type: 1,
      quoted_suppliers: 9,
    };

    try {
      // Call FastAPI backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/ai/explain-match/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendFeatures),
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        
        // Transform backend response to frontend format
        const feature_importance: Record<string, number> = {};
        if (Array.isArray(backendData)) {
          // If backend returns array of explanations
          backendData.forEach((item: any) => {
            feature_importance[item.feature] = item.importance || 0;
          });
        } else if (backendData.feature_importance) {
          // If backend returns dict format
          Object.assign(feature_importance, backendData.feature_importance);
        }

        return NextResponse.json({
          feature_importance,
          model_used: backendData.model_used !== false,
          shap_plots: backendData.shap_plots || {}
        });
      }
    } catch (backendError) {
      console.warn('Backend not available, using fallback:', backendError);
    }

    // Fallback: Mock data if backend unavailable
    const feature_importance: Record<string, number> = {
      price: price ? Math.abs(price / 100000) * 0.34 : 0.34,
      lead_time: lead_time ? Math.abs(lead_time / 30) * 0.21 : 0.21,
      supplier_rating: supplier_rating ? Math.abs(supplier_rating / 5) * 0.15 : 0.15,
      distance_km: distance_km ? Math.abs(distance_km / 200) * 0.12 : 0.12,
      past_on_time_rate: past_on_time_rate ? Math.abs(past_on_time_rate) * 0.10 : 0.10,
      compliance: 0.08,
      quality: 0.06,
      innovation: 0.04
    };

    const shap_plots = {
      force: '<div style="padding: 20px; background: white; border-radius: 8px;"><p>SHAP Force Plot (Fallback Mode)</p><p>Backend unavailable - using mock data</p></div>',
      waterfall: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    return NextResponse.json({
      feature_importance,
      model_used: false,
      shap_plots
    });

  } catch (error) {
    console.error('Error in AI explain endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compute AI explanations',
        feature_importance: {},
        model_used: false,
        shap_plots: {}
      },
      { status: 500 }
    );
  }
}

