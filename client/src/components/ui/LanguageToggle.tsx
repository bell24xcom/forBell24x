'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

interface LanguageToggleProps {
  currentLocale?: string;
}

export default function LanguageToggle({ currentLocale = 'en' }: LanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (locale: string) => {
    // In a real implementation, this would change the locale
    // For now, we'll just log the change
    console.log(`Language changed to: ${locale}`);
    setIsOpen(false);
    
    // Reload the page with new locale
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(en|hi)/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="relative">
      <Button
        variant="outlined"
        startIcon={<LanguageIcon />}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`${
                  currentLocale === language.code
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-700 hover:bg-gray-100'
                } flex items-center w-full px-4 py-2 text-sm`}
              >
                <span className="mr-2">{language.flag}</span>
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
