'use client';

import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { gdprConsent, COOKIE_CATEGORIES, CookieCategory } from '@/lib/gdpr-cookie-consent';

interface CookieConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onCustomize?: () => void;
}

export default function CookieConsentBanner({
  onAccept,
  onDecline,
  onCustomize,
}: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Check if consent has been given
    if (!gdprConsent.hasConsent()) {
      setIsVisible(true);
      // Initialize preferences with default values
      const defaultPreferences = COOKIE_CATEGORIES.reduce((acc, category) => {
        acc[category.id] = category.essential;
        return acc;
      }, {} as Record<string, boolean>);
      setPreferences(defaultPreferences);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allPreferences = COOKIE_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>);

    await gdprConsent.setConsent(allPreferences);
    setIsVisible(false);
    onAccept?.();
  };

  const handleDeclineAll = async () => {
    const essentialOnly = COOKIE_CATEGORIES.reduce((acc, category) => {
      acc[category.id] = category.essential;
      return acc;
    }, {} as Record<string, boolean>);

    await gdprConsent.setConsent(essentialOnly);
    setIsVisible(false);
    onDecline?.();
  };

  const handleCustomize = () => {
    setShowDetails(true);
    onCustomize?.();
  };

  const handleSavePreferences = async () => {
    await gdprConsent.setConsent(preferences);
    setIsVisible(false);
    setShowDetails(false);
  };

  const toggleCategory = (categoryId: string) => {
    const category = COOKIE_CATEGORIES.find(c => c.id === categoryId);
    if (category?.essential) return; // Can't toggle essential cookies

    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center'>
                <Cookie className='h-6 w-6 text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>Cookie Preferences</h2>
                <p className='text-blue-100 text-sm'>We value your privacy and data protection</p>
              </div>
            </div>
            <button
              onClick={handleDeclineAll}
              className='text-white/70 hover:text-white transition-colors'
            >
              <span>❌</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
          {!showDetails ? (
            /* Simple Banner */
            <div className='space-y-6'>
              <div className='flex items-start space-x-4'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span>🛡️</span>
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    We use cookies to enhance your experience
                  </h3>
                  <p className='text-gray-600 leading-relaxed'>
                    Bell24H uses cookies and similar technologies to provide you with a better,
                    safer, and faster experience. Some cookies are essential for our platform to
                    work, while others help us improve your experience by providing insights into
                    how the site is being used.
                  </p>
                </div>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center space-x-2 mb-2'>
                  <Info className='h-5 w-5 text-blue-600' />
                  <span className='font-medium text-blue-900'>Your Privacy Rights</span>
                </div>
                <p className='text-blue-800 text-sm'>
                  You can choose which cookies to accept. Essential cookies are always enabled to
                  ensure basic functionality. You can change your preferences anytime in your
                  account settings.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-medium text-gray-900 mb-2'>Essential Cookies</h4>
                  <p className='text-sm text-gray-600'>Required for basic functionality</p>
                  <div className='mt-2 flex items-center space-x-2'>
                    <span>✅</span>
                    <span className='text-sm text-green-700'>Always enabled</span>
                  </div>
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-medium text-gray-900 mb-2'>Optional Cookies</h4>
                  <p className='text-sm text-gray-600'>Analytics, marketing, and personalization</p>
                  <div className='mt-2 text-sm text-gray-600'>Choose what to enable</div>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed Settings */
            <div className='space-y-6'>
              <div className='text-center border-b border-gray-200 pb-6'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  Customize Your Cookie Preferences
                </h3>
                <p className='text-gray-600'>
                  Choose which types of cookies you want to accept. You can change these settings at
                  any time.
                </p>
              </div>

              <div className='space-y-4'>
                {COOKIE_CATEGORIES.map(category => (
                  <div
                    key={category.id}
                    className='border border-gray-200 rounded-lg overflow-hidden'
                  >
                    <div className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3 flex-1'>
                          <button
                            onClick={() => toggleCategory(category.id)}
                            disabled={category.essential}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[category.id] ? 'bg-blue-600' : 'bg-gray-200'
                            } ${
                              category.essential
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[category.id] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2'>
                              <h4 className='font-medium text-gray-900'>{category.name}</h4>
                              {category.essential && (
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                  Essential
                                </span>
                              )}
                            </div>
                            <p className='text-sm text-gray-600 mt-1'>{category.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCategoryExpanded(category.id)}
                          className='text-gray-400 hover:text-gray-600 ml-4'
                        >
                          {expandedCategories.includes(category.id) ? (
                            <ChevronUp className='h-5 w-5' />
                          ) : (
                            <ChevronDown className='h-5 w-5' />
                          )}
                        </button>
                      </div>

                      {expandedCategories.includes(category.id) && (
                        <div className='mt-4 pt-4 border-t border-gray-100'>
                          <h5 className='font-medium text-gray-900 mb-3'>
                            Cookies in this category:
                          </h5>
                          <div className='space-y-3'>
                            {category.cookies.map(cookie => (
                              <div key={cookie.name} className='bg-gray-50 rounded-lg p-3'>
                                <div className='flex items-center justify-between mb-2'>
                                  <span className='font-medium text-gray-900'>{cookie.name}</span>
                                  <span className='text-sm text-gray-500'>{cookie.provider}</span>
                                </div>
                                <p className='text-sm text-gray-600 mb-1'>{cookie.purpose}</p>
                                <div className='flex items-center space-x-4 text-xs text-gray-500'>
                                  <span>Duration: {cookie.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center space-x-2 mb-2'>
                  <Info className='h-5 w-5 text-yellow-600' />
                  <span className='font-medium text-yellow-900'>Cookie Policy</span>
                </div>
                <p className='text-yellow-800 text-sm mb-2'>
                  For detailed information about how we use cookies and your rights, please read our
                  Cookie Policy.
                </p>
                <a
                  href='/privacy-policy#cookies'
                  className='inline-flex items-center space-x-1 text-sm text-yellow-700 hover:text-yellow-800 font-medium'
                >
                  <span>Read Cookie Policy</span>
                  <span>🔗</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-gray-200 p-6 bg-gray-50'>
          {!showDetails ? (
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
              <button
                onClick={handleAcceptAll}
                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'
              >
                <span>✅</span>
                <span>Accept All Cookies</span>
              </button>
              <button
                onClick={handleDeclineAll}
                className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors'
              >
                Essential Only
              </button>
              <button
                onClick={handleCustomize}
                className='flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'
              >
                <span>⚙️</span>
                <span>Customize</span>
              </button>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
              <button
                onClick={handleSavePreferences}
                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2'
              >
                <span>✅</span>
                <span>Save Preferences</span>
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors'
              >
                Back to Simple View
              </button>
            </div>
          )}

          <div className='mt-4 text-center'>
            <p className='text-xs text-gray-500'>
              By continuing to use Bell24H, you agree to our use of cookies as described in our{' '}
              <a href='/privacy-policy' className='text-blue-600 hover:text-blue-700 underline'>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cookie preferences management component for settings page
export function CookiePreferencesManager() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentPreferences = gdprConsent.getConsent();
        setPreferences(currentPreferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await gdprConsent.setConsent(preferences);
      // Show success message
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdrawConsent = async () => {
    if (
      window.confirm(
        'Are you sure you want to withdraw all cookie consent? This will reset all cookies except essential ones.'
      )
    ) {
      try {
        await gdprConsent.withdrawConsent();
        setPreferences(gdprConsent.getConsent());
      } catch (error) {
        console.error('Error withdrawing consent:', error);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    const category = COOKIE_CATEGORIES.find(c => c.id === categoryId);
    if (category?.essential) return;

    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-12 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-semibold text-gray-900'>Cookie Preferences</h3>
        <button
          onClick={handleWithdrawConsent}
          className='text-red-600 hover:text-red-700 text-sm font-medium'
        >
          Withdraw All Consent
        </button>
      </div>

      <div className='space-y-4 mb-6'>
        {COOKIE_CATEGORIES.map(category => (
          <div
            key={category.id}
            className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
          >
            <div className='flex-1'>
              <div className='flex items-center space-x-2'>
                <h4 className='font-medium text-gray-900'>{category.name}</h4>
                {category.essential && (
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Essential
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-600 mt-1'>{category.description}</p>
            </div>
            <button
              onClick={() => toggleCategory(category.id)}
              disabled={category.essential}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences[category.id] ? 'bg-blue-600' : 'bg-gray-200'
              } ${category.essential ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[category.id] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className='flex justify-end'>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'
        >
          {isSaving ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Save Preferences</span>
            </>
          )}
=======

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
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        </button>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
