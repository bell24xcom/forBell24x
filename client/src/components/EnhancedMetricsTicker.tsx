'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Metric {
  id: string;
  label: string;
  value: string;
  previousValue: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  icon: any;
  color: string;
  prefix?: string;
  suffix?: string;
  category: 'volume' | 'users' | 'global' | 'performance';
}

interface MetricsUpdate {
  timestamp: number;
  metrics: Partial<
    Record<string, { value: string; change: string; trend: 'up' | 'down' | 'stable' }>
  >;
}

export default function EnhancedMetricsTicker() {
  const [hasMounted, setHasMounted] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'suppliers',
      label: 'Verified Suppliers',
      value: '534,891',
      previousValue: '534,234',
      trend: 'up',
      change: '+657',
      icon: Users,
      color: 'text-blue-600',
      category: 'users',
    },
    {
      id: 'volume',
      label: 'Monthly Volume',
      value: '12.5',
      previousValue: '11.8',
      trend: 'up',
      change: '+0.7',
      icon: TrendingUp,
      color: 'text-green-600',
      prefix: '₹',
      suffix: 'Cr',
      category: 'volume',
    },
    {
      id: 'countries',
      label: 'Active Countries',
      value: '143',
      previousValue: '142',
      trend: 'up',
      change: '+1',
      icon: Globe,
      color: 'text-purple-600',
      category: 'global',
    },
    {
      id: 'categories',
      label: 'Product Categories',
      value: '2,847',
      previousValue: '2,831',
      trend: 'up',
      change: '+16',
      icon: Target,
      color: 'text-orange-600',
      category: 'global',
    },
    {
      id: 'response',
      label: 'Avg Response Time',
      value: '47',
      previousValue: '52',
      trend: 'down',
      change: '-5',
      icon: Zap,
      color: 'text-amber-600',
      suffix: 'min',
      category: 'performance',
    },
    {
      id: 'satisfaction',
      label: 'Client Satisfaction',
      value: '98.7',
      previousValue: '98.4',
      trend: 'up',
      change: '+0.3',
      icon: Award,
      color: 'text-pink-600',
      suffix: '%',
      category: 'performance',
    },
    {
      id: 'enterprises',
      label: 'Enterprise Clients',
      value: '24,567',
      previousValue: '24,012',
      trend: 'up',
      change: '+555',
      icon: Users,
      color: 'text-indigo-600',
      category: 'users',
    },
    {
      id: 'transactions',
      label: 'Daily Transactions',
      value: '18,943',
      previousValue: '17,821',
      trend: 'up',
      change: '+1,122',
      icon: TrendingUp,
      color: 'text-emerald-600',
      category: 'volume',
    },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Simulate real-time updates
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    intervalRef.current = setInterval(() => {
      setCurrentTime(new Date());

      // Update metrics occasionally
      if (Math.random() < 0.3) {
        updateRandomMetric();
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasMounted]);

  const updateRandomMetric = () => {
    const metricIndex = Math.floor(Math.random() * metrics.length);
    const metric = metrics[metricIndex];

    const variation = Math.random() * 0.1 - 0.05; // ±5% variation
    const currentNum = parseFloat(metric.value.replace(/[,₹%]/g, ''));
    const newValue = Math.max(0, Math.floor(currentNum * (1 + variation)));
    const change = newValue - currentNum;

    setMetrics(prev =>
      prev.map((m, i) =>
        i === metricIndex
          ? {
              ...m,
              previousValue: m.value,
              value: newValue.toLocaleString(),
              change:
                change > 0
                  ? `+${Math.abs(change).toLocaleString()}`
                  : `-${Math.abs(change).toLocaleString()}`,
              trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            }
          : m
      )
    );

    setLastUpdate(new Date());
  };

  const formatMetricValue = (metric: Metric) => {
    return `${metric.prefix || ''}${metric.value}${metric.suffix || ''}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return ArrowUp;
      case 'down':
        return ArrowDown;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodTrend: boolean = true) => {
    if (trend === 'stable') return 'text-gray-500';

    const isPositive = (trend === 'up' && isGoodTrend) || (trend === 'down' && !isGoodTrend);
    return isPositive ? 'text-green-500' : 'text-red-500';
  };

  const isGoodTrend = (metricId: string, trend: 'up' | 'down' | 'stable') => {
    // Response time should go down
    if (metricId === 'response') return trend === 'down';
    // Everything else should go up
    return trend === 'up';
  };

  return (
    <section className='bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 py-8 overflow-hidden relative'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.1)_50%,transparent_75%)] bg-[length:20px_20px]' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='flex items-center justify-between mb-6'
        >
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div
                className={`w-3 h-3 rounded-full ${
                  isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className='text-white font-semibold'>
                {isLive ? 'LIVE METRICS' : 'OFFLINE'}
              </span>
            </div>
            <div className='text-gray-300 text-sm'>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div className='text-white text-right'>
            <div className='text-lg font-bold'>{currentTime.toLocaleTimeString()}</div>
            <div className='text-sm text-gray-300'>Real-time Data</div>
          </div>
        </motion.div>

        {/* Primary Ticker */}
        <div className='relative'>
          {/* Gradient Overlays */}
          <div className='absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none' />
          <div className='absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none' />

          {/* Scrolling Container */}
          <div className='overflow-hidden'>
            {hasMounted ? (
              <motion.div
                className='flex space-x-8'
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 45,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[...metrics, ...metrics].map((metric, index) => {
                  const Icon = metric.icon;
                  const TrendIcon = getTrendIcon(metric.trend);
                  const trendColor = getTrendColor(
                    metric.trend,
                    isGoodTrend(metric.id, metric.trend)
                  );

                  return (
                    <motion.div
                      key={`${metric.id}-${index}`}
                      className='flex-shrink-0 group cursor-pointer'
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 w-80'>
                        {/* Metric Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-10 h-10 ${metric.color} bg-white bg-opacity-20 rounded-xl flex items-center justify-center`}
                            >
                              <Icon className='w-5 h-5' />
                            </div>
                            <div>
                              <h3 className='text-white font-semibold text-lg'>
                                {formatMetricValue(metric)}
                              </h3>
                              <p className='text-gray-300 text-sm'>{metric.label}</p>
                            </div>
                          </div>

                          {/* Trend Indicator */}
                          {TrendIcon && (
                            <div className={`flex items-center gap-1 ${trendColor}`}>
                              <TrendIcon className='w-4 h-4' />
                              <span className='text-sm font-semibold'>{metric.change}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className='w-full bg-white bg-opacity-10 rounded-full h-2 mb-3'>
                          <motion.div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              metric.trend === 'up'
                                ? 'from-green-400 to-emerald-500'
                                : metric.trend === 'down'
                                ? 'from-red-400 to-red-500'
                                : 'from-gray-400 to-gray-500'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{
                              width: `${Math.min(
                                100,
                                Math.max(10, parseFloat(metric.value.replace(/[,₹%]/g, '')) % 100)
                              )}%`,
                            }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                          />
                        </div>

                        {/* Category Badge */}
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-400 uppercase tracking-wider'>
                            {metric.category}
                          </span>
                          <div className='flex items-center gap-1'>
                            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                            <span className='text-xs text-green-400'>Live</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <div className='flex space-x-8'>
                {[...metrics, ...metrics].map((metric, index) => {
                  const Icon = metric.icon;
                  const TrendIcon = getTrendIcon(metric.trend);
                  const trendColor = getTrendColor(
                    metric.trend,
                    isGoodTrend(metric.id, metric.trend)
                  );

                  return (
                    <div
                      key={`${metric.id}-${index}`}
                      className='flex-shrink-0 group cursor-pointer'
                    >
                      <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 w-80'>
                        {/* Metric Header */}
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-10 h-10 ${metric.color} bg-white bg-opacity-20 rounded-xl flex items-center justify-center`}
                            >
                              <Icon className='w-5 h-5' />
                            </div>
                            <div>
                              <h3 className='text-white font-semibold text-lg'>
                                {formatMetricValue(metric)}
                              </h3>
                              <p className='text-gray-300 text-sm'>{metric.label}</p>
                            </div>
                          </div>

                          {/* Trend Indicator */}
                          {TrendIcon && (
                            <div className={`flex items-center gap-1 ${trendColor}`}>
                              <TrendIcon className='w-4 h-4' />
                              <span className='text-sm font-semibold'>{metric.change}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className='w-full bg-white bg-opacity-10 rounded-full h-2 mb-3'>
                          <motion.div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              metric.trend === 'up'
                                ? 'from-green-400 to-emerald-500'
                                : metric.trend === 'down'
                                ? 'from-red-400 to-red-500'
                                : 'from-gray-400 to-gray-500'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{
                              width: `${Math.min(
                                100,
                                Math.max(10, parseFloat(metric.value.replace(/[,₹%]/g, '')) % 100)
                              )}%`,
                            }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                          />
                        </div>

                        {/* Category Badge */}
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-400 uppercase tracking-wider'>
                            {metric.category}
                          </span>
                          <div className='flex items-center gap-1'>
                            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
                            <span className='text-xs text-green-400'>Live</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'
        >
          <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-20'>
            <div className='text-2xl font-bold text-white mb-1'>₹100Cr+</div>
            <div className='text-gray-300 text-sm'>Annual GMV Target</div>
          </div>
          <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-20'>
            <div className='text-2xl font-bold text-white mb-1'>369</div>
            <div className='text-gray-300 text-sm'>Days to Launch</div>
          </div>
          <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-20'>
            <div className='text-2xl font-bold text-white mb-1'>24/7</div>
            <div className='text-gray-300 text-sm'>Enterprise Support</div>
          </div>
          <div className='bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-20'>
            <div className='text-2xl font-bold text-white mb-1'>99.9%</div>
            <div className='text-gray-300 text-sm'>Platform Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
