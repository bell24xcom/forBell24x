'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number;
  completedSteps: Set<string>;
  discoveredFeatures: Set<string>;
  tourCompleted: boolean;
  helpCenterOpen: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  discoverFeature: (featureId: string) => void;
  completeTour: () => void;
  openHelpCenter: () => void;
  closeHelpCenter: () => void;
  resetOnboarding: () => void;
  getProgress: () => number;
  isStepCompleted: (stepId: string) => boolean;
  isFeatureDiscovered: (featureId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: React.ReactNode;
  userId?: string;
}

const onboardingSteps = [
  'welcome',
  'voice-rfq',
  'ai-search',
  'categories',
  'dashboard',
  'trial-limits',
  'upgrade-path',
];

const onboardingFeatures = [
  'voice-rfq-intro',
  'ai-search-intro',
  'categories-explore',
  'dashboard-overview',
  'trial-limits',
  'upgrade-prompt',
];

export function OnboardingProvider({ children, userId }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    totalSteps: onboardingSteps.length,
    progress: 0,
    completedSteps: new Set(),
    discoveredFeatures: new Set(),
    tourCompleted: false,
    helpCenterOpen: false,
  });

  // Load onboarding state from localStorage
  useEffect(() => {
    if (userId) {
      const savedState = localStorage.getItem(`onboarding_state_${userId}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          completedSteps: new Set(parsed.completedSteps || []),
          discoveredFeatures: new Set(parsed.discoveredFeatures || []),
          tourCompleted: parsed.tourCompleted || false,
        }));
      }
    }
  }, [userId]);

  // Save onboarding state to localStorage
  useEffect(() => {
    if (userId) {
      const stateToSave = {
        completedSteps: [...state.completedSteps],
        discoveredFeatures: [...state.discoveredFeatures],
        tourCompleted: state.tourCompleted,
      };
      localStorage.setItem(`onboarding_state_${userId}`, JSON.stringify(stateToSave));
    }
  }, [state.completedSteps, state.discoveredFeatures, state.tourCompleted, userId]);

  // Calculate progress
  useEffect(() => {
    const totalItems = onboardingSteps.length + onboardingFeatures.length;
    const completedItems = state.completedSteps.size + state.discoveredFeatures.size;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    setState(prev => ({
      ...prev,
      progress: Math.round(progress),
    }));
  }, [state.completedSteps, state.discoveredFeatures]);

  const startOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
    }));

    // Track onboarding start
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_started', {
        event_category: 'onboarding',
        event_label: 'welcome_tour',
      });
    }
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, stepId]),
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));

    // Track step completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_completed', {
        event_category: 'onboarding',
        event_label: stepId,
      });
    }
  }, []);

  const discoverFeature = useCallback((featureId: string) => {
    setState(prev => ({
      ...prev,
      discoveredFeatures: new Set([...prev.discoveredFeatures, featureId]),
    }));

    // Track feature discovery
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'feature_discovered', {
        event_category: 'onboarding',
        event_label: featureId,
      });
    }
  }, []);

  const completeTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      tourCompleted: true,
    }));

    // Track tour completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tour_completed', {
        event_category: 'onboarding',
        event_label: 'welcome_tour',
        value: state.progress,
      });
    }
  }, [state.progress]);

  const openHelpCenter = useCallback(() => {
    setState(prev => ({
      ...prev,
      helpCenterOpen: true,
    }));
  }, []);

  const closeHelpCenter = useCallback(() => {
    setState(prev => ({
      ...prev,
      helpCenterOpen: false,
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStep: 0,
      completedSteps: new Set(),
      discoveredFeatures: new Set(),
      tourCompleted: false,
      helpCenterOpen: false,
    }));

    // Clear localStorage
    if (userId) {
      localStorage.removeItem(`onboarding_state_${userId}`);
      localStorage.removeItem(`tour_completed_${userId}`);
      localStorage.removeItem(`discovered_features_${userId}`);
    }
  }, [userId]);

  const getProgress = useCallback(() => {
    return state.progress;
  }, [state.progress]);

  const isStepCompleted = useCallback(
    (stepId: string) => {
      return state.completedSteps.has(stepId);
    },
    [state.completedSteps]
  );

  const isFeatureDiscovered = useCallback(
    (featureId: string) => {
      return state.discoveredFeatures.has(featureId);
    },
    [state.discoveredFeatures]
  );

  const contextValue: OnboardingContextType = {
    state,
    startOnboarding,
    completeStep,
    discoverFeature,
    completeTour,
    openHelpCenter,
    closeHelpCenter,
    resetOnboarding,
    getProgress,
    isStepCompleted,
    isFeatureDiscovered,
  };

  return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Progress tracking component
export function OnboardingProgress() {
  const { state, getProgress } = useOnboarding();
  const progress = getProgress();

  if (!state.isActive && progress === 0) return null;

  return (
    <div className='fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40'>
      <div className='flex items-center space-x-3'>
        <div className='flex-1'>
          <div className='text-sm font-medium text-gray-900 mb-1'>Getting Started</div>
          <div className='w-32 bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='text-xs text-gray-500 mt-1'>{progress}% complete</div>
        </div>
        <div className='text-2xl'>🎯</div>
      </div>
    </div>
  );
}

// Achievement system component
export function OnboardingAchievements() {
  const { state, isStepCompleted, isFeatureDiscovered } = useOnboarding();

  const achievements = [
    {
      id: 'tour-completed',
      title: 'Tour Guide',
      description: 'Completed the welcome tour',
      icon: '🎉',
      unlocked: state.tourCompleted,
    },
    {
      id: 'voice-rfq-discovered',
      title: 'Voice Master',
      description: 'Discovered Voice RFQ feature',
      icon: '🎤',
      unlocked: isFeatureDiscovered('voice-rfq-intro'),
    },
    {
      id: 'ai-search-discovered',
      title: 'AI Explorer',
      description: 'Tried AI-powered search',
      icon: '🤖',
      unlocked: isFeatureDiscovered('ai-search-intro'),
    },
    {
      id: 'categories-explored',
      title: 'Category Explorer',
      description: 'Explored supplier categories',
      icon: '📂',
      unlocked: isFeatureDiscovered('categories-explore'),
    },
    {
      id: 'dashboard-visited',
      title: 'Dashboard Pro',
      description: 'Visited your dashboard',
      icon: '📊',
      unlocked: isFeatureDiscovered('dashboard-overview'),
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  if (unlockedAchievements.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40 max-w-sm'>
      <div className='text-sm font-medium text-gray-900 mb-2'>Achievements Unlocked</div>
      <div className='space-y-2'>
        {unlockedAchievements.map(achievement => (
          <div key={achievement.id} className='flex items-center space-x-2'>
            <span className='text-lg'>{achievement.icon}</span>
            <div className='flex-1'>
              <div className='text-xs font-medium text-gray-900'>{achievement.title}</div>
              <div className='text-xs text-gray-500'>{achievement.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick help button
export function QuickHelpButton() {
  const { openHelpCenter } = useOnboarding();

  return (
    <button
      onClick={openHelpCenter}
      className='fixed bottom-4 left-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors z-40'
      title='Get Help'
    >
      <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    </button>
  );
}
