export type Platform = 'LinkedIn' | 'Twitter/X';
export type PostType = 'Founder Story' | 'Education' | 'Social Proof' | 'Feature Spotlight' | 'Industry Insight' | 'CTA';

export interface SocialPost {
  id: string;
  week: number;
  day: string;
  date: string;
  platform: Platform[];
  type: PostType;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  image?: string;
}

// Sprint: June 14 – July 5, 2026  (3 posts/week)
export const SOCIAL_POSTS: SocialPost[] = [
  // ── WEEK 1 (June 16–20) ──
  {
    id: 'w1-mon',
    week: 1,
    day: 'Monday',
    date: '2026-06-16',
    platform: ['LinkedIn'],
    type: 'Founder Story',
    hook: 'I watched a steel trader lose ₹4.2 lakh to a supplier who never delivered. That was the day I decided to build VyaparSethu.',
    body: `In Indian B2B, "advance payment" often means "goodbye money."

Here's what I saw happen to a Bhiwandi corrugated box buyer:
→ Found a supplier on a directory
→ Paid 60% advance (₹4.2L)
→ Supplier stopped responding
→ No invoice. No product. No recourse.

This isn't rare. It's routine.

The problem isn't bad suppliers. It's no verification + no payment protection.

VyaparSethu fixes both:
✅ Every supplier verified: GSTIN + Udyam before they can quote
✅ Protected Payment: funds held in escrow until delivery confirmed
✅ Quotation in 24h, Settlement in 7 days

We're building for the 63 million MSMEs who can't afford to lose even ₹50,000 to a bad deal.

If you've been burned — or you're a supplier who wants verified buyers — come build this with us.`,
    cta: 'Comment "VS" — I\'ll send you early access.',
    hashtags: ['MSMEIndia', 'B2BMarketplace', 'VyaparSethu', 'SupplyChain', 'StartupIndia'],
    image: 'Brand video / founder photo',
  },
  {
    id: 'w1-wed',
    week: 1,
    day: 'Wednesday',
    date: '2026-06-18',
    platform: ['Twitter/X', 'LinkedIn'],
    type: 'Education',
    hook: 'Most Indian B2B buyers don\'t know this about the MSMED Act:',
    body: `If your MSME supplier isn't paid within 45 days of delivery —

You legally owe them compound interest at 3× the RBI lending rate.

That's currently ~20.25% per annum on overdue amounts.

And they can file a complaint on MSME Samadhaan — which shows up on your MCA21 record.

Practical implication:
→ Net 30 terms with MSME suppliers = maximum 45 day payment window
→ Defaulting isn't just bad business. It's now legally expensive.

VyaparSethu's Protected Payment closes the loop: payment is collected from the buyer before dispatch, held in a nodal account, and released to the MSME supplier on delivery confirmation.

Nobody waits 90+ days. Nobody chases payments.`,
    cta: 'Read the full MSME payment rules → vyaparsethu.com/glossary/msme',
    hashtags: ['MSMEAct', 'B2BIndia', 'TradeCredit', 'VyaparSethu', 'MSME'],
    image: 'Infographic: 45-day MSMED payment rule',
  },
  {
    id: 'w1-fri',
    week: 1,
    day: 'Friday',
    date: '2026-06-20',
    platform: ['LinkedIn'],
    type: 'Industry Insight',
    hook: 'Kalamboli is to Indian steel what Dharavi is to leather. 800+ dealers in 5 km. Yet no verified digital directory exists.',
    body: `India's industrial clusters are invisible online.

Kalamboli (Navi Mumbai): India's largest steel distribution hub. ₹50,000 crore annual throughput. 800+ dealers/processors. 5 minutes from JNPT.

Online presence of most dealers: zero.

Buyers fly in from Gujarat and Rajasthan to physically verify suppliers before placing orders. In 2026.

This is the gap VyaparSethu is filling:

1/ Digitise cluster suppliers with GSTIN + Udyam verification
2/ Match them with buyers posting Requirements (no cold calls needed)
3/ Protect both sides through escrow

Phase 1 clusters: Kalamboli (Steel), Bhiwandi (Packaging), Taloja (Chemicals), Surat (Textiles), Coimbatore (Machinery)

If you're a supplier in any of these clusters — your profile on VyaparSethu is free and goes live in 24 hours.`,
    cta: 'Claim your profile → vyaparsethu.com/supplier/registration',
    hashtags: ['KalamboliSteel', 'MSMECluster', 'B2BIndia', 'VyaparSethu', 'MaharashtraIndustry'],
    image: 'Map of industrial clusters',
  },

  // ── WEEK 2 (June 23–27) ──
  {
    id: 'w2-mon',
    week: 2,
    day: 'Monday',
    date: '2026-06-23',
    platform: ['LinkedIn'],
    type: 'Feature Spotlight',
    hook: 'What if you could post a ₹10 lakh B2B requirement in 90 seconds — by just speaking?',
    body: `That's Speak Requirement on VyaparSethu.

Here's how it works:

1/ Tap the mic icon
2/ Say your requirement in plain Hindi or English:
   "Mujhe 50 tonne HR coil 3mm × 1250mm chahiye, Kalamboli delivery, October 15 tak"
3/ AI transcribes + extracts: product, grade, quantity, delivery location, timeline
4/ You review and confirm in 10 seconds
5/ 3+ verified suppliers see it and quote within 24 hours

No WhatsApp back-and-forth. No calls. No Excel sheets.

This is especially powerful for procurement managers on-site at factories who can't type a detailed spec on mobile.

Suppliers: you get structured, actionable requirements — not vague messages that waste 2 days of clarification.

We built this because the real India B2B market doesn't run on forms. It runs on voice.`,
    cta: 'Try Speak Requirement → vyaparsethu.com/voice-rfq',
    hashtags: ['VoiceAI', 'ProcurementIndia', 'B2BIndia', 'VyaparSethu', 'IndiaTech'],
    image: 'Screen recording of voice requirement flow',
  },
  {
    id: 'w2-wed',
    week: 2,
    day: 'Wednesday',
    date: '2026-06-25',
    platform: ['Twitter/X', 'LinkedIn'],
    type: 'Education',
    hook: 'HSN code wrong → GST rate wrong → ITC blocked. The ₹X lakh mistake most B2B buyers make without realising it.',
    body: `If your supplier puts the wrong HSN code on their invoice:

→ You pay a different GST rate than legally applicable
→ GSTR-2B mismatch = ITC claim blocked
→ GST audit notice arrives 6-18 months later
→ You've been paying 18% when the correct rate was 12% (or vice versa)

Common examples:
• Structural steel angles: HSN 7216 (18%) vs angle iron: HSN 7228 (18%) — same rate here but different filing requirement
• Industrial adhesives: HSN 3506 (18%) vs construction adhesives: HSN 3814 (18%) — fine until you're importing
• Packaging corrugated boxes: HSN 4819 (12%) vs paper: HSN 4823 (12%)

How VyaparSethu handles this:
Every supplier Quotation on the platform includes the HSN code. Accepted deals generate a GST-compliant invoice automatically. No manual errors.

Not on the platform yet? Use our free HSN Lookup → vyaparsethu.com/tools/hsn-lookup`,
    cta: 'Free HSN lookup → vyaparsethu.com/tools/hsn-lookup',
    hashtags: ['GSTIndia', 'HSNCode', 'B2BCompliance', 'ITC', 'VyaparSethu'],
    image: 'Infographic: HSN code on invoice flow',
  },
  {
    id: 'w2-fri',
    week: 2,
    day: 'Friday',
    date: '2026-06-27',
    platform: ['LinkedIn'],
    type: 'Social Proof',
    hook: 'Week 2 update: Here\'s what\'s happening on VyaparSethu right now',
    body: `Building in public, week 2:

What I'm seeing from early supplier conversations in Kalamboli:

"Buyers call us, ask for rates, then ghost. We waste 2 hours on calls that go nowhere."

"We need buyers to show commitment before we spend time on a detailed quote."

This is exactly why Protected Payment matters for suppliers too.

When a buyer posts a Requirement on VyaparSethu and accepts your quote:
→ Payment is collected from the buyer before you ship
→ Not released to you until delivery is confirmed
→ But you KNOW it's there — you're not chasing a promise

For suppliers in Kalamboli who've been burned by "we'll pay after delivery" buyers:
Your profile is live in 24 hours. Free.

DM me or WhatsApp: register at vyaparsethu.com/supplier/registration

Building the trade network India deserves — one verified supplier at a time.`,
    cta: 'Register as supplier → vyaparsethu.com/supplier/registration',
    hashtags: ['BuildingInPublic', 'VyaparSethu', 'MSMESupplier', 'B2BIndia', 'Startup'],
    image: 'Photo from Kalamboli market visit (if available)',
  },

  // ── WEEK 3 (June 30 – July 4) ──
  {
    id: 'w3-mon',
    week: 3,
    day: 'Monday',
    date: '2026-06-30',
    platform: ['LinkedIn'],
    type: 'Education',
    hook: 'The difference between IndiaMART and VyaparSethu, explained in 4 lines:',
    body: `IndiaMART: Anyone can list. No verification. No quotes. No payment protection. You get phone numbers and hope for the best.

VyaparSethu: Every supplier verified (GSTIN + Udyam). Structured Quotations. Protected Payment (escrow). Deal closes in 7 days.

IndiaMART is a phonebook.
VyaparSethu is a trade network.

Different use cases:
→ If you want to discover that a supplier exists: IndiaMART
→ If you want to actually do the deal safely: VyaparSethu

We don't compete on directory size. We compete on verified transaction completion.

Most B2B platforms measure "registered users." Our North Star is Successful Transactions ÷ Time.

That's the only metric that matters for buyers and suppliers.`,
    cta: 'Read the full comparison → vyaparsethu.com/compare/vyaparsethu-vs-indiamart',
    hashtags: ['IndiaMART', 'B2BMarketplace', 'VyaparSethu', 'ProcurementIndia', 'MSME'],
    image: 'Comparison table graphic',
  },
  {
    id: 'w3-wed',
    week: 3,
    day: 'Wednesday',
    date: '2026-07-02',
    platform: ['Twitter/X', 'LinkedIn'],
    type: 'Feature Spotlight',
    hook: 'Trade Confidence Score™ — how VyaparSethu decides which suppliers you should trust',
    body: `Every verified supplier on VyaparSethu has a Trade Confidence Score™ (0–100).

The formula:

30% Payment History — do they deliver what they invoice?
20% On-time Delivery — do they meet committed dates?
15% Response Speed — how fast do they reply to Requirements?
15% Repeat Orders — are buyers coming back?
10% Dispute Rate — how many deliveries are contested?
10% Verification Strength — GSTIN, Udyam, GST returns on file?

Why does this matter?

A supplier with Score 85 has closed 40+ deals with zero disputes and consistent delivery.
A supplier with Score 42 has 3 late deliveries and 1 open dispute.

As a buyer, you should see this before you accept their quote.

We compute scores daily at 2 AM IST — never real-time — to prevent gaming.

Coming to buyer dashboards this week.`,
    cta: 'Post a Requirement and see matched scores → vyaparsethu.com/rfq/create',
    hashtags: ['SupplierVerification', 'TradeScore', 'B2BTrust', 'VyaparSethu', 'ProcurementTech'],
    image: 'Trade Confidence Score breakdown graphic',
  },
  {
    id: 'w3-fri',
    week: 3,
    day: 'Friday',
    date: '2026-07-04',
    platform: ['LinkedIn'],
    type: 'CTA',
    hook: 'Looking for verified suppliers in these categories? Post a Requirement free today.',
    body: `If you're a buyer sourcing any of these — post your Requirement on VyaparSethu and get 3+ verified quotes within 24 hours:

Steel & Metals (Kalamboli, Ludhiana)
Packaging Materials (Bhiwandi, Silvassa)
Industrial Chemicals (Taloja, Ankleshwar)
Textiles & Fabric (Surat, Tirupur)
Industrial Machinery (Coimbatore, Rajkot)
Fasteners & Hardware (Ludhiana)
Paints & Coatings (Navi Mumbai)

Every supplier is:
✅ GSTIN verified
✅ Udyam registered MSME
✅ Payment protected (your advance is safe until delivery)

Voice Requirement: Speak it in 90 seconds
Text Requirement: Type it in 2 minutes
Video Requirement: Show us what you need

100% free for buyers. Competitive quotes. Protected payment.

Which category do you need?`,
    cta: 'Post free → vyaparsethu.com/rfq/create',
    hashtags: ['B2BSourcing', 'VerifiedSupplier', 'VyaparSethu', 'MSMEIndia', 'ProcurementIndia'],
    image: 'Category grid graphic',
  },

  // ── WEEK 4 (July 7–11) ──
  {
    id: 'w4-mon',
    week: 4,
    day: 'Monday',
    date: '2026-07-07',
    platform: ['LinkedIn'],
    type: 'Founder Story',
    hook: 'Month 1 report: What we built, what we learned, what we\'re doing differently.',
    body: `30 days of VyaparSethu in public:

What we shipped:
→ Voice Requirement (AI transcription in 90 sec)
→ Protected Payment flow (escrow via Razorpay nodal)
→ 290 city×category SEO pages (Kalamboli steel, Bhiwandi packaging, etc.)
→ Trade Confidence Score™ formula live
→ 12-term B2B glossary (MSME, HSN, GST, Escrow, etc.)
→ WhatsApp outreach pipeline for supplier acquisition

What I learned in week 2 (Bhiwandi market visit):
→ Suppliers don't want a SaaS tool. They want buyers.
→ The onboarding has to happen over WhatsApp, not a web form.
→ "Free" is not a differentiator. "I'll bring you verified buyers" is.

What changed:
→ Shifted outreach from "register on our platform" to "your first verified buyer is already searching"
→ Built supplier claim flow that works in 3 WhatsApp messages

Month 2 goal: 30 verified suppliers, 10 completed deals, 1 case study.

What question would you ask a B2B marketplace founder? Comment below.`,
    cta: 'Follow the build → linkedin.com/company/vyaparsethu',
    hashtags: ['BuildingInPublic', 'StartupIndia', 'VyaparSethu', 'B2BMarketplace', 'FounderLife'],
    image: 'Bhiwandi market photo or product screenshot collage',
  },
];

export const CALENDAR_WEEKS = [
  { week: 1, label: 'Jun 16–20', theme: 'Credibility & Problem' },
  { week: 2, label: 'Jun 23–27', theme: 'Features & Education' },
  { week: 3, label: 'Jun 30 – Jul 4', theme: 'Differentiation & Trust' },
  { week: 4, label: 'Jul 7–11', theme: 'Progress & Social Proof' },
];
