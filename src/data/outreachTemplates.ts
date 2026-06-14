export interface OutreachTemplate {
  id: string;
  segment: 'steel' | 'textiles' | 'packaging';
  sequence: 'day1' | 'day3' | 'day5' | 'day7' | 'day14';
  label: string;
  // {{companyName}}, {{ownerName}}, {{category}}, {{claimUrl}} are runtime substitutions
  body: string;
}

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  // ── STEEL / METALS (Kalamboli focus) ─────────────────────────────────
  {
    id: 'steel-d1',
    segment: 'steel',
    sequence: 'day1',
    label: 'Steel — Day 1 intro',
    body: `Namaste {{ownerName}} ji 🙏
{{companyName}} ka profile VyaparSethu pe verified hai.
Buyers are actively posting Steel & Metal requirements.
Claim your free profile: {{claimUrl}}
Reply STOP to remove your listing.`,
  },
  {
    id: 'steel-d3',
    segment: 'steel',
    sequence: 'day3',
    label: 'Steel — Day 3 follow-up',
    body: `{{ownerName}} ji, kal ek buyer ne Kalamboli mein 10-tonne MS angle maanga.
Aapka profile already live hai — sirf claim karein aur quote bhejein.
{{claimUrl}}
Reply STOP anytime.`,
  },
  {
    id: 'steel-d7',
    segment: 'steel',
    sequence: 'day7',
    label: 'Steel — Day 7 urgency',
    body: `Last reminder: {{companyName}} profile expires in 48h.
3 steel buyers in your area this week — don't miss leads.
Claim now (free): {{claimUrl}}
Reply STOP to opt out.`,
  },

  // ── TEXTILES (Surat / Tirupur focus) ─────────────────────────────────
  {
    id: 'textiles-d1',
    segment: 'textiles',
    sequence: 'day1',
    label: 'Textiles — Day 1 intro',
    body: `Namaste {{ownerName}} ji 🙏
{{companyName}} ka textile profile VyaparSethu pe ready hai.
Surat & Tirupur buyers post daily fabric requirements here.
Free claim: {{claimUrl}}
Reply STOP to remove listing.`,
  },
  {
    id: 'textiles-d3',
    segment: 'textiles',
    sequence: 'day3',
    label: 'Textiles — Day 3 follow-up',
    body: `{{ownerName}} ji — ek Mumbai buyer ne {{category}} fabric ke liye quote maanga.
Aap directly respond kar sakte hain after claiming your profile.
{{claimUrl}}
Reply STOP anytime.`,
  },
  {
    id: 'textiles-d7',
    segment: 'textiles',
    sequence: 'day7',
    label: 'Textiles — Day 7 urgency',
    body: `{{companyName}}: your VyaparSethu profile is unclaimed.
₹ losses from missed orders add up fast. Claim free today.
{{claimUrl}}
Reply STOP to opt out permanently.`,
  },

  // ── ECO-PACKAGING (Bhiwandi / Navi Mumbai focus) ──────────────────────
  {
    id: 'packaging-d1',
    segment: 'packaging',
    sequence: 'day1',
    label: 'Packaging — Day 1 intro',
    body: `Namaste {{ownerName}} ji 🙏
{{companyName}} corrugated/packaging profile is live on VyaparSethu.
Bhiwandi buyers post box requirements daily — claim & quote.
Free: {{claimUrl}}
Reply STOP to remove.`,
  },
  {
    id: 'packaging-d3',
    segment: 'packaging',
    sequence: 'day3',
    label: 'Packaging — Day 3 follow-up',
    body: `{{ownerName}} ji — 500 kg corrugated box requirement posted today near you.
Your profile is ready, just needs your confirmation.
{{claimUrl}}
Reply STOP anytime.`,
  },
  {
    id: 'packaging-d7',
    segment: 'packaging',
    sequence: 'day7',
    label: 'Packaging — Day 7 urgency',
    body: `Final notice: {{companyName}} profile expires soon.
Join 200+ verified packaging suppliers on VyaparSethu.
Claim free (2 min): {{claimUrl}}
Reply STOP to opt out.`,
  },

  // ── UNIVERSAL 14-DAY FOLLOW-UP (all segments) ─────────────────────────
  {
    id: 'universal-d14',
    segment: 'steel',   // reuse across segments by swapping segment field at send time
    sequence: 'day14',
    label: 'Universal — Day 14 final',
    body: `{{ownerName}} ji, this is our last message.
VyaparSethu protected payment removes bad debt risk for suppliers.
If you want buyers — claim here: {{claimUrl}}
Reply STOP to never hear from us again.`,
  },
];

export function renderTemplate(
  template: OutreachTemplate,
  vars: { companyName: string; ownerName: string; category: string; claimUrl: string },
): string {
  return template.body
    .replace(/\{\{companyName\}\}/g, vars.companyName)
    .replace(/\{\{ownerName\}\}/g,   vars.ownerName)
    .replace(/\{\{category\}\}/g,    vars.category)
    .replace(/\{\{claimUrl\}\}/g,    vars.claimUrl);
}
