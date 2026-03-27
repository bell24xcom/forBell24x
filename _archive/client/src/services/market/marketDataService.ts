// B2B Commodity Market Data Service
export interface CommodityPrice {
  id: string;
  symbol: string;
  commodity: string;
  category: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  high24h: number;
  low24h: number;
  lastUpdated: string;
  unit: string;
  exchange: string;
  specifications?: Record<string, string>;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: string;
  lastUpdated: string;
}

export interface MarketData {
  commodities: CommodityPrice[];
  indices: MarketIndex[];
  topGainers: CommodityPrice[];
  topLosers: CommodityPrice[];
  mostActive: CommodityPrice[];
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-market';
  lastRefresh: string;
}

// Comprehensive B2B Commodity Data
export const getComprehensiveMarketData = (): MarketData => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN');

  const commodities: CommodityPrice[] = [
    // CONSTRUCTION MATERIALS
    {
      id: 'steel-tmt',
      symbol: 'STEEL-TMT',
      commodity: 'TMT Steel Bars',
      category: 'Construction Materials',
      currentPrice: 65400,
      previousClose: 64800,
      change: 600,
      changePercent: 0.93,
      volume: '15,240 MT',
      marketCap: '₹125.6 Cr',
      high24h: 65800,
      low24h: 64200,
      lastUpdated: timeString,
      unit: 'per MT',
      exchange: 'NCDEX',
      specifications: {
        Grade: 'Fe500D',
        Standard: 'IS 1786',
        'Size Range': '8mm to 32mm',
        'Tensile Strength': '500 MPa minimum',
      },
    },
    {
      id: 'cement-opc',
      symbol: 'CEMENT-OPC',
      commodity: 'OPC Cement 53 Grade',
      category: 'Construction Materials',
      currentPrice: 420,
      previousClose: 415,
      change: 5,
      changePercent: 1.2,
      volume: '45,670 MT',
      marketCap: '₹89.3 Cr',
      high24h: 425,
      low24h: 412,
      lastUpdated: timeString,
      unit: 'per Bag (50kg)',
      exchange: 'MCX',
      specifications: {
        Grade: '53 Grade OPC',
        Standard: 'IS 12269',
        'Compressive Strength': '53 MPa',
        'Setting Time': '30 min initial',
      },
    },

    // ELECTRONICS & ELECTRICAL
    {
      id: 'copper-wire',
      symbol: 'CU-WIRE',
      commodity: 'Copper Wire',
      category: 'Electronics & Electrical',
      currentPrice: 785000,
      previousClose: 782000,
      change: 3000,
      changePercent: 0.38,
      volume: '3,890 MT',
      marketCap: '₹305.2 Cr',
      high24h: 787000,
      low24h: 779000,
      lastUpdated: timeString,
      unit: 'per MT',
      exchange: 'MCX',
      specifications: {
        Purity: '99.99%',
        Standard: 'IS 8130',
        Conductivity: '100% IACS',
        Diameter: '1.6mm to 4mm',
      },
    },
    {
      id: 'aluminum-wire',
      symbol: 'AL-WIRE',
      commodity: 'Aluminum Wire',
      category: 'Electronics & Electrical',
      currentPrice: 185000,
      previousClose: 186500,
      change: -1500,
      changePercent: -0.8,
      volume: '8,240 MT',
      marketCap: '₹152.4 Cr',
      high24h: 187000,
      low24h: 184000,
      lastUpdated: timeString,
      unit: 'per MT',
      exchange: 'MCX',
      specifications: {
        Grade: 'EC Grade',
        Purity: '99.5% minimum',
        Conductivity: '61% IACS',
        Temper: 'H19 (Hard)',
      },
    },

    // TEXTILES & APPAREL
    {
      id: 'cotton-bales',
      symbol: 'COTTON',
      commodity: 'Raw Cotton',
      category: 'Textiles & Apparel',
      currentPrice: 58200,
      previousClose: 58800,
      change: -600,
      changePercent: -1.02,
      volume: '28,450 Bales',
      marketCap: '₹165.8 Cr',
      high24h: 59000,
      low24h: 57800,
      lastUpdated: timeString,
      unit: 'per Bale (170kg)',
      exchange: 'NCDEX',
      specifications: {
        'Staple Length': '28-30mm',
        Micronaire: '3.8-4.2',
        Strength: '26-28 g/tex',
        Grade: 'Shankar-6',
      },
    },
    {
      id: 'polyester-yarn',
      symbol: 'PSF-YARN',
      commodity: 'Polyester Yarn',
      category: 'Textiles & Apparel',
      currentPrice: 145,
      previousClose: 143,
      change: 2,
      changePercent: 1.4,
      volume: '125,600 kg',
      marketCap: '₹182.3 Cr',
      high24h: 147,
      low24h: 142,
      lastUpdated: timeString,
      unit: 'per kg',
      exchange: 'NMCE',
      specifications: {
        Denier: '75D/36F',
        Tenacity: '4.5 g/d',
        Shrinkage: '7% maximum',
        Type: 'Fully Drawn Yarn',
      },
    },

    // CHEMICALS & PETROCHEMICALS
    {
      id: 'crude-oil',
      symbol: 'CRUDE',
      commodity: 'Crude Oil',
      category: 'Chemicals & Petrochemicals',
      currentPrice: 6850,
      previousClose: 6820,
      change: 30,
      changePercent: 0.44,
      volume: '42,180 Barrels',
      marketCap: '₹288.5 Cr',
      high24h: 6875,
      low24h: 6805,
      lastUpdated: timeString,
      unit: 'per Barrel',
      exchange: 'MCX',
      specifications: {
        Grade: 'WTI Crude',
        'API Gravity': '39.6',
        'Sulfur Content': '0.24%',
        'Pour Point': '-35°C',
      },
    },
    {
      id: 'natural-gas',
      symbol: 'NATGAS',
      commodity: 'Natural Gas',
      category: 'Chemicals & Petrochemicals',
      currentPrice: 285,
      previousClose: 288,
      change: -3,
      changePercent: -1.04,
      volume: '18,950 MMBtu',
      marketCap: '₹54.2 Cr',
      high24h: 290,
      low24h: 283,
      lastUpdated: timeString,
      unit: 'per MMBtu',
      exchange: 'MCX',
      specifications: {
        'Heat Value': '1050 BTU/scf',
        'Specific Gravity': '0.65',
        'Methane Content': '95% minimum',
        'H2S Content': '4 ppm maximum',
      },
    },

    // FOOD & AGRICULTURE
    {
      id: 'wheat-grain',
      symbol: 'WHEAT',
      commodity: 'Wheat',
      category: 'Food & Agriculture',
      currentPrice: 2450,
      previousClose: 2435,
      change: 15,
      changePercent: 0.62,
      volume: '58,720 Quintals',
      marketCap: '₹143.8 Cr',
      high24h: 2465,
      low24h: 2430,
      lastUpdated: timeString,
      unit: 'per Quintal',
      exchange: 'NCDEX',
      specifications: {
        Variety: 'HD-2967',
        Protein: '12% minimum',
        Moisture: '12% maximum',
        'Foreign Matter': '2% maximum',
      },
    },
    {
      id: 'rice-basmati',
      symbol: 'RICE-BAS',
      commodity: 'Basmati Rice',
      category: 'Food & Agriculture',
      currentPrice: 3850,
      previousClose: 3825,
      change: 25,
      changePercent: 0.65,
      volume: '24,580 Quintals',
      marketCap: '₹94.6 Cr',
      high24h: 3875,
      low24h: 3810,
      lastUpdated: timeString,
      unit: 'per Quintal',
      exchange: 'NCDEX',
      specifications: {
        Grade: 'Pusa Basmati-1121',
        Length: '6.5mm minimum',
        Moisture: '13% maximum',
        'Broken Grains': '5% maximum',
      },
    },
  ];

  // Calculate market indices
  const indices: MarketIndex[] = [
    {
      name: 'B2B Commodity Index',
      value: 15847.25,
      change: 156.8,
      changePercent: 1.0,
      volume: '₹2,450 Cr',
      lastUpdated: timeString,
    },
    {
      name: 'Industrial Materials Index',
      value: 8923.45,
      change: -23.15,
      changePercent: -0.26,
      volume: '₹1,890 Cr',
      lastUpdated: timeString,
    },
    {
      name: 'Agriculture Commodities',
      value: 12456.78,
      change: 89.34,
      changePercent: 0.72,
      volume: '₹1,250 Cr',
      lastUpdated: timeString,
    },
    {
      name: 'Energy & Chemicals',
      value: 9876.54,
      change: 45.67,
      changePercent: 0.46,
      volume: '₹980 Cr',
      lastUpdated: timeString,
    },
  ];

  // Sort for top gainers and losers
  const sortedByChange = [...commodities].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();

  // Most active by volume (simplified - would be based on actual volume numbers)
  const mostActive = commodities.slice(0, 5);

  return {
    commodities,
    indices,
    topGainers,
    topLosers,
    mostActive,
    marketStatus: now.getHours() >= 9 && now.getHours() < 17 ? 'open' : 'closed',
    lastRefresh: now.toISOString(),
  };
};

// Real-time market simulation
export const createMarketDataStream = (callback: (data: MarketData) => void) => {
  const updateMarket = () => {
    const data = getComprehensiveMarketData();

    // Simulate realistic price movements
    data.commodities.forEach(commodity => {
      // Small random fluctuations (±0.5%)
      const fluctuationPercent = (Math.random() - 0.5) * 1.0; // ±0.5%
      const fluctuation = commodity.previousClose * (fluctuationPercent / 100);

      commodity.currentPrice = commodity.previousClose + fluctuation;
      commodity.change = commodity.currentPrice - commodity.previousClose;
      commodity.changePercent = (commodity.change / commodity.previousClose) * 100;

      // Update high/low
      commodity.high24h = Math.max(commodity.high24h, commodity.currentPrice);
      commodity.low24h = Math.min(commodity.low24h, commodity.currentPrice);
    });

    callback(data);
  };

  // Update every 3 seconds for demo
  const interval = setInterval(updateMarket, 3000);
  updateMarket(); // Initial call

  return () => clearInterval(interval);
};

// Market analysis functions
export const getMarketSummary = (data: MarketData) => {
  const totalMarketCap = data.commodities.reduce((sum, commodity) => {
    const capValue = parseFloat(commodity.marketCap.replace(/[₹\s,Cr]/g, ''));
    return sum + capValue;
  }, 0);

  const gainers = data.commodities.filter(c => c.change > 0).length;
  const losers = data.commodities.filter(c => c.change < 0).length;
  const unchanged = data.commodities.filter(c => c.change === 0).length;

  return {
    totalMarketCap: `₹${totalMarketCap.toFixed(1)} Cr`,
    gainers,
    losers,
    unchanged,
    totalCommodities: data.commodities.length,
    marketTrend: gainers > losers ? 'bullish' : losers > gainers ? 'bearish' : 'neutral',
  };
};
