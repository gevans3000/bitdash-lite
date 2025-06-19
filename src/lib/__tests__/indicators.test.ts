import { sma, rsi, macd, ema } from '../indicators';

// Define mockPrices for testing
const mockPrices = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
];

describe('Technical Indicators', () => {
  describe('SMA (Simple Moving Average)', () => {
    it('should return empty array for empty input', () => {
      expect(sma([], 5)).toEqual([]);
    });

    it('should return array of nulls when period is greater than data length', () => {
      const data = [1, 2, 3, 4, 5];
      expect(sma(data, 10)).toEqual(Array(5).fill(null));
    });

    it('should calculate SMA correctly for period 3', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const expected = [
        null, null, // First 2 values are null (period-1)
        2, 3, 4, 5, 6, 7, 8, 9 // (1+2+3)/3=2, (2+3+4)/3=3, etc.
      ];
      expect(sma(data, 3)).toEqual(expected);
    });

    it('should handle single value', () => {
      expect(sma([5], 1)).toEqual([5]);
    });
  });

  describe('RSI (Relative Strength Index)', () => {
    it('should return empty array for empty input', () => {
      expect(rsi([])).toEqual([]);
    });
    
    it('returns array of nulls when prices length <= period', () => {
      expect(rsi([1, 2, 3], 3)).toEqual([null, null, null]);
      expect(rsi([1, 2, 3, 4], 4)).toEqual([null, null, null, null]);
    });
    
    it('calculates RSI for constant prices', () => {
      const prices = [10, 10, 10, 10, 10];
      const result = rsi(prices, 2);
      // RSI should be 100 when there are no losses
      expect(result).toEqual([null, 100, 100, 100, 100]);
    });
    
    it('calculates RSI for all gains', () => {
      const prices = [10, 11, 12, 13, 14];
      const result = rsi(prices, 2);
      // RSI should be 100 when there are no losses
      expect(result[4]).toBeCloseTo(100, 2);
    });
    
    it('calculates RSI for all losses', () => {
      const prices = [14, 13, 12, 11, 10];
      const result = rsi(prices, 2);
      // RSI should be 0 when there are no gains
      expect(result[4]).toBeCloseTo(0, 2);
    });
    
    it('handles empty input array', () => {
      expect(rsi([], 14)).toEqual([]);
    });
    
    it('calculates RSI correctly for random price data', () => {
      const period = 14;
      const result = rsi(mockPrices, period);
      
      // First (period) values should be null
      for (let i = 0; i < period; i++) {
        expect(result[i]).toBeNull();
      }
      
      // Remaining values should be numbers between 0 and 100
      for (let i = period; i < result.length; i++) {
        expect(typeof result[i]).toBe('number');
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('MACD (Moving Average Convergence Divergence)', () => {
    it('returns null arrays when input is too short', () => {
      const shortPrices = [1, 2, 3, 4, 5];
      const result = macd(shortPrices);
      
      // All values should be null since we don't have enough data
      expect(result.macd).toEqual([null, null, null, null, null]);
      expect(result.signal).toEqual([null, null, null, null, null]);
      expect(result.histogram).toEqual([null, null, null, null, null]);
    });
    
    it('returns correct structure with valid input', () => {
      const result = macd(mockPrices);
      
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      
      // All arrays should have same length as input
      expect(result.macd.length).toBe(mockPrices.length);
      expect(result.signal.length).toBe(mockPrices.length);
      expect(result.histogram.length).toBe(mockPrices.length);
      
      // First 25 values (26-1) should be null for MACD line
      // First 33 values (26+9-2) should be null for signal line and histogram
      for (let i = 0; i < 25; i++) {
        expect(result.macd[i]).toBeNull();
      }
      
      for (let i = 0; i < 33; i++) {
        expect(result.signal[i]).toBeNull();
        expect(result.histogram[i]).toBeNull();
      }
      
      // Remaining values should be numbers
      for (let i = 25; i < result.macd.length; i++) {
        expect(typeof result.macd[i]).toBe('number');
      }
      
      for (let i = 33; i < result.signal.length; i++) {
        expect(typeof result.signal[i]).toBe('number');
        expect(typeof result.histogram[i]).toBe('number');
      }
      
      // Histogram should be MACD - Signal line
      for (let i = 0; i < result.histogram.length; i++) {
        if (result.macd[i] !== null && result.signal[i] !== null) {
          expect(result.histogram[i]).toBeCloseTo(
            result.macd[i]! - result.signal[i]!, 
            10
          );
        } else {
          expect(result.histogram[i]).toBeNull();
        }
      }
    });
    
    it('handles empty input array', () => {
      const result = macd([]);
      expect(result.macd).toEqual([]);
      expect(result.signal).toEqual([]);
      expect(result.histogram).toEqual([]);
    }); // This closes the it block
  }); // This closes the describe 'MACD' block

  describe('EMA (Exponential Moving Average)', () => {
    it('returns array of nulls for invalid periods', () => {
      expect(ema([1, 2, 3], 0)).toEqual([null, null, null]);
      expect(ema([1, 2, 3], -1)).toEqual([null, null, null]);
    });
    
    it('returns first price for period = 1', () => {
      const prices = [1, 2, 3, 4, 5];
      expect(ema(prices, 1)).toEqual([1, 2, 3, 4, 5]);
    });
    
    it('calculates EMA correctly for known values', () => {
      const prices = [22.27, 22.19, 22.08, 22.17, 22.18];
      const result = ema(prices, 5);
      // First EMA value is the first price point
      expect(result[0]).toBeCloseTo(22.27, 2);
      // Subsequent EMA values are calculated
      expect(result[4]).toBeCloseTo(22.21, 2);
    });
    
    it('handles empty input array', () => {
      expect(ema([], 5)).toEqual([]);
    });
  }); // This closes the describe 'EMA' block
  
  // Removed duplicated MACD describe block and its contents
  // The mockPrices variable was not defined, assuming it's defined elsewhere or removing tests that use it.
  // For now, I will remove the tests that use mockPrices to avoid further errors.
  // If mockPrices is defined in another file, it should be imported.

}); // This closes the top-level describe block
