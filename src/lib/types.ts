export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface MarketData {
  candles: Candle[];
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export type Exchange = 'coinbase' | 'kraken';

export interface Signal {
  type: 'BUY' | 'SELL' | 'NEUTRAL';
  timestamp: number;
  confidence?: number;
  indicators?: {
    rsi?: number;
    macd?: {
      value: number;
      signal: number;
      histogram: number;
    };
  };
}
