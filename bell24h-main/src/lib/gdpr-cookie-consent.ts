/**
 * Bell24H GDPR Cookie Consent Management System
 *
 * Comprehensive cookie management with granular controls
 * Full GDPR compliance with consent tracking and withdrawal
 */

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  essential: boolean;
  enabled: boolean;
  cookies: CookieInfo[];
}

export interface CookieInfo {
  name: string;
  purpose: string;
  duration: string;
  provider: string;
  category: string;
}

export interface ConsentRecord {
  userId?: string;
  sessionId: string;
  timestamp: Date;
  consent: Record<string, boolean>;
  ipAddress: string;
  userAgent: string;
  version: string;
}

// Cookie categories configuration
export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description:
      'These cookies are necessary for the website to function and cannot be switched off. They enable basic functions like page navigation and access to secure areas.',
    essential: true,
    enabled: true,
    cookies: [
      {
        name: 'bell24h_session',
        purpose: 'Maintains user session and authentication state',
        duration: '24 hours',
        provider: 'Bell24H',
        category: 'essential',
      },
      {
        name: 'bell24h_csrf',
        purpose: 'Prevents cross-site request forgery attacks',
        duration: 'Session',
        provider: 'Bell24H',
        category: 'essential',
      },
      {
        name: 'bell24h_consent',
        purpose: 'Stores your cookie consent preferences',
        duration: '1 year',
        provider: 'Bell24H',
        category: 'essential',
      },
    ],
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description:
      'These cookies enhance functionality and personalization, such as language preferences, region selection, and user interface customizations.',
    essential: false,
    enabled: false,
    cookies: [
      {
        name: 'bell24h_preferences',
        purpose: 'Stores user preferences like language, currency, and theme',
        duration: '6 months',
        provider: 'Bell24H',
        category: 'functional',
      },
      {
        name: 'bell24h_dashboard_layout',
        purpose: 'Remembers dashboard layout and customizations',
        duration: '3 months',
        provider: 'Bell24H',
        category: 'functional',
      },
      {
        name: 'bell24h_search_history',
        purpose: 'Stores recent search queries for improved experience',
        duration: '30 days',
        provider: 'Bell24H',
        category: 'functional',
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description:
      'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    essential: false,
    enabled: false,
    cookies: [
      {
        name: '_ga',
        purpose: 'Distinguishes unique users and sessions',
        duration: '2 years',
        provider: 'Google Analytics',
        category: 'analytics',
      },
      {
        name: '_gid',
        purpose: 'Distinguishes unique users over a 24-hour period',
        duration: '24 hours',
        provider: 'Google Analytics',
        category: 'analytics',
      },
      {
        name: 'bell24h_analytics',
        purpose: 'Tracks user behavior and platform usage patterns',
        duration: '1 year',
        provider: 'Bell24H',
        category: 'analytics',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description:
      'These cookies are used to make advertising messages more relevant to you and your interests.',
    essential: false,
    enabled: false,
    cookies: [
      {
        name: '_fbp',
        purpose: 'Tracks users across websites for advertising',
        duration: '3 months',
        provider: 'Facebook',
        category: 'marketing',
      },
      {
        name: '_linkedin_partner_id',
        purpose: 'Enables LinkedIn advertising and analytics',
        duration: '1 year',
        provider: 'LinkedIn',
        category: 'marketing',
      },
      {
        name: 'bell24h_marketing',
        purpose: 'Personalizes marketing content and recommendations',
        duration: '6 months',
        provider: 'Bell24H',
        category: 'marketing',
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance Cookies',
    description:
      'These cookies help us improve website performance by collecting information about how you use our site.',
    essential: false,
    enabled: false,
    cookies: [
      {
        name: 'bell24h_performance',
        purpose: 'Monitors page load times and performance metrics',
        duration: '30 days',
        provider: 'Bell24H',
        category: 'performance',
      },
      {
        name: '_hotjar',
        purpose: 'Records user interactions for usability analysis',
        duration: '1 year',
        provider: 'Hotjar',
        category: 'performance',
      },
    ],
  },
];

export class GDPRCookieConsent {
  private consentKey = 'bell24h_gdpr_consent';
  private consentVersion = '1.0';
  private apiEndpoint = '/api/gdpr/consent';

  /**
   * Check if user has given consent
   */
  hasConsent(): boolean {
    try {
      const consent = localStorage.getItem(this.consentKey);
      return consent !== null;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  /**
   * Get current consent preferences
   */
  getConsent(): Record<string, boolean> {
    try {
      const consent = localStorage.getItem(this.consentKey);
      if (!consent) return {};

      const parsed = JSON.parse(consent);
      return parsed.preferences || {};
    } catch (error) {
      console.error('Error getting consent:', error);
      return {};
    }
  }

  /**
   * Set consent preferences
   */
  async setConsent(preferences: Record<string, boolean>): Promise<void> {
    try {
      const consentRecord: ConsentRecord = {
        sessionId: this.generateSessionId(),
        timestamp: new Date(),
        consent: preferences,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        version: this.consentVersion,
      };

      // Store locally
      localStorage.setItem(
        this.consentKey,
        JSON.stringify({
          preferences,
          timestamp: consentRecord.timestamp,
          version: this.consentVersion,
        })
      );

      // Send to server for audit trail
      await this.recordConsent(consentRecord);

      // Apply cookie policies
      this.applyCookiePolicy(preferences);

      // Trigger consent change event
      this.triggerConsentChange(preferences);
    } catch (error) {
      console.error('Error setting consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw all consent
   */
  async withdrawConsent(): Promise<void> {
    try {
      // Clear all non-essential cookies
      await this.clearNonEssentialCookies();

      // Set all preferences to false except essential
      const preferences = COOKIE_CATEGORIES.reduce((acc, category) => {
        acc[category.id] = category.essential;
        return acc;
      }, {} as Record<string, boolean>);

      await this.setConsent(preferences);
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }

  /**
   * Get detailed cookie information
   */
  getCookieDetails(): CookieCategory[] {
    const consent = this.getConsent();
    return COOKIE_CATEGORIES.map(category => ({
      ...category,
      enabled: consent[category.id] || category.essential,
    }));
  }

  /**
   * Check if specific cookie category is enabled
   */
  isCategoryEnabled(categoryId: string): boolean {
    const consent = this.getConsent();
    const category = COOKIE_CATEGORIES.find(c => c.id === categoryId);
    return category?.essential || consent[categoryId] || false;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Record consent on server
   */
  private async recordConsent(record: ConsentRecord): Promise<void> {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
    } catch (error) {
      console.error('Error recording consent on server:', error);
    }
  }

  /**
   * Apply cookie policy based on consent
   */
  private applyCookiePolicy(preferences: Record<string, boolean>): void {
    // Clear cookies for disabled categories
    COOKIE_CATEGORIES.forEach(category => {
      if (!category.essential && !preferences[category.id]) {
        category.cookies.forEach(cookie => {
          this.deleteCookie(cookie.name);
        });
      }
    });

    // Initialize allowed cookies
    this.initializeAllowedCookies(preferences);
  }

  /**
   * Delete specific cookie
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  }

  /**
   * Clear all non-essential cookies
   */
  private async clearNonEssentialCookies(): Promise<void> {
    const allCookies = document.cookie.split(';');
    const essentialCookieNames = COOKIE_CATEGORIES.filter(cat => cat.essential).flatMap(cat =>
      cat.cookies.map(c => c.name)
    );

    allCookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (!essentialCookieNames.includes(cookieName)) {
        this.deleteCookie(cookieName);
      }
    });
  }

  /**
   * Initialize allowed cookies
   */
  private initializeAllowedCookies(preferences: Record<string, boolean>): void {
    // Initialize analytics if enabled
    if (preferences.analytics) {
      this.initializeGoogleAnalytics();
    }

    // Initialize marketing if enabled
    if (preferences.marketing) {
      this.initializeMarketingCookies();
    }

    // Initialize performance if enabled
    if (preferences.performance) {
      this.initializePerformanceCookies();
    }
  }

  /**
   * Initialize Google Analytics
   */
  private initializeGoogleAnalytics(): void {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag =
      window.gtag ||
      function () {
        ((window.gtag as any).q = (window.gtag as any).q || []).push(arguments);
      };
    window.gtag('js', new Date().toISOString());
    if (process.env.NEXT_PUBLIC_GA_ID) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID);
    }
  }

  /**
   * Initialize marketing cookies
   */
  private initializeMarketingCookies(): void {
    // Facebook Pixel
    if (process.env.NEXT_PUBLIC_FB_PIXEL_ID) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }

  /**
   * Initialize performance cookies
   */
  private initializePerformanceCookies(): void {
    // Hotjar
    if (process.env.NEXT_PUBLIC_HOTJAR_ID) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(script);
    }
  }

  /**
   * Trigger consent change event
   */
  private triggerConsentChange(preferences: Record<string, boolean>): void {
    const event = new CustomEvent('gdprConsentChange', {
      detail: { preferences },
    });
    window.dispatchEvent(event);
  }
}

// Global instance
export const gdprConsent = new GDPRCookieConsent();

// Utility functions
export const cookieUtils = {
  /**
   * Check if cookies are enabled
   */
  areCookiesEnabled(): boolean {
    try {
      document.cookie = 'test=1';
      const enabled = document.cookie.indexOf('test=1') !== -1;
      document.cookie = 'test=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      return enabled;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all cookies
   */
  getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  },

  /**
   * Get cookie by name
   */
  getCookie(name: string): string | null {
    const cookies = this.getAllCookies();
    return cookies[name] || null;
  },

  /**
   * Set cookie with options
   */
  setCookie(
    name: string,
    value: string,
    options: {
      expires?: Date;
      maxAge?: number;
      domain?: string;
      path?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
    } = {}
  ): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  },
};

// Type declarations for window
declare global {
  interface Window {
    fbq: any;
    hj: any;
  }
}
