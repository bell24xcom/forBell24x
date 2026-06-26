import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { analyzeOnPage } from '@/lib/seo-on-page';
import { callSeoLlm } from '@/lib/seo-llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const { url, targetKeyword, aiSuggestions } = await request.json();
    if (!url?.trim()) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const result = await analyzeOnPage(url, targetKeyword);

    let suggestions: string[] | null = null;
    if (aiSuggestions) {
      const llm = await callSeoLlm(
        'You are an SEO expert for VyaparSethu B2B marketplace India. Return JSON only: { "suggestions": ["...", "..."] }',
        `Analyze this on-page SEO result and give 3 specific fixes:\n${JSON.stringify(result, null, 2)}`,
        500,
      );
      if (llm) {
        try {
          const parsed = JSON.parse(llm.content.replace(/```json\n?|\n?```/g, ''));
          suggestions = parsed.suggestions ?? null;
        } catch {
          suggestions = [llm.content.slice(0, 500)];
        }
      }
    }

    return NextResponse.json({ success: true, result, aiSuggestions: suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 },
    );
  }
}
