import { Candle } from './types';
import { rsi, vwap, ema, atr } from './indicators';
import { TradingSignal } from './types';
import { signalEmitter } from './signalEmitter';

/**
 * Detects bullish RSI divergence.
 * Price makes a lower low, but RSI makes a higher low.
 */
function detectBullishRsiDivergence(closes: number[], rsiValues: number[], lookbackPeriod: number = 20): boolean {
  if (closes.length < lookbackPeriod || rsiValues.length < lookbackPeriod) return false;

  const currentPrice = closes[closes.length - 1];
  const currentRsi = rsiValues[rsiValues.length - 1];

  let prevPriceLowIndex = -1;
  let prevPriceLow = Infinity;
  for (let i = closes.length - 2; i >= closes.length - 1 - lookbackPeriod && i >= 0; i--) {
    if (closes[i] < prevPriceLow) {
      prevPriceLow = closes[i];
      prevPriceLowIndex = i;
    }
  }

  if (prevPriceLowIndex === -1 || currentPrice >= prevPriceLow) return false;

  const prevRsiAtLow = rsiValues[prevPriceLowIndex];
  if (currentRsi > prevRsiAtLow) {
    return true;
  }

  return false;
}

/**
 * Detects bearish RSI divergence.
 * Price makes a higher high, but RSI makes a lower high.
 */
function detectBearishRsiDivergence(closes: number[], rsiValues: number[], lookbackPeriod: number = 20): boolean {
  if (closes.length < lookbackPeriod || rsiValues.length < lookbackPeriod) return false;

  const currentPrice = closes[closes.length - 1];
  const currentRsi = rsiValues[rsiValues.length - 1];

  let prevPriceHighIndex = -1;
  let prevPriceHigh = -Infinity;
  for (let i = closes.length - 2; i >= closes.length - 1 - lookbackPeriod && i >= 0; i--) {
    if (closes[i] > prevPriceHigh) {
      prevPriceHigh = closes[i];
      prevPriceHighIndex = i;
    }
  }

  if (prevPriceHighIndex === -1 || currentPrice <= prevPriceHigh) return false;

  const prevRsiAtHigh = rsiValues[prevPriceHighIndex];
  if (currentRsi < prevRsiAtHigh) {
    return true;
  }

  return false;
}


/**
 * Generates trading signals based on a simplified, confluence-based strategy.
 * Focuses on VWAP, RSI divergence, EMA trend, Volume, and ATR for 5-minute Bitcoin trading.
 * @param candles Array of candle data (5-minute timeframe)
 * @param higherTimeframeCandles Array of candle data for higher timeframe (e.g., 1-hour) for trend bias
 * @returns TradingSignal object with direction, strength, and reason
 */
export function generateSignal(candles: Candle[], higherTimeframeCandles: Candle[]): TradingSignal {
  const minCandlesForRSI = 14 + 1; // RSI period + 1 for delta calculation
  const minCandlesForVWAP = 1; // VWAP can be calculated from 1 candle
  const minCandlesForDivergence = 20; // For divergence lookback
  const minCandlesForEMA = 20; // For 20-period EMA
  const minCandlesForATR = 14; // For 14-period ATR

  if (candles.length < Math.max(minCandlesForRSI, minCandlesForVWAP, minCandlesForDivergence, minCandlesForATR)) {
    return {
      direction: 'NEUTRAL',
      strength: 'WEAK',
      indicators: {},
      timestamp: Date.now(),
      reason: 'Not enough 5-minute candle data for reliable signals.'
    };
  }
  if (higherTimeframeCandles.length < minCandlesForEMA) {
    return {
      direction: 'NEUTRAL',
      strength: 'WEAK',
      indicators: {},
      timestamp: Date.now(),
      reason: 'Not enough higher timeframe candle data for trend bias.'
    };
  }

  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];
  const lastCandleTime = candles[candles.length - 1].time * 1000; // Convert to milliseconds

  // Calculate indicators
  const rsiValues = rsi(closes, 14);
  const currentRsi = rsiValues[rsiValues.length - 1];
  const vwapValues = vwap(candles);
  const currentVwap = vwapValues[vwapValues.length - 1];
  const atrValues = atr(candles, 14);
  const currentAtr = atrValues[atrValues.length - 1];

  // Calculate 5-min EMAs for crossover
  const ema9 = ema(closes, 9);
  const ema21 = ema(closes, 21);
  const currentEma9 = ema9[ema9.length - 1];
  const currentEma21 = ema21[ema21.length - 1];
  const prevEma9 = ema9[ema9.length - 2];
  const prevEma21 = ema21[ema21.length - 2];

  // Initialize signal
  const signal: TradingSignal = {
    direction: 'NEUTRAL',
    strength: 'WEAK',
    indicators: {
      rsi: currentRsi,
      vwap: currentVwap,
      atr: currentAtr,
      ema9: currentEma9,
      ema21: currentEma21,
    },
    timestamp: lastCandleTime,
    reason: 'No clear signal based on current conditions.'
  };

  if (currentRsi === null || currentVwap === null || currentAtr === null || currentEma9 === null || currentEma21 === null) {
    signal.reason = 'Indicator calculation failed (null values).';
    return signal;
  }

  // --- Step 1: Define Higher Timeframe (1H) Bias using EMA ---
  const htfCloses = higherTimeframeCandles.map(c => c.close);
  const htfEma20 = ema(htfCloses, 20);
  const currentHtfEma = htfEma20[htfEma20.length - 1];

  let htfTrend: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';
  if (currentHtfEma !== null) {
    if (currentPrice > currentHtfEma) {
      htfTrend = 'UP';
    } else {
      htfTrend = 'DOWN';
    }
  }

  // --- Step 2 & 3: Confluence and Entry Triggers ---
  const isPriceAboveVwap = currentPrice > currentVwap;
  const isPriceBelowVwap = currentPrice < currentVwap;

  const bullishDivergence = detectBullishRsiDivergence(closes, rsiValues);
  const bearishDivergence = detectBearishRsiDivergence(closes, rsiValues);

  // EMA Crossover
  let emaCrossover: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';
  if (prevEma9 !== null && prevEma21 !== null) {
    if (currentEma9 > currentEma21 && prevEma9 <= prevEma21) {
      emaCrossover = 'BULLISH';
    } else if (currentEma9 < currentEma21 && prevEma9 >= prevEma21) {
      emaCrossover = 'BEARISH';
    }
  }

  let buyScore = 0;
  let sellScore = 0;
  let reasons: string[] = [];

  // Confluence for BUY signal
  if (htfTrend === 'UP') {
    reasons.push('HTF Trend: UP');
    buyScore += 1;

    if (isPriceAboveVwap) {
      reasons.push('Price above VWAP (intraday bullish bias)');
      buyScore += 1;
    } else if (isPriceBelowVwap && currentPrice > (currentVwap * 0.995)) {
      reasons.push('Price near VWAP (potential pullback entry)');
      buyScore += 0.5;
    }

    if (bullishDivergence) {
      reasons.push('Bullish RSI Divergence detected (momentum fading for sellers)');
      buyScore += 2;
    }
    if (emaCrossover === 'BULLISH') {
      reasons.push('Bullish EMA Crossover (9 EMA > 21 EMA)');
      buyScore += 1.5;
    }
  }

  // Confluence for SELL signal
  if (htfTrend === 'DOWN') {
    reasons.push('HTF Trend: DOWN');
    sellScore += 1;

    if (isPriceBelowVwap) {
      reasons.push('Price below VWAP (intraday bearish bias)');
      sellScore += 1;
    } else if (currentPrice < (currentVwap * 1.005)) {
      reasons.push('Price near VWAP (potential pullback entry)');
      sellScore += 0.5;
    }

    if (bearishDivergence) {
      reasons.push('Bearish RSI Divergence detected (momentum fading for buyers)');
      sellScore += 2;
    }
    if (emaCrossover === 'BEARISH') {
      reasons.push('Bearish EMA Crossover (9 EMA < 21 EMA)');
      sellScore += 1.5;
    }
  }

  // Volume and Volatility Check (Phase 2, Step 3)
  // For simplicity, let's assume a "healthy" volume is above the average of the last 10 candles
  // and ATR is not extremely low (e.g., > 0.05% of price)
  const recentVolumes: number[] = candles.slice(-10).map(c => c.volume).filter((v): v is number => typeof v === 'number');
  const avgVolume = recentVolumes.length > 0 ? recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length : 0;
  const lastCandle = candles[candles.length - 1];
  const isVolumeHealthy = candles.length > 0 && lastCandle && lastCandle.volume !== undefined && lastCandle.volume > avgVolume * 0.8; // 80% of avg volume
  const isVolatilityHealthy = currentAtr !== null && currentAtr !== undefined && currentAtr > (currentPrice * 0.0005); // ATR > 0.05% of price

  // Adjust strength based on volume and volatility
  if (buyScore > 0 && (!isVolumeHealthy || !isVolatilityHealthy)) {
    reasons.push('Volume or Volatility not optimal for strong signal.');
    buyScore -= 1; // Penalize if conditions are not met
  }
  if (sellScore > 0 && (!isVolumeHealthy || !isVolatilityHealthy)) {
    reasons.push('Volume or Volatility not optimal for strong signal.');
    sellScore -= 1; // Penalize if conditions are not met
  }

  // Determine final signal and strength
  const strongThreshold = 4; // Adjusted for new indicators
  const moderateThreshold = 2.5;

  if (buyScore >= strongThreshold && buyScore > sellScore) {
    signal.direction = 'BUY';
    signal.strength = 'STRONG';
    signal.reason = 'Strong Buy Signal: ' + reasons.join(', ');
  } else if (buyScore >= moderateThreshold && buyScore > sellScore) {
    signal.direction = 'BUY';
    signal.strength = 'MODERATE';
    signal.reason = 'Moderate Buy Signal: ' + reasons.join(', ');
  } else if (sellScore >= strongThreshold && sellScore > buyScore) {
    signal.direction = 'SELL';
    signal.strength = 'STRONG';
    signal.reason = 'Strong Sell Signal: ' + reasons.join(', ');
  } else if (sellScore >= moderateThreshold && sellScore > buyScore) {
    signal.direction = 'SELL';
    signal.strength = 'MODERATE';
    signal.reason = 'Moderate Sell Signal: ' + reasons.join(', ');
  } else {
    signal.reason = 'Neutral: ' + (reasons.length > 0 ? reasons.join(', ') : 'No strong confluence detected.');
  }

  // Step 6: Provide Actionable Trade Parameters
  if (signal.strength === 'STRONG') {
    const lastCandle = candles[candles.length - 1];
    const entryPrice = lastCandle.close;
    const stopLossDistance = currentAtr * 1.5; // 1.5 ATR for stop loss
    const profitTargetDistance = currentAtr * 3; // 3 ATR for profit target (1:2 risk/reward)

    if (signal.direction === 'BUY') {
      signal.tradeParameters = {
        entry: `~${entryPrice.toFixed(2)}`,
        stopLoss: (entryPrice - stopLossDistance).toFixed(2),
        profitTarget1: (entryPrice + profitTargetDistance).toFixed(2),
        profitTarget2: (entryPrice + profitTargetDistance * 2).toFixed(2), // Second target
      };
    } else if (signal.direction === 'SELL') {
      signal.tradeParameters = {
        entry: `~${entryPrice.toFixed(2)}`,
        stopLoss: (entryPrice + stopLossDistance).toFixed(2),
        profitTarget1: (entryPrice - profitTargetDistance).toFixed(2),
        profitTarget2: (entryPrice - profitTargetDistance * 2).toFixed(2), // Second target
      };
    }
  }

  // Emit the signal after it's fully generated
  signalEmitter.emit(signal); // The emit function in signalEmitter.ts directly takes the signal object
  return signal;
}

/**
 * Generates a human-readable description of the trading signal
 * @param signal The trading signal to describe
 * @returns A string description of the signal
 */
export function describeSignal(signal: TradingSignal): string {
  if (signal.direction === 'NEUTRAL') {
    return signal.reason || 'Neutral market conditions. No strong trading signals detected.';
  }
  
  const strengthText = signal.strength.toLowerCase();
  const indicators = [];
  
  if (signal.indicators.rsi !== null && signal.indicators.rsi !== undefined) {
    indicators.push(`RSI at ${signal.indicators.rsi.toFixed(2)}`);
  }
  
  if (signal.indicators.vwap !== null && signal.indicators.vwap !== undefined) {
    indicators.push(`VWAP at ${signal.indicators.vwap.toFixed(2)}`);
  }

  if (signal.indicators.atr !== null && signal.indicators.atr !== undefined) {
    indicators.push(`ATR at ${signal.indicators.atr.toFixed(2)}`);
  }

  if (signal.indicators.ema9 !== null && signal.indicators.ema9 !== undefined) {
    indicators.push(`EMA9 at ${signal.indicators.ema9.toFixed(2)}`);
  }

  if (signal.indicators.ema21 !== null && signal.indicators.ema21 !== undefined) {
    indicators.push(`EMA21 at ${signal.indicators.ema21.toFixed(2)}`);
  }
  
  const indicatorsText = indicators.length > 0
    ? ` (${indicators.join(', ')})`
    : '';
  
  return `${signal.strength} ${signal.direction} signal${indicatorsText}. Reason: ${signal.reason || 'N/A'}`;
}
