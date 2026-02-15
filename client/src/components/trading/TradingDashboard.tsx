'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface CommodityData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  category: string;
  marketCap?: number;
  confidence?: number;
}

interface TradeOrder {
  id: string;
  commodity: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
  profit?: number;
}

interface PortfolioMetrics {
  totalValue: number;
  todayChange: number;
  todayChangePercent: number;
  totalOrders: number;
  successRate: number;
  riskScore: number;
}

const EnterpriseTradingDashboard: React.FC = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const [commodities, setCommodities] = useState<CommodityData[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityData | null>(null);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [portfolio, setPortfolio] = useState<PortfolioMetrics>({
    totalValue: 2450000,
    todayChange: 15750,
    todayChangePercent: 0.65,
    totalOrders: 847,
    successRate: 94.2,
    riskScore: 7.3,
  });

  // Generate sophisticated commodity data
  useEffect(() => {
    setHasMounted(true);
    const generateCommodityData = (): CommodityData[] => {
      const commodityList = [
        { name: 'Crude Oil (Brent)', symbol: 'BRENT', category: 'Energy' },
        { name: 'Gold', symbol: 'GOLD', category: 'Precious Metals' },
        { name: 'Silver', symbol: 'SILVER', category: 'Precious Metals' },
        { name: 'Copper', symbol: 'COPPER', category: 'Industrial Metals' },
        { name: 'Wheat', symbol: 'WHEAT', category: 'Agriculture' },
        { name: 'Corn', symbol: 'CORN', category: 'Agriculture' },
        { name: 'Natural Gas', symbol: 'NATGAS', category: 'Energy' },
        { name: 'Aluminum', symbol: 'ALU', category: 'Industrial Metals' },
        { name: 'Cotton', symbol: 'COTTON', category: 'Agriculture' },
        { name: 'Sugar', symbol: 'SUGAR', category: 'Agriculture' },
        { name: 'Iron Ore', symbol: 'IRON', category: 'Industrial Metals' },
        { name: 'Platinum', symbol: 'PLAT', category: 'Precious Metals' },
      ];

      return commodityList.map(commodity => {
        const basePrice = Math.random() * 2000 + 100;
        const change = (Math.random() - 0.5) * 40;
        const changePercent = (change / basePrice) * 100;

        return {
          ...commodity,
          price: basePrice,
          change: change,
          changePercent: changePercent,
          volume: Math.floor(Math.random() * 2000000) + 500000,
          high: basePrice + Math.random() * 20,
          low: basePrice - Math.random() * 20,
          marketCap: Math.floor(Math.random() * 50000000) + 10000000,
          confidence: Math.floor(Math.random() * 20) + 80,
        };
      });
    };

    setTimeout(() => {
      setCommodities(generateCommodityData());
      setLoading(false);
    }, 1000);

    // Real-time market simulation
    const interval = setInterval(() => {
      setCommodities(prev =>
        prev.map(commodity => ({
          ...commodity,
          price: Math.max(commodity.price + (Math.random() - 0.5) * 3, 10),
          change: commodity.change + (Math.random() - 0.5) * 1,
          volume: commodity.volume + Math.floor((Math.random() - 0.5) * 100000),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTrade = (type: 'buy' | 'sell', commodity: CommodityData, quantity: number) => {
    const newOrder: TradeOrder = {
      id: Math.random().toString(36).substr(2, 9),
      commodity: commodity.name,
      type,
      quantity,
      price: commodity.price,
      status: 'pending',
      timestamp: new Date(),
      profit: (Math.random() - 0.3) * 1000,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Simulate order execution with enterprise feedback
    setTimeout(() => {
      setOrders(prev =>
        prev.map(order => (order.id === newOrder.id ? { ...order, status: 'filled' } : order))
      );
    }, 1500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const getMarketStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 9 && hour < 17) return { status: 'Open', color: 'text-green-600' };
    if (hour >= 17 && hour < 21) return { status: 'After Hours', color: 'text-yellow-600' };
    return { status: 'Closed', color: 'text-red-600' };
  };

  const marketStatus = getMarketStatus();

  if (!hasMounted) {
    // Fallback: render static demo data for SSR
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-12 shadow-lg border border-white/20 text-center'>
          <h3 className='text-xl font-bold text-gray-900 mb-2'>Enterprise Trading Platform</h3>
          <p className='text-gray-600'>Loading real-time data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Enterprise Header */}
      <div className='sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-20'>
            <div className='flex items-center space-x-6'>
              <Link
                href='/'
                className='group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all'
              >
                <div className='p-2 rounded-xl hover:bg-blue-50 transition-colors'>
                  <span>?</span>
                </div>
                <div className='p-2 rounded-xl hover:bg-blue-50 transition-colors'>
                  <span>??</span>
                </div>
                <span className='font-medium'>Back to Home</span>
              </Link>
              <div className='border-l border-gray-300 pl-6'>
                <div className='flex items-center space-x-4'>
                  <div className='h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <span>??</span>
                  </div>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                      Enterprise Commodity Trading
                    </h1>
                    <p className='text-gray-600 flex items-center space-x-4'>
                      <span>Real-time B2B trading platform</span>
                      <span className='text-gray-400'>•</span>
                      <span className={marketStatus.color}>Market {marketStatus.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-6'>
              <div className='hidden lg:flex items-center space-x-6 text-sm'>
                <div className='flex items-center space-x-2 text-green-600'>
                  <span>???</span>
                  <span>Secure Trading</span>
                </div>
                <div className='flex items-center space-x-2 text-blue-600'>
                  <span>?</span>
                  <span>Real-time Data</span>
                </div>
                <div className='flex items-center space-x-2 text-purple-600'>
                  <span>??</span>
                  <span>Global Markets</span>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Portfolio Value</p>
                <p className='text-xl font-bold text-gray-900'>
                  {formatCurrency(portfolio.totalValue)}
                </p>
                <p
                  className={`text-sm ${
                    portfolio.todayChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {portfolio.todayChange >= 0 ? '+' : ''}
                  {formatCurrency(portfolio.todayChange)} ({portfolio.todayChangePercent.toFixed(2)}
                  %)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Enterprise Metrics Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl'>
                <span>$</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>24h Volume</p>
                <p className='text-xl font-bold text-gray-900'>?128 Cr</p>
                <p className='text-green-600 text-sm flex items-center'>
                  <span>??</span>
                  +12.8%
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl'>
                <span>??</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Active Traders</p>
                <p className='text-xl font-bold text-gray-900'>{formatNumber(1284)}</p>
                <p className='text-blue-600 text-sm'>+167 today</p>
              </div>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl'>
                <Award className='w-6 h-6 text-white' />
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Success Rate</p>
                <p className='text-xl font-bold text-gray-900'>{portfolio.successRate}%</p>
                <p className='text-green-600 text-sm'>Industry Leading</p>
              </div>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl'>
                <span>???</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Risk Score</p>
                <p className='text-xl font-bold text-gray-900'>{portfolio.riskScore}/10</p>
                <p className='text-yellow-600 text-sm'>Moderate Risk</p>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Enhanced Commodity Prices */}
          <div className='lg:col-span-2'>
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden'>
              <div className='p-6 border-b border-gray-200/50'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-xl font-bold text-gray-900 flex items-center'>
                    <span>??</span>
                    Live Commodity Prices
                  </h3>
                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeFilter === 'all'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter('Energy')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeFilter === 'Energy'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Energy
                    </button>
                    <button
                      onClick={() => setActiveFilter('Precious Metals')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeFilter === 'Precious Metals'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Metals
                    </button>
                  </div>
                </div>
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <div className='flex items-center space-x-1'>
                    <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
                    <span>Live Updates</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <span>??</span>
                    <span>Updated every 2 seconds</span>
                  </div>
                </div>
              </div>

              <div className='overflow-hidden'>
                <div className='max-h-96 overflow-y-auto'>
                  {commodities
                    .filter(
                      commodity => activeFilter === 'all' || commodity.category === activeFilter
                    )
                    .map((commodity, index) => (
                      <div
                        key={commodity.symbol}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50/80 transition-all cursor-pointer ${
                          selectedCommodity?.symbol === commodity.symbol
                            ? 'bg-blue-50 border-blue-200'
                            : ''
                        }`}
                        onClick={() => setSelectedCommodity(commodity)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-4'>
                            <div className='flex-shrink-0'>
                              <div className='w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center'>
                                <span className='text-blue-700 font-bold text-sm'>
                                  {commodity.symbol.slice(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h4 className='font-semibold text-gray-900'>{commodity.name}</h4>
                              <div className='flex items-center space-x-3 text-xs text-gray-500'>
                                <span className='px-2 py-1 bg-gray-100 rounded-lg'>
                                  {commodity.category}
                                </span>
                                <span>Vol: {formatNumber(commodity.volume)}</span>
                                {commodity.confidence && (
                                  <span className='text-green-600'>
                                    AI: {commodity.confidence}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className='text-right'>
                            <p className='text-lg font-bold text-gray-900'>
                              {formatCurrency(commodity.price)}
                            </p>
                            <div
                              className={`flex items-center space-x-1 text-sm ${
                                commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {commodity.change >= 0 ? (
                                <span>??</span>
                              ) : (
                                <span>??</span>
                              )}
                              <span>
                                {commodity.change >= 0 ? '+' : ''}
                                {formatNumber(commodity.change, 2)}
                              </span>
                              <span>
                                ({commodity.changePercent >= 0 ? '+' : ''}
                                {formatNumber(commodity.changePercent, 2)}%)
                              </span>
                            </div>
                            <div className='text-xs text-gray-500 mt-1'>
                              H: {formatCurrency(commodity.high)} L: {formatCurrency(commodity.low)}
                            </div>
                          </div>

                          <div className='flex space-x-2 ml-4'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleTrade('buy', commodity, 100);
                              }}
                              className='px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm'
                            >
                              Buy
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleTrade('sell', commodity, 100);
                              }}
                              className='px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm'
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Trading Panel */}
          <div className='space-y-6'>
            {/* Selected Commodity Details */}
            {selectedCommodity && (
              <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                  <span>???</span>
                  Trading Details
                </h3>
                <div className='space-y-4'>
                  <div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl'>
                    <h4 className='font-bold text-blue-900'>{selectedCommodity.name}</h4>
                    <p className='text-blue-700 text-sm'>{selectedCommodity.category}</p>
                    <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-blue-600'>Current Price:</span>
                        <p className='font-bold text-blue-900'>
                          {formatCurrency(selectedCommodity.price)}
                        </p>
                      </div>
                      <div>
                        <span className='text-blue-600'>24h Change:</span>
                        <p
                          className={`font-bold ${
                            selectedCommodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {selectedCommodity.change >= 0 ? '+' : ''}
                          {formatNumber(selectedCommodity.changePercent, 2)}%
                        </p>
                      </div>
                      <div>
                        <span className='text-blue-600'>Volume:</span>
                        <p className='font-bold text-blue-900'>
                          {formatNumber(selectedCommodity.volume)}
                        </p>
                      </div>
                      <div>
                        <span className='text-blue-600'>Market Cap:</span>
                        <p className='font-bold text-blue-900'>
                          {formatCurrency(selectedCommodity.marketCap || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <button
                      onClick={() => handleTrade('buy', selectedCommodity, 1000)}
                      className='flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg'
                    >
                      <span>?</span>
                      <span>Buy 1000</span>
                    </button>
                    <button
                      onClick={() => handleTrade('sell', selectedCommodity, 1000)}
                      className='flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg'
                    >
                      <span>?</span>
                      <span>Sell 1000</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                <span>??</span>
                Recent Orders
              </h3>
              <div className='space-y-3 max-h-80 overflow-y-auto'>
                {orders.slice(0, 10).map(order => (
                  <div key={order.id} className='p-3 bg-gray-50 rounded-xl'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 text-xs rounded-lg font-medium ${
                            order.type === 'buy'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {order.type.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-lg ${
                            order.status === 'filled'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      {order.profit !== undefined && (
                        <span
                          className={`text-sm font-bold ${
                            order.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {order.profit >= 0 ? '+' : ''}
                          {formatCurrency(order.profit)}
                        </span>
                      )}
                    </div>
                    <div className='text-sm text-gray-600'>
                      <p className='font-medium text-gray-900'>{order.commodity}</p>
                      <p>
                        Qty: {formatNumber(order.quantity)} @ {formatCurrency(order.price)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {order.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className='text-center py-8'>
                    <span>??</span>
                    <p className='text-gray-500'>No orders yet</p>
                    <p className='text-sm text-gray-400'>Start trading to see your orders here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Market Insights */}
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
                <span>??</span>
                AI Market Insights
              </h3>
              <div className='space-y-4'>
                <div className='p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl'>
                  <div className='flex items-start space-x-3'>
                    <div className='h-2 w-2 bg-green-500 rounded-full mt-2'></div>
                    <div>
                      <h4 className='font-bold text-green-900'>Bullish Signal</h4>
                      <p className='text-sm text-green-700'>
                        Gold prices showing strong upward momentum with 87% confidence
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl'>
                  <div className='flex items-start space-x-3'>
                    <div className='h-2 w-2 bg-yellow-500 rounded-full mt-2'></div>
                    <div>
                      <h4 className='font-bold text-yellow-900'>Volatility Alert</h4>
                      <p className='text-sm text-yellow-700'>
                        Crude oil experiencing high volatility - trade with caution
                      </p>
                    </div>
                  </div>
                </div>
                <div className='p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl'>
                  <div className='flex items-start space-x-3'>
                    <div className='h-2 w-2 bg-blue-500 rounded-full mt-2'></div>
                    <div>
                      <h4 className='font-bold text-blue-900'>Market Opportunity</h4>
                      <p className='text-sm text-blue-700'>
                        Agricultural commodities undervalued - potential 15% gains
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Trading Statistics */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 text-center'>
            <span>??</span>
            <p className='text-2xl font-bold text-gray-900'>?8+ Cr</p>
            <p className='text-sm text-gray-600'>Annual Revenue Potential</p>
          </div>
          <div className='bg-white/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 text-center'>
            <span>???</span>
            <p className='text-2xl font-bold text-gray-900'>99.9%</p>
            <p className='text-sm text-gray-600'>Platform Uptime</p>
          </div>
          <div className='bg-white/80 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-white/20 text-center'>
            <span>??</span>
            <p className='text-2xl font-bold text-gray-900'>24/7</p>
            <p className='text-sm text-gray-600'>Global Market Access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTradingDashboard;
