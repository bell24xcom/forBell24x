'use client';

import { useState, useEffect } from 'react';

type Direction = 'ltr' | 'rtl';

// Languages that use RTL direction
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Hook to manage RTL (Right-to-Left) direction for multilanguage support
 * Supports Arabic, Hebrew, Farsi, and Urdu
 */
export function useRTL() {
  const [direction, setDirection] = useState<Direction>('ltr');
  const [language, setLanguage] = useState<string>('en');

  // Set direction based on language
  useEffect(() => {
    // Check if browser language is available
    const browserLang = navigator.language.split('-')[0];
    const isRTL = RTL_LANGUAGES.includes(browserLang);

    setLanguage(browserLang);
    setDirection(isRTL ? 'rtl' : 'ltr');

    // Apply direction to document
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = browserLang;

    // Add RTL class to body if needed for specific styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, []);

  // Function to manually switch direction
  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.body.classList.toggle('rtl');
  };

  // Function to manually switch language
  const changeLanguage = (lang: string) => {
    const isRTL = RTL_LANGUAGES.includes(lang);
    setLanguage(lang);
    setDirection(isRTL ? 'rtl' : 'ltr');
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  };

  return {
    direction,
    language,
    isRTL: direction === 'rtl',
    toggleDirection,
    changeLanguage,
  };
}
