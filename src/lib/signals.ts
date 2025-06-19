import { Candle } from './types';
import { sma, rsi, macd } from './indicators';

type Signal = 'BUY' | 'SELL' | 'HOLD';

/**
 * Represents the strength of a trading signal
 */
export type SignalStrength = 'WEAK' | 'MODERATE' | 'STRONG';

/**
 * Represents a trading signal with direction and strength
 */
export interface TradingSignal {
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: SignalStrength;
  indicators: {
    rsi?: number | null;
    macd?: number | null;
    macdSignal?: number | null;
    sma20?: number | null;
    sma50?: number | null;
    sma200?: number | null;
  };
  timestamp: number;
}

/**
 * Generates trading signals based on technical indicators
 * @param candles Array of candle data
 * @returns TradingSignal object with direction and strength
 */
/**
 * Simple signal generator for the dashboard
 * Uses RSI, MACD, and moving averages to generate signals
 */
export function getSignal(candles: Candle[]): Signal {
  if (candles.length < 20) return 'HOLD';
  
  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];
  
  // Calculate indicators
  const rsiValues = rsi(closes, 14);
  const currentRsi = rsiValues[rsiValues.length - 1];
  
  const { macd: macdLine, signal: signalLine } = macd(closes, 12, 26, 9);
  const currentMacd = macdLine[macdLine.length - 1];
  const currentSignal = signalLine[signalLine.length - 1];
  
  const sma20 = sma(closes, 20);
  const currentSma20 = sma20[sma20.length - 1];
  
  // Simple trading rules
  const isBullish =
    currentRsi !== null && currentRsi < 70 && // RSI not overbought
    currentMacd !== null && currentSignal !== null && currentMacd > currentSignal && // MACD above signal line
    currentSma20 !== null && currentPrice > currentSma20; // Price above 20-period SMA
    
  const isBearish =
    currentRsi !== null && currentRsi > 30 && // RSI not oversold
    currentMacd !== null && currentSignal !== null && currentMacd < currentSignal && // MACD below signal line
    currentSma20 !== null && currentPrice < currentSma20; // Price below 20-period SMA
    
  if (isBullish) return 'BUY';
  if (isBearish) return 'SELL';
  return 'HOLD';
}

export function generateSignal(candles: Candle[]): TradingSignal {
  if (candles.length < 50) {
    return {
      direction: 'NEUTRAL',
      strength: 'WEAK',
      indicators: {},
      timestamp: Date.now()
    };
  }

  // Extract closing prices
  const closes = candles.map(c => c.close);
  
  // Calculate indicators
  const rsiValues = rsi(closes, 14);
  const { macd: macdLine, signal: macdSignal } = macd(closes, 12, 26, 9);
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  
  // Get the most recent values
  const lastIndex = candles.length - 1;
  const currentRsi = rsiValues[lastIndex];
  const currentMacd = macdLine[lastIndex];
  const currentSignal = macdSignal[lastIndex];
  const currentSma20 = sma20[lastIndex];
  const currentSma50 = sma50[lastIndex];
  const currentSma200 = sma200[lastIndex];
  const currentPrice = closes[lastIndex];
  
  // Initialize signal
  const signal: TradingSignal = {
    direction: 'NEUTRAL',
    strength: 'WEAK',
    indicators: {
      rsi: currentRsi,
      macd: currentMacd,
      macdSignal: currentSignal,
      sma20: currentSma20,
      sma50: currentSma50,
      sma200: currentSma200
    },
    timestamp: candles[lastIndex].time * 1000 // Convert to milliseconds
  };
  
  if (currentRsi === null || currentMacd === null || currentSignal === null || 
      currentSma20 === null || currentSma50 === null || currentSma200 === null) {
    return signal; // Not enough data for signals
  }
  
  // Check RSI conditions
  const isOverbought = currentRsi > 70;
  const isOversold = currentRsi < 30;
  
  // Check MACD conditions
  const macdCrossedAbove = macdLine[lastIndex - 1]! <= macdSignal[lastIndex - 1]! && 
                         currentMacd > currentSignal;
  const macdCrossedBelow = macdLine[lastIndex - 1]! >= macdSignal[lastIndex - 1]! && 
                         currentMacd < currentSignal;
  
  // Check Moving Averages conditions
  const priceAboveSma20 = currentPrice > currentSma20;
  const priceAboveSma50 = currentPrice > currentSma50;
  const priceAboveSma200 = currentPrice > currentSma200;
  const sma20AboveSma50 = currentSma20 > currentSma50;
  const sma50AboveSma200 = currentSma50 > currentSma200;
  
  // Generate signals based on conditions
  let buyScore = 0;
  let sellScore = 0;
  
  // RSI signals
  if (isOversold) buyScore += 2;
  if (isOverbought) sellScore += 2;
  
  // MACD signals
  if (macdCrossedAbove) buyScore += 1.5;
  if (macdCrossedBelow) sellScore += 1.5;
  
  // Moving Averages signals
  if (priceAboveSma20) buyScore += 0.5;
  if (!priceAboveSma20) sellScore += 0.5;
  
  if (priceAboveSma50) buyScore += 1;
  if (!priceAboveSma50) sellScore += 1;
  
  if (priceAboveSma200) buyScore += 1.5;
  if (!priceAboveSma200) sellScore += 1.5;
  
  if (sma20AboveSma50) buyScore += 1;
  if (!sma20AboveSma50) sellScore += 1;
  
  if (sma50AboveSma200) buyScore += 1.5;
  if (!sma50AboveSma200) sellScore += 1.5;
  
  // Determine final signal
  const threshold = 3; // Minimum score to generate a signal
  
  if (buyScore >= threshold && buyScore > sellScore) {
    signal.direction = 'BUY';
    signal.strength = buyScore >= 5 ? 'STRONG' : buyScore >= 3.5 ? 'MODERATE' : 'WEAK';
  } else if (sellScore >= threshold && sellScore > buyScore) {
    signal.direction = 'SELL';
    signal.strength = sellScore >= 5 ? 'STRONG' : sellScore >= 3.5 ? 'MODERATE' : 'WEAK';
  }
  
  return signal;
}

/**
 * Generates a human-readable description of the trading signal
 * @param signal The trading signal to describe
 * @returns A string description of the signal
 */
export function describeSignal(signal: TradingSignal): string {
  if (signal.direction === 'NEUTRAL') {
    return 'Neutral market conditions. No strong trading signals detected.';
  }
  
  const strengthText = signal.strength.toLowerCase();
  const indicators = [];
  
  if (signal.indicators.rsi !== null && signal.indicators.rsi !== undefined) {
    indicators.push(`RSI at ${signal.indicators.rsi.toFixed(2)}`);
  }
  
  if (signal.indicators.macd !== null && signal.indicators.macdSignal !== null && 
      signal.indicators.macd !== undefined && signal.indicators.macdSignal !== undefined) {
    const macdDiff = signal.indicators.macd - signal.indicators.macdSignal;
    indicators.push(`MACD ${macdDiff > 0 ? 'above' : 'below'} signal line`);
  }
  
  const indicatorsText = indicators.length > 0 
    ? ` (${indicators.join(', ')})` 
    : '';
  
  return `${signal.strength} ${signal.direction} signal${indicatorsText}.`;
}
