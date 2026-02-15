import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TrafficAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  averageDuration: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; visits: number }>;
  hourlyTraffic: Array<{ hour: number; visits: number }>;
  activeUsers: number;
  conversionFunnel: Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>;
}

interface UseTrafficAnalyticsReturn {
  analytics: TrafficAnalytics | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => void;
  trackEvent: (action: string, metadata?: Record<string, any>) => void;
}

// Generate unique session ID
const generateSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('bell24h_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('bell24h_session_id', sessionId);
    }
    return sessionId;
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useTrafficAnalytics = (timeframe: string = '24h'): UseTrafficAnalyticsReturn => {
  const [analytics, setAnalytics] = useState<TrafficAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const { data: session } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const pageStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>(generateSessionId());

  // Track page views automatically
  useEffect(() => {
    const trackPageView = async () => {
      pageStartTime.current = Date.now();

      try {
        await fetch('/api/analytics/traffic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId.current,
            page: pathname,
            action: 'page_view',
            metadata: {
              userAgent: navigator.userAgent,
              screenResolution: `${screen.width}x${screen.height}`,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          }),
        });
      } catch (err) {
        console.error('Failed to track page view:', err);
      }
    };

    trackPageView();
  }, [pathname]);

  // Track page duration on unload
  useEffect(() => {
    const trackPageDuration = async () => {
      const duration = Date.now() - pageStartTime.current;

      try {
        await fetch('/api/analytics/traffic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId.current,
            page: pathname,
            action: 'page_exit',
            duration: duration,
            metadata: {
              timeOnPage: duration,
            },
          }),
        });
      } catch (err) {
        console.error('Failed to track page duration:', err);
      }
    };

    const handleBeforeUnload = () => {
      trackPageDuration();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackPageDuration();
      } else if (document.visibilityState === 'visible') {
        pageStartTime.current = Date.now();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackPageDuration();
    };
  }, [pathname]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    // Temporarily removing session requirement for testing
    // if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/traffic?timeframe=${timeframe}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Track custom events
  const trackEvent = async (action: string, metadata?: Record<string, any>) => {
    try {
      await fetch('/api/analytics/traffic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          page: pathname,
          action,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  };

  // Refresh analytics data
  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  // Fetch analytics on mount and timeframe change
  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]); // Temporarily removed session dependency

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        // Temporarily removed session requirement
        fetchAnalytics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]); // Temporarily removed session dependency

  return {
    analytics,
    loading,
    error,
    refreshAnalytics,
    trackEvent,
  };
};

// Utility hook for tracking specific user actions
export const useEventTracking = () => {
  const { trackEvent } = useTrafficAnalytics();

  const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent('button_click', { buttonName, location });
  };

  const trackFeatureUsage = (featureName: string, action: string) => {
    trackEvent('feature_used', { featureName, action });
  };

  const trackFormSubmission = (formName: string, success: boolean) => {
    trackEvent('form_submission', { formName, success });
  };

  const trackFileUpload = (fileType: string, fileSize: number) => {
    trackEvent('file_upload', { fileType, fileSize });
  };

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent('search', { searchTerm, resultsCount });
  };

  const trackConversion = (conversionType: string, value?: number) => {
    trackEvent('conversion', { conversionType, value });
  };

  return {
    trackButtonClick,
    trackFeatureUsage,
    trackFormSubmission,
    trackFileUpload,
    trackSearch,
    trackConversion,
  };
};
