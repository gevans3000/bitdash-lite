export interface Candle {
  time: number; // Timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number; // Make volume optional as it's not always available
}

export interface CandleWithTime {
  time: string; // ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
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

export interface OrderBook {
  bids: [number, number][]; // [price, size][]
  asks: [number, number][]; // [price, size][]
  timestamp?: number;
}

export interface LiquidityZone {
  type: 'support' | 'resistance';
  price: number;
  volume: number;
}

export interface OrderBookZone extends LiquidityZone {
  // Add any additional properties specific to order book zones
}
