export type CurrencyConversionInput = {
  amount: number;
  from: string;
  to: string;
};

export type CurrencyConversionResult = {
  convertedAmount: number;
  rate: number;
  from: string;
  to: string;
};

export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionResult> {
  // Simulate conversion (replace with real API call)
  const mockRates: Record<string, number> = {
    'USDINR': 83.2,
    'EURINR': 89.4,
    'INRUSD': 0.012,
    'USDEUR': 0.92,
    'EURUSD': 1.08
  };
  const key = (input.from + input.to).toUpperCase();
  const rate = mockRates[key] || 1;
  return {
    convertedAmount: input.amount * rate,
    rate,
    from: input.from,
    to: input.to
  };
}
