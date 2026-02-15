'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'scroll' | 'highlight' | 'demo';
  delay?: number;
  required?: boolean;
  skipable?: boolean;
}

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userId?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Bell24H! 🎉',
    description:
      "India's most trusted B2B marketplace with AI-powered features. Let's take a quick tour to show you around.",
    target: 'body',
    position: 'center',
    action: 'highlight',
    required: true,
    skipable: false,
  },
  {
    id: 'voice-rfq',
    title: 'Revolutionary Voice RFQ',
    description:
      'Simply speak your requirements and our AI will create detailed RFQs. Try saying "I need industrial machinery suppliers"',
    target: '[data-feature="voice-rfq"]',
    position: 'bottom',
    action: 'demo',
    required: true,
    skipable: false,
  },
  {
    id: 'ai-search',
    title: 'AI-Powered Search',
    description:
      'Our 98.5% accurate AI understands your business needs and finds the perfect suppliers instantly.',
    target: '[data-feature="ai-search"]',
    position: 'bottom',
    action: 'highlight',
    required: false,
    skipable: true,
  },
  {
    id: 'categories',
    title: 'Explore Categories',
    description:
      'Browse 50+ categories with 534,281+ verified suppliers. Find exactly what you need.',
    target: '[data-feature="categories"]',
    position: 'top',
    action: 'highlight',
    required: false,
    skipable: true,
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your RFQs, supplier contacts, and AI insights all in one place.',
    target: '[data-feature="dashboard"]',
    position: 'left',
    action: 'highlight',
    required: false,
    skipable: true,
  },
  {
    id: 'trial-limits',
    title: 'Free Trial Benefits',
    description:
      'You get 5 Voice RFQs, 20 supplier contacts, and 100 AI searches. Upgrade anytime for unlimited access.',
    target: '[data-feature="trial-info"]',
    position: 'top',
    action: 'highlight',
    required: true,
    skipable: false,
  },
  {
    id: 'upgrade-path',
    title: 'Ready to Upgrade?',
    description:
      'Unlock unlimited access to all features. Start with ₹15,000/month Basic plan or go Pro for ₹75,000/month.',
    target: '[data-feature="upgrade"]',
    position: 'center',
    action: 'highlight',
    required: false,
    skipable: true,
  },
];

export default function OnboardingTour({
  isActive,
  onComplete,
  onSkip,
  userId,
}: OnboardingTourProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [tourProgress, setTourProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  // Initialize tour
  useEffect(() => {
    if (isActive) {
      const hasCompletedTour = localStorage.getItem(`tour_completed_${userId || 'anonymous'}`);
      if (!hasCompletedTour) {
        startTour();
      } else {
        onComplete();
      }
    }
  }, [isActive, userId, onComplete]);

  // Track tour progress
  useEffect(() => {
    const progress = ((currentStep + 1) / tourSteps.length) * 100;
    setTourProgress(progress);
  }, [currentStep]);

  const startTour = useCallback(() => {
    setIsVisible(true);
    setCurrentStep(0);
    setTimeout(() => {
      positionOverlay(tourSteps[0]);
    }, 100);
  }, []);

  const positionOverlay = useCallback((step: TourStep) => {
    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      // If target not found, center the overlay
      setOverlayPosition({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const padding = 10;

    setOverlayPosition({
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        const nextStepIndex = currentStep + 1;
        setCurrentStep(nextStepIndex);
        const nextStepData = tourSteps[nextStepIndex];
        positionOverlay(nextStepData);
        setIsAnimating(false);
      }, 300);
    } else {
      completeTour();
    }
  }, [currentStep, positionOverlay]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        const prevStepIndex = currentStep - 1;
        setCurrentStep(prevStepIndex);
        const prevStepData = tourSteps[prevStepIndex];
        positionOverlay(prevStepData);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentStep, positionOverlay]);

  const skipTour = useCallback(() => {
    setIsVisible(false);
    onSkip();
  }, [onSkip]);

  const completeTour = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(`tour_completed_${userId || 'anonymous'}`, 'true');
    onComplete();

    // Track tour completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tour_completed', {
        event_category: 'onboarding',
        event_label: 'welcome_tour',
        value: tourProgress,
      });
    }
  }, [onComplete, userId, tourProgress]);

  const handleStepAction = useCallback((step: TourStep) => {
    switch (step.action) {
      case 'click':
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
          (targetElement as HTMLElement).click();
        }
        break;
      case 'scroll':
        const scrollElement = document.querySelector(step.target);
        if (scrollElement) {
          scrollElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      case 'demo':
        // Trigger voice RFQ demo
        if (step.id === 'voice-rfq') {
          // Simulate voice RFQ activation
          const voiceRfqElement = document.querySelector('[data-feature="voice-rfq"]');
          if (voiceRfqElement) {
            voiceRfqElement.classList.add('demo-active');
            setTimeout(() => {
              voiceRfqElement.classList.remove('demo-active');
            }, 3000);
          }
        }
        break;
    }
  }, []);

  if (!isVisible || !isActive) return null;

  const currentStepData = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300'
        onClick={currentStepData.skipable ? skipTour : undefined}
      />

      {/* Highlight Overlay */}
      <div
        ref={overlayRef}
        className={`fixed z-50 border-2 border-blue-500 bg-blue-500 bg-opacity-10 rounded-lg transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          left: overlayPosition.x,
          top: overlayPosition.y,
          width: overlayPosition.width,
          height: overlayPosition.height,
        }}
      />

      {/* Tour Step */}
      <div
        ref={stepRef}
        className={`fixed z-50 max-w-md bg-white rounded-lg shadow-2xl p-6 transition-all duration-300 ${
          isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
        style={{
          left: getStepPosition(currentStepData.position, overlayPosition).x,
          top: getStepPosition(currentStepData.position, overlayPosition).y,
        }}
      >
        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex justify-between text-sm text-gray-600 mb-2'>
            <span>
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <span>{Math.round(tourProgress)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${tourProgress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>{currentStepData.title}</h3>
          <p className='text-gray-600 leading-relaxed'>{currentStepData.description}</p>
        </div>

        {/* Action Button */}
        {currentStepData.action && (
          <button
            onClick={() => handleStepAction(currentStepData)}
            className='w-full mb-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
          >
            {getActionButtonText(currentStepData.action)}
          </button>
        )}

        {/* Navigation */}
        <div className='flex justify-between items-center'>
          <div className='flex space-x-2'>
            {!isFirstStep && (
              <button
                onClick={previousStep}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                ← Previous
              </button>
            )}
          </div>

          <div className='flex space-x-2'>
            {currentStepData.skipable && (
              <button
                onClick={skipTour}
                className='px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors'
              >
                Skip Tour
              </button>
            )}

            <button
              onClick={isLastStep ? completeTour : nextStep}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              {isLastStep ? 'Complete Tour' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className='flex justify-center space-x-2 mt-4'>
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-blue-600'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function getStepPosition(position: string, overlayPosition: any) {
  const stepWidth = 400;
  const stepHeight = 300;
  const margin = 20;

  switch (position) {
    case 'top':
      return {
        x: overlayPosition.x + overlayPosition.width / 2 - stepWidth / 2,
        y: overlayPosition.y - stepHeight - margin,
      };
    case 'bottom':
      return {
        x: overlayPosition.x + overlayPosition.width / 2 - stepWidth / 2,
        y: overlayPosition.y + overlayPosition.height + margin,
      };
    case 'left':
      return {
        x: overlayPosition.x - stepWidth - margin,
        y: overlayPosition.y + overlayPosition.height / 2 - stepHeight / 2,
      };
    case 'right':
      return {
        x: overlayPosition.x + overlayPosition.width + margin,
        y: overlayPosition.y + overlayPosition.height / 2 - stepHeight / 2,
      };
    case 'center':
    default:
      return {
        x: window.innerWidth / 2 - stepWidth / 2,
        y: window.innerHeight / 2 - stepHeight / 2,
      };
  }
}

function getActionButtonText(action: string): string {
  switch (action) {
    case 'click':
      return 'Try This Feature';
    case 'scroll':
      return 'Show Me';
    case 'demo':
      return 'Watch Demo';
    case 'highlight':
      return 'Got It';
    default:
      return 'Continue';
  }
}
