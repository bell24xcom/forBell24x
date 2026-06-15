export interface CityData {
  name: string;
  fullName: string;
  state: string;
  stateCode: string;
  description: string;
  clusterNote: string;
  categories: string[];
  lat?: number;
  lng?: number;
}

export interface CategoryMeta {
  name: string;
  description: string;
  keywords: string[];
  hsn?: string;
}

export const CITIES: Record<string, CityData> = {
  'kalamboli': {
    name: 'Kalamboli',
    fullName: 'Kalamboli, Navi Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'India\'s largest steel and metals distribution hub, with 800+ dealers, stockists, and processors within a 5 km radius.',
    clusterNote: 'CIDCO-developed industrial node; proximity to JNPT makes it the primary import-landing point for steel coils.',
    categories: ['metals-alloys', 'pipes-fittings', 'fasteners-bolts', 'tools-hardware', 'construction-real-estate'],
  },
  'bhiwandi': {
    name: 'Bhiwandi',
    fullName: 'Bhiwandi, Thane',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Maharashtra\'s largest corrugated packaging and textiles manufacturing cluster, with 400+ packaging units and India\'s highest warehousing density.',
    clusterNote: 'Home to the largest number of power looms in India. Packaging cluster serves Mumbai, Pune, and Nashik FMCG manufacturers.',
    categories: ['packaging-materials', 'textiles-garments', 'paper-printing', 'transport-logistics'],
  },
  'taloja': {
    name: 'Taloja',
    fullName: 'Taloja MIDC, Navi Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'MIDC Taloja houses Maharashtra\'s highest concentration of specialty chemical, adhesive, and polymer manufacturers.',
    clusterNote: 'MIDC Taloja has 600+ registered industrial units. Key sectors: industrial adhesives, solvents, polymers, rubber compounds.',
    categories: ['chemicals-petrochemicals', 'industrial-adhesives', 'plastics-rubber', 'paints-coatings'],
  },
  'rabale': {
    name: 'Rabale',
    fullName: 'Rabale MIDC, Navi Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Rabale MIDC is a premium industrial estate hosting electronics, chemicals, and engineering companies.',
    clusterNote: 'Adjacent to Thane-Belapur Road industrial corridor. Strong in electronics assembly and specialty chemicals.',
    categories: ['electronics-electricals', 'chemicals-petrochemicals', 'machinery-equipment'],
  },
  'ambernath': {
    name: 'Ambernath',
    fullName: 'Ambernath MIDC, Thane',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Ambernath MIDC specialises in engineering, chemicals, and defence manufacturing.',
    clusterNote: 'One of the oldest MIDCs in Maharashtra. Strong in batch chemical manufacturing and engineering components.',
    categories: ['chemicals-petrochemicals', 'machinery-equipment', 'tools-hardware', 'industrial-adhesives'],
  },
  'chakan': {
    name: 'Chakan',
    fullName: 'Chakan, Pune',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Chakan is India\'s fastest-growing auto components and engineering cluster, hosting Volkswagen, Tata Motors, and 2,000+ tier-2/3 suppliers.',
    clusterNote: 'MIDC Chakan Phase 1–3 spans 2,000+ acres. Dominant sectors: auto parts, die casting, precision machining, wiring harnesses.',
    categories: ['automotive-transport', 'machinery-equipment', 'metals-alloys', 'electronics-electricals'],
  },
  'bhosari': {
    name: 'Bhosari',
    fullName: 'Bhosari MIDC, Pune',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Bhosari MIDC is Pune\'s oldest industrial area, strong in plastics, engineering machinery, and defence components.',
    clusterNote: 'Home to BARC equipment manufacturers and defence supply chain. Strong in CNC machining and plastic moulding.',
    categories: ['plastics-rubber', 'machinery-equipment', 'automotive-transport', 'tools-hardware'],
  },
  'ranjangaon': {
    name: 'Ranjangaon',
    fullName: 'Ranjangaon MIDC, Pune',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Ranjangaon MIDC hosts Bajaj Auto, Bosch, and 500+ auto ancillary manufacturers.',
    clusterNote: 'Part of Pune-Nashik highway industrial corridor. Strong in auto ancillaries, electronics, and food processing.',
    categories: ['automotive-transport', 'electronics-electricals', 'food-beverages', 'machinery-equipment'],
  },
  'silvassa': {
    name: 'Silvassa',
    fullName: 'Silvassa, Dadra & Nagar Haveli',
    state: 'Dadra & Nagar Haveli',
    stateCode: 'DN',
    description: 'Silvassa is India\'s plastics and polymer manufacturing capital, with 7,000+ industrial units and significant tax advantages.',
    clusterNote: 'UT status gives Silvassa-based manufacturers GST and power cost advantages. Major hub for PVC pipes, plastic containers, lubricants.',
    categories: ['plastics-rubber', 'chemicals-petrochemicals', 'packaging-materials', 'pipes-fittings'],
  },
  'vatva': {
    name: 'Vatva',
    fullName: 'Vatva GIDC, Ahmedabad',
    state: 'Gujarat',
    stateCode: 'GJ',
    description: 'Vatva GIDC is India\'s largest chemical manufacturing cluster, hosting 2,000+ chemical units producing dyes, pharmaceuticals, and industrial chemicals.',
    clusterNote: 'India\'s largest dye and intermediate chemicals hub. Also strong in pharmaceuticals and specialty chemicals for textiles.',
    categories: ['chemicals-petrochemicals', 'pharmaceuticals-healthcare', 'textiles-garments', 'paints-coatings'],
  },
  'ankleshwar': {
    name: 'Ankleshwar',
    fullName: 'Ankleshwar GIDC, Bharuch',
    state: 'Gujarat',
    stateCode: 'GJ',
    description: 'Ankleshwar is Asia\'s largest industrial estate by area, specialising in agrochemicals, pharmaceuticals, and specialty chemicals.',
    clusterNote: 'Bharuch district hosts India\'s highest concentration of chemical manufacturers per sq km.',
    categories: ['chemicals-petrochemicals', 'pharmaceuticals-healthcare', 'agriculture-farming'],
  },
  'surat': {
    name: 'Surat',
    fullName: 'Surat, Gujarat',
    state: 'Gujarat',
    stateCode: 'GJ',
    description: 'Surat handles 95% of India\'s diamond cutting and polishing, and is India\'s largest synthetic textile and embroidery cluster.',
    clusterNote: 'Surat\'s textile market (Ring Road) is the world\'s largest fabric trading hub. Embroidery and zari work is concentrated in Surat city.',
    categories: ['textiles-garments', 'jewellery-gems', 'apparel-fashion', 'packaging-materials'],
  },
  'ludhiana': {
    name: 'Ludhiana',
    fullName: 'Ludhiana, Punjab',
    state: 'Punjab',
    stateCode: 'PB',
    description: 'Ludhiana is India\'s largest woollen hosiery manufacturing city and a major bicycle and auto parts hub.',
    clusterNote: 'Known as the Manchester of India. Strong in bicycle components, hosiery, and machine tools.',
    categories: ['textiles-garments', 'automotive-transport', 'machinery-equipment', 'metals-alloys'],
  },
  'coimbatore': {
    name: 'Coimbatore',
    fullName: 'Coimbatore, Tamil Nadu',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    description: 'Coimbatore is India\'s pump and motor manufacturing capital and a major textile machinery hub.',
    clusterNote: 'Known as the Manchester of South India. Hosts 30,000+ small industries. Pumps, motors, and wet grinders are global exports.',
    categories: ['pumps-compressors', 'machinery-equipment', 'textiles-garments', 'electronics-electricals'],
  },
  'rajkot': {
    name: 'Rajkot',
    fullName: 'Rajkot, Gujarat',
    state: 'Gujarat',
    stateCode: 'GJ',
    description: 'Rajkot is a major engineering and brass parts manufacturing hub, and one of India\'s top diesel engine producers.',
    clusterNote: 'Brass parts (auto, plumbing, electrical fittings) are Rajkot\'s primary export. 15,000+ MSME engineering units.',
    categories: ['machinery-equipment', 'metals-alloys', 'automotive-transport', 'fasteners-bolts'],
  },
  'agra': {
    name: 'Agra',
    fullName: 'Agra, Uttar Pradesh',
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    description: 'Agra is India\'s largest leather footwear manufacturing centre and a major tourist goods cluster.',
    clusterNote: '5,000+ leather units. Agra produces 65% of India\'s total leather footwear. Petha and Dalmoth are also food industry highlights.',
    categories: ['leather-footwear', 'apparel-fashion', 'food-beverages'],
  },
  'mumbai': {
    name: 'Mumbai',
    fullName: 'Mumbai, Maharashtra',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'India\'s financial and commercial capital, with major trading hubs across all B2B categories.',
    clusterNote: 'Dharavi for leather/recycled goods, Kurla-Mankhurd for electronics, Crawford Market for bulk commodities.',
    categories: ['electronics-electricals', 'leather-footwear', 'food-beverages', 'metals-alloys', 'packaging-materials'],
  },
  'pune': {
    name: 'Pune',
    fullName: 'Pune, Maharashtra',
    state: 'Maharashtra',
    stateCode: 'MH',
    description: 'Pune is India\'s second-largest automotive hub and a major IT and manufacturing centre.',
    clusterNote: 'Automotive ecosystem spans OEMs (Tata, Bajaj, Force) and 10,000+ tier-2/3 suppliers across Chakan, Pimpri, Bhosari.',
    categories: ['automotive-transport', 'machinery-equipment', 'electronics-electricals', 'it-telecom'],
  },
};

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'metals-alloys': {
    name: 'Steel & Metals',
    description: 'TMT bars, HR coils, MS plates, SS sheets, copper, aluminium, and all ferrous/non-ferrous metals',
    keywords: ['steel suppliers', 'TMT bar suppliers', 'HR coil suppliers', 'MS plate suppliers', 'metal dealers'],
    hsn: '7208-7229, 7407-7413',
  },
  'packaging-materials': {
    name: 'Packaging Materials',
    description: 'Corrugated boxes, BOPP tapes, stretch film, PP bags, jute bags, flexible packaging',
    keywords: ['corrugated box manufacturers', 'packaging suppliers', 'carton manufacturers', 'BOPP tape suppliers'],
    hsn: '4819, 3923, 6305',
  },
  'chemicals-petrochemicals': {
    name: 'Industrial Chemicals',
    description: 'Solvents, acids, lubricants, specialty chemicals, industrial gases, petrochemical derivatives',
    keywords: ['chemical suppliers', 'industrial chemical manufacturers', 'solvent suppliers', 'petrochemical dealers'],
    hsn: '2901-2942, 3814-3820',
  },
  'industrial-adhesives': {
    name: 'Industrial Adhesives & Sealants',
    description: 'Epoxy adhesives, PU adhesives, hot melt, cyanoacrylate, contact cement, construction sealants',
    keywords: ['adhesive suppliers India', 'epoxy adhesive manufacturers', 'sealant suppliers', 'industrial glue'],
    hsn: '3506',
  },
  'automotive-transport': {
    name: 'Auto Components & Transport',
    description: 'Auto parts, OEM components, tyres, batteries, EV components, commercial vehicle parts',
    keywords: ['auto parts suppliers India', 'automotive component manufacturers', 'OEM suppliers India'],
    hsn: '8708, 4011, 8507',
  },
  'machinery-equipment': {
    name: 'Industrial Machinery',
    description: 'CNC machines, hydraulic equipment, conveyor systems, industrial pumps, compressors, generators',
    keywords: ['industrial machinery suppliers India', 'CNC machine manufacturers', 'equipment dealers India'],
    hsn: '8428, 8479, 8501',
  },
  'plastics-rubber': {
    name: 'Plastics & Rubber',
    description: 'PVC pipes, plastic granules, rubber sheets, HDPE bags, PP compounds, injection moulded parts',
    keywords: ['plastic manufacturers India', 'rubber suppliers India', 'PVC pipe manufacturers', 'plastic granules'],
    hsn: '3901-3926, 4001-4017',
  },
  'textiles-garments': {
    name: 'Textiles & Garments',
    description: 'Cotton fabric, synthetic fabric, readymade garments, yarn, knitted fabric, embroidery',
    keywords: ['textile manufacturers India', 'fabric suppliers India', 'garment manufacturers India', 'yarn suppliers'],
    hsn: '5208-5212, 5407-5408, 6101-6117',
  },
  'electronics-electricals': {
    name: 'Electronics & Electricals',
    description: 'PCBs, electrical cables, switchgear, motors, LED lighting, transformers, sensors',
    keywords: ['electronics suppliers India', 'electrical equipment manufacturers', 'cable suppliers India'],
    hsn: '8501-8548, 8601-8609',
  },
  'pharmaceuticals-healthcare': {
    name: 'Pharmaceuticals & Healthcare',
    description: 'API, formulations, medical devices, hospital supplies, diagnostics, OTC medicines',
    keywords: ['pharma suppliers India', 'API manufacturers India', 'medical device suppliers', 'generic medicine'],
    hsn: '3001-3006, 9018-9022',
  },
  'food-beverages': {
    name: 'Food & Beverages',
    description: 'Agricultural commodities, processed food, spices, FMCG food products, beverages, dairy',
    keywords: ['food suppliers India', 'FMCG food manufacturers', 'spice suppliers India', 'commodity traders'],
    hsn: '0101-2402',
  },
  'pipes-fittings': {
    name: 'Pipes & Fittings',
    description: 'MS pipes, GI pipes, HDPE pipes, SS tubes, elbows, flanges, valves, pipe fittings',
    keywords: ['pipe suppliers India', 'pipe fittings manufacturers', 'HDPE pipe suppliers', 'MS pipe dealers'],
    hsn: '7303-7307, 3917',
  },
  'construction-real-estate': {
    name: 'Construction Materials',
    description: 'Cement, TMT bars, bricks, tiles, glass, waterproofing compounds, construction chemicals',
    keywords: ['construction materials suppliers India', 'cement dealers India', 'building materials suppliers'],
    hsn: '2523, 6810, 6901-6914',
  },
  'paints-coatings': {
    name: 'Paints & Coatings',
    description: 'Industrial paints, anti-corrosion coatings, powder coatings, protective coatings, solvents',
    keywords: ['paint manufacturers India', 'industrial coating suppliers', 'powder coating suppliers India'],
    hsn: '3208-3210',
  },
  'pumps-compressors': {
    name: 'Pumps & Compressors',
    description: 'Centrifugal pumps, submersible pumps, air compressors, vacuum pumps, industrial blowers',
    keywords: ['pump manufacturers India', 'compressor suppliers India', 'centrifugal pump dealers'],
    hsn: '8413, 8414',
  },
  'leather-footwear': {
    name: 'Leather & Footwear',
    description: 'Leather hides, finished leather, leather footwear, leather goods, synthetic leather',
    keywords: ['leather suppliers India', 'footwear manufacturers India', 'leather goods suppliers'],
    hsn: '4101-4115, 6401-6406',
  },
  'jewellery-gems': {
    name: 'Jewellery & Gems',
    description: 'Diamond, gold jewellery, silver jewellery, gemstones, imitation jewellery, lab-grown diamonds',
    keywords: ['jewellery manufacturers India', 'diamond suppliers Surat', 'gemstone dealers India'],
    hsn: '7101-7118',
  },
};

// All crawlable city+category combinations for sitemap
export function getAllCityCategoryPairs(): { city: string; category: string }[] {
  const pairs: { city: string; category: string }[] = [];
  for (const [citySlug, cityData] of Object.entries(CITIES)) {
    for (const category of cityData.categories) {
      pairs.push({ city: citySlug, category });
    }
  }
  return pairs;
}
