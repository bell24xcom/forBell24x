'use client';

import React, { useState, useEffect } from 'react';

export default function InteractiveROI() {
  const [monthlySpend, setMonthlySpend] = useState(5000000);
  const [orderValue, setOrderValue] = useState(250000);
  const [monthlyOrders, setMonthlyOrders] = useState(20);
  const [processTime, setProcessTime] = useState(40);

  const [results, setResults] = useState({
    costSavings: 0,
    timeSavings: 0,
    efficiency: 0,
    totalROI: 0,
  });

  useEffect(() => {
    // Real-time calculations
    const costSavings = monthlySpend * 0.3; // 30% cost reduction
    const timeSavings = processTime * 0.6 * 2000; // 60% time saved * ₹2000/hour
    const efficiency = monthlyOrders * 0.3 * orderValue; // 30% more orders
    const totalROI = costSavings + timeSavings + efficiency - 150000; // Minus platform cost

    setResults({
      costSavings,
      timeSavings,
      efficiency,
      totalROI,
    });
  }, [monthlySpend, orderValue, monthlyOrders, processTime]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl border p-8'>
      <div className='text-center mb-8'>
        <div className='flex items-center justify-center mb-4'>
          <Calculator className='h-8 w-8 text-blue-600 mr-3' />
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Interactive ROI Calculator
          </h2>
        </div>
        <p className='text-gray-600 dark:text-gray-400'>See your savings update in real-time</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Inputs */}
        <div className='space-y-6'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Your Current Metrics</h3>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Monthly Procurement Spend
            </label>
            <input
              type='range'
              min='1000000'
              max='50000000'
              step='100000'
              value={monthlySpend}
              onChange={e => setMonthlySpend(Number(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-sm text-gray-500 mt-1'>
              <span>₹10L</span>
              <span className='font-bold text-blue-600'>{formatCurrency(monthlySpend)}</span>
              <span>₹50Cr</span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Average Order Value
            </label>
            <input
              type='range'
              min='50000'
              max='5000000'
              step='10000'
              value={orderValue}
              onChange={e => setOrderValue(Number(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-sm text-gray-500 mt-1'>
              <span>₹50K</span>
              <span className='font-bold text-blue-600'>{formatCurrency(orderValue)}</span>
              <span>₹50L</span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Monthly Orders
            </label>
            <input
              type='range'
              min='5'
              max='200'
              step='1'
              value={monthlyOrders}
              onChange={e => setMonthlyOrders(Number(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-sm text-gray-500 mt-1'>
              <span>5</span>
              <span className='font-bold text-blue-600'>{monthlyOrders} orders</span>
              <span>200</span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Process Time (hours/month)
            </label>
            <input
              type='range'
              min='10'
              max='200'
              step='2'
              value={processTime}
              onChange={e => setProcessTime(Number(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
            <div className='flex justify-between text-sm text-gray-500 mt-1'>
              <span>10h</span>
              <span className='font-bold text-blue-600'>{processTime} hours</span>
              <span>200h</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className='space-y-4'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Your Bell24H Savings</h3>

          <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-green-800 dark:text-green-300 font-medium'>
                Cost Savings (30%)
              </span>
              <span>$</span>
            </div>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(results.costSavings)}
            </div>
            <div className='text-sm text-green-700 dark:text-green-400'>per month</div>
          </div>

          <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-blue-800 dark:text-blue-300 font-medium'>
                Time Savings (60%)
              </span>
              <span>🕐</span>
            </div>
            <div className='text-2xl font-bold text-blue-600'>
              {formatCurrency(results.timeSavings)}
            </div>
            <div className='text-sm text-blue-700 dark:text-blue-400'>
              {(processTime * 0.6).toFixed(1)} hours saved
            </div>
          </div>

          <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-purple-800 dark:text-purple-300 font-medium'>
                Efficiency Gains (30%)
              </span>
              <span>📈</span>
            </div>
            <div className='text-2xl font-bold text-purple-600'>
              {formatCurrency(results.efficiency)}
            </div>
            <div className='text-sm text-purple-700 dark:text-purple-400'>
              +{(monthlyOrders * 0.3).toFixed(1)} additional orders
            </div>
          </div>

          <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800'>
            <div className='text-center'>
              <div className='text-sm text-orange-700 dark:text-orange-400 font-medium mb-1'>
                Total Monthly ROI
              </div>
              <div className='text-3xl font-black text-orange-600 mb-2'>
                {formatCurrency(results.totalROI)}
              </div>
              <div className='text-sm text-orange-700 dark:text-orange-400'>
                Annual: {formatCurrency(results.totalROI * 12)}
              </div>
            </div>
          </div>

          <button className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg'>
            Start Your Free Trial
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
