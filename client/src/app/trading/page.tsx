'use client';

import { Activity, BarChart3, DollarSign, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CommodityData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  market: 'MCX' | 'NCDEX' | 'Global';
  unit: string;
}

interface PortfolioItem {
  id: string;
  commodity: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

interface OrderBookItem {
  id: string;
  type: 'BUY' | 'SELL';
  commodity: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  timestamp: string;
}

export default function TradingPlatformPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);
  const [commodityData, setCommodityData] = useState<CommodityData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookItem[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityData | null>(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Mock data initialization
  useEffect(() => {
    setHasMounted(true);
    const mockCommodities: CommodityData[] = [
      {
        id: '1',
        name: 'Gold',
        symbol: 'GOLD',
        price: 62450,
        change: 850,
        changePercent: 1.38,
        volume: '2,847 kg',
        market: 'MCX',
        unit: '?/10g',
      },
      {
        id: '2',
        name: 'Silver',
        symbol: 'SILVER',
        price: 72300,
        change: -420,
        changePercent: -0.58,
        volume: '15,234 kg',
        market: 'MCX',
        unit: '?/kg',
      },
      {
        id: '3',
        name: 'Crude Oil',
        symbol: 'CRUDE',
        price: 6890,
        change: 125,
        changePercent: 1.85,
        volume: '4,567 BBL',
        market: 'MCX',
        unit: '?/BBL',
      },
      {
        id: '4',
        name: 'Copper',
        symbol: 'COPPER',
        price: 745,
        change: -12,
        changePercent: -1.58,
        volume: '8,945 kg',
        market: 'MCX',
        unit: '?/kg',
      },
      {
        id: '5',
        name: 'Wheat',
        symbol: 'WHEAT',
        price: 2450,
        change: 35,
        changePercent: 1.45,
        volume: '12,456 Q',
        market: 'NCDEX',
        unit: '?/Q',
      },
    ];

    const mockPortfolio: PortfolioItem[] = [
      {
        id: '1',
        commodity: 'Gold',
        quantity: 5,
        buyPrice: 61200,
        currentPrice: 62450,
        totalValue: 312250,
        pnl: 6250,
        pnlPercent: 2.04,
      },
      {
        id: '2',
        commodity: 'Silver',
        quantity: 10,
        buyPrice: 73000,
        currentPrice: 72300,
        totalValue: 723000,
        pnl: -7000,
        pnlPercent: -0.96,
      },
      {
        id: '3',
        commodity: 'Crude Oil',
        quantity: 20,
        buyPrice: 6750,
        currentPrice: 6890,
        totalValue: 137800,
        pnl: 2800,
        pnlPercent: 2.07,
      },
    ];

    const mockOrders: OrderBookItem[] = [
      {
        id: '1',
        type: 'BUY',
        commodity: 'Gold',
        quantity: 2,
        price: 62000,
        status: 'PENDING',
        timestamp: '2025-01-27 10:30:00',
      },
      {
        id: '2',
        type: 'SELL',
        commodity: 'Silver',
        quantity: 5,
        price: 72500,
        status: 'EXECUTED',
        timestamp: '2025-01-27 09:45:00',
      },
    ];

    setCommodityData(mockCommodities);
    setPortfolioData(mockPortfolio);
    setOrderBook(mockOrders);
  }, []);

  // Live price updates simulation
  useEffect(() => {
    if (!hasMounted) return;

    const interval = setInterval(() => {
      setCommodityData(prev =>
        prev.map(commodity => ({
          ...commodity,
          price: commodity.price + (Math.random() - 0.5) * 50,
          change: commodity.change + (Math.random() - 0.5) * 10,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMounted]);

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + item.totalValue, 0);
  const totalPnL = portfolioData.reduce((sum, item) => sum + item.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalPortfolioValue - totalPnL)) * 100;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: DollarSign },
    { id: 'orders', label: 'Order Book', icon: Activity },
    { id: 'market', label: 'Market Data', icon: TrendingUp },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Fixed Left Sidebar (240px) would be here */}
      <div className='lg:ml-60'>
        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Trading Platform</h1>
              <p className='text-gray-600'>Real-time commodity trading with portfolio management</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  isLiveUpdating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                <span>??</span>
                {isLiveUpdating ? 'Live' : 'Paused'}
              </button>
              <div className='text-right'>
                <div className='text-sm text-gray-500'>Portfolio Value</div>
                <div className='text-xl font-bold text-gray-900'>
                  ?{(totalPortfolioValue / 100000).toFixed(1)}L
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white border-b border-gray-200 px-6'>
          <div className='flex space-x-8'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center py-4 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className='h-4 w-4 mr-2' />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className='p-6'>
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className='space-y-6'>
              {/* Portfolio Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-white p-6 rounded-lg border border-gray-200'>
                  <div className='flex items-center'>
                    <span>$</span>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Total Value</p>
                      <p className='text-2xl font-bold text-gray-900'>
                        ?{(totalPortfolioValue / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-200'>
                  <div className='flex items-center'>
                    <span>??</span>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Total P&L</p>
                      <p
                        className={`text-2xl font-bold ${
                          totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {totalPnL >= 0 ? '+' : ''}?{(totalPnL / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-200'>
                  <div className='flex items-center'>
                    <span>??</span>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>P&L %</p>
                      <p
                        className={`text-2xl font-bold ${
                          totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {totalPnLPercent >= 0 ? '+' : ''}
                        {totalPnLPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-200'>
                  <div className='flex items-center'>
                    <span>??</span>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Active Positions</p>
                      <p className='text-2xl font-bold text-gray-900'>{portfolioData.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Movers */}
              <div className='bg-white rounded-lg border border-gray-200'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900'>Market Movers</h3>
                </div>
                <div className='p-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='text-sm font-medium text-green-600 mb-3 flex items-center'>
                        <span>?</span>
                        Top Gainers
                      </h4>
                      {commodityData
                        .filter(c => c.changePercent > 0)
                        .sort((a, b) => b.changePercent - a.changePercent)
                        .slice(0, 3)
                        .map(commodity => (
                          <div
                            key={commodity.id}
                            className='flex items-center justify-between py-2'
                          >
                            <div>
                              <div className='font-medium text-gray-900'>{commodity.name}</div>
                              <div className='text-sm text-gray-500'>{commodity.market}</div>
                            </div>
                            <div className='text-right'>
                              <div className='font-medium text-gray-900'>
                                ?{commodity.price.toLocaleString()}
                              </div>
                              <div className='text-sm text-green-600'>
                                +{commodity.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div>
                      <h4 className='text-sm font-medium text-red-600 mb-3 flex items-center'>
                        <span>?</span>
                        Top Losers
                      </h4>
                      {commodityData
                        .filter(c => c.changePercent < 0)
                        .sort((a, b) => a.changePercent - b.changePercent)
                        .slice(0, 3)
                        .map(commodity => (
                          <div
                            key={commodity.id}
                            className='flex items-center justify-between py-2'
                          >
                            <div>
                              <div className='font-medium text-gray-900'>{commodity.name}</div>
                              <div className='text-sm text-gray-500'>{commodity.market}</div>
                            </div>
                            <div className='text-right'>
                              <div className='font-medium text-gray-900'>
                                ?{commodity.price.toLocaleString()}
                              </div>
                              <div className='text-sm text-red-600'>
                                {commodity.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {selectedTab === 'portfolio' && (
            <div className='bg-white rounded-lg border border-gray-200'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>Portfolio Holdings</h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Commodity
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Quantity
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Buy Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Current Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Total Value
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {portfolioData.map(item => (
                      <tr key={item.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='font-medium text-gray-900'>{item.commodity}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {item.quantity}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ?{item.buyPrice.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ?{item.currentPrice.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ?{item.totalValue.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div
                            className={`text-sm font-medium ${
                              item.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {item.pnl >= 0 ? '+' : ''}?{item.pnl.toLocaleString()}
                          </div>
                          <div
                            className={`text-xs ${
                              item.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({item.pnlPercent >= 0 ? '+' : ''}
                            {item.pnlPercent.toFixed(2)}%)
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Market Data Tab */}
          {selectedTab === 'market' && (
            <div className='bg-white rounded-lg border border-gray-200'>
              <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>Live Market Data</h3>
                <button
                  onClick={() => window.location.reload()}
                  className='flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900'
                >
                  <span>??</span>
                  Refresh
                </button>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Commodity
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Change
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Volume
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Market
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {commodityData.map(commodity => (
                      <tr key={commodity.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div>
                              <div className='font-medium text-gray-900'>{commodity.name}</div>
                              <div className='text-sm text-gray-500'>{commodity.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            ?{commodity.price.toLocaleString()}
                          </div>
                          <div className='text-xs text-gray-500'>{commodity.unit}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div
                            className={`flex items-center text-sm font-medium ${
                              commodity.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {commodity.changePercent >= 0 ? <span>??</span> : <span>??</span>}
                            {commodity.changePercent >= 0 ? '+' : ''}
                            {commodity.changePercent.toFixed(2)}%
                          </div>
                          <div
                            className={`text-xs ${
                              commodity.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({commodity.change >= 0 ? '+' : ''}?{commodity.change})
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {commodity.volume}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {commodity.market}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex space-x-2'>
                            <button className='flex items-center px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200'>
                              <span>?</span>
                              Buy
                            </button>
                            <button className='flex items-center px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200'>
                              <span>?</span>
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
