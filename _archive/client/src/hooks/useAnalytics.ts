import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyticsEvent {
  event: string;
  page: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  metadata?: any;
}

export function useAnalytics() {
  const router = useRouter();

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    let sessionId = localStorage.getItem('analytics-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics-session-id', sessionId);
    }
    return sessionId;
  }, []);

  // Get user ID from localStorage
  const getUserId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user-data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.email;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return null;
  }, []);

  // Track an analytics event
  const trackEvent = useCallback(async (event: string, metadata?: any) => {
    try {
      const sessionId = getSessionId();
      const userId = getUserId();
      const currentPage = window.location.pathname;

      const analyticsEvent: AnalyticsEvent = {
        event,
        page: currentPage,
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Send to analytics API
      await fetch('/api/analytics/traffic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      });

      // Also send to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, {
          page_title: document.title,
          page_location: window.location.href,
          ...metadata
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [getSessionId, getUserId]);

  // Track page view
  const trackPageView = useCallback(async () => {
    await trackEvent('page_view');
  }, [trackEvent]);

  // Track user interaction
  const trackInteraction = useCallback(async (action: string, element: string, metadata?: any) => {
    await trackEvent('user_interaction', {
      action,
      element,
      ...metadata
    });
  }, [trackEvent]);

  // Track conversion event
  const trackConversion = useCallback(async (conversionType: string, value?: number, metadata?: any) => {
    await trackEvent('conversion', {
      conversionType,
      value,
      ...metadata
    });
  }, [trackEvent]);

  // Track form submission
  const trackFormSubmission = useCallback(async (formName: string, success: boolean, metadata?: any) => {
    await trackEvent('form_submission', {
      formName,
      success,
      ...metadata
    });
  }, [trackEvent]);

  // Track search
  const trackSearch = useCallback(async (query: string, resultsCount: number, metadata?: any) => {
    await trackEvent('search', {
      query,
      resultsCount,
      ...metadata
    });
  }, [trackEvent]);

  // Track error
  const trackError = useCallback(async (errorType: string, errorMessage: string, metadata?: any) => {
    await trackEvent('error', {
      errorType,
      errorMessage,
      ...metadata
    });
  }, [trackEvent]);

  // Auto-track page views on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        trackPageView();
      }, 100);
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageView]);

  // Auto-track common user interactions
  useEffect(() => {
    const trackClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className || '';
      const id = target.id || '';
      const text = target.textContent?.trim().substring(0, 50) || '';

      // Track button clicks
      if (tagName === 'button' || className.includes('btn') || className.includes('button')) {
        trackInteraction('click', 'button', {
          text,
          className,
          id
        });
      }

      // Track link clicks
      if (tagName === 'a') {
        trackInteraction('click', 'link', {
          href: (target as HTMLAnchorElement).href,
          text,
          className,
          id
        });
      }

      // Track form interactions
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
        trackInteraction('interact', 'form_field', {
          type: (target as HTMLInputElement).type || tagName,
          name: (target as HTMLInputElement).name || '',
          className,
          id
        });
      }
    };

    // Track form submissions
    const trackFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.name || form.id || 'unknown_form';
      trackFormSubmission(formName, true, {
        action: form.action,
        method: form.method
      });
    };

    // Add event listeners
    document.addEventListener('click', trackClick);
    document.addEventListener('submit', trackFormSubmit);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('submit', trackFormSubmit);
    };
  }, [trackInteraction, trackFormSubmission]);

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackConversion,
    trackFormSubmission,
    trackSearch,
    trackError,
    getSessionId,
    getUserId
  };
}

// Hook for tracking specific user actions
export function useTrackUserAction() {
  const { trackEvent } = useAnalytics();

  const trackLogin = useCallback(async (method: string = 'email') => {
    await trackEvent('login', { method });
  }, [trackEvent]);

  const trackRegistration = useCallback(async (method: string = 'email') => {
    await trackEvent('registration', { method });
  }, [trackEvent]);

  const trackRFQCreation = useCallback(async (category: string, budget?: number) => {
    await trackEvent('rfq_created', { category, budget });
  }, [trackEvent]);

  const trackQuoteSubmission = useCallback(async (rfqId: string, amount: number) => {
    await trackEvent('quote_submitted', { rfqId, amount });
  }, [trackEvent]);

  const trackPurchase = useCallback(async (amount: number, currency: string = 'INR') => {
    await trackEvent('purchase', { amount, currency });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback(async (feature: string, metadata?: any) => {
    await trackEvent('feature_used', { feature, ...metadata });
  }, [trackEvent]);

  return {
    trackLogin,
    trackRegistration,
    trackRFQCreation,
    trackQuoteSubmission,
    trackPurchase,
    trackFeatureUsage
  };
} 
