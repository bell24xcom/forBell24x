'use client';

import React, { useState, useEffect } from 'react';

export function CookiePreferencesManager() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  const savePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
  };

  return {
    preferences,
    setPreferences,
    savePreferences
  };
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <button
          onClick={acceptCookies}
          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

