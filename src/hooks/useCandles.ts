import { useState, useEffect, useMemo, useCallback } from 'react';
import { Candle } from '@/lib/types';
import { fetchBitcoinCandles } from '@/lib/api';

interface UseCandlesProps {
  days?: number;
  refetchInterval?: number;
  debug?: boolean;
}

export const useCandles = ({
  days = 7,
  refetchInterval = 60000, // 1 minute
  debug = true,
}: UseCandlesProps = {}) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[useCandles]', ...args);
    }
  }, [debug]);

  // Format candles for the chart (convert time to seconds if needed)
  const formattedCandles = useMemo(() => {
    log('Formatting candles, count:', candles.length);
    
    const formatted = candles
      .map(candle => {
        // Ensure all required fields are numbers
        const time = Number(candle.time);
        const open = Number(candle.open);
        const high = Number(candle.high);
        const low = Number(candle.low);
        const close = Number(candle.close);
        
        // Lightweight Charts expects timestamp in seconds.
        // CoinGecko provides milliseconds, so convert if necessary.
        const timeInSeconds = time > 1e12 ? Math.floor(time / 1000) : time;
        
        return {
          time: timeInSeconds,
          open,
          high,
          low,
          close,
        };
      })
      .sort((a, b) => a.time - b.time); // Ensure candles are sorted by time
    
    log('Formatted candles (first 3):', formatted.slice(0, 3));
    log('Formatted candles (last 3):', formatted.slice(-3));
    return formatted;
  }, [candles, log]);

  const fetchCandles = useCallback(async () => {
    log('Fetching candles data...');
    try {
      setIsLoading(true);
      const data = await fetchBitcoinCandles(days);
      
      log(`Fetched ${data.length} candles`);
      if (data.length > 0) {
        log('First candle:', data[0]);
        log('Last candle:', data[data.length - 1]);
      }
      
      if (!Array.isArray(data)) {
        throw new Error(`Expected array but got ${typeof data}`);
      }
      
      if (data.length === 0) {
        log('Warning: No candle data received');
      }
      
      setCandles(data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load price data');
      console.error('[useCandles] Error loading candles:', {
        error: error.message,
        stack: error.stack,
        days,
      });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [days, log]);

  // Initial fetch
  useEffect(() => {
    log('Initial fetch triggered');
    fetchCandles().catch(err => {
      console.error('[useCandles] Error in initial fetch:', err);
    });
  }, [fetchCandles, log]);

  // Set up polling if refetchInterval is provided
  useEffect(() => {
    if (!refetchInterval) {
      log('Auto-refresh disabled');
      return;
    }
    
    log(`Setting up auto-refresh every ${refetchInterval}ms`);
    const intervalId = setInterval(() => {
      log('Auto-refreshing candles...');
      fetchCandles().catch(console.error);
    }, refetchInterval);
    
    return () => {
      log('Cleaning up auto-refresh');
      clearInterval(intervalId);
    };
  }, [fetchCandles, refetchInterval, log]);

  return {
    candles: formattedCandles,
    formattedCandles, // Alias for backward compatibility
    isLoading,
    error,
    refetch: fetchCandles,
  };
};

export default useCandles;
