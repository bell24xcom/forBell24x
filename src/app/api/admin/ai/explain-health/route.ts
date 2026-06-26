import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const PYTHON_EXPLAINER_URL =
  process.env.PYTHON_EXPLAINER_URL || 'https://vyaparsethu-ai.onrender.com';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const configuredUrl = process.env.PYTHON_EXPLAINER_URL || null;
  const healthUrl = `${PYTHON_EXPLAINER_URL.replace(/\/$/, '')}/health`;

  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(8000) });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({
      success: res.ok,
      serviceUrl: PYTHON_EXPLAINER_URL,
      configuredInVercel: !!configuredUrl,
      health: body,
      hint: configuredUrl
        ? undefined
        : 'Set PYTHON_EXPLAINER_URL=https://vyaparsethu-ai.onrender.com in Vercel for production SHAP/LIME',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      serviceUrl: PYTHON_EXPLAINER_URL,
      configuredInVercel: !!configuredUrl,
      error: error instanceof Error ? error.message : 'Health check failed',
      hint: 'Render free tier may sleep — first request can take 30s',
    });
  }
}
