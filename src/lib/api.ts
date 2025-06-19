import axios from 'axios';
import { Candle } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CoinGeckoCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const fetchBitcoinCandles = async (days: number = 7): Promise<Candle[]> => {
  console.log(`[API] Fetching ${days} days of Bitcoin candles...`);
  
  try {
    const response = await axios.get<number[][]>(
      `/api/ohlc`, // Use the local proxy API route
      {
        params: {
          coinId: 'bitcoin',
          vsCurrency: 'usd',
          days: Math.max(1, Math.min(90, days)), // Ensure days is between 1 and 90
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!Array.isArray(response?.data)) {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Validate and convert the response to our Candle format
    const candles = response.data
      .map((candle, index) => {
        try {
          if (!Array.isArray(candle) || candle.length < 5) {
            console.warn(`[API] Invalid candle data at index ${index}:`, candle);
            return null;
          }
          
          const timestamp = candle[0];
          if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            console.warn(`[API] Invalid timestamp at index ${index}:`, timestamp);
            return null;
          }
          
          const timeInSeconds = Math.floor(timestamp / 1000); // Convert to seconds
          
          // Ensure all price values are valid numbers
          const open = Number(candle[1]);
          const high = Number(candle[2]);
          const low = Number(candle[3]);
          const close = Number(candle[4]);
          
          if ([open, high, low, close].some(isNaN)) {
            console.warn(`[API] Invalid price values at index ${index}:`, { open, high, low, close });
            return null;
          }
          
          return {
            time: timeInSeconds,
            open,
            high,
            low,
            close,
            // CoinGecko doesn't provide volume in this endpoint
          };
        } catch (err) {
          console.warn(`[API] Error processing candle at index ${index}:`, err);
          return null;
        }
      })
      .filter((candle): candle is Candle => candle !== null);
    
    console.log(`[API] Fetched ${candles.length} valid candles`);
    
    if (candles.length === 0) {
      console.warn('[API] No valid candles found in response');
    } else {
      console.log('[API] First candle:', candles[0]);
      console.log('[API] Last candle:', candles[candles.length - 1]);
      console.log('[API] Example time value (first candle):', candles[0]?.time, 'Type:', typeof candles[0]?.time);
    }
    
    return candles;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error fetching Bitcoin candles:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      days,
    });
    
    // Return mock data if there's an error (for development)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Using mock data due to error');
      return generateMockCandles(days);
    }
    
    throw error;
  }
};

// Helper function to generate mock candle data for development
const generateMockCandles = (days: number): Candle[] => {
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  const candles: Candle[] = [];
  
  // Start from 30 days ago to now, with 5-minute intervals
  let time = now - (days * oneDay);
  let price = 60000; // Start at $60,000
  
  while (time < now) {
    // Random price movement (-$100 to +$100)
    const change = (Math.random() * 200) - 100;
    const open = price;
    const close = price + change;
    
    // Ensure high is >= open/close and low is <= open/close
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
    });
    
    // Move to next 5-minute interval
    time += 300; // 5 minutes in seconds
    price = close;
  }
  
  console.log(`[API] Generated ${candles.length} mock candles`);
  return candles;
};

export const fetchBitcoinPrice = async (): Promise<number> => {
  try {
    const response = await axios.get(
      `/api/price`, // Use the local proxy API route
      {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
        },
      }
    );

    return response.data.bitcoin.usd;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw error;
  }
};
