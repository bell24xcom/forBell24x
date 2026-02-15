import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ar: 'العربية',
  hi: 'हिन्दी',
  ja: '日本語'
};

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  });

export class LanguageService {
  private static instance: LanguageService;
  private currentLanguage: string;

  private constructor() {
    this.currentLanguage = i18n.language || 'en';
  }

  public static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  // Get current language
  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get language name
  public getLanguageName(code: string): string {
    return SUPPORTED_LANGUAGES[code] || code;
  }

  // Change language
  public async changeLanguage(lang: string): Promise<void> {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
      await i18n.changeLanguage(lang);
      this.currentLanguage = lang;
      document.documentElement.lang = lang;
      localStorage.setItem('preferredLanguage', lang);
    }
  }

  // Get all supported languages
  public getSupportedLanguages(): Record<string, string> {
    return SUPPORTED_LANGUAGES;
  }

  // Translate text
  public translate(key: string, options?: any): string {
    return i18n.t(key, options);
  }

  // Format date
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  // Format number
  public formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
  }

  // Format currency
  public formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  }

  // Get text direction
  public getTextDirection(): 'ltr' | 'rtl' {
    return ['ar'].includes(this.currentLanguage) ? 'rtl' : 'ltr';
  }

  // Load language resources
  public async loadLanguageResources(lang: string): Promise<void> {
    try {
      await i18n.loadNamespaces(['common', 'errors', 'validation']);
    } catch (error) {
      console.error(`Failed to load language resources for ${lang}:`, error);
    }
  }

  // Initialize language
  public async initialize(): Promise<void> {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(savedLanguage)) {
      await this.changeLanguage(savedLanguage);
    }
    await this.loadLanguageResources(this.currentLanguage);
  }
}

export default i18n; 