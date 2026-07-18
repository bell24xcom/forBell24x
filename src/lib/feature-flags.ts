/**
 * VyaparSethu Feature Flags
 *
 * All intelligence and experimental flags default to FALSE.
 * Change via Vercel environment variables — no code change needed.
 * Emergency kill: set to 'false' in Vercel → redeploy.
 */

export const FLAGS = {
  // Enterprise Intelligence Hub (Phase D — gate: 100 verified suppliers)
  INTELLIGENCE_ENABLED: process.env.NEXT_PUBLIC_INTELLIGENCE_ENABLED === 'true',

  // Trust Layer (Phase C — gate: 50 verified suppliers)
  SHAP_ENABLED: process.env.NEXT_PUBLIC_SHAP_ENABLED === 'true',

  // AI Layer — Applications (Phase B)
  VOICE_RFQ_ENABLED: process.env.NEXT_PUBLIC_VOICE_RFQ_ENABLED === 'true',
  VIDEO_RFQ_ENABLED: process.env.NEXT_PUBLIC_VIDEO_RFQ_ENABLED === 'true',

  // AI Layer — Digital Employees (Phase D)
  AI_AGENTS_ENABLED: process.env.NEXT_PUBLIC_AI_AGENTS_ENABLED === 'true',

  // AI Factory (Phase E)
  AI_FACTORY_ENABLED: process.env.NEXT_PUBLIC_AI_FACTORY_ENABLED === 'true',
} as const;

export type FeatureFlag = keyof typeof FLAGS;
