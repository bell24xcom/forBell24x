/**
 * H6-13 - Claim invitation message template (pure logic, no I/O)
 *
 * Renders {{variable}} placeholders and rejects unsubstantiated claims
 * ("verified", "GST verified", "official", guaranteed-outcome language)
 * per the sprint's truthfulness requirement, unless the caller explicitly
 * asserts the claim is true for this specific recipient (e.g. a company
 * whose gstNumber is actually on file).
 */

export interface TemplateVars {
  company_name: string;
  category?: string;
  city?: string;
  claim_url: string;
}

const ALLOWED_VARS = ['company_name', 'category', 'city', 'claim_url'] as const;

export const DEFAULT_CLAIM_TEMPLATE =
  "Namaste {{company_name}}! Your business profile is listed on VyaparSethu, India's B2B Trade Network. " +
  'Claim and manage your company profile here: {{claim_url}}';

/** Phrases that assert something we may not have evidence for. Checked case-insensitively. */
const UNSUBSTANTIATED_CLAIM_PATTERNS: RegExp[] = [
  /\bverified\b/i,
  /\bgst[\s-]?verified\b/i,
  /\bofficial\b/i,
  /\bguarantee(d)?\s+(leads|rfqs|sales|orders|buyers)\b/i,
];

export interface RenderResult {
  ok: boolean;
  text?: string;
  errors: string[];
}

function stripControlChars(value: string): string {
  return Array.from(value)
    .filter(ch => {
      const code = ch.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join('');
}

function escapeForMessage(value: string): string {
  // WhatsApp/SMS/email are plain text - strip control characters and
  // collapse any literal {{ / }} a caller-supplied value might contain,
  // so a malicious company/category string can't inject a fake variable
  // or break the template boundary.
  return stripControlChars(value).replace(/\{\{|\}\}/g, '');
}

/**
 * Renders a template string. Unknown {{var}} placeholders are treated as an
 * error rather than silently passed through or silently blanked.
 */
export function renderClaimTemplate(
  template: string,
  vars: TemplateVars,
  options: { allowVerifiedClaim?: boolean } = {}
): RenderResult {
  const errors: string[] = [];

  const placeholderPattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const found: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = placeholderPattern.exec(template)) !== null) {
    found.push(match[1]);
  }
  for (const name of found) {
    if (!ALLOWED_VARS.includes(name as any)) {
      errors.push(`Unknown template variable: {{${name}}}`);
    }
  }
  if (errors.length > 0) return { ok: false, errors };

  const varsMap = vars as unknown as Record<string, string | undefined>;
  const text = template.replace(placeholderPattern, (_match, name: string) => {
    const raw = varsMap[name] ?? '';
    return escapeForMessage(raw);
  });

  if (!options.allowVerifiedClaim) {
    for (const pattern of UNSUBSTANTIATED_CLAIM_PATTERNS) {
      if (pattern.test(text)) {
        errors.push(`Template text contains an unsubstantiated claim matching ${pattern}`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, text, errors: [] };
}
