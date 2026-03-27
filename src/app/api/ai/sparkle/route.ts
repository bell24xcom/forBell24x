import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const PROMPTS: Record<string, (value: string, context?: string) => string> = {
  'RFQ Title': (v, ctx) =>
    `Write a clear, professional B2B procurement title for this requirement: "${v}". ${ctx ? `Category: ${ctx}.` : ''} Keep it under 80 characters. Return ONLY the title, no explanation.`,

  'RFQ Description': (v, ctx) =>
    `Write a professional B2B procurement requirement description for: "${v}". ${ctx ? `Category: ${ctx}.` : ''} Include what is needed, quality expectations, and delivery requirements. Under 150 words. Return ONLY the description.`,

  'Product Description': (v, ctx) =>
    `Write a detailed B2B product/material description for: "${v}". ${ctx ? `Context: ${ctx}.` : ''} Include specifications, material grade, application, and relevant standards. Professional, under 200 words. Return ONLY the description.`,

  'Supplier Product Description': (v, ctx) =>
    `Write a professional product listing for a B2B supplier selling: "${v}". ${ctx ? `Category: ${ctx}.` : ''} Include key features, specs, applications, and why buyers should choose it. Under 200 words. Return ONLY the description.`,

  'MOQ': (v, ctx) =>
    `Suggest a reasonable Minimum Order Quantity for: "${ctx || v}". Consider typical B2B manufacturing quantities in India. Return ONLY the number with unit (e.g., "500 kg" or "1000 pieces").`,

  'Timeline': (v, ctx) =>
    `Suggest a reasonable delivery timeline for: "${ctx || v}" in India B2B manufacturing context. Return ONLY the timeline (e.g., "7-10 business days" or "2-3 weeks").`,

  'HSN Code': (v, ctx) =>
    `What is the most likely HSN (Harmonized System of Nomenclature) code for: "${v}"? ${ctx ? `Category: ${ctx}.` : ''} Return ONLY the HSN code and product description in format: "XXXX - Product description". If uncertain, give the most common 4-digit chapter code.`,
};

const FALLBACKS: Record<string, (v: string, ctx?: string) => string> = {
  'RFQ Title': (v) => `Procurement Request: ${v} — Industrial Grade, Bulk Quantity`,
  'RFQ Description': (v) => `Requirement for ${v}. Please provide product specifications, grade/quality details, packaging requirements, and delivery timeline. GST invoice mandatory.`,
  'Product Description': (v) => `${v} — High-quality material/product suitable for industrial manufacturing. Available in standard grades with custom specifications on request. MOQ applies. GST invoice provided.`,
  'Supplier Product Description': (v) => `${v} — Premium quality, competitively priced. Suitable for industrial and commercial use. Available in bulk quantities. GST invoice, delivery across India.`,
  'MOQ': (v, ctx) => `100 ${ctx?.includes('kg') || ctx?.includes('ton') ? 'kg' : 'units'}`,
  'Timeline': () => '7-14 business days',
  'HSN Code': (v) => `8544 - ${v} (Verify on GST portal for accurate HSN)`,
};

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    const { fieldName, currentValue, context } = await request.json();

    if (!fieldName || !currentValue?.trim()) {
      return NextResponse.json({ error: 'fieldName and currentValue are required' }, { status: 400 });
    }

    const promptFn = PROMPTS[fieldName] || PROMPTS['Product Description'];
    const prompt = promptFn(currentValue, context);
    const systemMsg = 'You are a B2B procurement expert for Indian manufacturing. Write clear, professional content. Return ONLY the requested text — no preamble, no explanation, no quotes.';

    // Try Groq first (free tier, fast)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemMsg },
              { role: 'user', content: prompt },
            ],
            max_tokens: 350,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const suggestion = data.choices?.[0]?.message?.content?.trim();
          if (suggestion) return NextResponse.json({ success: true, suggestion, model: 'groq' });
        }
      } catch { /* fall through */ }
    }

    // Try NVIDIA (DeepSeek)
    const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_DEEPSEEK_KEY;
    if (nvidiaKey) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'meta/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: systemMsg },
              { role: 'user', content: prompt },
            ],
            max_tokens: 350,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const suggestion = data.choices?.[0]?.message?.content?.trim();
          if (suggestion) return NextResponse.json({ success: true, suggestion, model: 'nvidia' });
        }
      } catch { /* fall through */ }
    }

    // Fallback: template-based (always works, no AI needed)
    const fallbackFn = FALLBACKS[fieldName] || FALLBACKS['Product Description'];
    const suggestion = fallbackFn(currentValue, context);
    return NextResponse.json({ success: true, suggestion, model: 'template' });

  } catch (error) {
    console.error('AI Sparkle error:', error);
    return NextResponse.json({ error: 'AI suggestion failed' }, { status: 500 });
  }
}
