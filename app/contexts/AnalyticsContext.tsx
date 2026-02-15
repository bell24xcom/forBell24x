'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (page: string) => void;
  trackUserAction: (action: string, category: string, label?: string) => void;
  isEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check if analytics cookies are enabled only on client-side
    if (typeof window !== 'undefined') {
      const checkAnalyticsConsent = () => {
        try {
          // For now, enable by default - in production this would check GDPR consent
          setIsEnabled(true);
        } catch (error) {
          console.error('Error checking analytics consent:', error);
          setIsEnabled(false);
        }
      };

      checkAnalyticsConsent();

      // Listen for consent changes
      const handleConsentChange = (event: CustomEvent) => {
        try {
          const enabled = event.detail?.preferences?.analytics || false;
          setIsEnabled(enabled);
        } catch (error) {
          console.error('Error handling consent change:', error);
        }
      };

      window.addEventListener('gdprConsentChange', handleConsentChange as EventListener);

      return () => {
        window.removeEventListener('gdprConsentChange', handleConsentChange as EventListener);
      };
    }
  }, []);

  const trackEvent = (event: AnalyticsEvent) => {
    if (!isClient || !isEnabled) return;

    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
        });
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    }

    // Track internally (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  };

  const trackPageView = (page: string) => {
    if (!isClient || !isEnabled) return;

    if (typeof window !== 'undefined' && (window as any).gtag && process.env.NEXT_PUBLIC_GA_ID) {
      try {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: page,
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Page View:', page);
    }
  };

  const trackUserAction = (action: string, category: string, label?: string) => {
    trackEvent({
      event: 'user_action',
      category,
      action,
      label,
      timestamp: new Date(),
    });
  };

  const contextValue = {
    trackEvent,
    trackPageView,
    trackUserAction,
    isEnabled: isClient ? isEnabled : false,
  };

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
