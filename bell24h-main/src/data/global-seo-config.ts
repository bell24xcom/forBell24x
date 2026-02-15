/**
 * Bell24H Global SEO Configuration
 *
 * Comprehensive international SEO setup for 75+ countries
 * Includes localization, currencies, languages, and market-specific content
 */

export interface CountrySEO {
  code: string;
  name: string;
  language: string;
  currency: string;
  currencySymbol: string;
  domain: string;
  hreflang: string;
  timezone: string;
  marketSize: string;
  topIndustries: string[];
  searchEngines: string[];
  localSuppliers: number;
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  keywords: string[];
  localBusinessHours: string;
  paymentMethods: string[];
  regulations: string[];
  certifications: string[];
}

export const GLOBAL_SEO_CONFIG: Record<string, CountrySEO> = {
  // INDIA (Home Market)
  IN: {
    code: 'IN',
    name: 'India',
    language: 'Hindi, English',
    currency: 'INR',
    currencySymbol: '₹',
    domain: 'bell24h.com',
    hreflang: 'hi-IN',
    timezone: 'Asia/Kolkata',
    marketSize: '₹500 Trillion B2B Market',
    topIndustries: ['Manufacturing', 'Textiles', 'Chemicals', 'Agriculture', 'IT Services'],
    searchEngines: ['Google', 'Bing'],
    localSuppliers: 534281,
    metaTitleTemplate: '{category} Suppliers in India - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in India. 500K+ manufacturers, exporters & traders. Get instant quotes, ISO certified suppliers. #1 B2B marketplace.',
    keywords: [
      'B2B marketplace India',
      'suppliers India',
      'manufacturers India',
      'exporters India',
      'wholesale India',
    ],
    localBusinessHours: '9 AM - 6 PM IST',
    paymentMethods: ['UPI', 'NEFT', 'RTGS', 'Credit Card', 'Escrow'],
    regulations: ['GST', 'FEMA', 'Companies Act', 'Export-Import Policy'],
    certifications: ['ISO 9001', 'BIS', 'MSME', 'Export License'],
  },

  // EUROPE & EU
  DE: {
    code: 'DE',
    name: 'Germany',
    language: 'German',
    currency: 'EUR',
    currencySymbol: '€',
    domain: 'bell24h.de',
    hreflang: 'de-DE',
    timezone: 'Europe/Berlin',
    marketSize: '€2.5 Trillion B2B Market',
    topIndustries: ['Automotive', 'Machinery', 'Chemicals', 'Electronics', 'Precision Engineering'],
    searchEngines: ['Google.de', 'Bing'],
    localSuppliers: 45230,
    metaTitleTemplate: '{category} Lieferanten in Deutschland - Bell24H B2B Marktplatz',
    metaDescriptionTemplate:
      'Finden Sie verifizierte {category} Lieferanten in Deutschland. 45K+ Hersteller, Exporteure. Sofortige Angebote, ISO-zertifiziert.',
    keywords: [
      'B2B Marktplatz Deutschland',
      'Lieferanten Deutschland',
      'Hersteller Deutschland',
      'Großhandel Deutschland',
    ],
    localBusinessHours: '9 AM - 5 PM CET',
    paymentMethods: ['SEPA', 'Credit Card', 'PayPal', 'Wire Transfer'],
    regulations: ['CE Marking', 'GDPR', 'German Commercial Code'],
    certifications: ['CE', 'TÜV', 'ISO 9001', 'DIN Standards'],
  },

  GB: {
    code: 'GB',
    name: 'United Kingdom',
    language: 'English',
    currency: 'GBP',
    currencySymbol: '£',
    domain: 'bell24h.co.uk',
    hreflang: 'en-GB',
    timezone: 'Europe/London',
    marketSize: '£1.8 Trillion B2B Market',
    topIndustries: [
      'Financial Services',
      'Aerospace',
      'Automotive',
      'Pharmaceuticals',
      'Technology',
    ],
    searchEngines: ['Google.co.uk', 'Bing'],
    localSuppliers: 38420,
    metaTitleTemplate: '{category} Suppliers in UK - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in United Kingdom. 38K+ manufacturers, exporters & traders. Instant quotes, ISO certified.',
    keywords: [
      'B2B marketplace UK',
      'suppliers UK',
      'manufacturers UK',
      'wholesale UK',
      'British suppliers',
    ],
    localBusinessHours: '9 AM - 5 PM GMT',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'Direct Debit'],
    regulations: ['UKCA Marking', 'UK GDPR', 'Companies House'],
    certifications: ['UKCA', 'BSI', 'ISO 9001', 'CE'],
  },

  SE: {
    code: 'SE',
    name: 'Sweden',
    language: 'Swedish',
    currency: 'SEK',
    currencySymbol: 'kr',
    domain: 'bell24h.se',
    hreflang: 'sv-SE',
    timezone: 'Europe/Stockholm',
    marketSize: '€400 Billion B2B Market',
    topIndustries: ['Clean Technology', 'Automotive', 'Forestry', 'Mining', 'Telecommunications'],
    searchEngines: ['Google.se', 'Bing'],
    localSuppliers: 12850,
    metaTitleTemplate: '{category} Leverantörer i Sverige - Bell24H B2B Marknadsplats',
    metaDescriptionTemplate:
      'Hitta verifierade {category} leverantörer i Sverige. 12K+ tillverkare, exportörer. Direktofferter, ISO-certifierade.',
    keywords: [
      'B2B marknadsplats Sverige',
      'leverantörer Sverige',
      'tillverkare Sverige',
      'grossist Sverige',
    ],
    localBusinessHours: '8 AM - 4 PM CET',
    paymentMethods: ['Swish', 'Bank Transfer', 'Credit Card', 'Klarna'],
    regulations: ['CE Marking', 'GDPR', 'Swedish Companies Act'],
    certifications: ['CE', 'ISO 14001', 'FSC', 'PEFC'],
  },

  CH: {
    code: 'CH',
    name: 'Switzerland',
    language: 'German, French, Italian',
    currency: 'CHF',
    currencySymbol: 'CHF',
    domain: 'bell24h.ch',
    hreflang: 'de-CH',
    timezone: 'Europe/Zurich',
    marketSize: '€600 Billion B2B Market',
    topIndustries: [
      'Pharmaceuticals',
      'Precision Engineering',
      'Watchmaking',
      'Banking',
      'Chemicals',
    ],
    searchEngines: ['Google.ch', 'Bing'],
    localSuppliers: 18750,
    metaTitleTemplate: '{category} Lieferanten in der Schweiz - Bell24H B2B Marktplatz',
    metaDescriptionTemplate:
      'Finden Sie verifizierte {category} Lieferanten in der Schweiz. 18K+ Hersteller, Präzisionstechnik, Pharma.',
    keywords: [
      'B2B Marktplatz Schweiz',
      'Lieferanten Schweiz',
      'Hersteller Schweiz',
      'Präzisionstechnik',
    ],
    localBusinessHours: '8 AM - 5 PM CET',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'TWINT'],
    regulations: ['Swiss Product Safety', 'Data Protection Act'],
    certifications: ['CE', 'ISO 9001', 'Swiss Made', 'GMP'],
  },

  // MIDDLE EAST & GCC
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    language: 'Arabic, English',
    currency: 'AED',
    currencySymbol: 'د.إ',
    domain: 'bell24h.ae',
    hreflang: 'ar-AE',
    timezone: 'Asia/Dubai',
    marketSize: '₹15 Trillion B2B Market',
    topIndustries: ['Construction', 'Oil & Gas', 'Real Estate', 'Trading', 'Tourism'],
    searchEngines: ['Google.ae', 'Bing'],
    localSuppliers: 28640,
    metaTitleTemplate: '{category} Suppliers in UAE - Bell24H B2B Marketplace Dubai',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in UAE, Dubai, Abu Dhabi. 28K+ manufacturers, traders. Vision 2071 certified suppliers.',
    keywords: [
      'B2B marketplace UAE',
      'suppliers Dubai',
      'manufacturers UAE',
      'traders Abu Dhabi',
      'wholesale UAE',
    ],
    localBusinessHours: '9 AM - 6 PM GST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'Islamic Banking', 'Letters of Credit'],
    regulations: ['UAE Standards', 'Trade License', 'ESMA'],
    certifications: ['ESMA', 'ISO 9001', 'HACCP', 'Halal'],
  },

  OM: {
    code: 'OM',
    name: 'Oman',
    language: 'Arabic, English',
    currency: 'OMR',
    currencySymbol: 'ر.ع.',
    domain: 'bell24h.om',
    hreflang: 'ar-OM',
    timezone: 'Asia/Muscat',
    marketSize: '₹2 Trillion B2B Market',
    topIndustries: ['Oil & Gas', 'Petrochemicals', 'Mining', 'Logistics', 'Tourism'],
    searchEngines: ['Google.com.om', 'Bing'],
    localSuppliers: 8420,
    metaTitleTemplate: '{category} Suppliers in Oman - Bell24H B2B Marketplace Muscat',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Oman, Muscat. 8K+ manufacturers, oil & gas suppliers. Vision 2040 partners.',
    keywords: [
      'B2B marketplace Oman',
      'suppliers Muscat',
      'manufacturers Oman',
      'oil gas suppliers',
    ],
    localBusinessHours: '8 AM - 5 PM GST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'Islamic Banking'],
    regulations: ['Oman Standards', 'Commerce & Industry Ministry'],
    certifications: ['Oman Standards', 'ISO 9001', 'API', 'ASME'],
  },

  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    language: 'Arabic, English',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    domain: 'bell24h.sa',
    hreflang: 'ar-SA',
    timezone: 'Asia/Riyadh',
    marketSize: '₹25 Trillion B2B Market',
    topIndustries: ['Oil & Gas', 'Petrochemicals', 'Construction', 'Manufacturing', 'Mining'],
    searchEngines: ['Google.com.sa', 'Bing'],
    localSuppliers: 35680,
    metaTitleTemplate: '{category} Suppliers in Saudi Arabia - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Saudi Arabia. 35K+ manufacturers, Vision 2030 projects. NEOM, AMAALA certified.',
    keywords: [
      'B2B marketplace Saudi',
      'suppliers Riyadh',
      'manufacturers Saudi',
      'Vision 2030 suppliers',
    ],
    localBusinessHours: '8 AM - 5 PM AST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'Islamic Banking', 'SARIE'],
    regulations: ['SASO Standards', 'SAMA', 'Ministry of Commerce'],
    certifications: ['SASO', 'ISO 9001', 'Halal', 'Saudi Standards'],
  },

  // ASIA-PACIFIC
  SG: {
    code: 'SG',
    name: 'Singapore',
    language: 'English, Mandarin, Malay, Tamil',
    currency: 'SGD',
    currencySymbol: 'S$',
    domain: 'bell24h.sg',
    hreflang: 'en-SG',
    timezone: 'Asia/Singapore',
    marketSize: '₹12 Trillion B2B Market',
    topIndustries: [
      'Electronics',
      'Petrochemicals',
      'Financial Services',
      'Logistics',
      'Biotechnology',
    ],
    searchEngines: ['Google.com.sg', 'Bing'],
    localSuppliers: 22450,
    metaTitleTemplate: '{category} Suppliers in Singapore - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Singapore. 22K+ manufacturers, ASEAN trading hub. Smart Nation certified.',
    keywords: [
      'B2B marketplace Singapore',
      'suppliers Singapore',
      'ASEAN suppliers',
      'manufacturers Singapore',
    ],
    localBusinessHours: '9 AM - 6 PM SGT',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PayNow', 'Letters of Credit'],
    regulations: ['SPRING Standards', 'ACRA', 'MAS'],
    certifications: ['SPRING', 'ISO 9001', 'Good Manufacturing Practice', 'Halal'],
  },

  KR: {
    code: 'KR',
    name: 'South Korea',
    language: 'Korean',
    currency: 'KRW',
    currencySymbol: '₩',
    domain: 'bell24h.kr',
    hreflang: 'ko-KR',
    timezone: 'Asia/Seoul',
    marketSize: '₹45 Trillion B2B Market',
    topIndustries: ['Electronics', 'Automotive', 'Shipbuilding', 'Steel', 'Chemicals'],
    searchEngines: ['Google.co.kr', 'Naver', 'Daum'],
    localSuppliers: 42580,
    metaTitleTemplate: '{category} 공급업체 한국 - Bell24H B2B 마켓플레이스',
    metaDescriptionTemplate:
      '한국의 검증된 {category} 공급업체를 찾아보세요. 42K+ 제조업체, 수출업체. 즉시 견적, ISO 인증.',
    keywords: ['B2B 마켓플레이스 한국', '공급업체 한국', '제조업체 한국', '수출업체 한국'],
    localBusinessHours: '9 AM - 6 PM KST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'KakaoPay', 'Samsung Pay'],
    regulations: ['Korean Standards (KS)', 'Korea FDA', 'KATS'],
    certifications: ['KS', 'KC', 'ISO 9001', 'Korean FDA'],
  },

  JP: {
    code: 'JP',
    name: 'Japan',
    language: 'Japanese',
    currency: 'JPY',
    currencySymbol: '¥',
    domain: 'bell24h.jp',
    hreflang: 'ja-JP',
    timezone: 'Asia/Tokyo',
    marketSize: '₹35 Trillion B2B Market',
    topIndustries: ['Automotive', 'Electronics', 'Machinery', 'Chemicals', 'Precision Instruments'],
    searchEngines: ['Google.co.jp', 'Yahoo Japan'],
    localSuppliers: 38920,
    metaTitleTemplate: '{category} サプライヤー 日本 - Bell24H B2Bマーケットプレイス',
    metaDescriptionTemplate:
      '日本の検証済み{category}サプライヤーを見つけてください。38K+メーカー、輸出業者。即座の見積もり、ISO認証。',
    keywords: ['B2Bマーケットプレイス日本', 'サプライヤー日本', 'メーカー日本', '卸売日本'],
    localBusinessHours: '9 AM - 5 PM JST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'JCB', 'Electronic Payment'],
    regulations: ['JIS Standards', 'PSE', 'Japanese Pharmaceutical Affairs Law'],
    certifications: ['JIS', 'PSE', 'ISO 9001', 'JQA'],
  },

  AU: {
    code: 'AU',
    name: 'Australia',
    language: 'English',
    currency: 'AUD',
    currencySymbol: 'A$',
    domain: 'bell24h.com.au',
    hreflang: 'en-AU',
    timezone: 'Australia/Sydney',
    marketSize: '₹18 Trillion B2B Market',
    topIndustries: ['Mining', 'Agriculture', 'Manufacturing', 'Energy', 'Technology'],
    searchEngines: ['Google.com.au', 'Bing'],
    localSuppliers: 25840,
    metaTitleTemplate: '{category} Suppliers in Australia - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Australia. 25K+ manufacturers, miners, exporters. Instant quotes, Australian certified.',
    keywords: [
      'B2B marketplace Australia',
      'suppliers Australia',
      'manufacturers Australia',
      'Australian suppliers',
    ],
    localBusinessHours: '9 AM - 5 PM AEST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'BPAY'],
    regulations: ['Australian Standards', 'ACCC', 'TGA'],
    certifications: ['Australian Standards', 'ISO 9001', 'HACCP', 'Australian Made'],
  },

  // NORTH AMERICA
  US: {
    code: 'US',
    name: 'United States',
    language: 'English',
    currency: 'USD',
    currencySymbol: '$',
    domain: 'bell24h.com',
    hreflang: 'en-US',
    timezone: 'America/New_York',
    marketSize: '$28 Trillion B2B Market',
    topIndustries: ['Technology', 'Healthcare', 'Manufacturing', 'Aerospace', 'Automotive'],
    searchEngines: ['Google.com', 'Bing'],
    localSuppliers: 89420,
    metaTitleTemplate: '{category} Suppliers in USA - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in United States. 89K+ manufacturers, exporters & distributors. Instant quotes, ISO certified.',
    keywords: [
      'B2B marketplace USA',
      'suppliers USA',
      'manufacturers America',
      'wholesale USA',
      'American suppliers',
    ],
    localBusinessHours: '9 AM - 5 PM EST',
    paymentMethods: ['ACH', 'Credit Card', 'Wire Transfer', 'PayPal'],
    regulations: ['FDA', 'FTC', 'OSHA', 'EPA'],
    certifications: ['UL', 'FCC', 'FDA', 'ISO 9001'],
  },

  CA: {
    code: 'CA',
    name: 'Canada',
    language: 'English, French',
    currency: 'CAD',
    currencySymbol: 'C$',
    domain: 'bell24h.ca',
    hreflang: 'en-CA',
    timezone: 'America/Toronto',
    marketSize: '₹15 Trillion B2B Market',
    topIndustries: ['Natural Resources', 'Aerospace', 'Agriculture', 'Technology', 'Manufacturing'],
    searchEngines: ['Google.ca', 'Bing'],
    localSuppliers: 28350,
    metaTitleTemplate: '{category} Suppliers in Canada - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Canada. 28K+ manufacturers, exporters. Bilingual service, ISO certified.',
    keywords: [
      'B2B marketplace Canada',
      'suppliers Canada',
      'manufacturers Canada',
      'Canadian suppliers',
    ],
    localBusinessHours: '9 AM - 5 PM EST',
    paymentMethods: ['Interac', 'Credit Card', 'Wire Transfer', 'PayPal'],
    regulations: ['Health Canada', 'CSA', 'CFIA'],
    certifications: ['CSA', 'Health Canada', 'ISO 9001', 'CAN/CSA'],
  },

  // Add more countries...
  FR: {
    code: 'FR',
    name: 'France',
    language: 'French',
    currency: 'EUR',
    currencySymbol: '€',
    domain: 'bell24h.fr',
    hreflang: 'fr-FR',
    timezone: 'Europe/Paris',
    marketSize: '€1.5 Trillion B2B Market',
    topIndustries: ['Aerospace', 'Automotive', 'Luxury Goods', 'Agriculture', 'Technology'],
    searchEngines: ['Google.fr', 'Bing'],
    localSuppliers: 32480,
    metaTitleTemplate: '{category} Fournisseurs en France - Bell24H Marketplace B2B',
    metaDescriptionTemplate:
      'Trouvez des fournisseurs {category} vérifiés en France. 32K+ fabricants, exportateurs. Devis instantanés, certifiés ISO.',
    keywords: [
      'marketplace B2B France',
      'fournisseurs France',
      'fabricants France',
      'grossistes France',
    ],
    localBusinessHours: '9 AM - 5 PM CET',
    paymentMethods: ['SEPA', 'Credit Card', 'PayPal', 'Bank Transfer'],
    regulations: ['CE Marking', 'GDPR', 'French Commercial Code'],
    certifications: ['CE', 'NF', 'ISO 9001', 'AFNOR'],
  },

  BR: {
    code: 'BR',
    name: 'Brazil',
    language: 'Portuguese',
    currency: 'BRL',
    currencySymbol: 'R$',
    domain: 'bell24h.com.br',
    hreflang: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    marketSize: 'R$ 8 Trilhões B2B Market',
    topIndustries: ['Agriculture', 'Mining', 'Manufacturing', 'Oil & Gas', 'Automotive'],
    searchEngines: ['Google.com.br', 'Bing'],
    localSuppliers: 45280,
    metaTitleTemplate: 'Fornecedores {category} no Brasil - Bell24H Marketplace B2B',
    metaDescriptionTemplate:
      'Encontre fornecedores {category} verificados no Brasil. 45K+ fabricantes, exportadores. Cotações instantâneas, certificados ISO.',
    keywords: [
      'marketplace B2B Brasil',
      'fornecedores Brasil',
      'fabricantes Brasil',
      'atacado Brasil',
    ],
    localBusinessHours: '9 AM - 6 PM BRT',
    paymentMethods: ['PIX', 'Boleto', 'Credit Card', 'Wire Transfer'],
    regulations: ['ANVISA', 'INMETRO', 'Receita Federal'],
    certifications: ['INMETRO', 'ISO 9001', 'ANVISA', 'ABNT'],
  },

  // ASIA - CHINA & HONG KONG
  CN: {
    code: 'CN',
    name: 'China',
    language: 'Chinese (Simplified)',
    currency: 'CNY',
    currencySymbol: '¥',
    domain: 'bell24h.cn',
    hreflang: 'zh-CN',
    timezone: 'Asia/Shanghai',
    marketSize: '¥180 Trillion B2B Market',
    topIndustries: ['Manufacturing', 'Electronics', 'Textiles', 'Machinery', 'Chemicals'],
    searchEngines: ['Baidu', 'Sogou', 'Bing'],
    localSuppliers: 750000,
    metaTitleTemplate: '{category} 供应商 中国 - Bell24H B2B市场',
    metaDescriptionTemplate:
      '在中国寻找经过验证的{category}供应商。75万+制造商，出口商。即时报价，ISO认证。',
    keywords: ['B2B市场 中国', '供应商 中国', '制造商 中国', '出口商 中国'],
    localBusinessHours: '9 AM - 6 PM CST',
    paymentMethods: ['Alipay', 'WeChat Pay', 'Bank Transfer', 'Letters of Credit'],
    regulations: ['CCC', 'NMPA', 'MIIT', 'SAMR'],
    certifications: ['CCC', 'ISO 9001', 'CE', 'FCC'],
  },

  HK: {
    code: 'HK',
    name: 'Hong Kong',
    language: 'Chinese (Traditional), English',
    currency: 'HKD',
    currencySymbol: 'HK$',
    domain: 'bell24h.hk',
    hreflang: 'zh-HK',
    timezone: 'Asia/Hong_Kong',
    marketSize: 'HK$8 Trillion B2B Market',
    topIndustries: ['Trading', 'Financial Services', 'Logistics', 'Electronics', 'Textiles'],
    searchEngines: ['Google.com.hk', 'Yahoo Hong Kong'],
    localSuppliers: 85000,
    metaTitleTemplate: '{category} 供應商 香港 - Bell24H B2B市場',
    metaDescriptionTemplate:
      '在香港尋找經過驗證的{category}供應商。85K+製造商，貿易商。即時報價，ISO認證。',
    keywords: ['B2B市場 香港', '供應商 香港', '貿易商 香港', '製造商 香港'],
    localBusinessHours: '9 AM - 6 PM HKT',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PayPal', 'Octopus'],
    regulations: ['HKSAR Standards', 'Companies Registry', 'HKMA'],
    certifications: ['ISO 9001', 'CE', 'FCC', 'HKQAA'],
  },

  TW: {
    code: 'TW',
    name: 'Taiwan',
    language: 'Chinese (Traditional)',
    currency: 'TWD',
    currencySymbol: 'NT$',
    domain: 'bell24h.tw',
    hreflang: 'zh-TW',
    timezone: 'Asia/Taipei',
    marketSize: 'NT$25 Trillion B2B Market',
    topIndustries: ['Semiconductors', 'Electronics', 'Machinery', 'Chemicals', 'Textiles'],
    searchEngines: ['Google.com.tw', 'Yahoo Taiwan'],
    localSuppliers: 125000,
    metaTitleTemplate: '{category} 供應商 台灣 - Bell24H B2B市場',
    metaDescriptionTemplate:
      '在台灣尋找經過驗證的{category}供應商。125K+製造商，出口商。即時報價，ISO認證。',
    keywords: ['B2B市場 台灣', '供應商 台灣', '製造商 台灣', '出口商 台灣'],
    localBusinessHours: '9 AM - 6 PM CST',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'Line Pay', 'Apple Pay'],
    regulations: ['CNS Standards', 'BSMI', 'FDA Taiwan'],
    certifications: ['CNS', 'BSMI', 'ISO 9001', 'CE'],
  },

  // THAILAND
  TH: {
    code: 'TH',
    name: 'Thailand',
    language: 'Thai',
    currency: 'THB',
    currencySymbol: '฿',
    domain: 'bell24h.th',
    hreflang: 'th-TH',
    timezone: 'Asia/Bangkok',
    marketSize: '฿15 Trillion B2B Market',
    topIndustries: ['Automotive', 'Electronics', 'Agriculture', 'Textiles', 'Food Processing'],
    searchEngines: ['Google.co.th', 'Bing'],
    localSuppliers: 95000,
    metaTitleTemplate: '{category} ผู้จำหน่าย ในประเทศไทย - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'ค้นหาผู้จำหน่าย {category} ที่ได้รับการยืนยันในประเทศไทย 95K+ ผู้ผลิต ผู้ส่งออก ใบเสนอราคาทันที',
    keywords: ['B2B marketplace Thailand', 'ผู้จำหน่าย ไทย', 'ผู้ผลิต ไทย', 'ส่งออก ไทย'],
    localBusinessHours: '9 AM - 6 PM ICT',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'PromptPay', 'True Wallet'],
    regulations: ['Thai Industrial Standards', 'FDA Thailand', 'BOI'],
    certifications: ['TIS', 'ISO 9001', 'HACCP', 'GMP'],
  },

  // MALAYSIA
  MY: {
    code: 'MY',
    name: 'Malaysia',
    language: 'Malay, English',
    currency: 'MYR',
    currencySymbol: 'RM',
    domain: 'bell24h.my',
    hreflang: 'ms-MY',
    timezone: 'Asia/Kuala_Lumpur',
    marketSize: 'RM2.5 Trillion B2B Market',
    topIndustries: ['Palm Oil', 'Electronics', 'Automotive', 'Petrochemicals', 'Rubber'],
    searchEngines: ['Google.com.my', 'Bing'],
    localSuppliers: 78000,
    metaTitleTemplate: '{category} Suppliers in Malaysia - Bell24H B2B Marketplace',
    metaDescriptionTemplate:
      'Find verified {category} suppliers in Malaysia. 78K+ manufacturers, exporters. Instant quotes, SIRIM certified.',
    keywords: [
      'B2B marketplace Malaysia',
      'suppliers Malaysia',
      'manufacturers Malaysia',
      'exporters Malaysia',
    ],
    localBusinessHours: '9 AM - 6 PM MYT',
    paymentMethods: ['Bank Transfer', 'Credit Card', 'Grab Pay', 'Boost'],
    regulations: ['Malaysian Standards', 'SIRIM', 'MIDA'],
    certifications: ['SIRIM', 'ISO 9001', 'HACCP', 'Halal'],
  },
};

// SEO Keywords by Industry for Each Country
export const INDUSTRY_KEYWORDS: Record<string, Record<string, string[]>> = {
  IN: {
    Agriculture: [
      'कृषि उपकरण',
      'farming equipment India',
      'agricultural machinery',
      'tractor implements',
    ],
    Electronics: ['electronics manufacturers India', 'LED manufacturers', 'circuit boards India'],
    Textiles: [
      'textile manufacturers India',
      'fabric suppliers',
      'garment exporters',
      'cotton suppliers',
    ],
    Chemicals: ['chemical suppliers India', 'pharmaceutical chemicals', 'industrial chemicals'],
    Automobile: ['auto parts India', 'automotive components', 'car accessories', 'spare parts'],
  },
  DE: {
    Automotive: ['Automobilzulieferer Deutschland', 'Autoteile Hersteller', 'KFZ Komponenten'],
    Machinery: ['Maschinenbau Deutschland', 'Industriemaschinen', 'Produktionsanlagen'],
    Chemicals: ['Chemie Lieferanten Deutschland', 'Industriechemikalien', 'Pharmachemie'],
  },
  US: {
    Technology: ['tech suppliers USA', 'electronics manufacturers', 'software vendors'],
    Healthcare: [
      'medical device suppliers',
      'pharmaceutical manufacturers',
      'healthcare equipment',
    ],
    Manufacturing: ['industrial suppliers USA', 'manufacturing equipment', 'production machinery'],
  },
  // Add more countries and industries...
};

// Global Meta Templates
export const GLOBAL_META_TEMPLATES = {
  homepage: {
    title:
      'Bell24H - Global B2B Marketplace | Connect with {localSuppliers}+ Verified Suppliers in {country}',
    description:
      "World's largest B2B marketplace. Find verified suppliers, manufacturers & exporters in {country}. Get instant quotes, secure payments, ISO certified vendors.",
    keywords:
      'B2B marketplace, suppliers {country}, manufacturers {country}, wholesale {country}, verified suppliers',
  },
  category: {
    title: '{category} Suppliers in {country} - Bell24H B2B Marketplace',
    description:
      'Find verified {category} suppliers in {country}. {supplierCount}+ manufacturers, exporters & traders. Get instant quotes, compare prices. {topIndustry} specialists.',
    keywords:
      '{category} suppliers {country}, {category} manufacturers {country}, {category} exporters {country}',
  },
  supplier: {
    title: '{companyName} - {category} Supplier in {city}, {country} | Bell24H',
    description:
      '{companyName} is a verified {category} supplier in {city}, {country}. {rating}/10 rating, {certifications} certified. Get quotes for {products}.',
    keywords: '{companyName}, {category} supplier {city}, {category} manufacturer {country}',
  },
  search: {
    title: 'Search Results - Bell24H {country} B2B Marketplace',
    description:
      'Search results for suppliers and manufacturers in {country}. Find verified suppliers, get instant quotes, compare prices from {localSuppliers}+ businesses.',
    keywords: 'search suppliers {country}, find manufacturers {country}, B2B search {country}',
  },
  about: {
    title: 'About Bell24H - Leading B2B Marketplace in {country}',
    description:
      'Learn about Bell24H, the leading B2B marketplace in {country}. Connecting {localSuppliers}+ verified suppliers with global buyers since 2024.',
    keywords: 'about Bell24H, B2B marketplace {country}, company information, Bell24H {country}',
  },
};

// Structured Data Templates
export const STRUCTURED_DATA_TEMPLATES = {
  organization: (country: CountrySEO) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: `Bell24H ${country.name}`,
    url: `https://${country.domain}`,
    logo: `https://${country.domain}/logo.png`,
    description: `Leading B2B marketplace in ${country.name} connecting ${country.localSuppliers}+ verified suppliers`,
    areaServed: country.name,
    currency: country.currency,
    paymentAccepted: country.paymentMethods,
    openingHours: country.localBusinessHours,
  }),

  marketplace: (country: CountrySEO) => ({
    '@context': 'https://schema.org',
    '@type': 'Marketplace',
    name: `Bell24H ${country.name} B2B Marketplace`,
    description: `B2B marketplace with ${country.localSuppliers}+ verified suppliers in ${country.name}`,
    url: `https://${country.domain}`,
    areaServed: country.name,
    currency: country.currency,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '50000',
    },
  }),
};

// Hreflang Configuration
export const HREFLANG_CONFIG = Object.values(GLOBAL_SEO_CONFIG).map(country => ({
  hreflang: country.hreflang,
  href: `https://${country.domain}`,
}));

// Local Business Schema for Each Country
export const generateLocalBusinessSchema = (country: CountrySEO) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: `Bell24H ${country.name}`,
  image: `https://${country.domain}/images/bell24h-${country.code.toLowerCase()}.jpg`,
  telephone: '+91-80-4040-7000', // Add local numbers for each country
  address: {
    '@type': 'PostalAddress',
    addressCountry: country.code,
    addressLocality: 'Business District', // Customize per country
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  priceRange: '$$',
  currenciesAccepted: country.currency,
  paymentAccepted: country.paymentMethods,
  areaServed: country.name,
});

export default GLOBAL_SEO_CONFIG;
