export interface IndianCategory {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  icon: string;
  subcategories: IndianSubcategory[];
  popularStates: string[];
  gstRate: number;
}

export interface IndianSubcategory {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
}

export interface IndianState {
  code: string;
  name: string;
  nameHindi: string;
  capital: string;
  majorIndustries: string[];
  businessHubs: string[];
}

export const INDIAN_STATES: IndianState[] = [
  {
    code: 'MH',
    name: 'Maharashtra',
    nameHindi: 'महाराष्ट्र',
    capital: 'Mumbai',
    majorIndustries: ['Textiles', 'Automotive', 'IT/Software', 'Pharmaceuticals', 'Manufacturing'],
    businessHubs: ['Mumbai', 'Pune', 'Nagpur', 'Aurangabad', 'Nashik']
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    nameHindi: 'गुजरात',
    capital: 'Gandhinagar',
    majorIndustries: ['Textiles', 'Diamonds', 'Petrochemicals', 'Automotive', 'Pharmaceuticals'],
    businessHubs: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar']
  },
  {
    code: 'DL',
    name: 'Delhi',
    nameHindi: 'दिल्ली',
    capital: 'New Delhi',
    majorIndustries: ['IT/Software', 'Manufacturing', 'Textiles', 'Electronics', 'Services'],
    businessHubs: ['New Delhi', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad']
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    nameHindi: 'तमिलनाडु',
    capital: 'Chennai',
    majorIndustries: ['Automotive', 'Textiles', 'IT/Software', 'Electronics', 'Manufacturing'],
    businessHubs: ['Chennai', 'Coimbatore', 'Salem', 'Tiruppur', 'Madurai']
  },
  {
    code: 'KA',
    name: 'Karnataka',
    nameHindi: 'कर्नाटक',
    capital: 'Bangalore',
    majorIndustries: ['IT/Software', 'Biotechnology', 'Aerospace', 'Textiles', 'Manufacturing'],
    businessHubs: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum']
  }
];

export const INDIAN_CATEGORIES: IndianCategory[] = [
  {
    id: 'textiles-garments',
    name: 'Textiles & Garments',
    nameHindi: 'कपड़ा और वस्त्र',
    description: 'India\'s largest export sector with world-class manufacturing',
    descriptionHindi: 'भारत का सबसे बड़ा निर्यात क्षेत्र विश्व स्तरीय विनिर्माण के साथ',
    icon: '🧵',
    gstRate: 5,
    popularStates: ['MH', 'GJ', 'TN', 'KA'],
    subcategories: [
      { id: 'cotton-fabric', name: 'Cotton Fabric', nameHindi: 'सूती कपड़ा', description: 'Premium cotton textiles' },
      { id: 'silk-fabric', name: 'Silk Fabric', nameHindi: 'रेशमी कपड़ा', description: 'Pure silk and silk blends' },
      { id: 'woolen-fabric', name: 'Woolen Fabric', nameHindi: 'ऊनी कपड़ा', description: 'Wool and wool blends' },
      { id: 'garments', name: 'Ready Garments', nameHindi: 'तैयार वस्त्र', description: 'Finished clothing items' }
    ]
  },
  {
    id: 'pharmaceuticals-chemicals',
    name: 'Pharmaceuticals & Chemicals',
    nameHindi: 'फार्मास्यूटिकल्स और रसायन',
    description: 'World\'s pharmacy with high-quality APIs and formulations',
    descriptionHindi: 'उच्च गुणवत्ता वाले APIs और फॉर्मूलेशन के साथ विश्व का फार्मेसी',
    icon: '💊',
    gstRate: 12,
    popularStates: ['MH', 'GJ', 'DL', 'TN'],
    subcategories: [
      { id: 'apis', name: 'APIs', nameHindi: 'APIs', description: 'Active Pharmaceutical Ingredients' },
      { id: 'formulations', name: 'Formulations', nameHindi: 'फॉर्मूलेशन', description: 'Finished pharmaceutical products' },
      { id: 'chemicals', name: 'Industrial Chemicals', nameHindi: 'औद्योगिक रसायन', description: 'Industrial chemical compounds' }
    ]
  },
  {
    id: 'agricultural-products',
    name: 'Agricultural Products & Food Processing',
    nameHindi: 'कृषि उत्पाद और खाद्य प्रसंस्करण',
    description: 'Fresh and processed agricultural commodities',
    descriptionHindi: 'ताजा और प्रसंस्कृत कृषि वस्तुएं',
    icon: '🌾',
    gstRate: 0,
    popularStates: ['MH', 'GJ', 'TN', 'KA'],
    subcategories: [
      { id: 'grains', name: 'Grains & Pulses', nameHindi: 'अनाज और दालें', description: 'Rice, wheat, pulses, and cereals' },
      { id: 'spices', name: 'Spices', nameHindi: 'मसाले', description: 'Whole and ground spices' },
      { id: 'processed-foods', name: 'Processed Foods', nameHindi: 'प्रसंस्कृत खाद्य', description: 'Ready-to-eat and processed foods' }
    ]
  },
  {
    id: 'automotive-parts',
    name: 'Automotive Parts & Components',
    nameHindi: 'ऑटोमोटिव पार्ट्स और कंपोनेंट्स',
    description: 'High-quality auto components for global markets',
    descriptionHindi: 'वैश्विक बाजारों के लिए उच्च गुणवत्ता वाले ऑटो कंपोनेंट्स',
    icon: '🚗',
    gstRate: 18,
    popularStates: ['MH', 'TN', 'GJ', 'DL'],
    subcategories: [
      { id: 'engine-parts', name: 'Engine Parts', nameHindi: 'इंजन पार्ट्स', description: 'Engine components and assemblies' },
      { id: 'body-parts', name: 'Body Parts', nameHindi: 'बॉडी पार्ट्स', description: 'Vehicle body components' },
      { id: 'electrical', name: 'Electrical Components', nameHindi: 'इलेक्ट्रिकल कंपोनेंट्स', description: 'Auto electrical systems' }
    ]
  },
  {
    id: 'it-services-software',
    name: 'IT Services & Software',
    nameHindi: 'आईटी सेवाएं और सॉफ्टवेयर',
    description: 'Global IT solutions and software development',
    descriptionHindi: 'वैश्विक आईटी समाधान और सॉफ्टवेयर विकास',
    icon: '💻',
    gstRate: 18,
    popularStates: ['KA', 'MH', 'TN', 'DL'],
    subcategories: [
      { id: 'software-development', name: 'Software Development', nameHindi: 'सॉफ्टवेयर विकास', description: 'Custom software solutions' },
      { id: 'web-services', name: 'Web Services', nameHindi: 'वेब सेवाएं', description: 'Web development and hosting' },
      { id: 'consulting', name: 'IT Consulting', nameHindi: 'आईटी परामर्श', description: 'Technology consulting services' }
    ]
  },
  {
    id: 'gems-jewelry',
    name: 'Gems & Jewelry',
    nameHindi: 'रत्न और आभूषण',
    description: 'World\'s largest diamond cutting and polishing center',
    descriptionHindi: 'विश्व का सबसे बड़ा हीरा काटने और पॉलिशिंग केंद्र',
    icon: '💎',
    gstRate: 3,
    popularStates: ['GJ', 'MH', 'DL'],
    subcategories: [
      { id: 'diamonds', name: 'Diamonds', nameHindi: 'हीरे', description: 'Cut and polished diamonds' },
      { id: 'gold-jewelry', name: 'Gold Jewelry', nameHindi: 'सोने के आभूषण', description: 'Gold jewelry and ornaments' },
      { id: 'silver-jewelry', name: 'Silver Jewelry', nameHindi: 'चांदी के आभूषण', description: 'Silver jewelry and artifacts' }
    ]
  },
  {
    id: 'handicrafts-home-decor',
    name: 'Handicrafts & Home Decor',
    nameHindi: 'हस्तकला और होम डेकोर',
    description: 'Traditional Indian handicrafts and modern home decor',
    descriptionHindi: 'पारंपरिक भारतीय हस्तकला और आधुनिक होम डेकोर',
    icon: '🏺',
    gstRate: 12,
    popularStates: ['DL', 'MH', 'GJ', 'TN'],
    subcategories: [
      { id: 'traditional-crafts', name: 'Traditional Crafts', nameHindi: 'पारंपरिक शिल्प', description: 'Traditional Indian handicrafts' },
      { id: 'home-decor', name: 'Home Decor', nameHindi: 'होम डेकोर', description: 'Modern home decoration items' },
      { id: 'furniture', name: 'Furniture', nameHindi: 'फर्नीचर', description: 'Wooden and metal furniture' }
    ]
  },
  {
    id: 'machinery-equipment',
    name: 'Machinery & Equipment',
    nameHindi: 'मशीनरी और उपकरण',
    description: 'Industrial machinery and manufacturing equipment',
    descriptionHindi: 'औद्योगिक मशीनरी और विनिर्माण उपकरण',
    icon: '⚙️',
    gstRate: 18,
    popularStates: ['MH', 'TN', 'GJ', 'KA'],
    subcategories: [
      { id: 'industrial-machinery', name: 'Industrial Machinery', nameHindi: 'औद्योगिक मशीनरी', description: 'Heavy industrial machinery' },
      { id: 'textile-machinery', name: 'Textile Machinery', nameHindi: 'कपड़ा मशीनरी', description: 'Textile manufacturing equipment' },
      { id: 'agricultural-machinery', name: 'Agricultural Machinery', nameHindi: 'कृषि मशीनरी', description: 'Farming and agricultural equipment' }
    ]
  }
];

export function getCategoryById(id: string): IndianCategory | undefined {
  return INDIAN_CATEGORIES.find(category => category.id === id);
}

export function getCategoriesByState(stateCode: string): IndianCategory[] {
  return INDIAN_CATEGORIES.filter(category => 
    category.popularStates.includes(stateCode)
  );
}

export function getStateByCode(code: string): IndianState | undefined {
  return INDIAN_STATES.find(state => state.code === code);
}

export function getPopularCategories(): IndianCategory[] {
  return INDIAN_CATEGORIES.slice(0, 6); // Top 6 categories
}

export function getCategoryGSTRate(categoryId: string): number {
  const category = getCategoryById(categoryId);
  return category?.gstRate || 18; // Default GST rate
} 
