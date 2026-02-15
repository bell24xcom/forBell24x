'use client';
import { Briefcase, Target } from 'lucide-react';
import React, { useState } from 'react';

interface PortfolioHolding {
  id: string;
  commodity: string;
  symbol: string;
  category: string;
  quantity: number;
  unit: string;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  purchaseDate: string;
  exchange: string;
}

const PortfolioManager: React.FC = () => {
  const [holdings] = useState<PortfolioHolding[]>([
    {
      id: '1',
      commodity: 'TMT Steel Bars',
      symbol: 'STEEL-TMT',
      category: 'Construction Materials',
      quantity: 150,
      unit: 'MT',
      averagePrice: 63500,
      currentPrice: 65400,
      marketValue: 9810000,
      investedAmount: 9525000,
      gainLoss: 285000,
      gainLossPercent: 2.99,
      dayChange: 90000,
      dayChangePercent: 0.93,
      purchaseDate: '2024-11-15',
      exchange: 'NCDEX',
    },
    {
      id: '2',
      commodity: 'Copper Wire',
      symbol: 'CU-WIRE',
      category: 'Electronics & Electrical',
      quantity: 25,
      unit: 'MT',
      averagePrice: 790000,
      currentPrice: 785000,
      marketValue: 19625000,
      investedAmount: 19750000,
      gainLoss: -125000,
      gainLossPercent: -0.63,
      dayChange: 75000,
      dayChangePercent: 0.38,
      purchaseDate: '2024-11-20',
      exchange: 'MCX',
    },
  ]);

  const portfolioSummary = {
    totalValue: holdings.reduce((sum, holding) => sum + holding.marketValue, 0),
    totalInvested: holdings.reduce((sum, holding) => sum + holding.investedAmount, 0),
    totalGainLoss: holdings.reduce((sum, holding) => sum + holding.gainLoss, 0),
    dayChange: holdings.reduce((sum, holding) => sum + holding.dayChange, 0),
    holdingsCount: holdings.length,
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Portfolio Management</h1>
          <p className='text-slate-600'>Monitor and manage your commodity trading positions</p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <span>$</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-slate-600'>Total Portfolio Value</p>
                <p className='text-2xl font-bold text-slate-900'>
                  ?{(portfolioSummary.totalValue / 10000000).toFixed(1)}Cr
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <span>??</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-slate-600'>Total Gain/Loss</p>
                <p className='text-2xl font-bold text-green-600'>
                  +?{(portfolioSummary.totalGainLoss / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <span>??</span>
              </div>
              <div className='text-right'>
                <p className='text-sm text-slate-600'>Active Holdings</p>
                <p className='text-2xl font-bold text-slate-900'>
                  {portfolioSummary.holdingsCount}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-2 bg-indigo-100 rounded-lg'>
                <Briefcase className='text-indigo-600' size={24} />
              </div>
              <div className='text-right'>
                <p className='text-sm text-slate-600'>Invested Amount</p>
                <p className='text-2xl font-bold text-slate-900'>
                  ?{(portfolioSummary.totalInvested / 10000000).toFixed(1)}Cr
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
          <div className='p-6 border-b'>
            <h3 className='text-xl font-semibold text-slate-900'>Holdings Detail</h3>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-slate-50 border-b'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Commodity
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Quantity
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Market Value
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Total Return
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-slate-200'>
                {holdings.map(holding => (
                  <tr key={holding.id} className='hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-sm font-medium text-slate-900'>
                          {holding.commodity}
                        </div>
                        <div className='text-xs text-slate-500'>
                          {holding.symbol} {holding.exchange}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-slate-900'>
                      {holding.quantity.toLocaleString()} {holding.unit}
                    </td>
                    <td className='px-6 py-4 text-sm font-semibold text-slate-900'>
                      ?{(holding.marketValue / 100000).toFixed(1)}L
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-green-600'>
                        <div>+?{(holding.gainLoss / 1000).toFixed(0)}K</div>
                        <div className='text-xs'>(+{holding.gainLossPercent.toFixed(2)}%)</div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex space-x-2'>
                        <button className='px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors font-medium'>
                          Trade
                        </button>
                        <button className='px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors font-medium'>
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

        {/* Demo Notice */}
        <div className='mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-start'>
            <Target className='text-blue-600 mr-3 mt-1 flex-shrink-0' size={20} />
            <div>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                Portfolio Management Platform - Demo Environment
              </h3>
              <p className='text-blue-800 leading-relaxed'>
                This portfolio management system demonstrates Bell24H's comprehensive trading
                platform capabilities with real-time position tracking, P&L calculations, and risk
                management tools for enterprise trading operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioManager;
