'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Beaker, Cpu, Factory } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  industry: string;
  trend: 'up' | 'down' | 'neutral';
  lastUpdated: string;
}

interface IndustryData {
  industry: string;
  icon: any;
  performance: number;
  trend: 'up' | 'down' | 'neutral';
  topStocks: StockData[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  keyInsights: string[];
  opportunities: string[];
}

interface EconomicIndicator {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface MarketNews {
  id: string;
  headline: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  relatedIndustries: string[];
}

export default function StockMarketIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);

  // Simulate real-time stock data (in production, this would come from Alpha Vantage API)
  const generateStockData = (): StockData[] => {
    const stocks = [
      {
        symbol: 'RELIANCE.BSE',
        name: 'Reliance Industries',
        industry: 'Oil & Gas',
        basePrice: 2450,
      },
      {
        symbol: 'TCS.BSE',
        name: 'Tata Consultancy Services',
        industry: 'IT Services',
        basePrice: 3850,
      },
      {
        symbol: 'INFY.BSE',
        name: 'Infosys Limited',
        industry: 'IT Services',
        basePrice: 1650,
      },
      {
        symbol: 'HDFCBANK.BSE',
        name: 'HDFC Bank',
        industry: 'Banking',
        basePrice: 1580,
      },
      {
        symbol: 'ICICIBANK.BSE',
        name: 'ICICI Bank',
        industry: 'Banking',
        basePrice: 1120,
      },
      {
        symbol: 'BHARTIARTL.BSE',
        name: 'Bharti Airtel',
        industry: 'Telecom',
        basePrice: 1050,
      },
      {
        symbol: 'ITC.BSE',
        name: 'ITC Limited',
        industry: 'FMCG',
        basePrice: 465,
      },
      {
        symbol: 'LT.BSE',
        name: 'Larsen & Toubro',
        industry: 'Engineering',
        basePrice: 3450,
      },
      {
        symbol: 'HCLTECH.BSE',
        name: 'HCL Technologies',
        industry: 'IT Services',
        basePrice: 1750,
      },
      {
        symbol: 'MARUTI.BSE',
        name: 'Maruti Suzuki',
        industry: 'Automotive',
        basePrice: 10500,
      },
    ];

    return stocks.map(stock => {
      const change = (Math.random() - 0.5) * 100;
      const changePercent = (change / stock.basePrice) * 100;
      return {
        ...stock,
        price: stock.basePrice + change,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: `₹${(Math.random() * 500 + 50).toFixed(0)}K Cr`,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const [stockData, setStockData] = useState<StockData[]>(generateStockData());

  // Industry data with B2B relevance
  const industryData: IndustryData[] = [
    {
      industry: 'Manufacturing',
      icon: Factory,
      performance: 2.3,
      trend: 'up',
      topStocks: stockData
        .filter(s => ['Engineering', 'Automotive'].includes(s.industry))
        .slice(0, 3),
      marketSentiment: 'bullish',
      keyInsights: [
        'Manufacturing PMI at 57.5, indicating strong expansion',
        'Government PLI schemes boosting production',
        'Rising demand for industrial equipment',
        'Export orders showing positive growth',
      ],
      opportunities: [
        'Automation equipment suppliers',
        'Raw material suppliers for manufacturing',
        'Industrial IoT solutions providers',
        'Quality testing equipment manufacturers',
      ],
    },
    {
      industry: 'Technology',
      icon: Cpu,
      performance: 1.8,
      trend: 'up',
      topStocks: stockData.filter(s => s.industry === 'IT Services').slice(0, 3),
      marketSentiment: 'bullish',
      keyInsights: [
        'Digital transformation driving IT spending',
        'Cloud adoption accelerating across sectors',
        'AI and ML investments increasing',
        'Cybersecurity demand at all-time high',
      ],
      opportunities: [
        'Cloud infrastructure providers',
        'Software licensing and services',
        'Hardware suppliers for data centers',
        'Cybersecurity solution providers',
      ],
    },
    {
      industry: 'Chemicals',
      icon: Beaker,
      performance: -0.5,
      trend: 'down',
      topStocks: stockData.filter(s => s.industry === 'Chemicals').slice(0, 3),
      marketSentiment: 'neutral',
      keyInsights: [
        'Raw material costs putting pressure on margins',
        'Environmental regulations increasing compliance costs',
        'Specialty chemicals showing resilience',
        'Export markets facing headwinds',
      ],
      opportunities: [
        'Green chemistry solutions',
        'Specialty chemical manufacturers',
        'Environmental compliance services',
        'Waste management solutions',
      ],
    },
    {
      industry: 'Logistics',
      icon: Truck,
      performance: 3.1,
      trend: 'up',
      topStocks: stockData.filter(s => s.industry === 'Logistics').slice(0, 3),
      marketSentiment: 'bullish',
      keyInsights: [
        'E-commerce growth driving logistics demand',
        'Last-mile delivery solutions in high demand',
        'Cold chain logistics expanding rapidly',
        'Technology adoption improving efficiency',
      ],
      opportunities: [
        'Fleet management solutions',
        'Warehouse automation equipment',
        'Cold storage infrastructure',
        'Logistics software providers',
      ],
    },
    {
      industry: 'Textiles',
      icon: Shirt,
      performance: 0.8,
      trend: 'up',
      topStocks: stockData.filter(s => s.industry === 'Textiles').slice(0, 3),
      marketSentiment: 'neutral',
      keyInsights: [
        'Cotton prices stabilizing after volatility',
        'Sustainable textile demand growing',
        'Export orders recovering gradually',
        'Technology adoption improving productivity',
      ],
      opportunities: [
        'Sustainable textile manufacturers',
        'Textile machinery suppliers',
        'Dyeing and finishing equipment',
        'Quality testing services',
      ],
    },
  ];

  const economicIndicators: EconomicIndicator[] = [
    {
      name: 'GDP Growth Rate',
      value: '6.8%',
      change: 0.2,
      trend: 'up',
      impact: 'positive',
      description: 'Quarterly GDP growth showing strong economic momentum',
    },
    {
      name: 'Manufacturing PMI',
      value: '57.5',
      change: 1.2,
      trend: 'up',
      impact: 'positive',
      description: 'Manufacturing sector expansion above 50 threshold',
    },
    {
      name: 'Inflation Rate',
      value: '4.2%',
      change: -0.3,
      trend: 'down',
      impact: 'positive',
      description: 'Consumer price inflation within RBI target range',
    },
    {
      name: 'USD/INR',
      value: '82.45',
      change: -0.15,
      trend: 'down',
      impact: 'positive',
      description: 'Rupee strengthening against dollar, good for importers',
    },
    {
      name: 'Crude Oil (Brent)',
      value: '$78.2',
      change: -2.1,
      trend: 'down',
      impact: 'positive',
      description: 'Lower oil prices reducing input costs for industries',
    },
    {
      name: 'Bank Credit Growth',
      value: '15.2%',
      change: 0.8,
      trend: 'up',
      impact: 'positive',
      description: 'Strong credit growth indicating business expansion',
    },
  ];

  const marketNews: MarketNews[] = [
    {
      id: 'news_001',
      headline: 'Government Announces ₹2 Lakh Crore Infrastructure Push',
      summary:
        'New infrastructure spending plan to boost steel, cement, and construction sectors with focus on roads, railways, and ports.',
      impact: 'high',
      timestamp: '2025-01-20T09:30:00Z',
      relatedIndustries: ['Manufacturing', 'Engineering', 'Steel'],
    },
    {
      id: 'news_002',
      headline: 'RBI Maintains Repo Rate at 6.5%, Signals Growth Focus',
      summary:
        'Central bank keeps interest rates unchanged, prioritizing economic growth while monitoring inflation trends.',
      impact: 'medium',
      timestamp: '2025-01-20T08:45:00Z',
      relatedIndustries: ['Banking', 'Real Estate', 'Manufacturing'],
    },
    {
      id: 'news_003',
      headline: 'PLI Scheme Extension Boosts Electronics Manufacturing',
      summary:
        'Production Linked Incentive scheme extended for electronics sector, expected to attract ₹50,000 crore investments.',
      impact: 'high',
      timestamp: '2025-01-20T07:15:00Z',
      relatedIndustries: ['Technology', 'Electronics', 'Manufacturing'],
    },
  ];

  // Simulate real-time updates
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const interval = setInterval(() => {
      setStockData(generateStockData());
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [hasMounted]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStockData(generateStockData());
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span>📈</span>;
      case 'down':
        return <span>📉</span>;
      default:
        return <span>📊</span>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-emerald-600 bg-emerald-100';
      case 'bearish':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-amber-600 bg-amber-100';
    }
  };

  return (
    <section className='bg-gradient-to-br from-emerald-50 to-blue-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full mb-4'>
            <span>📊</span>
            <span className='text-sm font-semibold text-emerald-700'>LIVE MARKET INTELLIGENCE</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Stock Market Integration
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Real-time market data, industry insights, and economic indicators to make informed B2B
            procurement and investment decisions.
          </p>

          <div className='flex items-center justify-center gap-4'>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className='inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50'
            >
              <span>🔄</span>
              {isLoading ? 'Updating...' : 'Refresh Data'}
            </button>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <span>🕐</span>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='flex flex-wrap justify-center gap-3 mb-12'
        >
          {[
            { id: 'overview', label: 'Market Overview', icon: BarChart3 },
            { id: 'industries', label: 'Industry Analysis', icon: Building },
            {
              id: 'indicators',
              label: 'Economic Indicators',
              icon: TrendingUp,
            },
            { id: 'news', label: 'Market News', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode='wait'>
          {activeTab === 'overview' && (
            <motion.div
              key='overview'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              {/* Market Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                {[
                  {
                    title: 'NIFTY 50',
                    value: '21,845.70',
                    change: '+156.30',
                    changePercent: '+0.72%',
                    trend: 'up',
                  },
                  {
                    title: 'SENSEX',
                    value: '72,240.26',
                    change: '+485.75',
                    changePercent: '+0.68%',
                    trend: 'up',
                  },
                  {
                    title: 'Bank NIFTY',
                    value: '46,820.15',
                    change: '-124.85',
                    changePercent: '-0.27%',
                    trend: 'down',
                  },
                  {
                    title: 'NIFTY IT',
                    value: '35,680.90',
                    change: '+287.45',
                    changePercent: '+0.81%',
                    trend: 'up',
                  },
                ].map((index, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'
                  >
                    <h3 className='text-sm font-medium text-gray-600 mb-2'>{index.title}</h3>
                    <div className='text-2xl font-bold text-gray-900 mb-1'>{index.value}</div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(
                        index.trend
                      )}`}
                    >
                      {getTrendIcon(index.trend)}
                      {index.change} ({index.changePercent})
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Top Stocks Table */}
              <div className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>Top B2B Relevant Stocks</h3>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Company</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>Price</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>Change</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>Volume</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>
                          Market Cap
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockData.slice(0, 8).map((stock, index) => (
                        <tr
                          key={stock.symbol}
                          className='border-b border-gray-100 hover:bg-gray-50'
                        >
                          <td className='py-4 px-4'>
                            <div>
                              <div className='font-semibold text-gray-900'>{stock.name}</div>
                              <div className='text-sm text-gray-600'>
                                {stock.symbol} • {stock.industry}
                              </div>
                            </div>
                          </td>
                          <td className='text-right py-4 px-4 font-semibold'>
                            ₹{stock.price.toFixed(2)}
                          </td>
                          <td
                            className={`text-right py-4 px-4 font-semibold ${getTrendColor(
                              stock.trend
                            )}`}
                          >
                            <div className='flex items-center justify-end gap-1'>
                              {getTrendIcon(stock.trend)}₹{Math.abs(stock.change).toFixed(2)} (
                              {Math.abs(stock.changePercent).toFixed(2)}%)
                            </div>
                          </td>
                          <td className='text-right py-4 px-4 text-gray-600'>
                            {(stock.volume / 1000000).toFixed(1)}M
                          </td>
                          <td className='text-right py-4 px-4 text-gray-600'>{stock.marketCap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'industries' && (
            <motion.div
              key='industries'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 lg:grid-cols-2 gap-8'
            >
              {industryData.map((industry, index) => (
                <motion.div
                  key={industry.industry}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer'
                  onClick={() => setSelectedIndustry(industry)}
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center'>
                        <industry.icon className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h3 className='text-xl font-bold text-gray-900'>{industry.industry}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(
                            industry.marketSentiment
                          )}`}
                        >
                          {industry.marketSentiment.charAt(0).toUpperCase() +
                            industry.marketSentiment.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className={`text-right ${getTrendColor(industry.trend)}`}>
                      <div className='flex items-center gap-1 text-2xl font-bold'>
                        {getTrendIcon(industry.trend)}
                        {industry.performance > 0 ? '+' : ''}
                        {industry.performance.toFixed(1)}%
                      </div>
                      <div className='text-sm'>Today</div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-semibold text-gray-900 mb-2'>Key Insights</h4>
                      <ul className='space-y-1'>
                        {industry.keyInsights.slice(0, 2).map((insight, i) => (
                          <li key={i} className='text-sm text-gray-600 flex items-start gap-2'>
                            <span>✅</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className='font-semibold text-gray-900 mb-2'>B2B Opportunities</h4>
                      <ul className='space-y-1'>
                        {industry.opportunities.slice(0, 2).map((opportunity, i) => (
                          <li key={i} className='text-sm text-gray-600 flex items-start gap-2'>
                            <span>↑</span>
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button className='w-full mt-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all'>
                    View Detailed Analysis
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'indicators' && (
            <motion.div
              key='indicators'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              <div className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>Economic Indicators</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {economicIndicators.map((indicator, index) => (
                    <motion.div
                      key={indicator.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className='bg-gray-50 rounded-2xl p-6'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='font-semibold text-gray-900'>{indicator.name}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                            indicator.impact
                          )}`}
                        >
                          {indicator.impact}
                        </span>
                      </div>

                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-3xl font-bold text-gray-900'>{indicator.value}</span>
                        <div
                          className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor(
                            indicator.trend
                          )}`}
                        >
                          {getTrendIcon(indicator.trend)}
                          {indicator.change > 0 ? '+' : ''}
                          {indicator.change}
                        </div>
                      </div>

                      <p className='text-sm text-gray-600'>{indicator.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Impact Analysis */}
              <div className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>B2B Impact Analysis</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div>
                    <h4 className='text-lg font-semibold text-emerald-600 mb-4'>
                      Positive Indicators
                    </h4>
                    <div className='space-y-3'>
                      {economicIndicators
                        .filter(i => i.impact === 'positive')
                        .map((indicator, i) => (
                          <div
                            key={i}
                            className='flex items-center gap-3 p-3 bg-emerald-50 rounded-xl'
                          >
                            <span>✅</span>
                            <div>
                              <div className='font-medium text-gray-900'>{indicator.name}</div>
                              <div className='text-sm text-gray-600'>{indicator.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='text-lg font-semibold text-amber-600 mb-4'>Watch Areas</h4>
                    <div className='space-y-3'>
                      {economicIndicators
                        .filter(i => i.impact === 'neutral')
                        .map((indicator, i) => (
                          <div
                            key={i}
                            className='flex items-center gap-3 p-3 bg-amber-50 rounded-xl'
                          >
                            <AlertTriangle className='w-5 h-5 text-amber-500' />
                            <div>
                              <div className='font-medium text-gray-900'>{indicator.name}</div>
                              <div className='text-sm text-gray-600'>{indicator.description}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div
              key='news'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-6'
            >
              {marketNews.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            news.impact === 'high'
                              ? 'bg-red-100 text-red-700'
                              : news.impact === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {news.impact.toUpperCase()} IMPACT
                        </span>
                        <span className='text-sm text-gray-500'>
                          {new Date(news.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <h3 className='text-xl font-bold text-gray-900 mb-3'>{news.headline}</h3>
                      <p className='text-gray-600 mb-4'>{news.summary}</p>
                      <div className='flex flex-wrap gap-2'>
                        {news.relatedIndustries.map((industry, i) => (
                          <span
                            key={i}
                            className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Industry Detail Modal */}
      <AnimatePresence>
        {selectedIndustry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setSelectedIndustry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center'>
                    <selectedIndustry.icon className='w-8 h-8 text-white' />
                  </div>
                  <div>
                    <h2 className='text-3xl font-bold text-gray-900'>
                      {selectedIndustry.industry} Analysis
                    </h2>
                    <div className='flex items-center gap-3'>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(
                          selectedIndustry.marketSentiment
                        )}`}
                      >
                        {selectedIndustry.marketSentiment.charAt(0).toUpperCase() +
                          selectedIndustry.marketSentiment.slice(1)}
                      </span>
                      <span
                        className={`text-lg font-bold ${getTrendColor(selectedIndustry.trend)}`}
                      >
                        {selectedIndustry.performance > 0 ? '+' : ''}
                        {selectedIndustry.performance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  ✕
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Market Insights</h3>
                  <div className='space-y-3'>
                    {selectedIndustry.keyInsights.map((insight, i) => (
                      <div key={i} className='flex items-start gap-3 p-3 bg-gray-50 rounded-xl'>
                        <span>✅</span>
                        <span className='text-gray-700'>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>B2B Opportunities</h3>
                  <div className='space-y-3'>
                    {selectedIndustry.opportunities.map((opportunity, i) => (
                      <div key={i} className='flex items-start gap-3 p-3 bg-blue-50 rounded-xl'>
                        <span>↑</span>
                        <span className='text-gray-700'>{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedIndustry.topStocks.length > 0 && (
                <div className='mt-8'>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>
                    Top Stocks in {selectedIndustry.industry}
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {selectedIndustry.topStocks.map((stock, i) => (
                      <div key={i} className='bg-gray-50 rounded-2xl p-4'>
                        <div className='font-semibold text-gray-900'>{stock.name}</div>
                        <div className='text-sm text-gray-600 mb-2'>{stock.symbol}</div>
                        <div className='flex items-center justify-between'>
                          <span className='text-lg font-bold'>₹{stock.price.toFixed(2)}</span>
                          <span className={`text-sm font-semibold ${getTrendColor(stock.trend)}`}>
                            {stock.change > 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
