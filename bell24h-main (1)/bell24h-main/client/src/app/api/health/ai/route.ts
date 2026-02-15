import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const aiServices = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          status: process.env.OPENAI_API_KEY ? 'ready' : 'not_configured'
        },
        huggingface: {
          configured: !!process.env.HUGGINGFACE_API_KEY,
          status: process.env.HUGGINGFACE_API_KEY ? 'ready' : 'not_configured'
        },
        shapLime: {
          configured: true,
          status: 'ready',
          endpoints: [
            '/api/ai/explanations',
            '/dashboard/ai-insights'
          ]
        },
        msg91OTP: {
          configured: !!process.env.MSG91_AUTH_KEY,
          status: process.env.MSG91_AUTH_KEY ? 'ready' : 'not_configured'
        }
      },
      features: {
        explainableAI: true,
        supplierEvaluation: true,
        riskScoring: true,
        otpAuthentication: true
      }
    };

    // Check if critical AI services are configured
    const criticalServicesConfigured = aiServices.services.openai.configured || 
                                      aiServices.services.huggingface.configured;

    if (!criticalServicesConfigured) {
      return NextResponse.json(
        { 
          ...aiServices,
          status: 'degraded',
          warning: 'Some AI services are not configured'
        }, 
        { status: 200 }
      );
    }

    return NextResponse.json(aiServices, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'AI services check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
