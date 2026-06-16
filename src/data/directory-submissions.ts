export interface Directory {
  id: string;
  name: string;
  url: string;
  category: 'B2B India' | 'MSME/Govt' | 'Global B2B' | 'Industry Specific' | 'SEO/Backlink';
  da: number; // Domain Authority estimate
  freeSubmission: boolean;
  requiresLogin: boolean;
  notes: string;
}

export const DIRECTORIES: Directory[] = [
  // ── B2B India ──
  { id: 'indiamart',        name: 'IndiaMART',              url: 'https://seller.indiamart.com',             category: 'B2B India',        da: 72, freeSubmission: true,  requiresLogin: true,  notes: 'Largest B2B directory India. Free basic listing. Add categories: Steel, Packaging, Chemicals.' },
  { id: 'tradeindia',       name: 'TradeIndia',             url: 'https://www.tradeindia.com/register',      category: 'B2B India',        da: 60, freeSubmission: true,  requiresLogin: true,  notes: 'Second-largest B2B portal. Free listing with GSTIN verification.' },
  { id: 'exportersindia',   name: 'ExportersIndia',         url: 'https://www.exportersindia.com/register',  category: 'B2B India',        da: 55, freeSubmission: true,  requiresLogin: true,  notes: 'Strong in manufacturing exporters. Add supplier directory listing.' },
  { id: 'yellowpages',      name: 'Yellow Pages India',     url: 'https://www.yellowpages.in/register',      category: 'B2B India',        da: 52, freeSubmission: true,  requiresLogin: true,  notes: 'Business directory with geo targeting. Register under "B2B Marketplace".' },
  { id: 'justdial',         name: 'Justdial',               url: 'https://www.justdial.com/listbusiness',   category: 'B2B India',        da: 68, freeSubmission: true,  requiresLogin: true,  notes: 'High DA. List under "Business Directory Software" and "B2B Marketplace".' },
  { id: 'sulekha',          name: 'Sulekha Business',       url: 'https://business.sulekha.com',             category: 'B2B India',        da: 58, freeSubmission: true,  requiresLogin: true,  notes: 'Service business directory. List under "B2B Trade Network".' },
  { id: 'indiabizclub',     name: 'India Biz Club',         url: 'https://www.indiabizclub.com',             category: 'B2B India',        da: 38, freeSubmission: true,  requiresLogin: false, notes: 'Smaller directory, low competition. Easy free listing.' },
  { id: 'bizbilla',         name: 'Bizbilla',               url: 'https://www.bizbilla.com',                 category: 'B2B India',        da: 40, freeSubmission: true,  requiresLogin: true,  notes: 'B2B marketplace with free product/service listing.' },
  { id: 'tradekeyindia',    name: 'TradeKey India',         url: 'https://www.tradekey.com/register.html',   category: 'B2B India',        da: 50, freeSubmission: true,  requiresLogin: true,  notes: 'International B2B with strong India presence.' },
  { id: 'eximguru',         name: 'Eximguru',               url: 'https://www.eximguru.com/directory',       category: 'B2B India',        da: 42, freeSubmission: true,  requiresLogin: true,  notes: 'Import-export focused. Good for industrial supplier categories.' },
  { id: 'b2bindia',         name: 'B2B India',              url: 'https://www.b2bindia.in',                  category: 'B2B India',        da: 35, freeSubmission: true,  requiresLogin: false, notes: 'Free listing, low DA but easy win for category coverage.' },
  { id: 'getit',            name: 'Getit Infomedia',        url: 'https://www.getit.in',                     category: 'B2B India',        da: 46, freeSubmission: true,  requiresLogin: true,  notes: 'Yellow pages style. List under "Trade Marketplace" category.' },
  { id: 'indiaonlinepages', name: 'India Online Pages',     url: 'https://www.indiaonlinepages.com',         category: 'B2B India',        da: 34, freeSubmission: true,  requiresLogin: false, notes: 'Simple free submission form. Quick win.' },
  { id: 'smartbuyer',       name: 'Smartbuyer',             url: 'https://www.smartbuyer.in',                category: 'B2B India',        da: 32, freeSubmission: true,  requiresLogin: false, notes: 'Buyer-seller matching platform. Relevant niche.' },

  // ── MSME / Govt ──
  { id: 'udhyamimitra',     name: 'Udyami Mitra (SIDBI)',   url: 'https://www.udyamimitra.in',               category: 'MSME/Govt',        da: 55, freeSubmission: true,  requiresLogin: true,  notes: 'SIDBI govt MSME portal. Register as a partner platform for MSME financing integration.' },
  { id: 'startupindia',     name: 'Startup India Hub',      url: 'https://www.startupindia.gov.in',          category: 'MSME/Govt',        da: 66, freeSubmission: true,  requiresLogin: true,  notes: 'DPIIT registration. Adds credibility + tax benefits. Mandatory for brand.' },
  { id: 'gem',              name: 'GeM (Govt e-Marketplace)', url: 'https://gem.gov.in/registration',       category: 'MSME/Govt',        da: 65, freeSubmission: true,  requiresLogin: true,  notes: 'Government procurement portal. List VyaparSethu as a software service under SaaS category.' },
  { id: 'nsic',             name: 'NSIC e-Marketplace',     url: 'https://www.nsic.co.in/emporiumNew',       category: 'MSME/Govt',        da: 52, freeSubmission: true,  requiresLogin: true,  notes: 'National Small Industries Corporation. High credibility for MSME suppliers.' },
  { id: 'cii',              name: 'CII Business Directory', url: 'https://www.cii.in',                       category: 'MSME/Govt',        da: 60, freeSubmission: false, requiresLogin: true,  notes: 'Confederation of Indian Industry. Membership required but high DA backlink.' },
  { id: 'ficci',            name: 'FICCI Members Directory', url: 'https://www.ficci.in',                    category: 'MSME/Govt',        da: 62, freeSubmission: false, requiresLogin: true,  notes: 'Federation of Indian Chambers. Membership listing.' },

  // ── Global B2B ──
  { id: 'alibaba',          name: 'Alibaba.com',            url: 'https://www.alibaba.com/trade/register',   category: 'Global B2B',       da: 75, freeSubmission: true,  requiresLogin: true,  notes: 'Global B2B giant. Free gold supplier listing for India. High DA backlink.' },
  { id: 'globalsources',    name: 'Global Sources',         url: 'https://www.globalsources.com',            category: 'Global B2B',       da: 68, freeSubmission: false, requiresLogin: true,  notes: 'India export focused. Submit editorial pitch as an Indian B2B platform.' },
  { id: 'kompass',          name: 'Kompass',                url: 'https://in.kompass.com/register',          category: 'Global B2B',       da: 65, freeSubmission: true,  requiresLogin: true,  notes: 'International B2B directory. Free basic listing in India.' },
  { id: 'thomasnet',        name: 'ThomasNet',              url: 'https://www.thomasnet.com/register',       category: 'Global B2B',       da: 72, freeSubmission: true,  requiresLogin: true,  notes: 'US-focused but indexes India suppliers. High DA.' },
  { id: 'europages',        name: 'Europages',              url: 'https://www.europages.co.in/register',     category: 'Global B2B',       da: 64, freeSubmission: true,  requiresLogin: true,  notes: 'European B2B portal with India section.' },
  { id: 'ec21',             name: 'EC21',                   url: 'https://www.ec21.com/register',            category: 'Global B2B',       da: 58, freeSubmission: true,  requiresLogin: true,  notes: 'Korean-origin global B2B. Strong in industrial categories.' },
  { id: 'ecplaza',          name: 'ECPlaza',                url: 'https://www.ecplaza.net/register',         category: 'Global B2B',       da: 52, freeSubmission: true,  requiresLogin: true,  notes: 'B2B marketplace. Free listing available.' },
  { id: 'go4worldbusiness', name: 'Go4WorldBusiness',       url: 'https://www.go4worldbusiness.com/register', category: 'Global B2B',     da: 48, freeSubmission: true,  requiresLogin: true,  notes: 'India-centric global B2B. Submit under "Trade Platform" category.' },
  { id: 'importexportbulk', name: 'ImportExportBulk',       url: 'https://www.importexportbulk.com',         category: 'Global B2B',       da: 40, freeSubmission: true,  requiresLogin: false, notes: 'Simple directory. Easy free submission.' },
  { id: 'manufacturers',    name: 'Manufacturers.com',      url: 'https://www.manufacturers.com',            category: 'Global B2B',       da: 44, freeSubmission: true,  requiresLogin: true,  notes: 'US-based manufacturer directory. Good for India industrial supplier listing.' },

  // ── Industry Specific ──
  { id: 'steelonthenet',    name: 'SteelOnTheNet',          url: 'https://www.steelonthenet.com',            category: 'Industry Specific', da: 48, freeSubmission: false, requiresLogin: true,  notes: 'Steel industry database. Submit Kalamboli cluster content.' },
  { id: 'metalbulletin',    name: 'Metal Bulletin',         url: 'https://www.fastmarkets.com',              category: 'Industry Specific', da: 60, freeSubmission: false, requiresLogin: true,  notes: 'Metals trade media. Submit editorial pitch about Kalamboli/JNPT cluster.' },
  { id: 'packagingdigest',  name: 'Packaging Digest India', url: 'https://www.packagingnews.co.in',          category: 'Industry Specific', da: 38, freeSubmission: true,  requiresLogin: false, notes: 'Packaging industry. Bhiwandi corrugated cluster content angle.' },
  { id: 'chemicaltoday',    name: 'Chemical Today',         url: 'https://www.chemicaltoday.net',            category: 'Industry Specific', da: 36, freeSubmission: true,  requiresLogin: false, notes: 'Chemical industry India. Taloja/Ankleshwar cluster angle.' },
  { id: 'texmin',           name: 'Textile Ministry Portal', url: 'https://texmin.nic.in',                   category: 'Industry Specific', da: 54, freeSubmission: false, requiresLogin: true,  notes: 'Govt textile portal. Submit for Surat cluster feature.' },
  { id: 'fibre2fashion',    name: 'Fibre2Fashion',          url: 'https://www.fibre2fashion.com',            category: 'Industry Specific', da: 56, freeSubmission: true,  requiresLogin: true,  notes: 'Textiles & apparel B2B. Free listing in marketplace section.' },
  { id: 'pharmaexcipients', name: 'PharmaExcipients',       url: 'https://www.pharmaexcipients.com',         category: 'Industry Specific', da: 40, freeSubmission: true,  requiresLogin: true,  notes: 'Pharma ingredient B2B. Submit under "digital marketplace" category.' },
  { id: 'coimbatoreindustry', name: 'Coimbatore Industrial', url: 'https://www.coimbatoreindustrial.com',   category: 'Industry Specific', da: 30, freeSubmission: true,  requiresLogin: false, notes: 'Coimbatore machinery cluster directory. Easy geo-targeted win.' },

  // ── SEO / Backlink ──
  { id: 'crunchbase',       name: 'Crunchbase',             url: 'https://www.crunchbase.com/register',      category: 'SEO/Backlink',     da: 90, freeSubmission: true,  requiresLogin: true,  notes: 'CRITICAL. High-DA startup database. Add company profile with funding stage, description, category = "B2B Marketplace".' },
  { id: 'producthunt',      name: 'Product Hunt',           url: 'https://www.producthunt.com/posts/new',    category: 'SEO/Backlink',     da: 87, freeSubmission: true,  requiresLogin: true,  notes: 'Launch on PH for backlink + early users. Schedule for a Tuesday morning.' },
  { id: 'g2',               name: 'G2 Reviews',             url: 'https://www.g2.com/products/new',          category: 'SEO/Backlink',     da: 85, freeSubmission: true,  requiresLogin: true,  notes: 'SaaS review platform. List under "B2B Marketplace" + "Procurement" categories.' },
  { id: 'capterra',         name: 'Capterra',               url: 'https://www.capterra.com/vendors/sign-up', category: 'SEO/Backlink',     da: 83, freeSubmission: true,  requiresLogin: true,  notes: 'Software review site. List under "Procurement Software" and "Supplier Management".' },
  { id: 'alternativeto',    name: 'AlternativeTo',          url: 'https://alternativeto.net/software/add',   category: 'SEO/Backlink',     da: 74, freeSubmission: true,  requiresLogin: true,  notes: 'Add VyaparSethu as alternative to IndiaMART. High-intent traffic.' },
  { id: 'softwareadvice',   name: 'Software Advice',        url: 'https://www.softwareadvice.com/resources/software-list', category: 'SEO/Backlink', da: 80, freeSubmission: true, requiresLogin: true, notes: 'Gartner-owned. List under "Procurement" category.' },
  { id: 'getapp',           name: 'GetApp',                 url: 'https://www.getapp.com/resources/submit',  category: 'SEO/Backlink',     da: 79, freeSubmission: true,  requiresLogin: true,  notes: 'Gartner-owned. Procurement + Supply Chain category.' },
  { id: 'techradar',        name: 'TechRadar B2B Tools',    url: 'https://www.techradar.com/best',           category: 'SEO/Backlink',     da: 88, freeSubmission: false, requiresLogin: false, notes: 'Editorial pitch only. Send press kit to b2b@techradar.com.' },
  { id: 'angellist',        name: 'Wellfound (AngelList)',  url: 'https://wellfound.com/company/new',         category: 'SEO/Backlink',     da: 84, freeSubmission: true,  requiresLogin: true,  notes: 'Startup profile. Adds credibility for investor visibility (Phase 2).' },
];

export const SUBMISSION_COPY = {
  companyName: 'VyaparSethu (by Digitex Studio)',
  tagline: 'India\'s Verified B2B Supplier & Buyer Network — Commerce Connections Globally',
  shortDescription: 'VyaparSethu connects Indian B2B buyers with verified MSME suppliers through protected payment (escrow), voice-powered requirements, and AI-matched quotations. Get 3+ competitive quotes within 24 hours on any industrial category.',
  longDescription: `VyaparSethu is India's verified B2B trade network, purpose-built for MSME buyers and suppliers in industrial clusters (Steel/Kalamboli, Packaging/Bhiwandi, Chemicals/Taloja, Textiles/Surat, Machinery/Coimbatore).

Key features:
• Verified Matching: Every supplier is GSTIN + Udyam verified before quoting
• Protected Payment: Funds held in escrow (RBI-regulated nodal account) until delivery confirmed
• Faster Trade: Post a Requirement by voice (90 sec), video, or text — get 3+ quotes within 24 hours
• DPDP compliant data handling

Founded by Digitex Studio. Registered in India. Operating entity: VyaparSethu Technologies Pvt Ltd (in registration).`,
  categories: ['B2B Marketplace', 'Procurement Software', 'Supply Chain', 'MSME Platform', 'Trade Network'],
  keywords: ['B2B marketplace India', 'verified supplier directory', 'procurement platform', 'MSME supplier', 'IndiaMART alternative', 'B2B escrow payment'],
  website: 'https://www.vyaparsethu.com',
  email: 'digitex.studio@gmail.com',
  phone: '',
  address: 'Navi Mumbai, Maharashtra, India',
  foundedYear: 2024,
  employees: '2-10',
  funding: 'Bootstrapped',
};

export type SubmissionStatus = 'pending' | 'submitted' | 'live' | 'rejected' | 'skip';

export interface DirectoryEntry extends Directory {
  status: SubmissionStatus;
  submittedAt?: string;
  liveUrl?: string;
  notes2?: string;
}
