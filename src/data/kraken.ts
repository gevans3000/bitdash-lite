import { Candle } from '@/lib/types';

/**
 * Fetches historical candle data from Kraken API
 * @param pair Trading pair (e.g., 'XBTUSD' for Bitcoin/USD)
 * @param interval Candle interval in minutes (e.g., 60 for 1h, 1440 for 1d)
 * @param limit Number of candles to return (max: 720)
 * @returns Array of candle data
 */
export async function fetchCandles(
  pair: string = 'XBTUSD',
  interval: string = '60',
  limit: number = 100
): Promise<Candle[]> {
  try {
    // TODO: Replace with actual API call in Task 02
    // For now, return mock data similar to Coinbase but with Kraken's format
    console.log(`[Kraken] Fetching ${limit} candles for ${pair} with ${interval}m interval`);
    
    // Generate mock candles
    const now = Date.now();
    const intervalMs = parseInt(interval) * 60 * 1000; // Convert minutes to ms
    const candles: Candle[] = [];
    
    // Slightly different price range to differentiate from Coinbase
    const basePrice = 29000 + Math.random() * 12000; // 29k-41k range
    
    for (let i = 0; i < limit; i++) {
      const time = (now - (limit - i - 1) * intervalMs) / 1000; // Convert to seconds
      const open = basePrice * (0.99 + Math.random() * 0.02);
      const close = basePrice * (0.99 + Math.random() * 0.02);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (0.99 - Math.random() * 0.01);
      
      candles.push({
        time: Math.floor(time),
        open: parseFloat(open.toFixed(1)), // Kraken uses 1 decimal place
        high: parseFloat(high.toFixed(1)),
        low: parseFloat(low.toFixed(1)),
        close: parseFloat(close.toFixed(1)),
        volume: parseFloat((Math.random() * 50).toFixed(4)) // Lower volume than Coinbase
      });
    }
    
    return candles;
  } catch (error) {
    console.error('[Kraken] Error fetching candles:', error);
    throw error;
  }
}

/**
 * Subscribes to real-time candle updates from Kraken
 * @param pair Trading pair (e.g., 'XBTUSD')
 * @param interval Candle interval in minutes (e.g., '60' for 1h)
 * @param onUpdate Callback function for new candle data
 * @returns Unsubscribe function
 */
const KRAKEN_BASE_PRICE = 34000;
const KRAKEN_VOLATILITY = 0.015; // 1.5%
const KRAKEN_VOLUME_MULTIPLIER = 8;

export function subscribeCandles(
  pair: string = 'XBTUSD',
  interval: string = '60',
  onUpdate: (candle: Candle) => void
): () => void {
  const intervalMs = Math.min(parseInt(interval) * 60 * 1000, 60000);
  const candle: Candle = { time: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 };
  
  const updateCandle = () => {
    const now = Date.now();
    const rnd = Math.random();
    const priceOffset = (rnd - 0.5) * 2000;
    const basePrice = KRAKEN_BASE_PRICE + priceOffset;
    const change = (rnd - 0.5) * basePrice * KRAKEN_VOLATILITY;
    const absChange = Math.abs(change);
    
    // Format prices to 1 decimal place for Kraken
    const formatPrice = (price: number) => Math.round(price * 10) / 10;
    
    // Reuse candle object to reduce GC pressure
    candle.time = Math.floor(now / 1000);
    candle.open = formatPrice(basePrice);
    candle.high = formatPrice(basePrice + absChange * 2.5);
    candle.low = formatPrice(basePrice - absChange * 2.5);
    candle.close = formatPrice(basePrice + change);
    candle.volume = Math.random() * KRAKEN_VOLUME_MULTIPLIER;
    
    onUpdate({ ...candle });
  };
  
  updateCandle(); // Initial update
  const intervalId = setInterval(updateCandle, intervalMs);
  
  return () => {
    clearInterval(intervalId);
  };
}
