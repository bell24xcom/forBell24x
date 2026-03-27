'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check for saved theme only on client-side
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('bell24h_theme') as 'light' | 'dark';
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document only on client-side
    if (isClient && typeof window !== 'undefined') {
      try {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('bell24h_theme', theme);
      } catch (error) {
        console.error('Error applying theme:', error);
      }
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const contextValue = {
    theme: isClient ? theme : 'light',
    toggleTheme,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
