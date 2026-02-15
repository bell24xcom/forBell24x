import { NextApiRequest, NextApiResponse } from 'next';

// Mock stock data - in production, you'd use Alpha Vantage or similar API
const MOCK_STOCK_DATA = [
  {
    symbol: 'RELIANCE',
    price: 2456.50,
    change: 12.30,
    changePercent: 0.50,
    volume: 1250000,
    marketCap: 1665000000000,
  },
  {
    symbol: 'TCS',
    price: 3456.75,
    change: -8.25,
    changePercent: -0.24,
    volume: 850000,
    marketCap: 1250000000000,
  },
  {
    symbol: 'HDFC',
    price: 1456.20,
    change: 5.80,
    changePercent: 0.40,
    volume: 650000,
    marketCap: 850000000000,
  },
  {
    symbol: 'INFY',
    price: 1656.90,
    change: -3.45,
    changePercent: -0.21,
    volume: 750000,
    marketCap: 680000000000,
  },
  {
    symbol: 'HINDUNILVR',
    price: 2456.30,
    change: 15.60,
    changePercent: 0.64,
    volume: 450000,
    marketCap: 580000000000,
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In production, you would:
    // 1. Use Alpha Vantage API or similar
    // 2. Cache the data with appropriate TTL
    // 3. Handle rate limiting
    // 4. Add error handling for API failures
    
    // For now, return mock data with some randomization
    const stockData = MOCK_STOCK_DATA.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 10,
      change: stock.change + (Math.random() - 0.5) * 2,
      volume: Math.floor(stock.volume * (0.8 + Math.random() * 0.4)),
    }));

    res.status(200).json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}

// Example of how to integrate with Alpha Vantage API
async function fetchRealStockData() {
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const symbols = ['RELIANCE', 'TCS', 'HDFC', 'INFY', 'HINDUNILVR'];
  
  const stockData = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${API_KEY}`
        );
        const data = await response.json();
        
        const quote = data['Global Quote'];
        if (!quote) {
          throw new Error(`No data for ${symbol}`);
        }
        
        return {
          symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          marketCap: parseFloat(quote['05. price']) * parseInt(quote['06. volume']),
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    })
  );
  
  return stockData.filter(Boolean);
}