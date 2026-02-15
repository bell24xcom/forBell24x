'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Globe, Target, Zap } from 'lucide-react';

interface MetricData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function AdvancedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnimating, setIsAnimating] = useState(true);
  const [liveData, setLiveData] = useState<MetricData[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const generateMetrics = () => [
      {
        label: 'Live RFQs (24h)',
        value: `${847 + Math.floor(Math.random() * 20)}`,
        change: 12.5 + Math.random() * 5,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        label: 'Active Suppliers',
        value: `${2340 + Math.floor(Math.random() * 50)}`,
        change: 8.3 + Math.random() * 3,
        trend: 'up' as const,
        icon: Users,
        color: 'from-blue-500 to-blue-600',
      },
      {
        label: 'Transaction Volume',
        value: `₹${(45.7 + Math.random() * 5).toFixed(1)}Cr`,
        change: 15.2 + Math.random() * 7,
        trend: 'up' as const,
        icon: BarChart3,
        color: 'from-purple-500 to-purple-600',
      },
      {
        label: 'Global Reach',
        value: `${43 + Math.floor(Math.random() * 5)} Countries`,
        change: 5.8 + Math.random() * 2,
        trend: 'up' as const,
        icon: Globe,
        color: 'from-amber-500 to-orange-600',
      },
      {
        label: 'AI Match Accuracy',
        value: `${(96.7 + Math.random() * 2).toFixed(1)}%`,
        change: 2.1 + Math.random() * 1,
        trend: 'up' as const,
        icon: Target,
        color: 'from-rose-500 to-pink-600',
      },
      {
        label: 'Response Time',
        value: `${28 + Math.floor(Math.random() * 10)} min`,
        change: 12.4 + Math.random() * 5,
        trend: 'down' as const,
        icon: Zap,
        color: 'from-teal-500 to-cyan-600',
      },
    ];

    setLiveData(generateMetrics());

    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const interval = setInterval(() => {
      setLiveData(generateMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [hasMounted]);

  // Sample chart data for different categories
  const industryData: ChartData[] = [
    { label: 'Electronics', value: 28, color: '#3b82f6' },
    { label: 'Machinery', value: 22, color: '#8b5cf6' },
    { label: 'Chemicals', value: 18, color: '#10b981' },
    { label: 'Textiles', value: 15, color: '#f59e0b' },
    { label: 'Automotive', value: 12, color: '#ef4444' },
    { label: 'Others', value: 5, color: '#6b7280' },
  ];

  const geographicData: ChartData[] = [
    { label: 'Maharashtra', value: 35, color: '#3b82f6' },
    { label: 'Gujarat', value: 28, color: '#8b5cf6' },
    { label: 'Tamil Nadu', value: 22, color: '#10b981' },
    { label: 'Karnataka', value: 18, color: '#f59e0b' },
    { label: 'Delhi NCR', value: 15, color: '#ef4444' },
    { label: 'Others', value: 12, color: '#6b7280' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className='bg-gradient-to-br from-slate-50 to-blue-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full mb-4'>
            <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
            <span className='text-sm font-semibold text-emerald-700'>LIVE ANALYTICS</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Real-Time Business Intelligence
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Monitor marketplace activity, supplier network growth, and transaction trends with our
            advanced analytics dashboard.
          </p>
        </motion.div>

        {/* Main Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'
        >
          {liveData.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group'
            >
              <div className='flex items-start justify-between mb-4'>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <metric.icon className='w-6 h-6 text-white' />
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    metric.trend === 'up'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {metric.trend === 'up' ? (
                    <span>📈</span>
                  ) : (
                    <span>📉</span>
                  )}
                  {metric.change.toFixed(1)}%
                </div>
              </div>
              <h3 className='text-sm font-medium text-gray-600 mb-2'>{metric.label}</h3>
              <div className='text-3xl font-bold text-gray-900 mb-1'>
                {isAnimating ? (
                  <div className='animate-pulse bg-gray-300 h-8 rounded'></div>
                ) : (
                  metric.value
                )}
              </div>
              <p className='text-sm text-gray-500'>
                {metric.trend === 'up' ? 'Increased' : 'Improved'} from last period
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and Analytics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20'
        >
          {/* Tab Navigation */}
          <div className='flex flex-wrap gap-2 mb-8'>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'industry', label: 'Industry Trends', icon: Package },
              { id: 'geographic', label: 'Geographic', icon: MapPin },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode='wait'>
            {activeTab === 'overview' && (
              <motion.div
                key='overview'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>Platform Activity</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl'>
                        <div className='flex items-center gap-3'>
                          <span>🕐</span>
                          <span className='font-medium text-gray-900'>Peak Hours</span>
                        </div>
                        <span className='text-blue-600 font-bold'>10 AM - 2 PM IST</span>
                      </div>
                      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl'>
                        <div className='flex items-center gap-3'>
                          <Target className='w-5 h-5 text-emerald-600' />
                          <span className='font-medium text-gray-900'>Success Rate</span>
                        </div>
                        <span className='text-emerald-600 font-bold'>94.7%</span>
                      </div>
                      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl'>
                        <div className='flex items-center gap-3'>
                          <span>⚡</span>
                          <span className='font-medium text-gray-900'>Avg. Response</span>
                        </div>
                        <span className='text-amber-600 font-bold'>28 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                      Key Performance Indicators
                    </h3>
                    <div className='space-y-3'>
                      {[
                        {
                          label: 'Supplier Verification Rate',
                          value: 98,
                          color: 'emerald',
                        },
                        {
                          label: 'Customer Satisfaction',
                          value: 96,
                          color: 'blue',
                        },
                        {
                          label: 'Platform Uptime',
                          value: 99,
                          color: 'purple',
                        },
                        {
                          label: 'Transaction Security',
                          value: 100,
                          color: 'teal',
                        },
                      ].map((kpi, index) => (
                        <div key={kpi.label} className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='font-medium text-gray-700'>{kpi.label}</span>
                            <span className='font-bold text-gray-900'>{kpi.value}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${kpi.value}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              viewport={{ once: true }}
                              className={`h-2 rounded-full bg-gradient-to-r ${
                                kpi.color === 'emerald'
                                  ? 'from-emerald-400 to-emerald-600'
                                  : kpi.color === 'blue'
                                  ? 'from-blue-400 to-blue-600'
                                  : kpi.color === 'purple'
                                  ? 'from-purple-400 to-purple-600'
                                  : 'from-teal-400 to-teal-600'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'industry' && (
              <motion.div
                key='industry'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className='text-xl font-bold text-gray-900 mb-6'>Industry Distribution</h3>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    {industryData.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className='flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-4 h-4 rounded-full'
                            style={{ backgroundColor: item.color }}
                          />
                          <span className='font-medium text-gray-900'>{item.label}</span>
                        </div>
                        <div className='text-right'>
                          <div className='font-bold text-gray-900'>{item.value}%</div>
                          <div className='text-sm text-gray-600'>Market Share</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className='flex items-center justify-center'>
                    <div className='relative w-64 h-64'>
                      <svg className='w-full h-full transform -rotate-90'>
                        {industryData.map((item, index) => {
                          const total = industryData.reduce((sum, d) => sum + d.value, 0);
                          const percentage = (item.value / total) * 100;
                          const circumference = 2 * Math.PI * 100;
                          const strokeDasharray = `${
                            (percentage / 100) * circumference
                          } ${circumference}`;
                          const strokeDashoffset = -industryData
                            .slice(0, index)
                            .reduce((sum, d) => sum + (d.value / total) * circumference, 0);

                          return (
                            <circle
                              key={item.label}
                              cx='128'
                              cy='128'
                              r='100'
                              fill='none'
                              stroke={item.color}
                              strokeWidth='20'
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className='transition-all duration-1000'
                            />
                          );
                        })}
                      </svg>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-gray-900'>100%</div>
                          <div className='text-sm text-gray-600'>Industries</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'geographic' && (
              <motion.div
                key='geographic'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className='text-xl font-bold text-gray-900 mb-6'>Geographic Distribution</h3>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    {geographicData.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className='flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all'
                      >
                        <span>📍</span>
                        <div className='flex-1'>
                          <div className='flex justify-between items-center mb-2'>
                            <span className='font-medium text-gray-900'>{item.label}</span>
                            <span className='font-bold text-blue-600'>{item.value}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.value}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              viewport={{ once: true }}
                              className='h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-600'
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className='bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6'>
                    <h4 className='text-lg font-bold text-gray-900 mb-4'>Activity Heatmap</h4>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='text-center p-4 bg-white rounded-xl shadow-sm'>
                        <div className='text-2xl font-bold text-blue-600'>43</div>
                        <div className='text-sm text-gray-600'>Countries</div>
                      </div>
                      <div className='text-center p-4 bg-white rounded-xl shadow-sm'>
                        <div className='text-2xl font-bold text-purple-600'>284</div>
                        <div className='text-sm text-gray-600'>Cities</div>
                      </div>
                      <div className='text-center p-4 bg-white rounded-xl shadow-sm'>
                        <div className='text-2xl font-bold text-emerald-600'>16</div>
                        <div className='text-sm text-gray-600'>Time Zones</div>
                      </div>
                      <div className='text-center p-4 bg-white rounded-xl shadow-sm'>
                        <div className='text-2xl font-bold text-amber-600'>24/7</div>
                        <div className='text-sm text-gray-600'>Operations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className='text-center mt-12'
        >
          <button className='group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto'>
            <span>👁️</span>
            View Full Analytics Dashboard
            <span>↑</span>
          </button>
          <p className='text-gray-600 mt-4'>
            Access detailed insights, custom reports, and advanced analytics
          </p>
        </motion.div>
      </div>
    </section>
  );
}
