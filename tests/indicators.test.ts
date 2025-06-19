import { sma, rsi, macd } from '@/lib/indicators';

describe('Technical Indicators', () => {
  describe('SMA (Simple Moving Average)', () => {
    it('should return empty array for empty input', () => {
      expect(sma([], 5)).toEqual([]);
    });

    it('should return array of correct length', () => {
      const prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const period = 3;
      const result = sma(prices, period);
      expect(result).toHaveLength(prices.length - period + 1);
    });

    it('should calculate correct SMA values', () => {
      const prices = [1, 2, 3, 4, 5];
      const period = 3;
      const expected = [2, 3, 4]; // (1+2+3)/3=2, (2+3+4)/3=3, (3+4+5)/3=4
      expect(sma(prices, period)).toEqual(expected);
    });

    it('should handle period larger than input array', () => {
      const prices = [1, 2, 3];
      expect(sma(prices, 5)).toEqual([]);
    });
  });

  describe('RSI (Relative Strength Index)', () => {
    it('should return empty array for empty input', () => {
      expect(rsi([], 14)).toEqual([]);
    });

    it('should return array of correct length', () => {
      const prices = [
        44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
        45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64
      ];
      const period = 14;
      const result = rsi(prices, period);
      expect(result).toHaveLength(prices.length - period);
    });

    it('should return values between 0 and 100', () => {
      const prices = [
        44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
        45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64
      ];
      const result = rsi(prices, 14);
      result.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('MACD (Moving Average Convergence Divergence)', () => {
    it('should return empty arrays for empty input', () => {
      const result = macd([], 12, 26, 9);
      expect(result.macd).toEqual([]);
      expect(result.signal).toEqual([]);
      expect(result.histogram).toEqual([]);
    });

    it('should return arrays of correct length', () => {
      const prices = [
        22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29,
        22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63,
        23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17
      ];
      const result = macd(prices, 12, 26, 9);
      
      // For MACD with fast=12, slow=26, signal=9:
      // - MACD line starts at index 25 (26th element)
      // - Signal line starts 9 periods after MACD line
      const expectedMacdLength = Math.max(0, prices.length - 25);
      const expectedSignalLength = Math.max(0, prices.length - 25 - 9);
      
      expect(result.macd).toHaveLength(expectedMacdLength);
      expect(result.signal).toHaveLength(expectedSignalLength);
      expect(result.histogram).toHaveLength(expectedSignalLength);
    });

    it('should have histogram as MACD - Signal', () => {
      const prices = [
        22.27, 22.19, 22.08, 22.17, 22.18, 22.13, 22.23, 22.43, 22.24, 22.29,
        22.15, 22.39, 22.38, 22.61, 23.36, 24.05, 23.75, 23.83, 23.95, 23.63,
        23.82, 23.87, 23.65, 23.19, 23.10, 23.33, 22.68, 23.10, 22.40, 22.17
      ];
      const result = macd(prices, 12, 26, 9);
      
      // Check that histogram = MACD - Signal for all values where we have both
      const minLength = Math.min(result.macd.length, result.signal.length);
      
      // Skip the first 8 elements of the MACD line since signal line starts later
      const macdOffset = result.macd.length - result.signal.length;
      
      for (let i = 0; i < minLength; i++) {
        const macdValue = result.macd[macdOffset + i];
        const signalValue = result.signal[i];
        const histogramValue = result.histogram[i];
        
        if (macdValue !== null && signalValue !== null && histogramValue !== null) {
          const expectedHistogram = macdValue - signalValue;
          expect(histogramValue).toBeCloseTo(expectedHistogram, 6);
        } else {
          // If any value is null, histogram should be null
          expect(histogramValue).toBeNull();
        }
      }
    });
  });
});
