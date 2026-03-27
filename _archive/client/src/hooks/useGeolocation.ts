'use client';

import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  region: string;
  city: string;
  continent: string;
  countryCode: string;
}

interface PersonalizedContent {
  headline: string;
  subheadline: string;
  marketMessage: string;
  localStats: {
    suppliers: string;
    volume: string;
    growth: string;
  };
}

const REGION_CONTENT: Record<string, PersonalizedContent> = {
  Asia: {
    headline: "Asia's B2B Operating System",
    subheadline: "Powering procurement across the world's fastest-growing economies",
    marketMessage: 'Join 50,000+ Asian enterprises scaling with Bell24H',
    localStats: {
      suppliers: '300K+',
      volume: '₹150Cr+',
      growth: '340%',
    },
  },
  India: {
    headline: "India's Premier B2B Operating System",
    subheadline: "Trusted by Tata, Reliance, and India's industrial giants",
    marketMessage: "Leading India's digital procurement revolution",
    localStats: {
      suppliers: '534K+',
      volume: '₹100Cr+',
      growth: '280%',
    },
  },
  Europe: {
    headline: "Europe's Trusted B2B Platform",
    subheadline: 'Connecting European enterprises with verified global suppliers',
    marketMessage: 'GDPR-compliant, enterprise-grade procurement',
    localStats: {
      suppliers: '180K+',
      volume: '€85M+',
      growth: '195%',
    },
  },
  'North America': {
    headline: "North America's B2B Innovation Hub",
    subheadline: 'AI-powered procurement for Fortune 500 companies',
    marketMessage: 'Scaling American businesses with global reach',
    localStats: {
      suppliers: '220K+',
      volume: '$120M+',
      growth: '225%',
    },
  },
  'Middle East': {
    headline: "Middle East's Digital Procurement Leader",
    subheadline: 'Connecting MENA region with global supply chains',
    marketMessage: 'Powering Vision 2030 with smart procurement',
    localStats: {
      suppliers: '95K+',
      volume: 'AED 450M+',
      growth: '320%',
    },
  },
  Africa: {
    headline: "Africa's B2B Growth Engine",
    subheadline: 'Accelerating African economies through smart procurement',
    marketMessage: "Building Africa's digital trade infrastructure",
    localStats: {
      suppliers: '75K+',
      volume: '$65M+',
      growth: '420%',
    },
  },
  Global: {
    headline: 'The Global B2B Operating System',
    subheadline: 'AI-powered procurement, trusted worldwide',
    marketMessage: 'Connecting enterprises across 150+ countries',
    localStats: {
      suppliers: '534K+',
      volume: '₹100Cr+',
      growth: '280%',
    },
  },
};

const CITY_SPECIFIC: Record<string, Partial<PersonalizedContent>> = {
  Mumbai: {
    headline: "Mumbai's Premier B2B Hub",
    marketMessage: "Powering Maharashtra's ₹32 Lakh Crore economy",
  },
  Delhi: {
    headline: "Delhi NCR's B2B Powerhouse",
    marketMessage: "Connecting the capital's industrial corridor",
  },
  Bangalore: {
    headline: "Bangalore's Innovation Platform",
    marketMessage: "Where India's tech meets global trade",
  },
  Shanghai: {
    headline: "Shanghai's Global Trade Gateway",
    marketMessage: "Connecting China's manufacturing hub worldwide",
  },
  Singapore: {
    headline: "Singapore's Enterprise Hub",
    marketMessage: "Southeast Asia's procurement command center",
  },
  Dubai: {
    headline: "Dubai's Global Business Platform",
    marketMessage: "Your gateway to MENA's $3.2 trillion market",
  },
  London: {
    headline: "London's B2B Innovation Center",
    marketMessage: 'European headquarters for global procurement',
  },
  'New York': {
    headline: "New York's Enterprise Platform",
    marketMessage: "Wall Street's trusted procurement partner",
  },
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent>(
    REGION_CONTENT['Global']
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try IP-based geolocation first (more reliable for international users)
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const locationData: LocationData = {
            country: data.country_name || 'Unknown',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            continent: data.continent_code || 'Unknown',
            countryCode: data.country_code || 'Unknown',
          };

          setLocation(locationData);
          updatePersonalizedContent(locationData);
        } else {
          // Fallback to browser geolocation
          await tryBrowserGeolocation();
        }
      } catch (err) {
        console.log('IP geolocation failed, trying browser geolocation');
        await tryBrowserGeolocation();
      } finally {
        setIsLoading(false);
      }
    };

    const tryBrowserGeolocation = async () => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async position => {
          try {
            // Reverse geocoding (you might want to use a service like OpenCage or Google)
            const { latitude, longitude } = position.coords;

            // For demo purposes, we'll estimate based on coordinates
            const estimatedLocation = estimateLocationFromCoords(latitude, longitude);
            setLocation(estimatedLocation);
            updatePersonalizedContent(estimatedLocation);
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
            setError('Location detection failed');
          }
        },
        err => {
          console.error('Browser geolocation failed:', err);
          setError('Location access denied');
        },
        { timeout: 10000, maximumAge: 300000 } // 5 minutes cache
      );
    };

    detectLocation();
  }, []);

  const estimateLocationFromCoords = (lat: number, lon: number): LocationData => {
    // Simple coordinate-based region detection
    if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {
      return {
        country: 'India',
        region: 'South Asia',
        city: 'India',
        continent: 'Asia',
        countryCode: 'IN',
      };
    } else if (lat >= -10 && lat <= 55 && lon >= 60 && lon <= 180) {
      return {
        country: 'Asia',
        region: 'Asia',
        city: 'Asia',
        continent: 'Asia',
        countryCode: 'AS',
      };
    } else if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
      return {
        country: 'Europe',
        region: 'Europe',
        city: 'Europe',
        continent: 'Europe',
        countryCode: 'EU',
      };
    } else if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -60) {
      return {
        country: 'United States',
        region: 'North America',
        city: 'North America',
        continent: 'North America',
        countryCode: 'US',
      };
    }

    return {
      country: 'Global',
      region: 'Global',
      city: 'Global',
      continent: 'Global',
      countryCode: 'GL',
    };
  };

  const updatePersonalizedContent = (locationData: LocationData) => {
    // Priority: City-specific > Country-specific > Region-specific > Global
    let content = REGION_CONTENT['Global'];

    // Check city-specific content
    if (CITY_SPECIFIC[locationData.city]) {
      content = {
        ...content,
        ...CITY_SPECIFIC[locationData.city],
      };
    }
    // Check country-specific content
    else if (REGION_CONTENT[locationData.country]) {
      content = REGION_CONTENT[locationData.country];
    }
    // Check region/continent-specific content
    else if (REGION_CONTENT[locationData.continent]) {
      content = REGION_CONTENT[locationData.continent];
    }

    setPersonalizedContent(content);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getLocalCurrency = () => {
    if (!location) return '₹';

    const currencyMap: Record<string, string> = {
      IN: '₹',
      US: '$',
      EU: '€',
      GB: '£',
      AE: 'AED',
      SG: 'S$',
      CN: '¥',
      JP: '¥',
    };

    return currencyMap[location.countryCode] || '₹';
  };

  const getLocalDateFormat = () => {
    if (!location) return 'en-IN';

    const localeMap: Record<string, string> = {
      IN: 'en-IN',
      US: 'en-US',
      GB: 'en-GB',
      DE: 'de-DE',
      FR: 'fr-FR',
      CN: 'zh-CN',
      JP: 'ja-JP',
    };

    return localeMap[location.countryCode] || 'en-IN';
  };

  return {
    location,
    personalizedContent,
    isLoading,
    error,
    getTimeBasedGreeting,
    getLocalCurrency,
    getLocalDateFormat,
  };
};
