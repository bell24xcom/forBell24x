import React from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface SVGTimelineAnimationProps {
  items: TimelineItem[];
  className?: string;
}

const SVGTimelineAnimation: React.FC<SVGTimelineAnimationProps> = ({
  items = [],
  className = '',
}) => {
  const defaultItems: TimelineItem[] = [
    {
      id: '1',
      title: 'RFQ Submitted',
      description: 'Your request for quotation has been submitted',
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Suppliers Matched',
      description: 'AI has matched your RFQ with relevant suppliers',
      date: '2024-01-16',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Quotes Received',
      description: 'Suppliers are submitting their quotations',
      date: '2024-01-17',
      status: 'in-progress',
    },
    {
      id: '4',
      title: 'Evaluation',
      description: 'Review and compare received quotes',
      date: '2024-01-18',
      status: 'pending',
    },
  ];

  const timelineItems = items.length > 0 ? items : defaultItems;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981'; // Green
      case 'in-progress':
        return '#F59E0B'; // Orange
      case 'pending':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <div className='relative'>
        <svg className='w-full h-auto' viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>
          {/* Timeline Line */}
          <motion.line
            x1='50'
            y1='200'
            x2='750'
            y2='200'
            stroke='#E5E7EB'
            strokeWidth='3'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Timeline Items */}
          {timelineItems.map((item, index) => {
            const x = 50 + index * (700 / (timelineItems.length - 1));
            const y = 200;

            return (
              <g key={item.id}>
                {/* Circle */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r='12'
                  fill={getStatusColor(item.status)}
                  stroke='#FFFFFF'
                  strokeWidth='3'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.5,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                />

                {/* Pulse Animation for In-Progress */}
                {item.status === 'in-progress' && (
                  <motion.circle
                    cx={x}
                    cy={y}
                    r='12'
                    fill='none'
                    stroke={getStatusColor(item.status)}
                    strokeWidth='2'
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'easeOut',
                    }}
                  />
                )}

                {/* Title */}
                <motion.text
                  x={x}
                  y={y - 30}
                  textAnchor='middle'
                  className='text-sm font-semibold fill-gray-800'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.5 + 0.3,
                    duration: 0.5,
                  }}
                >
                  {item.title}
                </motion.text>

                {/* Date */}
                <motion.text
                  x={x}
                  y={y + 35}
                  textAnchor='middle'
                  className='text-xs fill-gray-500'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.5 + 0.4,
                    duration: 0.5,
                  }}
                >
                  {new Date(item.date).toLocaleDateString()}
                </motion.text>

                {/* Status Icon */}
                {item.status === 'completed' && (
                  <motion.path
                    d={`M ${x - 4} ${y} L ${x - 1} ${y + 3} L ${x + 4} ${y - 2}`}
                    stroke='#FFFFFF'
                    strokeWidth='2'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: index * 0.5 + 0.5,
                      duration: 0.3,
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Description Cards */}
        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {timelineItems.map((item, index) => (
            <motion.div
              key={item.id}
              className='bg-white rounded-lg shadow-md p-4 border-l-4'
              style={{ borderLeftColor: getStatusColor(item.status) }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.5 + 0.6,
                duration: 0.5,
              }}
            >
              <h3 className='font-semibold text-gray-800 mb-2'>{item.title}</h3>
              <p className='text-sm text-gray-600 mb-2'>{item.description}</p>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500'>
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'in-progress'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.status.replace('-', ' ')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SVGTimelineAnimation;
