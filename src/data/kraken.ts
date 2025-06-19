import { Candle } from '@/lib/types';

// Note: This is a simplified example. In a production environment, you would
// want to handle pagination, error handling, and rate limits more robustly
// according to the provider's documentation.
export async function fetchKrakenCandles(pair: string = 'BTC/USD', interval: number = 5): Promise<Candle[]> {
  // Kraken uses a different pair format in its API, e.g., XBTUSD
  const apiPair = pair.replace('BTC', 'XBT').replace('/', '');
  const url = `https://api.kraken.com/0/public/OHLC?pair=${apiPair}&interval=${interval}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Kraken candles: ${response.statusText}`);
  }
  
  const data = await response.json();

  if (data.error && data.error.length > 0) {
    throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
  }
  
  // Kraken's API has a unique structure that needs to be parsed.
  // The actual pair data is nested under a dynamic key.
  const pairKey = Object.keys(data.result)[0];
  if (!pairKey) {
    throw new Error('Could not find pair key in Kraken API response.');
  }
  const rawCandles = data.result[pairKey];

  // Transform the raw data into the application's Candle format.
  return rawCandles.map((c: any) => ({
    time: c[0],       // Unix timestamp
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[6]),
  }));
}
