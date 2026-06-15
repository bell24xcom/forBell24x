import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// POST /api/admin/generate-blog
// Body: { category: string, city?: string, slug?: string, adminToken: string }
// Returns: { slug, title, body, excerpt, keywords }
//
// Usage: curl -X POST /api/admin/generate-blog \
//   -H "Content-Type: application/json" \
//   -d '{"category":"Steel","city":"Kalamboli","adminToken":"..."}'

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, city, slug: customSlug, adminToken } = body;

    if (!ADMIN_TOKEN || adminToken !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!category) {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const locationContext = city ? ` specifically focusing on the ${city} industrial cluster` : '';
    const prompt = `You are a senior B2B trade journalist writing for VyaparSethu, India's B2B Trade Network. Write a comprehensive, SEO-optimised blog article about "${category}" procurement for Indian B2B buyers${locationContext}.

REQUIREMENTS:
- Word count: 900–1100 words
- Tone: authoritative, practical, India-specific
- Use VyaparSethu's word system: "Quotation" (not RFQ), "Protected Payment" (not escrow), "Verified Supplier" (not vendor), "Trade Account" (not wallet)
- Include specific GST rates, HSN codes, and regulatory details relevant to India
- Include a "How to Source via VyaparSethu" section near the end
- No generic preamble, no meta-commentary, start directly with the article

OUTPUT FORMAT (JSON only, no markdown fences):
{
  "title": "SEO title (60–70 chars)",
  "excerpt": "Meta description (150–160 chars)",
  "keywords": ["keyword1", "keyword2", ...],
  "slug": "url-slug-lowercase-dashes",
  "body": "Full article body in plain text with paragraph breaks (\\n\\n between paragraphs). Use **bold** for key terms. Use - bullet list prefix for lists."
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from Groq' }, { status: 500 });
    }

    let article: Record<string, unknown>;
    try {
      article = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from Groq', raw: content }, { status: 500 });
    }

    if (customSlug) article.slug = customSlug;

    return NextResponse.json({
      success: true,
      category,
      city: city || null,
      article,
      tokensUsed: completion.usage?.total_tokens,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
