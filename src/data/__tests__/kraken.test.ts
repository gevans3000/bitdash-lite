import { fetchCandles, subscribeCandles } from '../kraken';
import { Candle } from '@/lib/types';

describe('Kraken Data Provider', () => {
  // Increase timeout for async tests
  jest.setTimeout(10000);

  describe('fetchCandles', () => {
    it('should return an array of candles with Kraken-specific format', async () => {
      const candles = await fetchCandles('XBTUSD', '60', 10);
      
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
        
        // Check Kraken's 1 decimal place for prices
        expect(candle.open.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
        expect(candle.high.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
        expect(candle.low.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
        expect(candle.close.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      }
    });

    it('should return correct number of candles', async () => {
      const counts = [1, 5, 50];
      
      for (const count of counts) {
        const candles = await fetchCandles('XBTUSD', '60', count);
        expect(candles.length).toBe(count);
      }
    });

    it('should handle different intervals', async () => {
      const intervals = ['1', '5', '15', '60', '1440'];
      
      for (const interval of intervals) {
        const candles = await fetchCandles('XBTUSD', interval, 5);
        expect(candles.length).toBe(5);
        
        // Check if candles are properly spaced (for mock data)
        if (candles.length > 1) {
          const timeDiff = candles[1].time - candles[0].time;
          const expectedDiff = parseInt(interval) * 60; // Convert minutes to seconds
          
          expect(Math.abs(timeDiff - expectedDiff)).toBeLessThanOrEqual(60); // Allow some leeway
        }
      }
    });
  });

  describe('subscribeCandles', () => {
    it('should subscribe and receive candle updates with Kraken format', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = subscribeCandles('XBTUSD', '1', mockCallback);
      
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
      
      // Check Kraken's 1 decimal place for prices
      expect(receivedCandle.open.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      expect(receivedCandle.high.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      expect(receivedCandle.low.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      expect(receivedCandle.close.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
      
      // Cleanup
      unsubscribe();
    });

    it('should stop receiving updates after unsubscribe', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = subscribeCandles('XBTUSD', '1', mockCallback);
      
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
