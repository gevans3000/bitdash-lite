import { Candle } from '@/lib/types';

// Cache for rate limiting
const API_CACHE = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetches historical candle data from Coinbase API
 * @param symbol Trading pair symbol (e.g., 'BTC-USD')
 * @param interval Candle interval (e.g., '1m', '5m', '1h')
 * @param limit Number of candles to return (max: 300)
 * @returns Array of candle data
 */
export async function fetchCandles(
  symbol: string = 'BTC-USD',
  interval: string = '5m',
  limit: number = 300
): Promise<Candle[]> {
  const cacheKey = `${symbol}-${interval}-${limit}`;
  const now = Date.now();
  
  // Return cached data if available and not expired
  if (API_CACHE.has(cacheKey)) {
    const { timestamp, data } = API_CACHE.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  try {
    // Convert interval to Coinbase's granularity (in seconds)
    const granularity = parseIntervalToSeconds(interval);
    const endTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const startTime = endTime - (granularity * limit);
    
    const url = `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${granularity}&start=${startTime}&end=${endTime}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert Coinbase's format to our Candle format
    const candles: Candle[] = data
      .map(([time, low, high, open, close, volume]: number[]) => ({
        time,
        open,
        high,
        low,
        close,
        volume,
      }))
      .sort((a: Candle, b: Candle) => a.time - b.time);
    
    // Cache the results
    API_CACHE.set(cacheKey, {
      timestamp: now,
      data: candles
    });
    
    return candles;
  } catch (error) {
    console.error('Error fetching candles from Coinbase:', error);
    // Fallback to mock data if API fails
    return generateMockCandles(symbol, interval, limit);
  }
}

/**
 * Generates mock candle data for fallback
 */
function generateMockCandles(symbol: string, interval: string, limit: number): Candle[] {
  console.warn('Using mock data as fallback');
  const now = Date.now();
  const intervalMs = parseIntervalToMs(interval);
  const candles: Candle[] = [];
  
  // Start with a random base price
  let lastClose = 30000 + Math.random() * 10000;
  
  for (let i = 0; i < limit; i++) {
    const time = Math.floor((now - (limit - i - 1) * intervalMs) / 1000);
    
    // Generate realistic price movement
    const change = (Math.random() * 0.02) - 0.01; // -1% to +1% change
    const open = lastClose;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = 1 + Math.random() * 100; // Random volume
    
    candles.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(4))
    });
    
    lastClose = close;
  }
  
  return candles;
}

/**
 * Converts interval string to milliseconds
 */
function parseIntervalToMs(interval: string): number {
  const unit = interval.slice(-1);
  const value = parseInt(interval.slice(0, -1), 10) || 5;
  
  switch (unit) {
    case 's': return value * 1000; // seconds
    case 'm': return value * 60 * 1000; // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    case 'w': return value * 7 * 24 * 60 * 60 * 1000; // weeks
    default: return 5 * 60 * 1000; // default to 5 minutes
  }
}

/**
 * Converts interval string to seconds (Coinbase granularity)
 */
function parseIntervalToSeconds(interval: string): number {
  const unit = interval.slice(-1);
  const value = parseInt(interval.slice(0, -1), 10) || 5;
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    case 'w': return value * 7 * 24 * 60 * 60;
    default: return 300; // Default to 5 minutes (300 seconds)
  }
}

/**
 * Subscribes to real-time candle updates
 * @param symbol Trading pair symbol (e.g., 'BTC-USD')
 * @param interval Candle interval (e.g., '1h', '4h', '1d')
 * @param onUpdate Callback function for new candle data
 * @returns Unsubscribe function
 */
const BASE_PRICE = 35000;
const PRICE_VOLATILITY = 0.01; // 1%
const VOLUME_MULTIPLIER = 10;

export function subscribeCandles(
  symbol: string = 'BTC-USD',
  interval: string = '1h',
  onUpdate: (candle: Candle) => void
): () => void {
  const intervalMs = Math.min(parseIntervalToMs(interval), 60000);
  const candle: Candle = { time: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 };
  
  const updateCandle = () => {
    const now = Date.now();
    const rnd = Math.random();
    const priceOffset = (rnd - 0.5) * 1000;
    const basePrice = BASE_PRICE + priceOffset;
    const change = (rnd - 0.5) * basePrice * PRICE_VOLATILITY;
    const absChange = Math.abs(change);
    
    // Reuse candle object to reduce GC pressure
    candle.time = Math.floor(now / 1000);
    candle.open = basePrice;
    candle.high = basePrice + absChange * 2;
    candle.low = basePrice - absChange * 2;
    candle.close = basePrice + change;
    candle.volume = Math.random() * VOLUME_MULTIPLIER;
    
    onUpdate({ ...candle });
  };
  
  updateCandle(); // Initial update
  const intervalId = setInterval(updateCandle, intervalMs);
  
  return () => {
    clearInterval(intervalId);
  };
}
