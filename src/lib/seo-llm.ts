/**
 * Shared LLM client for SEO extraction — Groq first, then NVIDIA NIM.
 */

export type LlmProvider = 'groq' | 'nvidia' | 'none';

export interface LlmResult {
  content: string;
  provider: LlmProvider;
  model: string;
}

export async function callSeoLlm(system: string, user: string, maxTokens = 2000): Promise<LlmResult | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey !== 'your-groq-api-key-here') {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: maxTokens,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return { content, provider: 'groq', model: 'llama-3.3-70b-versatile' };
      }
    } catch {
      /* fall through */
    }
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_DEEPSEEK_KEY;
  if (nvidiaKey) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_tokens: maxTokens,
          temperature: 0.2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return { content, provider: 'nvidia', model: 'meta/llama-3.3-70b-instruct' };
      }
    } catch {
      /* fall through */
    }
  }

  return null;
}

export function parseJsonFromLlm(raw: string): unknown {
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
}
