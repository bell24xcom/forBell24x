/**
 * One-time seed: MPCB steel manufacturers (45) + Wagle Estate steel companies (52)
 * Total: 97 unclaimed shell profiles
 *
 * Run:  npx tsx scripts/seed-mpcb-wagle-suppliers.ts
 *
 * Rules enforced (same as all unclaimed profiles):
 *   - isVerified: false  (hard — platform has not verified these businesses)
 *   - isClaimed:  false  (owner has not authenticated)
 *   - trustScore: 0      (never set on unclaimed profiles)
 *   - claimToken: auto   (generates /claim/<token> URL for manual outreach)
 *   - No messages, emails, or notifications sent here
 *
 * Source labels stored in preferences.sourceLabel:
 *   MPCB   → "Listed via MPCB registration — pending platform verification"
 *   Wagle  → "Listed via Wagle Estate industrial directory — pending platform verification"
 *
 * Duplicate phone handling: if two companies share a phone (e.g. Ramsons group),
 * first occurrence wins; subsequent entries get phone: null to satisfy unique constraint.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });   // load Neon credentials before PrismaClient initialises

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vyaparsethu.com';

const MPCB_LABEL = 'Listed via MPCB registration — pending platform verification';
const WAGLE_LABEL = 'Listed via Wagle Estate industrial directory — pending platform verification';

interface MpcbEntry {
  company:       string;
  district:      string;
  address:       string;
  product:       string;
  contactPerson: string;
  phone:         string;
  email:         string;
}

interface WagleEntry {
  company: string;
  phone:   string;
}

const MPCB: MpcbEntry[] = [
  { company: 'Ganraj Ispat Pvt. Ltd.',                    district: 'Ahilya Nagar',            address: 'Plot No. A-3, Supa MIDC, Tal. Parner',                           product: 'MS Billets & TMT Bars',             contactPerson: 'Gaurav Pramod Dugad',          phone: '9545363636', email: 'ganrajispat125@gmail.com' },
  { company: 'Rushas Engineering Company Pvt. Ltd.',       district: 'Ahilya Nagar',            address: 'Plot No. B-6, MIDC, Ahilya Nagar',                               product: 'Steel And Alloy Steel',             contactPerson: 'Satish Dattatraya Salvekar',   phone: '9225320720', email: 'accts@rushas.com' },
  { company: 'Jailaxmi Casting & Alloys Pvt. Ltd.',        district: 'Chh. Sambhaji Nagar',     address: 'Gut No. 75, Paithan Pharola',                                    product: 'MS Billets & TMT Bars',             contactPerson: 'Shriniwas Jairam Pasudesai',   phone: '9371269925', email: 'jailaxmicasting@yahoo.com' },
  { company: 'Shan Engineering Works',                     district: 'Jalgaon',                 address: 'J-83, MIDC Area',                                                product: 'MS Bars',                           contactPerson: 'Satinder Singh Gupta',         phone: '9822893130', email: 'shanjal83@gmail.com' },
  { company: 'Bhagyalaxmi Rolling Mills Pvt. Ltd.',        district: 'Jalna',                   address: 'Addl MIDC Phase-II, Gut No. 225, Nagewadi',                       product: 'MS Billets',                        contactPerson: 'V.V. Muley',                   phone: '9970400119', email: 'vv.muley@polaadbars.com' },
  { company: 'Gajkeshari Steels & Alloys Pvt. Ltd.',       district: 'Jalna',                   address: 'Plot No. F-18 & F-19, MIDC',                                     product: 'MS Billets & Ingots',               contactPerson: 'Ankush A Agrawal',             phone: '7391044402', email: 'gajkesaristeels@gmail.com' },
  { company: 'Gajlaxmi Steel Pvt. Ltd.',                   district: 'Jalna',                   address: 'Plot No. F-4, Phase II, Addl MIDC',                              product: 'MS Billets',                        contactPerson: 'Anoop Jaju',                   phone: '9960617370', email: 'anoopcool143@gmail.com' },
  { company: 'Geetai Steels Pvt. Ltd.',                    district: 'Jalna',                   address: 'Addl MIDC Plot No. F-22, Phase-II',                              product: 'MS Billets & TMT Bars',             contactPerson: 'Ashish Agrawal',               phone: '9422323120', email: 'geetaisteel@gmail.com' },
  { company: 'Jalna Siddhivinayak Alloys Pvt. Ltd.',       district: 'Jalna',                   address: 'C-4/1/1 & P-9, Addl. MIDC',                                     product: 'MS Billets & Ingots',               contactPerson: 'Santoah Tiwari',               phone: '9422217133', email: 'tiwari@roopamsteels.com' },
  { company: 'Matsyodari Steel & Alloys Pvt. Ltd.',        district: 'Jalna',                   address: 'Plot No. D-31 & 32, Addl MIDC Area',                             product: 'MS Billets & TMT Bars',             contactPerson: 'Kishor K Bharuka',             phone: '9822558171', email: 'matsyodari32@gmail.com' },
  { company: 'Metarolls Ispat Pvt. Ltd.',                  district: 'Jalna',                   address: 'Gut No. 48, Addl MIDC Phase-II, Daregaon',                       product: 'MS Billets & TMT Bars',             contactPerson: 'D N Reddy',                    phone: '7558612544', email: 'dnreddy@metarolls.com' },
  { company: 'Om Sai Ram Steels & Alloys Pvt. Ltd.',       district: 'Jalna',                   address: 'Plot No. F-1,2,3,8,9,10, Addl MIDC Phase II',                    product: 'MS Billets & TMT Bars',             contactPerson: 'Rajendra Satyanarayan Bharuka', phone: '9823373004', email: 'omsairambd@gmail.com' },
  { company: 'Rathi Steel & Metal Pvt. Ltd.',              district: 'Jalna',                   address: 'Addl MIDC Plot No. F-12',                                        product: 'MS Billets & TMT Bars',             contactPerson: 'Dinesh Kantilal Rathi',        phone: '9158997810', email: 'taxes@iconsteel.com' },
  { company: 'Saptashrungi Alloy Pvt. Ltd.',               district: 'Jalna',                   address: 'Gut No. 51 & 52, Daregaon',                                      product: 'MS Billets & TMT Bars',             contactPerson: 'Purushottam Toshhniwal',       phone: '9881738843', email: 'saptashrungi.jln@gmail.com' },
  { company: 'SRJ Peety Steels Pvt. Ltd.',                 district: 'Jalna',                   address: 'Plot No. D-50/1, Jalna',                                         product: 'MS Billets & TMT Bars',             contactPerson: 'Surendra S Peety',             phone: '9423487782', email: 'danish1017@gmail.com' },
  { company: 'SRJ Strips And Pipes Pvt. Ltd.',             district: 'Jalna',                   address: 'Vill. Daregaon, Adjacent MIDC Phase-II',                         product: 'MS Billets & TMT Bars',             contactPerson: 'Surendra Peety',               phone: '9860627273', email: 'srjstrips@gmail.com' },
  { company: 'Mahalaxmi Metallics',                        district: 'Kolhapur',                address: 'Plot No. G-94, MIDC Gokulshirgaon, Karvir',                      product: 'S.G. Iron',                         contactPerson: 'Padmaraj A. Patil',            phone: '9225839993', email: 'mahalaxmimetallics@gmail.com' },
  { company: 'Nilanjan Iron Pvt. Ltd.',                    district: 'Kolhapur',                address: 'Kagal Five Star MIDC, Halsavade',                                 product: 'MS Billets',                        contactPerson: 'Ankush Singla',                phone: '9970788278', email: 'nilanjan.iron7@gmail.com' },
  { company: 'Bajaj Steel Industries Ltd.',                district: 'Nagpur',                  address: 'G 108 MIDC Industrial Area, Butibori',                            product: 'Steel And Alloy Steel',             contactPerson: 'Rajesh Modi',                  phone: '9130038677', email: 'barve.nikhil@bajajngp.com' },
  { company: 'Diwanka Energy Pvt. Ltd.',                   district: 'Nagpur',                  address: 'Mouza-Lapka, Tal. Mouda',                                        product: 'MS Ingots & Steel Casting',         contactPerson: 'Priyank Rajkumar Diwanka',     phone: '9822221569', email: 'despatch@diwanka.com' },
  { company: 'Raja Ram Steel Industries Pvt. Ltd.',        district: 'Nagpur',                  address: 'Plot No. N-68 & 69, MIDC Hingna',                                product: 'Rolling Mill Operations',           contactPerson: 'Rajesh Sarda',                 phone: '9822213366', email: 'info@ramsons.co.in' },
  { company: 'Ramsons Castings Pvt. Ltd.',                 district: 'Nagpur',                  address: 'Plot No. N-3,4,8,9,10, MIDC Hingna Road',                        product: 'MS Billets',                        contactPerson: 'Rajesh Ramswarup Sarda',       phone: '9822213366', email: 'rrsarda@yahoo.com' },   // phone shared with Raja Ram — deduped in script
  { company: 'Ramsons Tmt Pvt. Ltd.',                      district: 'Nagpur',                  address: 'Vill. Bazargaon, N.H. No. 6, Amravati Road',                     product: 'Rolling Mill Operations',           contactPerson: 'Rajesh R. Sarda',              phone: '9822213366', email: 'storetmt@yahoo.in' },    // phone shared — deduped in script
  { company: 'MITC Rolling Mills Pvt. Ltd.',               district: 'Nashik',                  address: 'MIDC Palkhed Road, Dindori',                                     product: 'MS Billets & TMT Bars',             contactPerson: 'Atul Shah',                    phone: '9823054121', email: 'mitc.tmt@gmail.com' },
  { company: 'Bhartiya Metacast Pvt. Ltd.',                district: 'Palghar',                 address: 'Vill. Gonsai (Met Naka), Bhiwandi-Wada Rd, Wada',                product: 'MS Billets',                        contactPerson: 'Mayur Jain',                   phone: '7720076427', email: 'bhartiyameta2018@gmail.com' },
  { company: 'Bholaram Metal Industries Pvt. Ltd.',        district: 'Palghar',                 address: 'Vill. Nehroli, Tal. Wada',                                       product: 'MS Billets & Ingots',               contactPerson: 'Anil Kumar Goenka',            phone: '9967839904', email: 'info@bholarammetal.net' },
  { company: 'Gopal Ferrous Pvt. Ltd.',                    district: 'Palghar',                 address: 'Survey No.114/2/PT/L, Tal. Talsari',                             product: 'MS Billets & TMT Bars',             contactPerson: 'Sanjay Gupta',                 phone: '7574814210', email: 'gopalferrouspvtltd@gmail.com' },
  { company: 'Harisons Steel Ltd.',                        district: 'Palghar',                 address: 'Plot No. 1, Bhiwandi Wada Road',                                 product: 'MS Billets & Ingots',               contactPerson: 'Daulat Hariram Fulwadhya',     phone: '9920879123', email: 'harisonssteel@gmail.com' },
  { company: 'Jaideep Metallics & Alloys Pvt. Ltd.',       district: 'Palghar',                 address: 'Gut No. 78(P) & 79(P), Vill. Lakhmapur',                        product: 'MS Billets & Ingots',               contactPerson: 'Sitaram Churiwala',            phone: '9833036567', email: 'jaideepmetallics@gmail.com' },
  { company: 'Lion Steel Pvt. Ltd.',                       district: 'Palghar',                 address: 'Gut No 6,8P, Kondla Road, Mangathane',                           product: 'Rolling Mill Operations',           contactPerson: 'Mohd Umer Mohd Ali Khan',      phone: '9324022981', email: 'safiulmurad@gmail.com' },
  { company: 'Shivkrupa Steel and Alloys Pvt. Ltd.',       district: 'Palghar',                 address: 'Gut No. 11/1/A, Vill. Torne, Tal. Wada',                        product: 'MS Bars',                           contactPerson: 'Anand Agarwal',                phone: '8378973276', email: 'anandag84@gmail.com' },
  { company: 'Skytech Rollingmill Pvt. Ltd.',              district: 'Palghar',                 address: 'Gut No. 473,479,481, Vill. Usar, Wada',                         product: 'Steel And Alloy Steel',             contactPerson: 'Vinod B. Jain',                phone: '9930657257', email: 'skytechrolling1@gmail.com' },
  { company: 'Solo Metals Pvt. Ltd.',                      district: 'Palghar',                 address: 'Bharat Fertilizer Road, Vill. Vasuri Khurd',                     product: 'MS Billets & Ingots',               contactPerson: 'Shivgopal Damani',             phone: '9969993222', email: 'damanienterprises@rediffmail.com' },
  { company: 'Sudsar Balaji Steel Rolling Mills Pvt. Ltd.',district: 'Palghar',                 address: 'Gut No 304 & 307(P), Vill. Musarne, Wada',                      product: 'Rolling Mill Operations',           contactPerson: 'Jitendra Motilal Mundhara',    phone: '9321517090', email: 'tnd150@yahoo.co.in' },
  { company: 'Sun Metallics And Alloys Pvt. Ltd.',         district: 'Palghar',                 address: 'Bhiwandi-Wada State Highway, Lakhamapur',                        product: 'MS Billets & TMT Bars',             contactPerson: 'Mayank Singhania',             phone: '9619661713', email: 'ajay.sunsteel@gmail.com' },
  { company: 'Surya Ferrous Alloys Pvt. Ltd.',             district: 'Palghar',                 address: 'Gut No. 92, Vill. Abitghar, Wada',                               product: 'MS Billets & Ingots, Runner Risers', contactPerson: 'Amit Garg',                   phone: '9967056552', email: 'sales@suryathermex.com' },
  { company: 'Thane Steels Pvt. Ltd.',                     district: 'Palghar',                 address: '46,66,67, Vill. Vasuri Khurd, Tal. Wada',                        product: 'MS Billets & TMT Bars',             contactPerson: 'Manish Garg',                  phone: '9867608111', email: 'thanesteels@gmail.com' },
  { company: 'Torane Ispat Udyog Pvt. Ltd.',               district: 'Palghar',                 address: 'Survey No. 5/2,5/3,6,7, Vill. Torane, Wada',                    product: 'MS Billets & Ingots',               contactPerson: 'Maqsud Khan',                  phone: '9822078167', email: 'toraneispat@rediffmail.com' },
  { company: 'Viraj Profiles Pvt. Ltd.',                   district: 'Palghar',                 address: 'MIDC Tarapur-Boisar Plot No. G-34',                              product: 'Steel And Alloy Steel',             contactPerson: 'Pawankumar Bajaj',             phone: '9371099726', email: 'ehs@viraj.com' },
  { company: 'Indrayani Ferrocast Pvt. Ltd.',              district: 'Pune',                    address: 'Gut No. 225, Alandi Markal Rd, Dhanore, Khed',                   product: 'MS Billets',                        contactPerson: 'Vinod Goyal',                  phone: '9139964429', email: 'indrayaniferrocast225@gmail.com' },
  { company: 'Meenakshi Ferro Ingots Pvt. Ltd.',           district: 'Pune',                    address: 'Bhandgaon, Khor Road, Yavat, Khed',                              product: 'MS Billets & TMT Bars',             contactPerson: 'Umang Agarwal',                phone: '9049990813', email: 'mfi_pune@yahoo.co.in' },
  { company: 'Roop Rajat Steel Pvt. Ltd.',                 district: 'Pune',                    address: 'Plot 4-6, Gat No. 1251-1261, Markal, Khed',                      product: 'MS Billets',                        contactPerson: 'Saurabh Bhalchandra Mane',     phone: '9096096096', email: 'rooprajatsteelpvtltd@gmail.com' },
  { company: 'Sant Gyaneshwar Steel Pvt. Ltd.',            district: 'Pune',                    address: 'Gut No. 1076/77 Golegaon Road, Markal, Khed',                    product: 'MS Billets & Ingots, Runner Risers', contactPerson: 'Vinod Goyal',                 phone: '9552589303', email: 'santgyaneshwar2021@gmail.com' },
  { company: 'Goradia Special Steels Ltd.',                district: 'Raigad',                  address: 'Plot No. 33/5, Niphan Savroli Kharpada Rd, Khopoli',             product: 'Steel And Alloy Steel',             contactPerson: 'Pranay Goradia',               phone: '9223320189', email: 'accounts@goradia.in' },
  { company: 'Sanyo Special Steel Mfg India Pvt. Ltd.',    district: 'Raigad',                  address: 'S.No. 28B & 1B, Wasrang/Lavej, Khopoli',                        product: 'Steel And Alloy Steel',             contactPerson: 'Tanhaji Namdev Pathare',       phone: '9823964598', email: 'pathare.tanhaji@sanyospecialsteel.in' },
];

const WAGLE: WagleEntry[] = [
  { company: 'AKS Steel Processors',              phone: '9892288289' },
  { company: 'Ambica Steels India Limited',        phone: '9810189929' },
  { company: 'Anil Engineering Pvt Ltd',           phone: '7506037927' },
  { company: 'Ardh Metals & Alloys Pvt. Ltd.',     phone: '9869936999' },
  { company: 'Beegees Confab Pvt. Ltd.',           phone: '9323960454' },
  { company: 'Bombay Metal & Steel Traders',       phone: '9821137610' },
  { company: 'Bygging Infrastructure Pvt Ltd',     phone: '9821112606' },
  { company: 'Cair Valve Automation',              phone: '6357123045' },
  { company: 'Cape Town Impex',                    phone: '9004252032' },
  { company: 'Chase Bright Steel Ltd',             phone: '9920054411' },
  { company: 'D. H. Exports Pvt. Ltd.',            phone: '9870085309' },
  { company: 'Effex Industrial Solutions',         phone: '9619390698' },
  { company: 'Excelhone Mfg I Pvt. Ltd.',          phone: '9987179397' },
  { company: 'Expert Control & Infotech',          phone: '9819915822' },
  { company: 'Fabrinox Potnis India Pvt. Ltd.',    phone: '9619164777' },
  { company: 'Farohar Engineering',                phone: '9819074557' },
  { company: 'Forstar Engineers',                  phone: '9930700910' },
  { company: 'Gandhi Engineering Co',              phone: '8169790940' },
  { company: 'Hardcarb Technologies P. Ltd.',      phone: '9821420018' },
  { company: 'Havistha Steel Wool',                phone: '9821146607' },
  { company: 'Hitesh Mechanicals Pvt. Ltd.',       phone: '9821781383' },
  { company: 'Incrab Engineers Pvt. Ltd.',         phone: '9324542928' },
  { company: 'India Flex Industries Pvt. Ltd.',    phone: '9820000805' },
  { company: 'Insteel Engineers Pvt. Ltd.',        phone: '9324368017' },
  { company: 'KR Steel And Alloys',               phone: '8356827130' },
  { company: 'Sheth Fabricators Pvt. Ltd.',        phone: '9323578541' },
  { company: 'Meltroll Engineering Pvt. Ltd.',     phone: '9820094537' },
  { company: 'Metalita',                           phone: '8452034641' },
  { company: 'Natvar Iron & Steel Works P. Ltd',  phone: '9819644211' },
  { company: 'Mould N Cast/Amar Industries',       phone: '9930353333' },
  { company: 'P M Steel Industries',               phone: '9892033775' },
  { company: 'Pratham Heat Treatments',            phone: '9920709227' },
  { company: 'Prima Steels Pvt. Ltd.',             phone: '9967530174' },
  { company: 'Quality Steel Processors',           phone: '9323152778' },
  { company: 'Ref Industries',                     phone: '9820403748' },
  { company: 'S. V. Steel & Alloys P. Ltd.',      phone: '9223272789' },
  { company: 'Sanghvi Steel & Alloys',             phone: '9082875196' },
  { company: 'Shalimar Valves Pvt. Ltd.',          phone: '9820191034' },
  { company: 'Siddhesh Steel Treatment P. Ltd.',   phone: '9322253702' },
  { company: 'Siddhi Steels Pvt. Ltd.',            phone: '9925097013' },
  { company: 'Sigma Galvanizing Pvt. Ltd.',        phone: '9821325365' },
  { company: 'SK Intech Metchems Pvt. Ltd.',       phone: '9867597998' },
  { company: 'Smaco Engineering Pvt. Ltd.',        phone: '9821357054' },
  { company: 'Stainless Alloys',                   phone: '9323328292' },
  { company: 'Steel Mech Engineers',               phone: '9833131359' },
  { company: 'Steel Strong Valves (I) Pvt. Ltd.', phone: '7304508044' },
  { company: 'Steelcons Engineers Pvt. Ltd.',      phone: '7208133110' },
  { company: 'Steelkraft Equipment I Pvt. Ltd.',   phone: '9820322854' },
  { company: 'Swastik Steels (P) Ltd.',            phone: '9820007440' },
  { company: 'Technostar Engineering Pvt. Ltd.',   phone: '9322695721' },
  { company: 'Vashi Steels Pvt. Ltd.',             phone: '9820086093' },
  { company: "X'Mas Steel",                        phone: '9821292916' },
];

async function seedBatch<T extends { company: string }>(
  entries: T[],
  getPhone: (e: T) => string | null,
  getEmail: (e: T) => string | null,
  getLocation: (e: T) => string,
  getPrefs: (e: T) => Record<string, unknown>,
  importedFrom: string,
  label: string,
): Promise<Array<{ company: string; status: string; claimUrl: string }>> {
  const results: Array<{ company: string; status: string; claimUrl: string }> = [];
  const phonesUsedThisBatch = new Set<string>();

  for (const e of entries) {
    const existing = await prisma.user.findFirst({
      where: { company: e.company },
      select: { id: true, claimToken: true },
    });

    if (existing) {
      results.push({
        company:  e.company,
        status:   'SKIPPED',
        claimUrl: existing.claimToken ? `${SITE_URL}/claim/${existing.claimToken}` : '(no token)',
      });
      continue;
    }

    // Deduplicate phones within this batch
    const rawPhone = getPhone(e);
    const phone = rawPhone && !phonesUsedThisBatch.has(rawPhone) ? rawPhone : null;
    if (rawPhone && phone) phonesUsedThisBatch.add(rawPhone);

    const claimToken = randomUUID();

    try {
      await prisma.user.create({
        data: {
          name:         e.company,
          company:      e.company,
          phone,
          email:        getEmail(e),
          location:     getLocation(e),
          role:         'SUPPLIER',
          isActive:     true,
          isVerified:   false,
          isClaimed:    false,
          trustScore:   0,
          claimToken,
          importedFrom,
          preferences: {
            ...getPrefs(e),
            sourceLabel:        label,
            onboardingComplete: false,
          },
        },
      });
      results.push({
        company:  e.company,
        status:   phone ? 'CREATED' : 'CREATED (phone deduped→null)',
        claimUrl: `${SITE_URL}/claim/${claimToken}`,
      });
    } catch (err) {
      results.push({
        company:  e.company,
        status:   `ERROR: ${err instanceof Error ? err.message.split('\n')[0] : 'unknown'}`,
        claimUrl: '—',
      });
    }
  }

  return results;
}

async function main() {
  console.log('\n[1/2] MPCB steel manufacturers (45 entries)...');
  const mpcbResults = await seedBatch(
    MPCB,
    e => e.phone,
    e => e.email.toLowerCase(),
    e => `${e.address}, ${e.district}, Maharashtra`,
    e => ({ categories: ['Iron & Steel Industry'], product: e.product, contactPerson: e.contactPerson }),
    'mpcb',
    MPCB_LABEL,
  );

  console.log('\n[2/2] Wagle Estate steel companies (52 entries)...');
  const wagleResults = await seedBatch(
    WAGLE,
    e => e.phone,
    () => null,
    () => 'Wagle Estate, Thane, Maharashtra',
    () => ({ categories: ['Iron & Steel Industry', 'Mineral & Metals'] }),
    'wagle_estate',
    WAGLE_LABEL,
  );

  const all = [...mpcbResults, ...wagleResults];
  const created = all.filter(r => r.status.startsWith('CREATED')).length;
  const skipped = all.filter(r => r.status === 'SKIPPED').length;
  const errors  = all.filter(r => r.status.startsWith('ERROR')).length;

  console.log('\n' + '─'.repeat(100));
  console.log('Company'.padEnd(50) + 'Status'.padEnd(28) + 'Claim URL');
  console.log('─'.repeat(100));
  for (const r of all) {
    console.log(r.company.slice(0, 49).padEnd(50) + r.status.slice(0, 27).padEnd(28) + r.claimUrl);
  }
  console.log('─'.repeat(100));
  console.log(`\nDone. Created: ${created}  Skipped: ${skipped}  Errors: ${errors}\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
