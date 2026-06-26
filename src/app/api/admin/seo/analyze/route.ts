import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { callSeoLlm, parseJsonFromLlm } from '@/lib/seo-llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type AnalyzeType = 'gsc_queries' | 'position_tracking' | 'content_ideas' | 'ref_domains' | 'generic';

const SYSTEM = `You are an SEO analyst for VyaparSethu (vyaparsethu.com), a verified B2B marketplace in India competing with IndiaMART and TradeIndia.
Extract structured SEO opportunities from the user's CSV or text export. Return ONLY valid JSON.
Focus on B2B marketplace keywords, content gaps, backlink targets, and actionable tasks for a small team with no paid SEO tools.`;

function buildPrompt(type: AnalyzeType, text: string): string {
  const schemas: Record<AnalyzeType, string> = {
    gsc_queries: `{
  "summary": "string",
  "topOpportunities": [{ "keyword": "string", "impressions": number, "clicks": number, "position": number, "suggestedAction": "string", "targetPage": "string", "priority": "high|medium|low" }],
  "contentGaps": ["string"],
  "quickWins": ["string"]
}`,
    position_tracking: `{
  "summary": "string",
  "keywords": [{ "keyword": "string", "position": "string|null", "volume": number, "sd": number, "priority": "high|medium|low", "contentBrief": "string" }],
  "comparisonArticleNeeded": boolean,
  "topPriorityKeyword": "string"
}`,
    content_ideas: `{
  "summary": "string",
  "ideas": [{ "title": "string", "url": "string", "estVisits": number, "vyaparsethuAngle": "string", "contentType": "blog|video|category|glossary" }],
  "recommendedVyaparSethuPages": ["string"]
}`,
    ref_domains: `{
  "summary": "string",
  "outreachTargets": [{ "domain": "string", "domainAuthority": number, "linksToCompetitors": ["string"], "action": "string", "priority": "high|medium|low" }],
  "quickWins": ["string"]
}`,
    generic: `{
  "summary": "string",
  "opportunities": [{ "title": "string", "description": "string", "priority": "high|medium|low", "suggestedAction": "string" }]
}`,
  };

  return `Analyze this ${type.replace('_', ' ')} export for VyaparSethu SEO.

Return JSON matching this schema:
${schemas[type]}

Input data:
---
${text.slice(0, 12000)}
---`;
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json();
    const { csvText, type = 'generic' } = body as { csvText?: string; type?: AnalyzeType };

    if (!csvText?.trim()) {
      return NextResponse.json({ error: 'csvText is required' }, { status: 400 });
    }

    const validTypes: AnalyzeType[] = ['gsc_queries', 'position_tracking', 'content_ideas', 'ref_domains', 'generic'];
    const analyzeType: AnalyzeType = validTypes.includes(type) ? type : 'generic';

    const llm = await callSeoLlm(SYSTEM, buildPrompt(analyzeType, csvText), 2500);

    if (!llm) {
      return NextResponse.json(
        {
          error: 'No LLM available — set GROQ_API_KEY or NVIDIA_API_KEY in Vercel',
          fallback: parseCsvFallback(analyzeType, csvText),
        },
        { status: 503 },
      );
    }

    let parsed: unknown;
    try {
      parsed = parseJsonFromLlm(llm.content);
    } catch {
      return NextResponse.json(
        { error: 'LLM returned invalid JSON', raw: llm.content.slice(0, 500), provider: llm.provider },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      type: analyzeType,
      provider: llm.provider,
      model: llm.model,
      result: parsed,
    });
  } catch (error) {
    console.error('[SEO Analyze]', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

/** Rule-based fallback when no API key — still useful for CSV upload */
function parseCsvFallback(type: AnalyzeType, csv: string) {
  const lines = csv.trim().split('\n').slice(1);
  if (type === 'position_tracking') {
    const keywords = lines.slice(0, 20).map(line => {
      const parts = line.split(',');
      return {
        keyword: parts[2]?.replace(/"/g, '') ?? '',
        position: parts[1]?.replace(/"/g, '') ?? 'Not ranked',
        volume: parseInt(parts[5] ?? '0', 10) || 0,
        sd: parseInt(parts[4] ?? '0', 10) || 0,
      };
    });
    return { summary: 'Parsed without AI — add GROQ or NVIDIA key for briefs', keywords };
  }
  if (type === 'content_ideas') {
    const ideas = lines.slice(0, 15).map(line => {
      const parts = line.split(',');
      return { title: parts[1]?.replace(/"/g, '') ?? '', url: parts[2]?.replace(/"/g, '') ?? '', estVisits: parseInt(parts[3] ?? '0', 10) || 0 };
    });
    return { summary: 'Parsed without AI', ideas };
  }
  return { summary: `${lines.length} rows detected — configure LLM for full analysis`, rowCount: lines.length };
}
