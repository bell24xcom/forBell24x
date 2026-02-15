'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics() {
  const { user, profile } = useAuth();

  useEffect(() => {
    // Google Analytics 4 Configuration
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

    // Load gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    // Configure GA4 with enhanced measurement
    gtag('config', GA_MEASUREMENT_ID, {
      // Enhanced measurement settings
      'page_title': document.title,
      'page_location': window.location.href,
      'send_page_view': true,
      'anonymize_ip': true,
      
      // Custom dimensions for user profiles
      'custom_map': {
        'user_id': 'user_id',
        'company_name': 'company_name',
        'user_role': 'user_role',
        'business_category': 'business_category',
        'user_location': 'user_location'
      },
      
      // User profile data injection
      'user_id': user?.id || 'anonymous',
      'company_name': profile?.company_name || 'unknown',
      'user_role': profile?.role || 'visitor',
      'business_category': profile?.business_category || 'general',
      'user_location': `${profile?.city || 'unknown'}, ${profile?.state || 'unknown'}`,
      
      // Enhanced measurement events
      'scroll_depth': true,
      'outbound_links': true,
      'site_search': true,
      'video_engagement': true,
      'file_downloads': true,
      'form_interactions': true,
      
      // E-commerce tracking
      'ecommerce': {
        'currency': 'INR',
        'country': 'IN'
      }
    });

    // Track user profile views as events
    if (user?.id && profile?.company_name) {
      gtag('event', 'user_profile_view', {
        'user_id': user.id,
        'company_name': profile.company_name,
        'user_role': profile.role,
        'business_category': profile.business_category,
        'event_category': 'engagement',
        'event_label': 'profile_view'
      });
    }

    // Track page views with enhanced data
    gtag('event', 'page_view', {
      'page_title': document.title,
      'page_location': window.location.href,
      'user_id': user?.id || 'anonymous',
      'company_name': profile?.company_name || 'unknown',
      'user_role': profile?.role || 'visitor'
    });

    // Track custom events for B2B marketplace
    const trackCustomEvent = (eventName: string, parameters: any = {}) => {
      gtag('event', eventName, {
        ...parameters,
        'user_id': user?.id || 'anonymous',
        'company_name': profile?.company_name || 'unknown',
        'user_role': profile?.role || 'visitor',
        'event_category': 'b2b_marketplace'
      });
    };

    // Track RFQ creation
    const trackRFQCreation = () => {
      trackCustomEvent('rfq_created', {
        'event_label': 'rfq_creation',
        'value': 1
      });
    };

    // Track supplier registration
    const trackSupplierRegistration = () => {
      trackCustomEvent('supplier_registered', {
        'event_label': 'supplier_registration',
        'value': 1
      });
    };

    // Track product searches
    const trackProductSearch = (searchTerm: string) => {
      trackCustomEvent('product_search', {
        'search_term': searchTerm,
        'event_label': 'product_search'
      });
    };

    // Track AI feature usage
    const trackAIFeature = (featureName: string) => {
      trackCustomEvent('ai_feature_used', {
        'feature_name': featureName,
        'event_label': 'ai_feature'
      });
    };

    // Make tracking functions globally available
    (window as any).trackRFQCreation = trackRFQCreation;
    (window as any).trackSupplierRegistration = trackSupplierRegistration;
    (window as any).trackProductSearch = trackProductSearch;
    (window as any).trackAIFeature = trackAIFeature;

    // Track scroll depth
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          gtag('event', 'scroll_depth', {
            'scroll_percentage': maxScroll,
            'user_id': user?.id || 'anonymous',
            'event_category': 'engagement'
          });
        }
      }
    };

    // Track outbound clicks
    const trackOutboundClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        gtag('event', 'click', {
          'event_category': 'outbound',
          'event_label': link.href,
          'transport_type': 'beacon',
          'user_id': user?.id || 'anonymous'
        });
      }
    };

    // Add event listeners
    window.addEventListener('scroll', trackScrollDepth);
    document.addEventListener('click', trackOutboundClicks);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      document.removeEventListener('click', trackOutboundClicks);
    };
  }, [user, profile]);

  return null; // This component doesn't render anything
} 
