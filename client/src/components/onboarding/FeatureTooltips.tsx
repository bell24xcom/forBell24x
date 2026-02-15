'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TooltipConfig {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click' | 'auto';
  delay?: number;
  showOnce?: boolean;
  required?: boolean;
  action?: 'highlight' | 'demo' | 'guide';
}

interface FeatureTooltipsProps {
  isActive: boolean;
  onFeatureDiscovered: (featureId: string) => void;
  userId?: string;
}

const tooltipConfigs: TooltipConfig[] = [
  {
    id: 'voice-rfq-intro',
    target: '[data-feature="voice-rfq"]',
    title: '🎤 Voice RFQ',
    content: 'Click to start voice recording. Our AI will create detailed RFQs from your speech.',
    position: 'bottom',
    trigger: 'auto',
    showOnce: true,
    required: true,
    action: 'demo',
  },
  {
    id: 'ai-search-intro',
    target: '[data-feature="ai-search"]',
    title: '🤖 AI Search',
    content: 'Type your requirements and our AI will find the perfect suppliers instantly.',
    position: 'bottom',
    trigger: 'hover',
    showOnce: false,
    action: 'highlight',
  },
  {
    id: 'categories-explore',
    target: '[data-feature="categories"]',
    title: '📂 Browse Categories',
    content: 'Explore 50+ categories with 534,281+ verified suppliers.',
    position: 'top',
    trigger: 'hover',
    showOnce: false,
    action: 'highlight',
  },
  {
    id: 'dashboard-overview',
    target: '[data-feature="dashboard"]',
    title: '📊 Your Dashboard',
    content: 'Track your RFQs, supplier contacts, and AI insights all in one place.',
    position: 'left',
    trigger: 'auto',
    showOnce: true,
    action: 'guide',
  },
  {
    id: 'trial-limits',
    target: '[data-feature="trial-info"]',
    title: '🎁 Trial Benefits',
    content: 'You have 5 Voice RFQs, 20 supplier contacts, and 100 AI searches remaining.',
    position: 'top',
    trigger: 'auto',
    showOnce: true,
    required: true,
    action: 'highlight',
  },
  {
    id: 'upgrade-prompt',
    target: '[data-feature="upgrade"]',
    title: '🚀 Upgrade Now',
    content: 'Unlock unlimited access to all features. Start with ₹15,000/month.',
    position: 'top',
    trigger: 'auto',
    showOnce: true,
    action: 'highlight',
  },
];

export default function FeatureTooltips({
  isActive,
  onFeatureDiscovered,
  userId,
}: FeatureTooltipsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [discoveredFeatures, setDiscoveredFeatures] = useState<Set<string>>(new Set());
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load discovered features from localStorage
  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`discovered_features_${userId}`);
      if (saved) {
        setDiscoveredFeatures(new Set(JSON.parse(saved)));
      }
    }
  }, [userId]);

  // Save discovered features to localStorage
  useEffect(() => {
    if (userId && discoveredFeatures.size > 0) {
      localStorage.setItem(
        `discovered_features_${userId}`,
        JSON.stringify([...discoveredFeatures])
      );
    }
  }, [discoveredFeatures, userId]);

  // Initialize tooltips
  useEffect(() => {
    if (isActive) {
      initializeTooltips();
    }
  }, [isActive]);

  const initializeTooltips = useCallback(() => {
    // Add event listeners for hover tooltips
    tooltipConfigs.forEach(config => {
      if (config.trigger === 'hover') {
        const element = document.querySelector(config.target);
        if (element) {
          element.addEventListener('mouseenter', () => showTooltip(config.id));
          element.addEventListener('mouseleave', hideTooltip);
        }
      }
    });

    // Show auto tooltips
    tooltipConfigs
      .filter(config => config.trigger === 'auto' && !discoveredFeatures.has(config.id))
      .forEach((config, index) => {
        setTimeout(() => {
          if (isActive) {
            showTooltip(config.id);
          }
        }, (index + 1) * 2000); // Stagger auto tooltips
      });
  }, [isActive, discoveredFeatures]);

  const showTooltip = useCallback((tooltipId: string) => {
    const config = tooltipConfigs.find(c => c.id === tooltipId);
    if (!config) return;

    const targetElement = document.querySelector(config.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const position = calculateTooltipPosition(rect, config.position);

    setTooltipPosition(position);
    setActiveTooltip(tooltipId);
    setIsVisible(true);

    // Auto-hide for auto tooltips
    if (config.trigger === 'auto') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        hideTooltip();
        markFeatureDiscovered(tooltipId);
      }, 5000);
    }
  }, []);

  const hideTooltip = useCallback(() => {
    setIsVisible(false);
    setActiveTooltip(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markFeatureDiscovered = useCallback(
    (tooltipId: string) => {
      setDiscoveredFeatures(prev => new Set([...prev, tooltipId]));
      onFeatureDiscovered(tooltipId);

      // Track feature discovery
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'feature_discovered', {
          event_category: 'onboarding',
          event_label: tooltipId,
        });
      }
    },
    [onFeatureDiscovered]
  );

  const calculateTooltipPosition = useCallback((rect: DOMRect, position: string) => {
    const tooltipWidth = 300;
    const tooltipHeight = 120;
    const margin = 10;

    switch (position) {
      case 'top':
        return {
          x: rect.left + rect.width / 2 - tooltipWidth / 2,
          y: rect.top - tooltipHeight - margin,
        };
      case 'bottom':
        return {
          x: rect.left + rect.width / 2 - tooltipWidth / 2,
          y: rect.bottom + margin,
        };
      case 'left':
        return {
          x: rect.left - tooltipWidth - margin,
          y: rect.top + rect.height / 2 - tooltipHeight / 2,
        };
      case 'right':
        return {
          x: rect.right + margin,
          y: rect.top + rect.height / 2 - tooltipHeight / 2,
        };
      default:
        return {
          x: rect.left + rect.width / 2 - tooltipWidth / 2,
          y: rect.bottom + margin,
        };
    }
  }, []);

  const handleTooltipAction = useCallback((config: TooltipConfig) => {
    switch (config.action) {
      case 'demo':
        // Trigger demo animation
        const targetElement = document.querySelector(config.target);
        if (targetElement) {
          targetElement.classList.add('demo-active');
          setTimeout(() => {
            targetElement.classList.remove('demo-active');
          }, 2000);
        }
        break;
      case 'highlight':
        // Add highlight effect
        const highlightElement = document.querySelector(config.target);
        if (highlightElement) {
          highlightElement.classList.add('feature-highlight');
          setTimeout(() => {
            highlightElement.classList.remove('feature-highlight');
          }, 3000);
        }
        break;
      case 'guide':
        // Scroll to element
        const guideElement = document.querySelector(config.target);
        if (guideElement) {
          guideElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
    }
  }, []);

  if (!isVisible || !activeTooltip) return null;

  const currentConfig = tooltipConfigs.find(c => c.id === activeTooltip);
  if (!currentConfig) return null;

  return (
    <>
      {/* Backdrop for auto tooltips */}
      {currentConfig.trigger === 'auto' && (
        <div className='fixed inset-0 bg-black bg-opacity-30 z-40' onClick={hideTooltip} />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 max-w-sm bg-white rounded-lg shadow-2xl p-4 border border-gray-200 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45 ${
            currentConfig.position === 'top'
              ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'
              : currentConfig.position === 'bottom'
              ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : currentConfig.position === 'left'
              ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2'
              : 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
          }`}
        />

        {/* Header */}
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-sm font-semibold text-gray-900'>{currentConfig.title}</h3>
          {currentConfig.trigger === 'auto' && (
            <button
              onClick={hideTooltip}
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <p className='text-sm text-gray-600 mb-3'>{currentConfig.content}</p>

        {/* Action Button */}
        {currentConfig.action && (
          <button
            onClick={() => handleTooltipAction(currentConfig)}
            className='w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors'
          >
            {getActionButtonText(currentConfig.action)}
          </button>
        )}

        {/* Progress for auto tooltips */}
        {currentConfig.trigger === 'auto' && (
          <div className='mt-3'>
            <div className='w-full bg-gray-200 rounded-full h-1'>
              <div
                className='bg-blue-600 h-1 rounded-full transition-all duration-100'
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function getActionButtonText(action: string): string {
  switch (action) {
    case 'demo':
      return 'Try Demo';
    case 'highlight':
      return 'Got It';
    case 'guide':
      return 'Show Me';
    default:
      return 'Continue';
  }
}

// CSS for animations (add to your global CSS)
const tooltipStyles = `
  .demo-active {
    animation: pulse 2s ease-in-out;
  }

  .feature-highlight {
    animation: glow 3s ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tooltipStyles;
  document.head.appendChild(style);
}
