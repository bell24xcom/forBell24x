/**
 * One-time seed: MJP (Maharashtra Jeevan Pradhikaran) registered pipe & irrigation suppliers
 * 169 deduplicated companies from MJP enlisted vendor list.
 *
 * Run:  npx tsx scripts/seed-mjp-pipes-suppliers.ts
 *
 * Rules:
 *   isVerified: false  — platform has not verified these businesses
 *   isClaimed:  false  — owner has not authenticated
 *   trustScore: 0      — never set on unclaimed profiles
 *   claimToken: auto   — one per record, powers /claim/<token> URL
 *   No messages, notifications, or MSG91 calls.
 *
 * Phone normalisation: strips formatting chars, validates as 10-digit Indian
 * mobile (starts 6-9). Landlines / invalid formats stored as null.
 *
 * Email normalisation: lowercases, rejects entries missing '@', containing
 * double-dots, or with invalid structure.
 *
 * Intra-batch dedup: if two source rows share a phone or email, the first
 * occurrence wins and subsequent rows get null for that field.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });   // load Neon credentials before PrismaClient initialises

import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vyaparsethu.com';
const MJP_LABEL = 'Listed via Maharashtra Jeevan Pradhikaran (MJP) registry — pending platform verification';

interface MjpEntry {
  company: string;
  phone:   string;   // raw — normalised before DB write
  email:   string;   // raw — normalised before DB write
}

// ---------------------------------------------------------------------------
// Source data — 169 deduplicated MJP-registered pipe & irrigation companies
// Raw phones include landlines (stored null after normalisation).
// Raw emails include a few malformed entries (stored null after normalisation).
// ---------------------------------------------------------------------------
const MJP_COMPANIES: MjpEntry[] = [
  { company: 'AA Vasani Poly Pipe LLP',                    phone: '8866901195',   email: 'info.vasanipolypipe@.com' },        // email invalid (@.com) → null
  { company: 'Aashirwad Industries',                        phone: '9158872887',   email: 'sales@aashirwadindustries.in' },
  { company: 'Agricture Polymers',                          phone: '9371999990',   email: 'appipe@gmail.com' },
  { company: 'Agrifem Industries',                          phone: '9425088374',   email: 'agrifemindustries@gmail.com' },
  { company: 'Agro Plast Industries',                       phone: '9904927767',   email: 'agroplastindustries86@gmail.com' },
  { company: 'Aion Pipes Pvt.Ltd.',                         phone: '9812040595',   email: 'infor@aionpipes.com' },
  { company: 'Alex Pipe India Pvt.Ltd.',                    phone: '7738021671',   email: 'abhijeetpawar52@gmail.com' },
  { company: 'Anant Extrusion Ltd.',                        phone: '9821029522',   email: 'info@kamalpipes.com' },
  { company: 'Anant Irrigation',                            phone: '7610100021',   email: 'anantirrigation@gmail.com' },
  { company: 'APL Apollo Tubes Ltd.',                       phone: '9810173215',   email: 'rprasad@aplapollo.com' },
  { company: 'Apollo Pipes Ltd.',                           phone: '01206587777',  email: 'info@apollopipes.com' },            // landline → phone null
  { company: 'Arihant Industries',                          phone: '9829010745',   email: 'akkshatrashi@yahoo.com' },
  { company: 'Ashirvad Pipes Pvt.Ltd.',                     phone: '9890330269',   email: 'info@ashirvad.com' },
  { company: 'Astral poly Technik Limited',                 phone: '7774009435',   email: 'narendra.mahajan@astralpipes.com' },
  { company: 'Avon Plastic Industries Pvt. Ltd.',           phone: '080-27839948', email: 'avonplast@gmail.com' },             // landline → phone null
  { company: 'Bhagwati Plastice & Pipes Industries',        phone: '9314607924',   email: 'bppi.ambika@gmail.com' },
  { company: 'Bothra Agro Equipments Pvt Ltd.',             phone: '9545451964',   email: 'bothara@bothara.com' },
  { company: 'Braj polymers',                               phone: '9765171117',   email: 'brajpolymers@rediffmail.com' },
  { company: 'Centuary Irrigation Systems',                 phone: '9822327789',   email: 'centuryirrigationsytem@gmail.com' },
  { company: 'Chamunda Plastic Pvt. Ltd.',                  phone: '9825533176',   email: 'cpplastic.dhruv@gmail.com' },
  { company: 'Chemfab Alkalis Ltd.',                        phone: '—',            email: 'gsriram@drraoholdings.com' },
  { company: 'Constech Engineers',                          phone: '9422156678',   email: 'deshpandebhushan@hotmail.com' },
  { company: 'Creator Poly Extrusions LLP',                 phone: '9810961040',   email: 'cpepipes@gmail.com' },
  { company: 'Crown Pipes',                                 phone: '9822430700',   email: 'crownpipes1@gmail.com' },
  { company: 'Das Civil Project Pvt.Ltd.',                  phone: '—',            email: '—' },
  { company: 'Deepshika Castings Pvt. Ltd.',                phone: '9822474131',   email: 'deepshikha_castings@yahoo.in' },
  { company: 'Delta Irrigation India LLP',                  phone: '9765167186',   email: 'info@deltairrigation.in' },
  { company: 'Desana Poly Plastic Industries',              phone: '9358405000',   email: 'accounts_desana@shandgroup.com' },
  { company: 'Dolphin Poly Plast Pvt. Ltd.',                phone: '9727873737',   email: 'info@dolphinpipe.com' },
  { company: 'Drip Inida Irrigation Pvt. Ltd.',             phone: '9422961782',   email: 'contact@dripindia..com' },          // double-dot email → null
  { company: 'Duke Pipes Pvt.Ltd.',                         phone: '7574880053',   email: 'south@dukepipes.com' },
  { company: 'Dutron Polymers, Ltd.',                       phone: '9823606362',   email: 'sales@dutronindia.com' },
  { company: 'Earth & Alloys Pvt.Ltd.',                     phone: '8120666664',   email: 'info@earthstahl.com' },
  { company: 'Electrotherm (India) Ltd.',                   phone: '9370605214',   email: 'pipe@electrotherm.com' },
  { company: 'ESL Steel Ltd.',                              phone: '8697742321',   email: 'nagendra.kumarevedanta.co.in' },    // missing @ → null
  { company: 'Esscon Pipes & Fittings',                     phone: '9273404266',   email: 'essconpipes@gmail.com' },
  { company: 'Flowkem Poly Plast Pvt. Ltd.',                phone: '7874722277',   email: 'info@flowkempipes.com' },
  { company: 'Gajanan Pipe Industries',                     phone: '8888626668',   email: 'gpiakola@gmail.com' },
  { company: 'Ganesh Gouri Industries',                     phone: '7507147791',   email: 'info@ganeshgouriindustries.com' },
  { company: 'Gariman pipe Industries',                     phone: '9767001133',   email: 'garimanpipeindustries@gmail.com' },
  { company: 'Geeta Plasticwood Industries',                phone: '9372755543',   email: 'gplastwood@gmail.com' },
  { company: 'Graphite India.Ltd.',                         phone: '9158556661',   email: 'mktggrp@graphiteindia.com' },
  { company: 'GSK Irigation Pvt. Ltd.',                     phone: '9726104058',   email: 'info@gskirrigation.com' },
  { company: 'HEERA PLASTIC',                               phone: '9823066424',   email: 'heeraplastics1@gmail.com' },
  { company: 'Hil Ltd.',                                    phone: '8788671268',   email: 'ankit.dhule@hil.in' },
  { company: 'HiTech Polyplast Nagpur Pvt. Ltd.',           phone: '9422805402',   email: 'hitechployplast@gmail.com' },        // "ployplast" is source typo, stored as-is
  { company: 'Hitech Polyplast Nagpur Pvt.Ltd.',            phone: '9422805420',   email: 'hitechpolyplast@gmail.com' },
  { company: 'Idol Plasto Pvt.Ltd.',                        phone: '9687519030',   email: 'info@idolpipe.com' },
  { company: 'Idol Polytech Pvt.Ltd.',                      phone: '9925255255',   email: 'hdpe@idolpipe.com' },
  { company: 'Indofin Polymers',                            phone: '9422167997',   email: 'indofinpolymers@gmail.com' },
  { company: 'Indus Pipes & Fittings',                      phone: '9834932890',   email: 'merimaaindustries@gmail.com' },
  { company: 'Integrated Thermoplastics Ltd',               phone: '9866664934',   email: 'itlnandi07@gmail.com' },
  { company: 'Jai Balaji Industries Ltd.',                   phone: '8585024334',   email: 'mkt.dip@jaibalajigroup.com' },
  { company: 'Jain Irrigation Systems Ltd.',                phone: '—',            email: 'pemktgws@jains.com' },
  { company: 'Jalpurti Pipes Pvt.Ltd.',                     phone: '8888883177',   email: 'jalpurtipipes@gmail.com' },
  { company: 'Jeevan Polymers',                             phone: '9423185027',   email: 'jeevanpipes@gmail.com' },
  { company: 'Jindal Fittings.Ltd.',                        phone: '9167223570',   email: 'nitin.rode@jindalsaw.com' },
  { company: 'Jindal SAW Ltd.',                             phone: '9167223570',   email: 'nitin.rode@jindalsaw.com' },         // phone+email dupe of Jindal Fittings → both null after dedup
  { company: 'J.K. Technoplast Pvt.Ltd.',                   phone: '9405799633',   email: 'jktechnoplast@yahoo.com' },
  { company: 'Kakatiya Pipes & Infra Pvt. Ltd.',            phone: '9908888848',   email: 'Kakatiyapipes@gmail.com' },
  { company: 'Kanha Plastics Pvt. Ltd.',                    phone: '9226021022',   email: 'info@kptpipes.com' },
  { company: 'Kejriwal Castings Ltd.',                      phone: '033-22262312', email: 'info@kejriwalcastings.com' },        // landline → null
  { company: 'Kelvin Plastic Pvt. Ltd.',                    phone: '9099266193',   email: 'kelvinpipe@gmail.com' },
  { company: 'Kiran Infra Tech',                            phone: '7045468921',   email: 'sales@geminipipes.com' },
  { company: 'Kiran Pipe Industries',                       phone: '9420941817',   email: 'kiran.pipem84@gmail.com' },
  { company: 'Kisan Irrigation & Infrastucture Ltd.',       phone: '8691076519',   email: 'customereare@kisanirrigation.com' },
  { company: 'Kisan Mouldings Ltd.',                        phone: '7506727223',   email: 'maharashtra@kisangroup.com' },
  { company: 'Kothari Agrotech Pvt. Ltd.',                  phone: '9096327833',   email: 'project.pipe@kotharigroupindia.com' },
  { company: 'Kriti Industries Ltd.',                       phone: '0731-2719100', email: 'smithanair@kirtiindia.com' },        // landline → null
  { company: 'Kriti Industries (India) Ltd.',               phone: '0731-2540963', email: 'info@kritiindia.com' },              // landline → null
  { company: 'L G Irrigation',                              phone: '9711979713',   email: 'Irriation99@gmail.com' },
  { company: 'Laddha Agroplast Industries Pvt Ltd',         phone: '9422283974',   email: 'laddhaagro@gmail.com' },
  { company: 'Mahesh Agro Plast.',                          phone: '9881908477',   email: 'nerowcab@gmail.com' },
  { company: 'Mahindra EPC Irrigation LTD.',                phone: '9987070777',   email: 'info@mahindrairrigation.com' },
  { company: 'Mak Industries',                              phone: '7035845555',   email: 'makindustries2019@gmail.com' },
  { company: 'Malpani Pipes and Fittings Pvt. Ltd.',        phone: '9993108408',   email: 'pipes@malpanipipes.com' },
  { company: 'Modigold Pipes Pvt. Ltd.',                    phone: '9422104125',   email: 'salemodigold@gmail.com' },
  { company: 'Natraj Polyplast Pvt. Ltd.',                  phone: '9081817117',   email: 'natrajpolyplast@yahoo.com' },
  { company: 'Nineplast Industries Pvt. Ltd.',              phone: '8888868441',   email: 'nineplastindia@gmail.com' },
  { company: 'Noble Green Agritech Pvt. Ltd.',              phone: '9730677000',   email: 'noblegreenagritech@gmail.com' },
  { company: 'Noble Polymers (TNB Polymers Ltd.)',           phone: '9081605751',   email: 'noblepolymers@gmail.com' },
  { company: 'Noble Polytec',                               phone: '8511579533',   email: 'info@noblepolytec.com' },
  { company: 'Omkar Polymers Pvt. Ltd.',                    phone: '9423101824',   email: 'omkarpolymers@gmail.com' },
  { company: 'Optifiux Pipe Industries',                    phone: '9460216569',   email: 'contact@optifluxpipes.com' },
  { company: 'Ori-Plast Ltd.',                              phone: '8240998288',   email: 'Vikash.agarwal@oriplast.com' },
  { company: 'Oza Piping System Pvt. Ltd.',                 phone: '9422040099',   email: 'mahesh@ozaagro.com' },
  { company: 'Paras PVC Pipes & Fittings Pvt. Ltd.',        phone: '—',            email: 'paras@parasgroup.net' },
  { company: 'Paravati Agro Plast',                         phone: '9423035900',   email: 'pramod@parvatiudyog.com' },
  { company: 'Paravati Polyextrusion (I) Pvt.Ltd.',         phone: '9422040077',   email: 'dwc@parvatiudyog.com' },
  { company: 'Parixit Irrigation Ltd.',                     phone: '9512548485',   email: 'info@parixit.com' },
  { company: 'Parshwanath Polymers',                        phone: '9422069643',   email: 'parshwanathpolymers123@gmail.com' },
  { company: 'Polyraj Pipes LLP',                           phone: '—',            email: '—' },
  { company: 'Polysil Irrigation Systems Pvt.Ltd.',         phone: '9978933881',   email: 'info@polysilirrigation.com' },
  { company: 'Polysl Pipes Pvt. Ltd.',                      phone: '9724171141',   email: 'abdul.rehman@polysilpipes.com' },
  { company: 'Prabhavati Udyog',                            phone: '9130009202',   email: 'prabhavatiudyog@gmail.com' },
  { company: 'Pragati Pipe Industries Pvt. Ltd.',           phone: '8888626668',   email: 'info@pragatipipe.com' },             // phone dupe of Gajanan Pipe → null
  { company: 'Prajapati Industries Pvt. Ltd.',              phone: '9922009969',   email: 'piplpune13@gmail.com' },
  { company: 'Pratiksha Industries Pvt. Ltd.',              phone: '9822238180',   email: 'olex.pratiksha@gmail.com' },
  { company: 'Precision Plastic Industries Pvt.Ltd.',       phone: '—',            email: 'plumbing@precisionpipes.com' },
  { company: 'Premier Irrigation Adritec Pvt.Ltd.',         phone: '9689892242',   email: 'ngp@pial.in' },
  { company: 'Prince Pipes & Fittings Ltd.',                phone: '9004404112',   email: 'info@princepipes.com' },
  { company: 'R C Plasto Tanks & Pipes Pvt. Ltd.',          phone: '9370254204',   email: 'plastopipes@yahoo.co.in' },
  { company: 'Rainson Pipes Indudtries',                    phone: '9925745028',   email: 'rainsonpipe@gmail.com' },
  { company: 'Rashmi Metaliks Ltd.',                        phone: '8895219844',   email: 'diptender@rashmigroup.com' },
  { company: 'Reliance Industries Ltd.',                    phone: '9967659981',   email: 'relpipebusiness@ril.com' },
  { company: 'R.G. Industries',                             phone: '9815704499',   email: 'enquirya@rgindustriessachdeva.com' },
  { company: 'Sahyadri Agro Pipe Industries',               phone: '9970394845',   email: 'sahyadriagropipe055@gmail.com' },
  { company: 'Sairoop Industries',                          phone: '9021161616',   email: 'contact@sairoopindustries.com' },
  { company: 'Sarita Krushi Industries LLP',                phone: '9850342258',   email: 'saritapipes@gmail.com' },
  { company: 'SAS Polymers Pvt. Ltd.',                      phone: '9356267869',   email: 'registration@saspolymers.in' },
  { company: 'Savatram Polymers',                           phone: '9422861200',   email: 'sppipe@gmail.com' },
  { company: 'Sethi & Sons Industries.',                    phone: '9594060304',   email: 'ankursethi@gmail.com' },
  { company: 'Shakti Industries',                           phone: '9822026966',   email: 'shaileshdaga@ymail.com' },
  { company: 'Shakti Polymers',                             phone: '9246363080',   email: 'Shaktipolymersindia@gmail.com' },
  { company: 'Shiv Ganga Polymers Pvt. Ltd.',               phone: '04040101313',  email: 'shivhdppepipes@gmail.com' },         // landline (11-digit incl. STD) → null
  { company: 'Shivdatta Irrigation',                        phone: '9423439990',   email: 'shivdatta.irrigation@gmail.com' },
  { company: 'Shivshakti Industries',                       phone: '9422413208',   email: 'shivshaktigroup@hotmail.com' },
  { company: 'Shree Darshan Pipes',                         phone: '9822073007',   email: 'darshanpipes@yahoo.co.in' },
  { company: 'Shree Maheshwari Industries',                 phone: '9001021024',   email: 'smi.orvinpipes@gmail.com' },
  { company: 'Shree TNB Polymers Ltd.',                     phone: '9712932613',   email: 'noblepolymers@gmail.com' },           // email dupe of Noble Polymers → null
  { company: 'Shri. Bajrang Power and Ispat Ltd.',          phone: '9826825052',   email: 'rajat.rathod@goelgroup.co.in' },
  { company: 'Shri Balaji Industries',                      phone: '9823045546',   email: 'shribalaji.ind14@gmail.com' },
  { company: 'Shri Sairam Plastic & Irrigation',            phone: '9921192911',   email: 'patilganesh1702@gmail.com' },
  { company: 'Shrileela Industries',                        phone: '8308821135',   email: 'pvc@sanjivanigroup.com' },
  { company: 'Shriniwas Industris',                         phone: '9021140678',   email: 'qc@sanjivanigroup.com' },
  { company: 'Siddhivinayak precast pipes pvt.Ltd.',        phone: '8806757575',   email: 'sales@siddhivinayakprecast.com' },
  { company: 'Signet Industries Ltd.',                      phone: '9767873777',   email: 'Info@groupsignet.com' },
  { company: 'Sona Industries',                             phone: '9422223202',   email: 'sonaindustries1@gmail.com' },
  { company: 'Spark Irrigation Pvt. Ltd.',                  phone: '9049761183',   email: 'sparkirrigation21@gmail.com' },
  { company: 'Srikalahasthi Pipes Ltd.',                    phone: '9820048505',   email: 'splmum@srikalahasthipipes.com' },
  { company: 'SSV Piping Industries',                       phone: '9028630528',   email: 'ssvpiping@gmail.com' },
  { company: 'Sudhakar Plastic Pvt. Ltd.',                  phone: '9848042464',   email: 'polymers403@gmail.com' },
  { company: 'Sudhakar Polymers Pvt. Ltd.',                 phone: '9848042464',   email: 'polymers403@gmail.com' },             // phone+email dupe of Sudhakar Plastic → both null
  { company: 'Sunvesta Pipes Pvt. Ltd.',                    phone: '8484889444',   email: 'sunvestapipes@gmail.com' },
  { company: 'Supreme Gold Irrigation Ltd.',                phone: '8055805500',   email: 'surajned@gmail.com' },
  { company: 'Supreme industries limited',                  phone: '8806662081',   email: 'sunil_pawar@supreme.co.in' },
  { company: 'Surya Pipes',                                 phone: '8087565356',   email: 'suryapipes1@gmail.com' },
  { company: 'Surya Roshni Ltd.',                           phone: '8800377550',   email: 'maheshsharma@surya.in' },
  { company: 'S.V. Agro Products.',                         phone: '9922774138',   email: 'svagro@rediffmail.com' },
  { company: 'Swastik Industries',                          phone: '7980638334',   email: 'ho@swastic.co.in' },
  { company: 'Swastik Pipes, Yavatmal',                     phone: '07232-245121', email: 'swastikpipeind@rediffmail.com' },     // landline → null
  { company: 'Systoverse Pvt.Ltd.',                         phone: '9422278604',   email: 'admin@systoverse.com' },
  { company: 'Tata Metaliks Ltd.',                          phone: '7738381126',   email: 'tml@tatametaliks.co.in' },
  { company: 'Tatiwar Agro Industries',                     phone: '9421287072',   email: 'tatiwaragro@gmail.com' },
  { company: 'Techstar Endineer Pvt. Ltd.',                 phone: '9922240122',   email: 'techstareng@gmail.com' },
  { company: 'Tejas Agro Irrigation System Pvt. Ltd.',      phone: '9075022220',   email: 'tejas.drip@gmail.com' },
  { company: 'Telangana Pipes (P)Ltd.',                     phone: '9866664934',   email: 'marketingnandi@hotmail.com' },        // phone dupe of Integrated Thermoplastics → null
  { company: 'Teraflow Pipes',                              phone: '9998459395',   email: 'teraflowpipes2018@gmail.com' },
  { company: 'Texmo Pipes & Products Ltd.',                 phone: '—',            email: 'texmopipe@texmopipe.com' },
  { company: 'Time Technoplast Ltd.',                       phone: '9821126203',   email: 'infra@timetechnoplast.com' },
  { company: 'Tirupati Plastomatics Pvt. Ltd.',             phone: '7045468921',   email: 'saless@geminipipes.com' },            // phone dupe of Kiran Infra Tech → null
  { company: 'Tru Form Engneers',                           phone: '9225337815',   email: 'piping@truformengineers.co' },
  { company: 'Tulsi Extrusions Ltd.',                       phone: '8377059505',   email: 'info@tulsigroup.com' },
  { company: 'TVS Polymers',                                phone: '9822278489',   email: 'tvspolymers@gmail.com' },
  { company: 'Unicel Engineering Pvt. Ltd.',                phone: '9823224965',   email: 'unicelengg@gmail.com' },
  { company: 'Unitec Pipe Industry',                        phone: '—',            email: '—' },
  { company: 'United Agro Pipe Industries',                 phone: '9890150094',   email: 'unitedagro.info@gmail.com' },
  { company: 'Vahini Irrigation Pvt. Ltd.',                 phone: '7022277205',   email: 'mktg@vahinipipes.in' },
  { company: 'Vardhaman Pipes & Cables',                    phone: '9763844044',   email: 'vardhaman.pac@gmail.com' },
  { company: 'Vardhaman Polyextrusion',                     phone: '9423588903',   email: 'vardhamanpipes@gmail.com' },
  { company: 'Vasani Polymers Pvt.Ltd.',                    phone: '9409309831',   email: 'project@vasanipolymers.com' },
  { company: 'Venuka Polymers',                             phone: '6352694271',   email: 'rajesh.bhatia@venukapolymers.com' },
  { company: 'Vidharbha Irrigation System Pvt.Ltd.',        phone: '9168163751',   email: 'vidharbhairrigation@gmail.com' },
  { company: 'Vijaya Polymers India Pvt. Ltd.',             phone: '040/66586658', email: 'info@vijayapolymers.com' },           // landline → null
  { company: 'Vinayak Polypipes Pvt. Ltd.',                 phone: '9099908431',   email: 'info@vinayakpolypipes.com' },
  { company: 'viraj Polymers',                              phone: '8888834777',   email: 'bhakkadrahul@gmail.com' },
  { company: 'Visek Industries Pvt. Ltd.',                  phone: '9371162902',   email: 'visekpipes@gmail.com' },
  { company: 'Vishakha Plastic Pipes Pvt. Ltd.',            phone: '9909930975',   email: 'info@vishakhapipes.com' },
  { company: 'Welspun DI Pipes Ltd.',                       phone: '7003237944',   email: 'abhijit_ghosh@welspun.com' },
];

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

function normalizeMobile(raw: string): string | null {
  if (!raw || raw === '—') return null;
  const digits = raw.replace(/\D/g, '');
  // Strip single leading 0 (STD trunk prefix)
  const cleaned = digits.startsWith('0') ? digits.slice(1) : digits;
  // Valid Indian mobile: exactly 10 digits, starting with 6-9
  return cleaned.length === 10 && /^[6-9]/.test(cleaned) ? cleaned : null;
}

function normalizeEmail(raw: string): string | null {
  if (!raw || raw === '—') return null;
  const e = raw.toLowerCase().trim();
  if (!e.includes('@')) return null;           // missing @ (e.g. ESL Steel)
  if (e.includes('..')) return null;           // double-dot (e.g. Drip Inida)
  const [local, domain] = e.split('@');
  if (!local || !domain || !domain.includes('.')) return null;
  if (domain.startsWith('.')) return null;     // @.com pattern (AA Vasani)
  return e;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nSeeding ${MJP_COMPANIES.length} MJP pipe & irrigation supplier profiles...\n`);

  let created = 0;
  let skipped = 0;
  let errors  = 0;

  const phonesUsed  = new Set<string>();
  const emailsUsed  = new Set<string>();
  const results: Array<{ company: string; status: string; claimUrl: string }> = [];

  for (const e of MJP_COMPANIES) {
    const existing = await prisma.user.findFirst({
      where: { company: e.company },
      select: { id: true, claimToken: true },
    });

    if (existing) {
      skipped++;
      results.push({
        company:  e.company,
        status:   'SKIPPED',
        claimUrl: existing.claimToken ? `${SITE_URL}/claim/${existing.claimToken}` : '(no token)',
      });
      continue;
    }

    // Normalise and dedup within batch
    const rawPhone = normalizeMobile(e.phone);
    const phone = rawPhone && !phonesUsed.has(rawPhone) ? rawPhone : null;
    if (rawPhone && phone) phonesUsed.add(rawPhone);

    const rawEmail = normalizeEmail(e.email);
    const email = rawEmail && !emailsUsed.has(rawEmail) ? rawEmail : null;
    if (rawEmail && email) emailsUsed.add(rawEmail);

    const claimToken = randomUUID();

    try {
      await prisma.user.create({
        data: {
          name:         e.company,
          company:      e.company,
          phone,
          email,
          location:     'Maharashtra',
          role:         'SUPPLIER',
          isActive:     true,
          isVerified:   false,
          isClaimed:    false,
          trustScore:   0,
          claimToken,
          importedFrom: 'mjp',
          preferences: {
            categories:         ['Pipes & Irrigation Equipment', 'Industrial Supplies'],
            sourceLabel:        MJP_LABEL,
            onboardingComplete: false,
          },
        },
      });
      created++;
      const note = (!phone && normalizeMobile(e.phone)) ? ' (phone deduped→null)'
                 : (!phone && e.phone && e.phone !== '—')  ? ' (phone landline→null)'
                 : (!email && e.email && e.email !== '—')  ? ' (email invalid→null)'
                 : '';
      results.push({ company: e.company, status: `CREATED${note}`, claimUrl: `${SITE_URL}/claim/${claimToken}` });
    } catch (err) {
      errors++;
      results.push({
        company:  e.company,
        status:   `ERROR: ${err instanceof Error ? err.message.split('\n')[0] : 'unknown'}`,
        claimUrl: '—',
      });
    }
  }

  console.log('─'.repeat(110));
  console.log('Company'.padEnd(52) + 'Status'.padEnd(34) + 'Claim URL');
  console.log('─'.repeat(110));
  for (const r of results) {
    console.log(r.company.slice(0, 51).padEnd(52) + r.status.slice(0, 33).padEnd(34) + r.claimUrl);
  }
  console.log('─'.repeat(110));
  console.log(`\nDone. Created: ${created}  Skipped (exists): ${skipped}  Errors: ${errors}\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
