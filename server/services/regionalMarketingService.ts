interface MarketingCampaign {
  id: string;
  name: string;
  region: string;
  language: string;
  targetAudience: string[];
  budget: number;
  startDate: Date;
  endDate: Date;
  channels: string[];
  creatives: {
    type: string;
    url: string;
    title: string;
    description: string;
  }[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
}

interface RegionalMarketingInsights {
  region: string;
  topKeywords: { keyword: string; volume: number; competition: number }[];
  competitorActivity: { name: string; marketShare: number; growth: number }[];
  seasonalTrends: { season: string; trendingCategories: string[] }[];
  recommendedChannels: { channel: string; effectiveness: number }[];
}

// In-memory storage for campaigns (would be a database in production)
const campaigns: MarketingCampaign[] = [];

/**
 * Create a new regional marketing campaign
 */
export const createMarketingCampaign = async (campaignData: Omit<MarketingCampaign, 'id' | 'metrics'>): Promise<MarketingCampaign> => {
  const newCampaign: MarketingCampaign = {
    id: `camp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...campaignData,
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roi: 0
    }
  };
  
  campaigns.push(newCampaign);
  return newCampaign;
};

/**
 * Get all marketing campaigns for a region
 */
export const getRegionalCampaigns = async (region: string): Promise<MarketingCampaign[]> => {
  return campaigns.filter(campaign => campaign.region === region);
};

/**
 * Get marketing insights for a specific region
 */
export const getRegionalMarketingInsights = async (region: string): Promise<RegionalMarketingInsights> => {
  // In production, this would fetch real data from analytics services
  // For now, return mock data based on region
  
  const insights: RegionalMarketingInsights = {
    region,
    topKeywords: [],
    competitorActivity: [],
    seasonalTrends: [],
    recommendedChannels: []
  };
  
  // Populate with region-specific mock data
  switch (region) {
    case 'in':
      insights.topKeywords = [
        { keyword: 'wholesale suppliers', volume: 12500, competition: 0.75 },
        { keyword: 'manufacturing partners', volume: 8200, competition: 0.65 },
        { keyword: 'bulk orders', volume: 6700, competition: 0.55 }
      ];
      insights.recommendedChannels = [
        { channel: 'WhatsApp Business', effectiveness: 0.85 },
        { channel: 'LinkedIn', effectiveness: 0.75 },
        { channel: 'Google Ads', effectiveness: 0.70 }
      ];
      break;
      
    case 'us':
      insights.topKeywords = [
        { keyword: 'supply chain partners', volume: 15800, competition: 0.85 },
        { keyword: 'manufacturing outsourcing', volume: 9300, competition: 0.75 },
        { keyword: 'procurement solutions', volume: 7800, competition: 0.65 }
      ];
      insights.recommendedChannels = [
        { channel: 'LinkedIn', effectiveness: 0.90 },
        { channel: 'Industry Events', effectiveness: 0.85 },
        { channel: 'Email Marketing', effectiveness: 0.75 }
      ];
      break;
      
    case 'eu':
      insights.topKeywords = [
        { keyword: 'sustainable suppliers', volume: 11200, competition: 0.70 },
        { keyword: 'ethical manufacturing', volume: 8900, competition: 0.65 },
        { keyword: 'EU compliant suppliers', volume: 7400, competition: 0.60 }
      ];
      insights.recommendedChannels = [
        { channel: 'Industry Events', effectiveness: 0.85 },
        { channel: 'LinkedIn', effectiveness: 0.80 },
        { channel: 'Trade Publications', effectiveness: 0.75 }
      ];
      break;
      
    default:
      insights.topKeywords = [
        { keyword: 'global suppliers', volume: 10000, competition: 0.70 },
        { keyword: 'international procurement', volume: 7500, competition: 0.65 },
        { keyword: 'wholesale partners', volume: 5000, competition: 0.60 }
      ];
      insights.recommendedChannels = [
        { channel: 'LinkedIn', effectiveness: 0.80 },
        { channel: 'Google Ads', effectiveness: 0.75 },
        { channel: 'Email Marketing', effectiveness: 0.70 }
      ];
  }
  
  // Add common data for all regions
  insights.competitorActivity = [
    { name: 'Competitor A', marketShare: 25, growth: 5 },
    { name: 'Competitor B', marketShare: 18, growth: 3 },
    { name: 'Competitor C', marketShare: 12, growth: -2 }
  ];
  
  insights.seasonalTrends = [
    { 
      season: 'Q1', 
      trendingCategories: ['Electronics', 'Raw Materials', 'Industrial Equipment'] 
    },
    { 
      season: 'Q2', 
      trendingCategories: ['Construction Materials', 'Agricultural Products', 'Textiles'] 
    },
    { 
      season: 'Q3', 
      trendingCategories: ['Consumer Goods', 'Packaging', 'Food Processing'] 
    },
    { 
      season: 'Q4', 
      trendingCategories: ['Electronics', 'Gifts & Crafts', 'Apparel'] 
    }
  ];
  
  return insights;
};

/**
 * Generate ad creatives for a specific region and language
 */
export const generateRegionalAdCreatives = async (
  region: string,
  language: string,
  product: string,
  targetAudience: string[]
): Promise<{
  headlines: string[];
  descriptions: string[];
  callsToAction: string[];
}> => {
  // In production, this might use AI to generate region-specific ad copy
  // For now, return template-based content
  
  const creatives = {
    headlines: [
      `Find the best ${product} suppliers in your region`,
      `Connect with verified ${product} manufacturers`,
      `Streamline your ${product} procurement process`
    ],
    descriptions: [
      `Bell24H connects you with trusted ${product} suppliers tailored to your business needs.`,
      `Save time and money on ${product} procurement with our verified supplier network.`,
      `Get competitive quotes from top ${product} manufacturers in minutes.`
    ],
    callsToAction: [
      'Get Started Today',
      'Request Quotes Now',
      'Find Suppliers'
    ]
  };
  
  // Customize based on region and language
  if (region === 'in' && language === 'hi') {
    creatives.headlines = [
      `अपने क्षेत्र में सर्वश्रेष्ठ ${product} आपूर्तिकर्ता खोजें`,
      `प्रमाणित ${product} निर्माताओं से जुड़ें`,
      `अपनी ${product} खरीद प्रक्रिया को सुव्यवस्थित करें`
    ];
    creatives.callsToAction = [
      'आज ही शुरू करें',
      'अभी कोटेशन प्राप्त करें',
      'आपूर्तिकर्ता खोजें'
    ];
  }
  
  return creatives;
};
