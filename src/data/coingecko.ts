import { PriceData, Candle } from '@/lib/types';

export async function getSimplePrice(): Promise<PriceData> {
  try {
    const url = `/api/price`; // Use the local proxy API route
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch price from CoinGecko');
    }
    const data = await response.json();
    return {
      price: data.bitcoin.usd,
      change: data.bitcoin.usd_24h_change,
    };
  } catch (error) {
    console.error(error);
    // Return stale or zero data on failure
    return { price: 0, change: 0 };
  }
}

export async function fetchCandles(coinId: string, vsCurrency: string, days: number): Promise<Candle[]> {
  try {
    // CoinGecko's /ohlc endpoint provides OHLC data, but granularity depends on 'days' parameter:
    // 1 day: 30 minutes interval
    // 7 days, 14 days, 30 days, 90 days, 180 days, 365 days: 4 hours interval
    // max: daily interval
    const url = `/api/ohlc?coinId=${coinId}&vsCurrency=${vsCurrency}&days=${days}`; // Use the local proxy API route
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLC candles from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();
    // CoinGecko returns [timestamp, open, high, low, close]
    return data.map((ohlc: [number, number, number, number, number]) => ({
      time: ohlc[0],
      open: ohlc[1],
      high: ohlc[2],
      low: ohlc[3],
      close: ohlc[4],
      volume: 0, // CoinGecko's /ohlc endpoint does not provide volume, setting to 0
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}