'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Factory, Package, Building } from 'lucide-react';

interface TradeData {
  country: string;
  flag: string;
  exportValue: number;
  importValue: number;
  tradeBalance: number;
  topCommodities: string[];
  trend: 'up' | 'down' | 'neutral';
  opportunities: string[];
}

interface CommodityData {
  name: string;
  icon: any;
  globalValue: string;
  indiaShare: number;
  trend: 'up' | 'down' | 'neutral';
  topSuppliers: string[];
  topBuyers: string[];
  priceChange: number;
}

export default function GlobalTradeInsights() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState<TradeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const tradeData: TradeData[] = [
    {
      country: 'United States',
      flag: '🇺🇸',
      exportValue: 76500,
      importValue: 45200,
      tradeBalance: 31300,
      topCommodities: ['Software Services', 'Pharmaceuticals', 'Textiles', 'Chemicals'],
      trend: 'up',
      opportunities: ['IT Services', 'Generic Drugs', 'Organic Chemicals', 'Textile Products'],
    },
    {
      country: 'China',
      flag: '🇨🇳',
      exportValue: 125600,
      importValue: 87400,
      tradeBalance: 38200,
      topCommodities: ['Electronics', 'Machinery', 'Chemicals', 'Iron & Steel'],
      trend: 'up',
      opportunities: [
        'Electronic Components',
        'Industrial Machinery',
        'Raw Materials',
        'Consumer Goods',
      ],
    },
    {
      country: 'UAE',
      flag: '🇦🇪',
      exportValue: 35800,
      importValue: 52100,
      tradeBalance: -16300,
      topCommodities: ['Petroleum Products', 'Gems & Jewelry', 'Chemicals', 'Food Products'],
      trend: 'up',
      opportunities: ['Refined Petroleum', 'Gold & Jewelry', 'Petrochemicals', 'Processed Foods'],
    },
    {
      country: 'Germany',
      flag: '🇩🇪',
      exportValue: 8900,
      importValue: 14200,
      tradeBalance: -5300,
      topCommodities: ['Machinery', 'Chemicals', 'Automotive', 'Pharmaceuticals'],
      trend: 'neutral',
      opportunities: [
        'Engineering Goods',
        'Chemical Products',
        'Auto Components',
        'Medical Devices',
      ],
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      exportValue: 16800,
      importValue: 7200,
      tradeBalance: 9600,
      topCommodities: ['Software', 'Pharmaceuticals', 'Textiles', 'Tea'],
      trend: 'up',
      opportunities: ['IT Services', 'Generic Medicines', 'Fashion Apparel', 'Food Products'],
    },
  ];

  const commodityData: CommodityData[] = [
    {
      name: 'Petroleum & Gas',
      icon: Factory,
      globalValue: '$2.1T',
      indiaShare: 12.8,
      trend: 'up',
      topSuppliers: ['Saudi Arabia', 'Iraq', 'UAE', 'Kuwait'],
      topBuyers: ['China', 'USA', 'Japan', 'South Korea'],
      priceChange: 2.3,
    },
    {
      name: 'Electronics',
      icon: Package,
      globalValue: '$1.8T',
      indiaShare: 3.2,
      trend: 'up',
      topSuppliers: ['China', 'South Korea', 'Taiwan', 'Singapore'],
      topBuyers: ['USA', 'Germany', 'Hong Kong', 'Netherlands'],
      priceChange: -1.2,
    },
    {
      name: 'Machinery',
      icon: Building,
      globalValue: '$1.5T',
      indiaShare: 4.5,
      trend: 'neutral',
      topSuppliers: ['Germany', 'China', 'USA', 'Japan'],
      topBuyers: ['USA', 'China', 'Germany', 'France'],
      priceChange: 0.8,
    },
    {
      name: 'Chemicals',
      icon: Factory,
      globalValue: '$1.2T',
      indiaShare: 8.1,
      trend: 'up',
      topSuppliers: ['China', 'Germany', 'USA', 'India'],
      topBuyers: ['China', 'USA', 'Germany', 'Netherlands'],
      priceChange: 1.5,
    },
  ];

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

  const refreshData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  return (
    <section className='bg-gradient-to-br from-blue-50 to-purple-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4'>
            <span>🌍</span>
            <span className='text-sm font-semibold text-blue-700'>GLOBAL TRADE INTELLIGENCE</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Global Trade Insights
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Real-time international trade data, market opportunities, and global supply chain
            intelligence for strategic B2B decisions.
          </p>

          <div className='flex items-center justify-center gap-4'>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50'
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
            { id: 'overview', label: 'Trade Overview', icon: BarChart3 },
            { id: 'countries', label: 'Country Analysis', icon: Globe },
            { id: 'commodities', label: 'Commodity Trends', icon: Package },
            { id: 'opportunities', label: 'Market Opportunities', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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
              {/* Global Trade Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                {[
                  { title: 'Total Exports', value: '$422.0B', change: '+8.2%', trend: 'up' },
                  { title: 'Total Imports', value: '$507.6B', change: '+12.1%', trend: 'up' },
                  { title: 'Trade Deficit', value: '$85.6B', change: '+24.3%', trend: 'down' },
                  { title: 'Trade Partners', value: '195', change: '+3', trend: 'up' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'
                  >
                    <h3 className='text-sm font-medium text-gray-600 mb-2'>{stat.title}</h3>
                    <div className='text-2xl font-bold text-gray-900 mb-1'>{stat.value}</div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(
                        stat.trend
                      )}`}
                    >
                      {getTrendIcon(stat.trend)}
                      {stat.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Top Trading Partners */}
              <div className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>Top Trading Partners</h3>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-700'>Country</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>
                          Exports ($ Million)
                        </th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>
                          Imports ($ Million)
                        </th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-700'>
                          Trade Balance
                        </th>
                        <th className='text-center py-3 px-4 font-semibold text-gray-700'>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeData.map((country, index) => (
                        <tr
                          key={country.country}
                          className='border-b border-gray-100 hover:bg-gray-50 cursor-pointer'
                          onClick={() => setSelectedCountry(country)}
                        >
                          <td className='py-4 px-4'>
                            <div className='flex items-center gap-3'>
                              <span className='text-2xl'>{country.flag}</span>
                              <span className='font-semibold text-gray-900'>{country.country}</span>
                            </div>
                          </td>
                          <td className='text-right py-4 px-4 font-semibold'>
                            {country.exportValue.toLocaleString()}
                          </td>
                          <td className='text-right py-4 px-4 font-semibold'>
                            {country.importValue.toLocaleString()}
                          </td>
                          <td
                            className={`text-right py-4 px-4 font-semibold ${
                              country.tradeBalance > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {country.tradeBalance > 0 ? '+' : ''}
                            {country.tradeBalance.toLocaleString()}
                          </td>
                          <td className='text-center py-4 px-4'>
                            <div
                              className={`inline-flex items-center gap-1 ${getTrendColor(
                                country.trend
                              )}`}
                            >
                              {getTrendIcon(country.trend)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'commodities' && (
            <motion.div
              key='commodities'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 lg:grid-cols-2 gap-8'
            >
              {commodityData.map((commodity, index) => (
                <motion.div
                  key={commodity.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
                >
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center'>
                        <commodity.icon className='w-6 h-6 text-white' />
                      </div>
                      <div>
                        <h3 className='text-xl font-bold text-gray-900'>{commodity.name}</h3>
                        <p className='text-gray-600'>Global Market: {commodity.globalValue}</p>
                      </div>
                    </div>
                    <div className={`text-right ${getTrendColor(commodity.trend)}`}>
                      <div className='flex items-center gap-1 text-lg font-bold'>
                        {getTrendIcon(commodity.trend)}
                        {commodity.priceChange > 0 ? '+' : ''}
                        {commodity.priceChange}%
                      </div>
                      <div className='text-sm'>Price Change</div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className='text-center p-4 bg-blue-50 rounded-xl'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {commodity.indiaShare}%
                      </div>
                      <div className='text-sm text-gray-600'>India's Share</div>
                    </div>
                    <div className='text-center p-4 bg-purple-50 rounded-xl'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {commodity.globalValue}
                      </div>
                      <div className='text-sm text-gray-600'>Global Value</div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-semibold text-gray-900 mb-2'>Top Suppliers</h4>
                      <div className='flex flex-wrap gap-2'>
                        {commodity.topSuppliers.map((supplier, i) => (
                          <span
                            key={i}
                            className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm'
                          >
                            {supplier}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 mb-2'>Top Buyers</h4>
                      <div className='flex flex-wrap gap-2'>
                        {commodity.topBuyers.map((buyer, i) => (
                          <span
                            key={i}
                            className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm'
                          >
                            {buyer}
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

      {/* Country Detail Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setSelectedCountry(null)}
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
                  <span className='text-4xl'>{selectedCountry.flag}</span>
                  <div>
                    <h2 className='text-3xl font-bold text-gray-900'>{selectedCountry.country}</h2>
                    <p className='text-gray-600'>Trade Analysis & Opportunities</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  ✕
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <div className='text-center p-6 bg-emerald-50 rounded-2xl'>
                  <div className='text-3xl font-bold text-emerald-600'>
                    ${selectedCountry.exportValue.toLocaleString()}M
                  </div>
                  <div className='text-gray-600'>Exports to India</div>
                </div>
                <div className='text-center p-6 bg-blue-50 rounded-2xl'>
                  <div className='text-3xl font-bold text-blue-600'>
                    ${selectedCountry.importValue.toLocaleString()}M
                  </div>
                  <div className='text-gray-600'>Imports from India</div>
                </div>
                <div
                  className={`text-center p-6 rounded-2xl ${
                    selectedCountry.tradeBalance > 0 ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      selectedCountry.tradeBalance > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    ${Math.abs(selectedCountry.tradeBalance).toLocaleString()}M
                  </div>
                  <div className='text-gray-600'>
                    Trade {selectedCountry.tradeBalance > 0 ? 'Surplus' : 'Deficit'}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Top Commodities</h3>
                  <div className='space-y-3'>
                    {selectedCountry.topCommodities.map((commodity, i) => (
                      <div key={i} className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                        <span>✅</span>
                        <span className='text-gray-700'>{commodity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-4'>Market Opportunities</h3>
                  <div className='space-y-3'>
                    {selectedCountry.opportunities.map((opportunity, i) => (
                      <div key={i} className='flex items-center gap-3 p-3 bg-blue-50 rounded-xl'>
                        <span>↑</span>
                        <span className='text-gray-700'>{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
