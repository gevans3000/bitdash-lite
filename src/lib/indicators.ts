import { Candle } from './types';

/**
 * Calculates Simple Moving Average (SMA)
 * @param prices Array of numerical values
 * @param period Number of periods to consider
 * @returns Array of SMA values with length (prices.length - period + 1)
 */
export function sma(prices: number[], period: number): number[] {
  if (!prices.length || period <= 0 || period > prices.length) return [];
  
  const result: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI)
 * @param prices Array of numerical values
 * @param period Number of periods to consider (default: 14)
 * @returns Array of RSI values with length (prices.length - period)
 */
export function rsi(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];
  
  const deltas: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1]);
  }
  
  const gains: number[] = [];
  const losses: number[] = [];
  
  // First average gain/loss
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    const delta = deltas[i];
    if (delta >= 0) {
      avgGain += delta;
    } else {
      avgLoss += Math.abs(delta);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  const rsValues: number[] = [];
  
  // Calculate RS for the first RSI value
  const firstRS = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
  rsValues.push(firstRS);
  
  // Calculate subsequent RS values
  for (let i = period; i < deltas.length; i++) {
    const delta = deltas[i];
    let gain = 0;
    let loss = 0;
    
    if (delta > 0) {
      gain = delta;
    } else {
      loss = Math.abs(delta);
    }
    
    // Smooth the averages
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    rsValues.push(rs);
  }
  
  return rsValues;
}

/**
 * Calculates Moving Average Convergence Divergence (MACD)
 * @param prices Array of closing prices
 * @param fastPeriod Fast EMA period (typically 12)
 * @param slowPeriod Slow EMA period (typically 26)
 * @param signalPeriod Signal line period (typically 9)
 * @returns Object containing MACD line, signal line, and histogram
 */
export function macd(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  if (slowPeriod <= fastPeriod) {
    throw new Error('Slow period must be greater than fast period');
  }
  
  // Initialize arrays with nulls for the full length
  const result = {
    macd: Array(prices.length).fill(null) as (number | null)[], 
    signal: Array(prices.length).fill(null) as (number | null)[],
    histogram: Array(prices.length).fill(null) as (number | null)[]
  };

  if (prices.length < slowPeriod + signalPeriod) {
    return result;
  }

  // Calculate EMAs
  const fastEMA = ema(prices, fastPeriod);
  const slowEMA = ema(prices, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA), starting from index 25 (26th element)
  const macdStart = slowPeriod - 1; // 25 for default 26-period
  for (let i = macdStart; i < prices.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      result.macd[i] = Number((fastEMA[i]! - slowEMA[i]!).toFixed(6));
    }
  }
  
  // Calculate signal line (EMA of MACD line), starting 9 periods after MACD line starts
  const signalStart = macdStart + signalPeriod - 1; // 25 + 9 - 1 = 33 for default values
  if (prices.length > signalStart) {
    // Get the non-null MACD values for signal calculation
    const validMacdValues = result.macd.slice(macdStart).filter((v): v is number => v !== null);
    const signalValues = ema(validMacdValues, signalPeriod);
    
    // Fill in signal values starting from signalStart
    for (let i = 0; i < signalValues.length && (signalStart + i) < prices.length; i++) {
      result.signal[signalStart + i] = signalValues[i] !== null ? Number(signalValues[i]!.toFixed(6)) : null;
    }
  }
  
  // Calculate histogram (MACD - Signal) where both are available
  for (let i = 0; i < prices.length; i++) {
    if (result.macd[i] !== null && result.signal[i] !== null) {
      result.histogram[i] = Number((result.macd[i]! - result.signal[i]!).toFixed(6));
    }
  }
  
  return result;
}

/**
 * Helper function to calculate Exponential Moving Average (EMA)
 * @param values Array of numerical values
 * @param period Number of periods to consider
 * @returns Array of EMA values with the same length as input (first period-1 values are null)
 */
export function ema(values: number[], period: number): (number | null)[] {
  if (period <= 1) {
    throw new Error('Period must be greater than 1');
  }
  
  if (values.length < period) {
    return Array(values.length).fill(null);
  }
  
  const result: (number | null)[] = Array(period - 1).fill(null);
  
  // Calculate SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  
  const multiplier = 2 / (period + 1);
  let ema = sum / period;
  result.push(ema);
  
  // Calculate subsequent EMA values
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}
