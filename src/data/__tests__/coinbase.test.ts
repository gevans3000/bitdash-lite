import { fetchCandles, subscribeCandles } from '../coinbase';
import { Candle } from '@/lib/types';

describe('Coinbase Data Provider', () => {
  // Increase timeout for async tests
  jest.setTimeout(10000);

  describe('fetchCandles', () => {
    it('should return an array of candles', async () => {
      const candles = await fetchCandles('BTC-USD', '1h', 10);
      
      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBe(10);
      
      // Check candle structure
      if (candles.length > 0) {
        const candle = candles[0];
        expect(candle).toHaveProperty('time');
        expect(candle).toHaveProperty('open');
        expect(candle).toHaveProperty('high');
        expect(candle).toHaveProperty('low');
        expect(candle).toHaveProperty('close');
        expect(candle).toHaveProperty('volume');
        
        // Check types
        expect(typeof candle.time).toBe('number');
        expect(typeof candle.open).toBe('number');
        expect(typeof candle.high).toBe('number');
        expect(typeof candle.low).toBe('number');
        expect(typeof candle.close).toBe('number');
        expect(typeof candle.volume).toBe('number');
        
        // Check high/low consistency
        expect(candle.high).toBeGreaterThanOrEqual(candle.open);
        expect(candle.high).toBeGreaterThanOrEqual(candle.close);
        expect(candle.low).toBeLessThanOrEqual(candle.open);
        expect(candle.low).toBeLessThanOrEqual(candle.close);
      }
    });

    it('should return correct number of candles', async () => {
      const counts = [1, 5, 50];
      
      for (const count of counts) {
        const candles = await fetchCandles('BTC-USD', '1h', count);
        expect(candles.length).toBe(count);
      }
    });

    it('should handle different intervals', async () => {
      const intervals = ['1m', '5m', '15m', '1h', '6h', '1d'];
      
      for (const interval of intervals) {
        const candles = await fetchCandles('BTC-USD', interval, 5);
        expect(candles.length).toBe(5);
        
        // Check if candles are properly spaced (for mock data)
        if (candles.length > 1) {
          const timeDiff = candles[1].time - candles[0].time;
          // For 1m interval, timeDiff should be 60 seconds, etc.
          const expectedDiff = 
            interval.endsWith('m') ? parseInt(interval) * 60 :
            interval.endsWith('h') ? parseInt(interval) * 3600 :
            interval.endsWith('d') ? parseInt(interval) * 86400 : 3600; // Default to 1h
          
          expect(Math.abs(timeDiff - expectedDiff)).toBeLessThanOrEqual(60); // Allow some leeway
        }
      }
    });
  });

  describe('subscribeCandles', () => {
    it('should subscribe and receive candle updates', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = subscribeCandles('BTC-USD', '1m', mockCallback);
      
      // Wait for at least one update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Should have been called at least once
      expect(mockCallback).toHaveBeenCalled();
      
      // Check the structure of the received candle
      const receivedCandle = mockCallback.mock.calls[0][0];
      expect(receivedCandle).toHaveProperty('time');
      expect(receivedCandle).toHaveProperty('open');
      expect(receivedCandle).toHaveProperty('high');
      expect(receivedCandle).toHaveProperty('low');
      expect(receivedCandle).toHaveProperty('close');
      expect(receivedCandle).toHaveProperty('volume');
      
      // Cleanup
      unsubscribe();
    });

    it('should stop receiving updates after unsubscribe', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = subscribeCandles('BTC-USD', '1m', mockCallback);
      
      // Wait for an update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Should have been called at least once
      const callCount = mockCallback.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
      
      // Unsubscribe
      unsubscribe();
      
      // Clear mock to only count new calls
      mockCallback.mockClear();
      
      // Wait for potential updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Should not have been called again after unsubscribe
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
