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
        <p className="text-slate-400 text-sm mt-1">Crunchbase · G2 · Startup India — highest DA backlinks, do these first</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-3 mb-8">
        {GUIDES.map(g => (
          <button key={g.id} onClick={() => setActive(g.id)}
            className={`flex-1 rounded-xl p-4 text-left border transition-all ${
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
