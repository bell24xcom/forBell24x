'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface FormField {
  label: string;
  value: string;
  multiline?: boolean;
}

interface DirectoryGuide {
  id: string;
  name: string;
  url: string;
  da: number;
  estimatedTime: string;
  steps: string[];
  fields: FormField[];
  tips: string[];
  category: string;
}

const GUIDES: DirectoryGuide[] = [
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    url: 'https://www.crunchbase.com/add-new-organization',
    da: 90,
    estimatedTime: '15 min',
    category: 'SEO/Backlink — DA 90',
    steps: [
      'Go to crunchbase.com → Sign in (create account with digitex.studio@gmail.com)',
      'Click "Add New Organization" → select "Company"',
      'Fill all fields below exactly as shown',
      'Upload logo: use /public/brand/vyaparsethu-logo.png',
      'Set "Organization Type" = Private Company',
      'Set "Operating Status" = Active',
      'Add funding round: type = Seed, status = Pre-Seed, amount = Undisclosed',
      'Submit for review — usually approved in 24–48 hours',
    ],
    fields: [
      { label: 'Organization Name', value: 'VyaparSethu' },
      { label: 'Short Description (160 chars)', value: "India's verified B2B supplier & buyer network. Voice-powered requirements, MSME-verified suppliers, Protected Payment escrow. 3+ quotes in 24h." },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Founded Date', value: '2024' },
      { label: 'Location', value: 'Navi Mumbai, Maharashtra, India' },
      { label: 'Employee Count', value: '2-10' },
      { label: 'Industries / Categories', value: 'B2B Marketplace, Procurement Software, Supply Chain Management, Financial Technology, MSME' },
      { label: 'Long Description', value: `VyaparSethu is India's verified B2B trade network, purpose-built for MSME buyers and suppliers in industrial clusters — Steel/Kalamboli, Packaging/Bhiwandi, Chemicals/Taloja, Textiles/Surat, Machinery/Coimbatore.

Three pillars:
• Verified Matching — every supplier is GSTIN + Udyam verified before they can quote
• Protected Payment — buyer funds held in RBI-regulated nodal escrow until delivery confirmed
• Faster Trade — post a Requirement by voice (90 sec AI transcription), video, or text; get 3+ quotes within 24 hours

Formerly Bell24h. Operating entity: VyaparSethu Technologies Pvt Ltd (registration in progress). Bootstrapped.`, multiline: true },
      { label: 'Contact Email', value: 'digitex.studio@gmail.com' },
      { label: 'LinkedIn URL', value: 'https://www.linkedin.com/company/vyaparsethu' },
      { label: 'Twitter/X URL', value: 'https://x.com/vyaparsethu' },
    ],
    tips: [
      'Crunchbase profile = instant DA 90 dofollow backlink',
      'Add a "Featured Image" — use the brand video thumbnail',
      'After approval, claim the profile to edit freely',
      'Request team members to add VyaparSethu to their work history for more signals',
    ],
  },
  {
    id: 'g2',
    name: 'G2',
    url: 'https://www.g2.com/products/new',
    da: 85,
    estimatedTime: '20 min',
    category: 'SEO/Backlink + Reviews — DA 85',
    steps: [
      'Go to g2.com → Sign in → Products → Add new product',
      'Do NOT use sell.g2.com/free-listing — that URL returns 404 (as of Jun 2026)',
      'Search if VyaparSethu already exists → if not, click "Add a Product"',
      'Set Primary Category = "B2B Marketplace" + Secondary = "Procurement Software"',
      'Fill all fields below',
      'Upload screenshots of the dashboard, voice RFQ, and supplier profile pages',
      'Submit — approval takes 3–5 business days',
      'After approval: invite 5 beta users to leave reviews (even 2-3 reviews moves you up dramatically)',
    ],
    fields: [
      { label: 'Product Name', value: 'VyaparSethu' },
      { label: 'Tagline', value: "India's Verified B2B Trade Network — Commerce Connections Globally" },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Primary Category', value: 'B2B Marketplace' },
      { label: 'Secondary Categories', value: 'Procurement Software, Supply Chain Management, Supplier Management' },
      { label: 'Short Description', value: "VyaparSethu connects Indian B2B buyers with verified MSME suppliers through protected payment (escrow), voice-powered requirements, and AI-matched quotations. Get 3+ competitive quotes within 24 hours on any industrial category." },
      { label: 'Full Description', value: `VyaparSethu is India's verified B2B trade network for industrial buyers and MSME suppliers.

KEY FEATURES:
• Voice Requirement: Post a procurement requirement in 90 seconds by speaking — AI transcribes and structures it
• Verified Suppliers: Every supplier verified with GSTIN + Udyam Registration before they can quote
• Protected Payment: Buyer funds held in RBI-regulated nodal escrow — released to supplier only on delivery confirmation
• Trade Confidence Score™: Supplier trust scores computed daily from payment history, delivery rate, response speed
• GST-compliant Invoicing: Auto-generated tax invoices with correct HSN codes on every completed deal

TARGET USERS:
• B2B buyers in manufacturing, construction, packaging, chemicals, textiles
• MSME suppliers in Indian industrial clusters (Kalamboli, Bhiwandi, Taloja, Surat, Coimbatore)

PRICING: Free for buyers. Supplier listing free. Commission only on completed deals.`, multiline: true },
      { label: 'Pricing Model', value: 'Freemium — free for buyers, commission on completed deals' },
      { label: 'Deployment', value: 'Cloud, SaaS, Web-Based' },
      { label: 'Supported Languages', value: 'English, Hindi' },
      { label: 'Company HQ', value: 'Navi Mumbai, Maharashtra, India' },
    ],
    tips: [
      'G2 reviews drive massive organic traffic — even 5 reviews puts you on the map',
      'Ask first users via WhatsApp: "Would you leave us a 2-min review on G2? It helps us a lot"',
      'Respond to every review publicly — G2 rewards vendor engagement',
      'Add competitor alternatives: IndiaMART, TradeIndia — this captures comparison traffic',
    ],
  },
  {
    id: 'startupindia',
    name: 'Startup India (DPIIT)',
    url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
    da: 66,
    estimatedTime: '30 min',
    category: 'MSME/Govt — DPIIT Recognition',
    steps: [
      'Go to startupindia.gov.in → click "Register" (top right)',
      'Create account with digitex.studio@gmail.com',
      'Click "Apply for DPIIT Recognition"',
      'Entity type: LLP or Private Limited (use current registered entity)',
      'Fill incorporation details: date, CIN/LLPIN, registered address',
      'Self-certify innovation and scalability (required for recognition)',
      'Upload documents: Certificate of Incorporation, PAN card',
      'Submit — DPIIT certificate issued in 2–3 working days',
      'After recognition: access Startup India Hub, government schemes, and tax exemption (80IAC)',
    ],
    fields: [
      { label: 'Startup Name', value: 'VyaparSethu (Digitex Studio)' },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Industry', value: 'Information Technology' },
      { label: 'Sector', value: 'Enterprise Tech / B2B Commerce' },
      { label: 'Stage', value: 'Validation' },
      { label: 'Problem Being Solved', value: 'Indian B2B trade suffers from unverified suppliers, advance payment fraud, and 90+ day payment delays. MSMEs lose ₹4–12 lakh annually to bad deals. No platform combines supplier verification + payment protection + digital RFQ for industrial sectors.' },
      { label: 'Solution / Innovation', value: 'VyaparSethu verifies every supplier (GSTIN + Udyam) before they can quote, protects buyer payments in RBI-regulated escrow, and enables voice-powered procurement requirements (AI transcription in 90 seconds). Trade Confidence Score™ computed daily from transaction history.' },
      { label: 'Revenue Model', value: 'Commission on completed deals (1–2%). Premium supplier subscription (₹2,999/month). Lead credits for bulk quote access.' },
      { label: 'Is the startup Scalable?', value: 'Yes — platform model with network effects: more verified suppliers attract more buyers; more buyers attract more suppliers. Geographic expansion: 18 industrial clusters across India by Year 2.' },
      { label: 'Team Size', value: '2' },
      { label: 'Registered Office Address', value: 'Navi Mumbai, Maharashtra, India' },
      { label: 'Has the startup received any funding?', value: 'No (Bootstrapped)' },
    ],
    tips: [
      'DPIIT recognition gives 80IAC tax exemption for first 3 years — apply now even if small',
      'Recognition certificate = instant credibility for enterprise buyers and bank loans',
      'After recognition: apply for SIDBI Startup Mitra funding (up to ₹25 lakh soft loan)',
      'List on Startup India Hub — gets you visible to corporates looking for B2B tech vendors',
      'Connect with NASSCOM Emerge 50 after DPIIT recognition — good PR angle',
    ],
  },
  {
    id: 'alternativeto',
    name: 'AlternativeTo',
    url: 'https://alternativeto.net/',
    da: 85,
    estimatedTime: '15 min (+ 7-day account-age wait before you can submit)',
    category: 'SEO/Backlink + Alternative Positioning — DA 85',
    steps: [
      'Create an account at alternativeto.net TODAY with digitex.studio@gmail.com — new accounts must wait 7 days before the site allows a new app submission, so don\'t wait to register',
      'After 7+ days: log in → click your profile icon (top right) → "Suggest new application"',
      'Search "VyaparSethu" first to confirm it isn\'t already listed by someone else',
      'Fill all fields below exactly as shown',
      'When asked "Alternative to", add IndiaMART and TradeIndia — this is the field that captures "IndiaMART alternative" search traffic',
      'Submit — review typically takes a few days to about a week',
    ],
    fields: [
      { label: 'Application Name', value: 'VyaparSethu' },
      { label: 'Short Description', value: 'A verified alternative to IndiaMART and TradeIndia for Indian B2B trade — every supplier is GSTIN + Udyam verified, and buyer payments sit in escrow until delivery is confirmed.' },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Platforms', value: 'Web' },
      { label: 'License / Pricing', value: 'Free (Freemium — commission on completed deals)' },
      { label: 'Tags / Categories', value: 'B2B Marketplace, Procurement, Supplier Directory, Escrow Payments, MSME, Supply Chain' },
      { label: 'Alternative To', value: 'IndiaMART, TradeIndia' },
      { label: 'Long Description', value: `Most Indian B2B directories connect you to a supplier — VyaparSethu verifies them first and protects your money after.

Every supplier is GSTIN + Udyam verified before they can quote. Buyer funds sit in an RBI-regulated nodal escrow account and only release on delivery confirmation. Post a Requirement by voice (90-second AI transcription), video, or text, and get 3+ quotes within 24 hours.

Built for MSME buyers and suppliers across India's industrial clusters — Steel/Kalamboli, Packaging/Bhiwandi, Chemicals/Taloja, Textiles/Surat.

Formerly Bell24h.`, multiline: true },
    ],
    tips: [
      'The "Alternative to" field is the highest-value part of this listing — it puts VyaparSethu in front of people actively comparing IndiaMART/TradeIndia',
      'Don\'t attempt submission before the 7-day account-age window passes — the option won\'t appear and the form-fill is wasted',
      'AlternativeTo ranking is community-driven — a few genuine early users upvoting/commenting helps visibility',
    ],
  },
  {
    id: 'saashub',
    name: 'SaaSHub',
    url: 'https://www.saashub.com/services/submit',
    da: 74,
    estimatedTime: '15 min',
    category: 'SEO/Backlink + Alternative Positioning — DR 74',
    steps: [
      'Go to saashub.com/services/submit (free, no account required to start)',
      'Paste the website URL: https://www.vyaparsethu.com',
      'Fill all fields below exactly as shown',
      'List competitors (IndiaMART, TradeIndia) — SaaSHub explicitly slows down/deprioritizes submissions with no competitors listed',
      'If possible, submit from an email address on the vyaparsethu.com domain rather than Gmail — SaaSHub gives verified-domain submissions higher priority',
      'Submit — most listings are reviewed within 1–2 days',
    ],
    fields: [
      { label: 'Product Name', value: 'VyaparSethu' },
      { label: 'Tagline', value: "India's Verified B2B Trade Network" },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Category', value: 'B2B Marketplace / Procurement Software' },
      { label: 'Competitors / Rivals', value: 'IndiaMART, TradeIndia' },
      { label: 'Description', value: 'VyaparSethu is a verified B2B trade network for Indian MSMEs — GSTIN + Udyam-verified suppliers, escrow-protected buyer payments, and voice-powered requirement posting with AI transcription. 3+ quotes within 24 hours, deals settle in 7 days.' },
      { label: 'Pricing', value: 'Free for buyers. Free supplier listing. Commission only on completed deals.' },
    ],
    tips: [
      'Do not submit if the site looks like "just a landing page with a waitlist" — SaaSHub rejects those; VyaparSethu is live and functional, so this is fine',
      'Competitors field is not optional in practice — always fill it',
      'Verification via a company-domain email (not Gmail) is worth doing once @vyaparsethu.com email is set up',
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Company Page',
    url: 'https://www.linkedin.com/company/setup/new/',
    da: 98,
    estimatedTime: '10 min',
    category: 'GEO/AI Citation — DA 98',
    steps: [
      'Sign in to a personal LinkedIn account (must be an admin of the future page)',
      'Go to linkedin.com/company/setup/new/ → choose page type "Company"',
      'Fill all fields below exactly as shown',
      'Upload logo (square) and a cover banner image',
      'Publish the page, then post an intro update announcing VyaparSethu',
      'Have every team member add "VyaparSethu" as their current company/experience — this is a real trust + discovery signal, not just cosmetic',
    ],
    fields: [
      { label: 'Page Name', value: 'VyaparSethu' },
      { label: 'LinkedIn Public URL', value: 'linkedin.com/company/vyaparsethu' },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Industry', value: 'Technology, Information and Internet' },
      { label: 'Company Size', value: '2-10 employees' },
      { label: 'Company Type', value: 'Privately Held' },
      { label: 'Tagline', value: 'Commerce Connections Globally' },
      { label: 'About', value: `VyaparSethu is India's verified B2B trade network for MSME buyers and suppliers.

Verified Matching — every supplier is GSTIN + Udyam verified before they can quote.
Protected Payment — buyer funds held in RBI-regulated escrow until delivery is confirmed.
Faster Trade — post a Requirement by voice, video, or text; get 3+ quotes within 24 hours.

Formerly Bell24h. Operating entity: VyaparSethu Technologies Pvt Ltd (registration in progress).`, multiline: true },
    ],
    tips: [
      'LinkedIn company pages are one of the sources AI engines (ChatGPT, Claude, Perplexity) pull from when answering "what is [company]" — this is a GEO play, not just a social profile',
      'Keep the About text factual and distinct from the Crunchbase/G2 copy — don\'t copy-paste the same paragraph everywhere',
      'Post at least once a week once live — a dormant page with zero posts looks less credible to both people and AI crawlers',
    ],
  },
  {
    id: 'wikidata',
    name: 'Wikidata',
    url: 'https://www.wikidata.org/wiki/Special:NewItem',
    da: 94,
    estimatedTime: '20–30 min — more technical than the others, structured data not free text',
    category: 'GEO/AI Citation — Structured Data',
    steps: [
      'Create a Wikidata/Wikimedia account if you don\'t have one, then go to Special:NewItem',
      'Set Label = VyaparSethu',
      'Set Description in Wikidata\'s terse, neutral, encyclopedic style — NOT marketing copy (see Description field below for the correct tone)',
      'Add statements: "instance of" → business / online marketplace; "country" → India; "inception" → founding year; "official website" → https://www.vyaparsethu.com; "industry" → e-commerce / B2B commerce',
      'IMPORTANT: Wikidata requires at least one independent reference for a new entity — cite the Crunchbase profile, a DPIIT/Startup India record, or a press mention once one exists. A new item with zero references is likely to be flagged or deleted',
      'Save — Wikidata items go live immediately but may be reviewed/challenged by volunteer editors if unsourced',
    ],
    fields: [
      { label: 'Label', value: 'VyaparSethu' },
      { label: 'Description (Wikidata style — neutral, factual, no adjectives)', value: 'Indian business-to-business e-commerce platform' },
      { label: 'Instance of', value: 'business / online marketplace' },
      { label: 'Country', value: 'India' },
      { label: 'Official website', value: 'https://www.vyaparsethu.com' },
      { label: 'Industry', value: 'e-commerce, business-to-business commerce' },
    ],
    tips: [
      'This is the one listing in this tool where marketing language actively hurts you — Wikidata editors remove promotional wording on sight',
      'Do this AFTER Crunchbase/Startup India are live so you have something independent to cite as a reference',
      'Wikidata feeds AI model training corpora directly — this is worth doing even though it has no direct traffic value, per GEO best practice',
    ],
  },
  {
    id: 'f6s',
    name: 'F6S',
    url: 'https://www.f6s.com/',
    da: 86,
    estimatedTime: '15 min',
    category: 'Startup Network — DA 86',
    steps: [
      'Create an account at f6s.com with digitex.studio@gmail.com',
      'From your account/profile menu, look for "List your startup" / "Add company" (F6S\'s exact navigation changes periodically — use their search bar for "add company" if the button isn\'t where expected)',
      'Fill all fields below exactly as shown',
      'Upload logo, at least one product photo, and add LinkedIn/Twitter links',
      'Submit — F6S listings are typically visible right away, full profile review may take longer',
      'Once listed, check F6S\'s startup deals/perks section — often includes free SaaS credits worth claiming separately',
    ],
    fields: [
      { label: 'Business Name', value: 'VyaparSethu' },
      { label: 'Tagline', value: "India's Verified B2B Trade Network" },
      { label: 'Website', value: 'https://www.vyaparsethu.com' },
      { label: 'Business Categories', value: 'B2B Marketplace, Procurement, FinTech, Supply Chain' },
      { label: 'Year Established', value: '2024' },
      { label: 'Employees', value: '2-10' },
      { label: 'Country', value: 'India' },
      { label: 'Description', value: 'VyaparSethu connects verified MSME suppliers with B2B buyers across India\'s industrial clusters. Every supplier passes GSTIN + Udyam verification before quoting; buyer payments are protected in escrow until delivery. Bootstrapped, building toward Seed.' },
    ],
    tips: [
      'F6S is also a deal/perks platform for startups (AWS, other SaaS credits) — worth checking after listing, separate from the SEO value',
      'Strong for founder-to-founder and accelerator visibility, not primarily a consumer-facing directory',
    ],
  },
];

const VALID_GUIDES = new Set(GUIDES.map(g => g.id));

function SubmitDirectoriesContent() {
  const searchParams = useSearchParams();
  const guideParam = searchParams.get('guide');
  const initial = guideParam && VALID_GUIDES.has(guideParam) ? guideParam : 'crunchbase';

  const [active, setActive] = useState(initial);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (guideParam && VALID_GUIDES.has(guideParam)) setActive(guideParam);
  }, [guideParam]);

  const guide = GUIDES.find(g => g.id === active)!;

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = async () => {
    const all = guide.fields.map(f => `${f.label}:\n${f.value}`).join('\n\n');
    await navigator.clipboard.writeText(all);
    setCopied('all');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Priority Submissions</h1>
        <p className="text-slate-400 text-sm mt-1">Highest DA backlinks + GEO/AI-citation surfaces — copy-paste guides, do these first</p>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {GUIDES.map(g => (
          <button key={g.id} onClick={() => setActive(g.id)}
            className={`w-40 shrink-0 rounded-xl p-4 text-left border transition-all ${
              active === g.id
                ? 'bg-[#001f3f] border-[#D4AF37]/40'
                : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
            }`}>
            <p className="text-white font-bold text-sm">{g.name}</p>
            <p className="text-[#D4AF37] text-xs font-mono mt-0.5">DA {g.da}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">{g.estimatedTime}</p>
          </button>
        ))}
      </div>

      {/* Guide header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">{guide.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{guide.category} · ~{guide.estimatedTime}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyAll}
            className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg text-xs font-medium hover:bg-[#D4AF37]/30 transition-colors">
            {copied === 'all' ? '✓ Copied All' : '📋 Copy All Fields'}
          </button>
          <a href={guide.url} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold rounded-lg text-xs transition-colors">
            Open Form →
          </a>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 mb-6">
        <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Steps</h3>
        <ol className="space-y-2">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Fields */}
      <div className="space-y-3 mb-6">
        <h3 className="text-white font-semibold text-xs uppercase tracking-widest">Form Fields — Copy & Paste</h3>
        {guide.fields.map(field => (
          <div key={field.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide mb-1">{field.label}</p>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{field.value}</p>
            </div>
            <button onClick={() => copy(field.value, field.label)}
              className="shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors self-start">
              {copied === field.label ? '✓' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-5">
        <h3 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Tips for {guide.name}</h3>
        <ul className="space-y-2">
          {guide.tips.map((tip, i) => (
            <li key={i} className="text-slate-300 text-sm flex gap-2">
              <span className="text-[#D4AF37] shrink-0">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SubmitDirectoriesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-sm">Loading submission guide…</div>}>
      <SubmitDirectoriesContent />
    </Suspense>
  );
}
