import posthog from 'posthog-js';

// Initialize PostHog if API key is available
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_API_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true,
    persistence: 'localStorage',
    loaded: posthog => {
      if (process.env.NODE_ENV === 'development') {
        // Log to console in development
        posthog.debug();
      }
    },
  });
}

/**
 * Track an event with optional properties
 * @param eventName Name of the event to track
 * @param properties Optional properties to include with the event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    try {
      posthog.capture(eventName, properties);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] Event tracked: ${eventName}`, properties);
      }

      // Also add Google Analytics tracking if configured
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, properties);
      }
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  }
}

/**
 * Track a user property
 * @param propertyName Name of the property to set
 * @param value Value to set for the property
 */
export function setUserProperty(propertyName: string, value: any) {
  if (typeof window !== 'undefined') {
    try {
      posthog.people.set({ [propertyName]: value });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] User property set: ${propertyName}=${value}`);
      }
    } catch (err) {
      console.error('Error setting user property:', err);
    }
  }
}

/**
 * Identify a user with a unique ID and optional properties
 * @param userId Unique identifier for the user
 * @param properties Optional properties to set for the user
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    try {
      posthog.identify(userId, properties);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] User identified: ${userId}`, properties);
      }
    } catch (err) {
      console.error('Error identifying user:', err);
    }
  }
}

/**
 * Log blockchain-specific events with standardized properties
 * @param action The blockchain action (create, approve, reject, etc.)
 * @param contractType The type of contract (milestone, escrow, etc.)
 * @param details Additional details about the transaction
 */
export function trackBlockchainEvent(
  action:
    | 'create'
    | 'start'
    | 'complete'
    | 'approve'
    | 'reject'
    | 'dispute'
    | 'resolve'
    | 'finance',
  contractType: 'milestone' | 'escrow' | 'credential',
  details: {
    contractId?: string;
    milestoneId?: string;
    amount?: number;
    walletAddress?: string;
    transactionHash?: string;
    networkId?: string;
    successful?: boolean;
    errorMessage?: string;
    provider?: string;
  }
) {
  const eventName = `blockchain_${contractType}_${action}`;

  trackEvent(eventName, {
    ...details,
    timestamp: new Date().toISOString(),
    network: details.networkId || 'polygon',
    success: details.successful !== false, // Default to true if not specified
  });
}

// Export a dummy instance for server-side code
export const analyticsInstance = typeof window !== 'undefined' ? posthog : null;

// Add TypeScript definitions for Google Analytics
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}
