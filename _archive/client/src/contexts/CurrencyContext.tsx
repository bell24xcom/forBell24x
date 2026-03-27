'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface CurrencyContextType {
  currency: string;
  exchangeRates: Record<string, number>;
  formatPrice: (amount: number, currencyCode?: string) => string;
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => number;
  setCurrency: (currency: string) => void;
  getSupportedCurrencies: () => string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

const mockExchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  INR: 83.12,
  JPY: 149.34,
  AUD: 1.55,
  CAD: 1.36,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(mockExchangeRates);

  const setCurrency = useCallback((newCurrency: string) => {
    if (supportedCurrencies.includes(newCurrency)) {
      setCurrencyState(newCurrency);
    }
  }, []);

  const formatPrice = useCallback(
    (amount: number, currencyCode?: string): string => {
      const code = currencyCode || currency;

      const formatters: Record<string, Intl.NumberFormat> = {
        USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
        GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
        INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
        JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
        AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
        CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
      };

      const formatter = formatters[code] || formatters.USD;
      return formatter.format(amount);
    },
    [currency]
  );

  const convertPrice = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string): number => {
      if (fromCurrency === toCurrency) return amount;

      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[toCurrency] || 1;

      // Convert to USD first, then to target currency
      const usdAmount = amount / fromRate;
      return usdAmount * toRate;
    },
    [exchangeRates]
  );

  const getSupportedCurrencies = useCallback(() => {
    return supportedCurrencies;
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRates,
        formatPrice,
        convertPrice,
        setCurrency,
        getSupportedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
