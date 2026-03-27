'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  countryCode?: string;
}

interface GeolocationContextType {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const requestLocation = async (): Promise<void> => {
    if (!isClient || typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Mock city/country data - in production, you'd use a reverse geocoding service
      const locationData: Location = {
        latitude,
        longitude,
        accuracy,
        city: 'Mumbai',
        country: 'India',
        countryCode: 'IN',
      };

      setLocation(locationData);
    } catch (err) {
      const error = err as GeolocationPositionError;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('User denied the request for Geolocation');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information is unavailable');
          break;
        case error.TIMEOUT:
          setError('The request to get user location timed out');
          break;
        default:
          setError('An unknown error occurred');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  const contextValue = {
    location: isClient ? location : null,
    isLoading: isClient ? isLoading : false,
    error: isClient ? error : null,
    requestLocation,
    clearLocation,
  };

  return <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>;
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
}
