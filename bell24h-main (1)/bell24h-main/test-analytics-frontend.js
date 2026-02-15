/**
 * Test script for Analytics Dashboard Frontend
 * 
 * This script simulates API responses to test the analytics dashboard frontend component
 * by printing the expected data structures that would be returned by the backend API.
 */

const dashboardOverviewData = {
  activeRfqs: 23,
  activeRfqsChange: 15,
  totalBids: 142,
  totalBidsChange: 8,
  contractValue: 2850000,
  contractValueChange: 12,
  activeSuppliers: 35,
  activeSuppliersChange: 5,
  trendData: {
    rfqTrends: [
      { month: '2024-04-01', count: 18 },
      { month: '2024-05-01', count: 23 }
    ]
  }
};

const rfqPerformanceData = {
  rfqPerformanceScore: 78,
  bidRate: 85,
  averageBidsPerRfq: 4.3,
  awardRate: 63,
  responseTimeDistribution: [
    { responseTime: '< 1 day', count: 48 },
    { responseTime: '1-2 days', count: 35 },
    { responseTime: '3-5 days', count: 12 },
    { responseTime: '> 5 days', count: 5 }
  ],
  rfqStatusOverview: [
    { status: 'open', count: 12 },
    { status: 'in-progress', count: 8 },
    { status: 'awarded', count: 18 },
    { status: 'completed', count: 35 },
    { status: 'cancelled', count: 5 }
  ],
  rfqCategories: [
    { category: 'Electronics', count: 28 },
    { category: 'Manufacturing', count: 15 },
    { category: 'Chemicals', count: 12 },
    { category: 'Textiles', count: 8 },
    { category: 'Auto', count: 15 }
  ],
  rfqTypePerformance: [
    { 
      rfqType: 'text', 
      count: 45, 
      avgBids: 3.8, 
      awardRate: 58, 
      avgValue: 120000 
    },
    { 
      rfqType: 'voice', 
      count: 25, 
      avgBids: 5.2, 
      awardRate: 72, 
      avgValue: 180000 
    },
    { 
      rfqType: 'video', 
      count: 8, 
      avgBids: 6.1, 
      awardRate: 75, 
      avgValue: 210000 
    }
  ]
};

const marketAnalysisData = {
  marketInsights: {
    overview: "The Electronics sector shows an upward trend with moderate volatility expected in Q2 2025.",
    keyIndicators: {
      priceTrend: "Rising",
      volatility: "Moderate", 
      supply: "Tight",
      demand: "High"
    },
    predictions: {
      shortTerm: "Expected 5-7% price increases due to seasonal demand fluctuations.",
      midTerm: "Stabilization expected after initial volatility. Supply chains should normalize.",
      longTerm: "Projected growth of 12-15% with emerging market opportunities."
    }
  },
  priceTrends: [
    { timestamp: '2024-01-01', category: 'Electronics', priceIndex: 100 },
    { timestamp: '2024-02-01', category: 'Electronics', priceIndex: 102 },
    { timestamp: '2024-03-01', category: 'Electronics', priceIndex: 105 },
    { timestamp: '2024-04-01', category: 'Electronics', priceIndex: 106 },
    { timestamp: '2024-05-01', category: 'Electronics', priceIndex: 108 }
  ],
  regionalComparison: [
    { region: 'Asia', categoryIndex: 108, changePercent: 8 },
    { region: 'Europe', categoryIndex: 105, changePercent: 5 },
    { region: 'North America', categoryIndex: 106, changePercent: 6 },
    { region: 'MENA', categoryIndex: 110, changePercent: 10 },
    { region: 'South America', categoryIndex: 104, changePercent: 4 }
  ]
};

const marketTrendsData = {
  data: {
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    values: [100, 102, 105, 106, 108]
  },
  volatilityIndex: 0.32,
  seasonalTrend: 'upward',
  category: 'Electronics'
};

const activityData = [
  {
    type: 'rfq_created',
    title: 'PCB Assembly Components',
    timestamp: '2024-05-03T10:23:15Z'
  },
  {
    type: 'bid_received',
    rfqTitle: 'PCB Assembly Components',
    supplierName: 'GlobalTech Solutions',
    timestamp: '2024-05-03T14:45:33Z'
  },
  {
    type: 'rfq_created',
    title: 'Industrial Valves and Fittings',
    timestamp: '2024-05-02T09:12:05Z'
  },
  {
    type: 'bid_received',
    rfqTitle: 'Industrial Valves and Fittings',
    supplierName: 'PrecisionValve Inc.',
    timestamp: '2024-05-02T16:30:27Z'
  },
  {
    type: 'rfq_awarded',
    title: 'Custom Circuit Boards',
    supplierName: 'CircuitPro Manufacturing',
    timestamp: '2024-05-01T11:05:19Z'
  }
];

// Display expected API responses
console.log('\n===== Analytics API Testing =====\n');

console.log('1. Dashboard Overview Data:');
console.log(JSON.stringify(dashboardOverviewData, null, 2));
console.log('\n');

console.log('2. RFQ Performance Data:');
console.log(JSON.stringify(rfqPerformanceData, null, 2));
console.log('\n');

console.log('3. Market Analysis Data:');
console.log(JSON.stringify(marketAnalysisData, null, 2));
console.log('\n');

console.log('4. Market Trends Data:');
console.log(JSON.stringify(marketTrendsData, null, 2));
console.log('\n');

console.log('5. Activity Data:');
console.log(JSON.stringify(activityData, null, 2));
console.log('\n');

console.log('===== End of API Response Testing =====\n');

console.log('Analytics dashboard frontend is ready for implementation.');
console.log('Use the above data structures to verify component rendering and chart display.');