'use client';

import React, { useState, useEffect } from 'react';

interface ROIData {
  monthlyProcurementSpend: number;
  averageOrderValue: number;
  monthlyOrders: number;
  currentProcessTime: number;
  teamSize: number;
}

interface ROIResults {
  costSavings: {
    monthly: number;
    annual: number;
    percentage: number;
  };
  timeSavings: {
    hoursPerMonth: number;
    percentageReduction: number;
    dollarValue: number;
  };
  efficiencyGains: {
    additionalOrders: number;
    revenueIncrease: number;
  };
  totalROI: {
    monthly: number;
    annual: number;
    percentage: number;
  };
}

export default function ROICalculator() {
  const [formData, setFormData] = useState<ROIData>({
    monthlyProcurementSpend: 5000000, // ₹50L
    averageOrderValue: 250000, // ₹2.5L
    monthlyOrders: 20,
    currentProcessTime: 40, // hours per month
    teamSize: 3,
  });

  const [results, setResults] = useState<ROIResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Real-time calculation
  useEffect(() => {
    calculateROI();
  }, [formData]);

  const calculateROI = () => {
    setIsCalculating(true);

    setTimeout(() => {
      // Cost savings calculation (Bell24H reduces procurement costs by 25-35%)
      const costSavingsPercentage = 30; // 30% average
      const monthlyCostSavings = (formData.monthlyProcurementSpend * costSavingsPercentage) / 100;

      // Time savings calculation (60% reduction in process time)
      const timeSavingsPercentage = 60;
      const savedHours = (formData.currentProcessTime * timeSavingsPercentage) / 100;
      const hourlyRate = 2000; // ₹2000/hour for procurement professionals
      const timeSavingsDollarValue = savedHours * hourlyRate;

      // Efficiency gains (30% more orders due to faster process)
      const efficiencyIncrease = 30;
      const additionalOrders = (formData.monthlyOrders * efficiencyIncrease) / 100;
      const revenueIncrease = additionalOrders * formData.averageOrderValue;

      // Total ROI
      const totalMonthlySavings = monthlyCostSavings + timeSavingsDollarValue + revenueIncrease;
      const bellPlatformCost = 150000; // ₹1.5L monthly platform cost
      const netMonthlySavings = totalMonthlySavings - bellPlatformCost;

      const roiResults: ROIResults = {
        costSavings: {
          monthly: monthlyCostSavings,
          annual: monthlyCostSavings * 12,
          percentage: costSavingsPercentage,
        },
        timeSavings: {
          hoursPerMonth: savedHours,
          percentageReduction: timeSavingsPercentage,
          dollarValue: timeSavingsDollarValue,
        },
        efficiencyGains: {
          additionalOrders: additionalOrders,
          revenueIncrease: revenueIncrease,
        },
        totalROI: {
          monthly: netMonthlySavings,
          annual: netMonthlySavings * 12,
          percentage: (netMonthlySavings / bellPlatformCost) * 100,
        },
      };

      setResults(roiResults);
      setIsCalculating(false);
    }, 500);
  };

  const handleInputChange = (field: keyof ROIData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  return (
    <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6'>
        <div className='flex items-center'>
          <Calculator className='h-8 w-8 text-white mr-3' />
          <div>
            <h2 className='text-2xl font-bold text-white'>Bell24H ROI Calculator</h2>
            <p className='text-blue-100'>Calculate your procurement savings in real-time</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8'>
        {/* Input Form */}
        <div className='space-y-6'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            Your Current Metrics
          </h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Monthly Procurement Spend
              </label>
              <div className='relative'>
                <span>$</span>
                <input
                  type='number'
                  value={formData.monthlyProcurementSpend}
                  onChange={e =>
                    handleInputChange('monthlyProcurementSpend', Number(e.target.value))
                  }
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  placeholder='5000000'
                />
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                Current: {formatCurrency(formData.monthlyProcurementSpend)}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Average Order Value
              </label>
              <div className='relative'>
                <span>$</span>
                <input
                  type='number'
                  value={formData.averageOrderValue}
                  onChange={e => handleInputChange('averageOrderValue', Number(e.target.value))}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  placeholder='250000'
                />
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                Current: {formatCurrency(formData.averageOrderValue)}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Monthly Orders
              </label>
              <div className='relative'>
                <span>👤</span>
                <input
                  type='number'
                  value={formData.monthlyOrders}
                  onChange={e => handleInputChange('monthlyOrders', Number(e.target.value))}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  placeholder='20'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Current Process Time (hours/month)
              </label>
              <div className='relative'>
                <span>🕐</span>
                <input
                  type='number'
                  value={formData.currentProcessTime}
                  onChange={e => handleInputChange('currentProcessTime', Number(e.target.value))}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  placeholder='40'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Procurement Team Size
              </label>
              <div className='relative'>
                <span>👤</span>
                <input
                  type='number'
                  value={formData.teamSize}
                  onChange={e => handleInputChange('teamSize', Number(e.target.value))}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  placeholder='3'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className='space-y-6'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
            Your Bell24H Savings
            {isCalculating && (
              <span className='ml-2 text-sm text-blue-600 animate-pulse'>Calculating...</span>
            )}
          </h3>

          {results && (
            <div className='space-y-4'>
              {/* Cost Savings */}
              <div className='bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-bold text-green-800 dark:text-green-300'>Cost Savings</h4>
                  <span>📈</span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-green-700 dark:text-green-400'>Monthly:</span>
                    <span className='font-bold text-green-800 dark:text-green-300'>
                      {formatCurrency(results.costSavings.monthly)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-green-700 dark:text-green-400'>Annual:</span>
                    <span className='font-bold text-green-800 dark:text-green-300'>
                      {formatCurrency(results.costSavings.annual)}
                    </span>
                  </div>
                  <div className='text-sm text-green-600 dark:text-green-400'>
                    {results.costSavings.percentage}% reduction in procurement costs
                  </div>
                </div>
              </div>

              {/* Time Savings */}
              <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-bold text-blue-800 dark:text-blue-300'>Time Savings</h4>
                  <span>🕐</span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-blue-700 dark:text-blue-400'>Hours Saved/Month:</span>
                    <span className='font-bold text-blue-800 dark:text-blue-300'>
                      {results.timeSavings.hoursPerMonth.toFixed(1)}h
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-blue-700 dark:text-blue-400'>Dollar Value:</span>
                    <span className='font-bold text-blue-800 dark:text-blue-300'>
                      {formatCurrency(results.timeSavings.dollarValue)}
                    </span>
                  </div>
                  <div className='text-sm text-blue-600 dark:text-blue-400'>
                    {results.timeSavings.percentageReduction}% process time reduction
                  </div>
                </div>
              </div>

              {/* Efficiency Gains */}
              <div className='bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-bold text-purple-800 dark:text-purple-300'>
                    Efficiency Gains
                  </h4>
                  <span>📈</span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-purple-700 dark:text-purple-400'>Additional Orders:</span>
                    <span className='font-bold text-purple-800 dark:text-purple-300'>
                      +{results.efficiencyGains.additionalOrders.toFixed(1)}/month
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-purple-700 dark:text-purple-400'>Revenue Increase:</span>
                    <span className='font-bold text-purple-800 dark:text-purple-300'>
                      {formatCurrency(results.efficiencyGains.revenueIncrease)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total ROI */}
              <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800'>
                <div className='text-center'>
                  <h4 className='text-2xl font-bold text-orange-800 dark:text-orange-300 mb-2'>
                    Total ROI
                  </h4>
                  <div className='text-4xl font-black text-orange-600 mb-2'>
                    {results.totalROI.percentage.toFixed(0)}%
                  </div>
                  <div className='space-y-1'>
                    <div className='text-orange-700 dark:text-orange-400'>
                      Monthly Net Savings:{' '}
                      <span className='font-bold'>{formatCurrency(results.totalROI.monthly)}</span>
                    </div>
                    <div className='text-orange-700 dark:text-orange-400'>
                      Annual Net Savings:{' '}
                      <span className='font-bold'>{formatCurrency(results.totalROI.annual)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className='text-center pt-4'>
                <button className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-xl'>
                  Start Your Free Trial
                  <span>→</span>
                </button>
                <p className='text-sm text-gray-500 mt-2'>
                  No setup fees • 30-day money-back guarantee
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
