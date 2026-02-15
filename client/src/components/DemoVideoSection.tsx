'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  category: 'platform' | 'feature' | 'mobile' | 'ai';
  features: string[];
  icon: React.ReactNode;
}

const demoVideos: DemoVideo[] = [
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    description: 'Complete Bell24H platform walkthrough - from RFQ creation to supplier selection',
    duration: '3:45',
    thumbnail: '/demo-thumbnails/platform-overview.jpg',
    videoUrl: '/demo-videos/platform-overview.mp4',
    category: 'platform',
    features: ['Dashboard Tour', 'Navigation', 'Core Features', 'User Interface'],
    icon: <span>🌍</span>,
  },
  {
    id: 'voice-rfq-demo',
    title: 'Voice RFQ Creation',
    description: 'Watch how Voice RFQ transforms procurement - 90% faster than traditional methods',
    duration: '2:30',
    thumbnail: '/demo-thumbnails/voice-rfq.jpg',
    videoUrl: '/demo-videos/voice-rfq-demo.mp4',
    category: 'feature',
    features: ['Voice Commands', 'Speech Recognition', 'Auto-fill', 'Smart Suggestions'],
    icon: <span>🎤</span>,
  },
  {
    id: 'ai-matching-demo',
    title: 'AI Supplier Matching',
    description: 'See AI-powered matching in action - 98.5% accuracy in supplier recommendations',
    duration: '2:15',
    thumbnail: '/demo-thumbnails/ai-matching.jpg',
    videoUrl: '/demo-videos/ai-matching-demo.mp4',
    category: 'ai',
    features: ['Smart Matching', 'Risk Scoring', 'Recommendations', 'Analytics'],
    icon: <Brain className='h-5 w-5' />,
  },
  {
    id: 'escrow-demo',
    title: 'Blockchain Escrow',
    description: 'Secure payment processing with blockchain technology - 100% transaction security',
    duration: '3:20',
    thumbnail: '/demo-thumbnails/escrow-demo.jpg',
    videoUrl: '/demo-videos/escrow-demo.mp4',
    category: 'feature',
    features: ['Milestone Payments', 'Smart Contracts', 'Security', 'Transparency'],
    icon: <span>🔒</span>,
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Real-time insights and business intelligence for procurement optimization',
    duration: '2:50',
    thumbnail: '/demo-thumbnails/analytics.jpg',
    videoUrl: '/demo-videos/analytics-demo.mp4',
    category: 'platform',
    features: ['Live Data', 'Custom Reports', 'Insights', 'Forecasting'],
    icon: <span>📊</span>,
  },
  {
    id: 'mobile-app-demo',
    title: 'Mobile App Experience',
    description: 'Best-in-class mobile B2B marketplace experience - iOS & Android',
    duration: '2:40',
    thumbnail: '/demo-thumbnails/mobile-app.jpg',
    videoUrl: '/demo-videos/mobile-demo.mp4',
    category: 'mobile',
    features: ['Touch Interface', 'Offline Mode', 'Push Notifications', 'Native Performance'],
    icon: <Smartphone className='h-5 w-5' />,
  },
];

const categoryColors = {
  platform: 'from-blue-500 to-blue-600',
  feature: 'from-purple-500 to-purple-600',
  ai: 'from-green-500 to-green-600',
  mobile: 'from-orange-500 to-orange-600',
};

const categoryLabels = {
  platform: 'Platform',
  feature: 'Features',
  ai: 'AI Technology',
  mobile: 'Mobile',
};

interface VideoPlayerProps {
  video: DemoVideo;
  isActive: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
    }
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className='bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Video Header */}
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${
                  categoryColors[video.category]
                } text-white`}
              >
                {video.icon}
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>{video.title}</h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {video.duration} • {categoryLabels[video.category]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className='relative bg-black'>
          <video
            ref={videoRef}
            className='w-full aspect-video'
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            poster={video.thumbnail}
          >
            <source src={video.videoUrl} type='video/mp4' />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
            {/* Progress Bar */}
            <div className='w-full bg-gray-600 rounded-full h-1 mb-3'>
              <div
                className='bg-blue-500 h-1 rounded-full transition-all duration-150'
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className='flex items-center justify-between text-white'>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={togglePlay}
                  className='p-2 hover:bg-white/20 rounded-full transition-colors'
                >
                  {isPlaying ? <span>⏸️</span> : <span>▶️</span>}
                </button>
                <button
                  onClick={restart}
                  className='p-2 hover:bg-white/20 rounded-full transition-colors'
                >
                  <RotateCcw className='h-4 w-4' />
                </button>
                <button
                  onClick={toggleMute}
                  className='p-2 hover:bg-white/20 rounded-full transition-colors'
                >
                  {isMuted ? <span>🔊</span> : <span>🔊</span>}
                </button>
              </div>
              <button className='p-2 hover:bg-white/20 rounded-full transition-colors'>
                <Maximize className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className='p-6'>
          <p className='text-gray-600 dark:text-gray-300 mb-4'>{video.description}</p>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
            {video.features.map((feature, index) => (
              <div
                key={index}
                className='flex items-center text-sm text-gray-600 dark:text-gray-400'
              >
                <span>✅</span>
                {feature}
              </div>
            ))}
          </div>

          <div className='flex space-x-3'>
            <button className='flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              <span>⬇️</span>
              Download Video
            </button>
            <button className='flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'>
              <span>📤</span>
              Share Demo
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function DemoVideoSection() {
  const [activeVideo, setActiveVideo] = useState<DemoVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'platform', 'feature', 'ai', 'mobile'];

  const filteredVideos =
    selectedCategory === 'all'
      ? demoVideos
      : demoVideos.filter(video => video.category === selectedCategory);

  return (
    <section className='py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4'>
            Platform Demo Videos
          </h2>
          <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
            See Bell24H in action. Watch comprehensive demos of our revolutionary B2B procurement
            platform.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className='flex justify-center mb-8'>
          <div className='flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg'>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {category === 'all'
                  ? 'All Videos'
                  : categoryLabels[category as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className='bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group'
              onClick={() => setActiveVideo(video)}
            >
              {/* Video Thumbnail */}
              <div className='relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center'>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className='w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all'
                  >
                    <span>▶️</span>
                  </motion.div>
                </div>
                <div className='absolute top-3 left-3'>
                  <span
                    className={`px-2 py-1 bg-gradient-to-r ${
                      categoryColors[video.category]
                    } text-white text-xs font-bold rounded-full`}
                  >
                    {categoryLabels[video.category]}
                  </span>
                </div>
                <div className='absolute bottom-3 right-3'>
                  <span className='px-2 py-1 bg-black/70 text-white text-xs font-medium rounded'>
                    {video.duration}
                  </span>
                </div>
              </div>

              {/* Video Info */}
              <div className='p-6'>
                <div className='flex items-center mb-3'>
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${
                      categoryColors[video.category]
                    } text-white mr-3`}
                  >
                    {video.icon}
                  </div>
                  <h3 className='text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {video.title}
                  </h3>
                </div>
                <p className='text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2'>
                  {video.description}
                </p>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                    <span>✅</span>
                    {video.features.length} features
                  </div>
                  <span>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mt-12'
        >
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg'>
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
              Ready to Experience Bell24H?
            </h3>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              Schedule a personalized demo with our team or start your free trial today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-lg'>
                Schedule Live Demo
              </button>
              <button className='px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold'>
                Start Free Trial
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayer
          video={activeVideo}
          isActive={!!activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </section>
  );
}
