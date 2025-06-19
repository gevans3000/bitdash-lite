export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceData {
  price: number;
  change: number;
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

export type SignalStrength = 'WEAK' | 'MODERATE' | 'STRONG';

export interface TradingSignal {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: SignalStrength;
  indicators: {
    rsi?: number | null;
    vwap?: number | null;
    atr?: number | null;
    ema9?: number | null;
    ema21?: number | null;
  };
  timestamp: number;
  reason?: string;
  tradeParameters?: {
    entry: string;
    stopLoss: string;
    profitTarget1: string;
    profitTarget2: string;
  };
}
