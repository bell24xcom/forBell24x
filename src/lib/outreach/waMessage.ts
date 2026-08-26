/**
 * Shared WhatsApp message builders for supplier acquisition outreach
 * (cold "claim your profile" invite + day3/7/14 drip follow-ups).
 *
 * Added to fix a bug found in production copy: when a supplier record has
 * no `company` name, three separate call sites each did
 *   (s.company && s.company.trim()) ? s.company : 'your business'
 * then substituted that into `Your business "${companyName}" has a
 * verified profile...` — producing the literal, sent-to-real-suppliers text
 * `Your business "your business" has a verified profile...`.
 *
 * That same text also asserted "verified profile" for suppliers who have
 * NOT been claimed or KYC-verified yet (they're pre-built/scraped listings
 * at this stage) — an unsubstantiated claim per the truthfulness rule
 * already enforced for the H6-13 claim-invitation template, see
 * src/lib/outreach/messageTemplate.ts's UNSUBSTANTIATED_CLAIM_PATTERNS.
 *
 * This file is now the single source of truth for that copy so a future
 * change (e.g. adding a 4th send site) can't reintroduce either bug by
 * copy-pasting the old inline template again.
 *
 * SPRINT-STDV-01 pass: "Buyers are actively posting Requirements in your
 * category" / "buyers are searching your category right now" were their own
 * unverified activity claims — no query backs "actively" for any given
 * category, and this app has no live buyer-activity feed to check against.
 * Replaced with the founder-led framing SPRINT-STDV-01 asked for instead of
 * an activity claim: "We're building this with Indian suppliers. Your
 * feedback shapes the product." — true regardless of current demand level.
 */

/** "Namaste {Company} Team! 🙏" when a real company name exists, else a plain "Namaste! 🙏" — never wraps a fallback placeholder in quotes. */
function greeting(company?: string | null): string {
  const name = company?.trim();
  return name ? `Namaste ${name} Team! 🙏` : `Namaste! 🙏`;
}

/** Founder-signed close, per the acquisition-message audit — replaces the unsigned "— Team VyaparSethu". */
const SIGN_OFF = 'Regards,\nVishal Pendharkar\nFounder, VyaparSethu';

/** SPRINT-STDV-01 Priority 1, step 4: founder-led line, used in place of any buyer-activity claim we can't back with data. */
const FOUNDER_LINE = "We're building this with Indian suppliers. Your feedback shapes the product.";

/**
 * Day-1 cold outreach: invites an unclaimed supplier to claim their
 * pre-built profile. Deliberately does NOT claim the profile is
 * "verified", and does not claim current buyer activity — neither is
 * something this codebase can back with evidence at send time.
 */
export function buildClaimWhatsAppMessage(company: string | null | undefined, claimLink: string): string {
  const name = company?.trim();
  const profileLine = name
    ? `We've reserved a business profile for ${name} on VyaparSethu, India's B2B Trade Network.`
    : `We've reserved a business profile for you on VyaparSethu, India's B2B Trade Network.`;

  return (
    `${greeting(company)}\n\n` +
    `${profileLine}\n\n` +
    `${FOUNDER_LINE}\n\n` +
    `Claim your free profile in 2 minutes:\n${claimLink}\n\n` +
    `${SIGN_OFF}`
  );
}

export type DripType = 'day3' | 'day7' | 'day14';

const DRIP_BODY: Record<DripType, (link: string) => string> = {
  day3: (l) =>
    `Reminder — your free business profile is still reserved on VyaparSethu, India's B2B Trade Network.\n\n${FOUNDER_LINE}\n\nClaim it in 2 minutes:\n${l}`,
  day7: (l) =>
    `It's been a week — your profile slot is still reserved on VyaparSethu.\n\n${FOUNDER_LINE}\n\nClaim it in 2 minutes:\n${l}`,
  day14: (l) =>
    `Last reminder — we're finalising this round of supplier profiles.\n\n${FOUNDER_LINE}\n\nClaim your free profile before the slot is offered elsewhere:\n${l}`,
};

/** Day3/7/14 drip follow-ups for a supplier who hasn't claimed yet. Same greeting/sign-off convention as the day-1 message. */
export function buildDripWhatsAppMessage(dripType: DripType, company: string | null | undefined, claimLink: string): string {
  return (
    `${greeting(company)}\n\n` +
    `${DRIP_BODY[dripType](claimLink)}\n\n` +
    `${SIGN_OFF}`
  );
}
