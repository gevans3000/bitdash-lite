'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useOrderBookZones } from '@/hooks/useOrderBookZones';
import { useCandles } from '@/hooks/useCandles';
import { LiquidityZone } from '@/lib/types';
import { LoadingSpinner } from './LoadingSpinner';

export interface LightweightChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
}

export const LightweightChart: React.FC<LightweightChartProps> = ({
  symbol = 'BTC-USD',
  interval = '5',
  theme = 'dark',
  width = 800,
  height = 500,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const priceLinesRef = useRef<{ [key: string]: any }>({});
  
  // Fetch candles data with error handling for mock data
  const { 
    candles: formattedCandles = [], 
    isLoading: isLoadingCandles, 
    error: candleError,
    refetch: refetchCandles,
  } = useCandles({
    days: 7, // Show 7 days of data by default
    refetchInterval: 60000, // Refetch every minute
    debug: true,
  });
  
  // Handle retry on error
  const handleRetry = useCallback(() => {
    console.log('Retrying to fetch candles...');
    refetchCandles().catch(console.error);
  }, [refetchCandles]);
  
  // Get order book zones from our custom hook
  const { zones, isLoading: isLoadingZones, error: zonesError } = useOrderBookZones({
    priceGrouping: 10,
    volumeThreshold: 50,
    refetchInterval: 5000, // 5 seconds
  }) as { zones: LiquidityZone[], isLoading: boolean, error: Error | null };

  // Initialize chart
  useEffect(() => {
    console.log('Initializing chart...');
    
    if (!chartContainerRef.current) {
      console.error('Chart container ref is not available');
      return;
    }
    
    // Clean up previous chart if it exists
    if (chartRef.current) {
      console.log('Removing previous chart instance');
      try {
        chartRef.current.remove();
      } catch (err) {
        console.error('Error removing previous chart:', err);
      }
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      priceLinesRef.current = {};
    }
    
    try {
      // Ensure container has dimensions
      const container = chartContainerRef.current;
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '500px';
      
      console.log('Container dimensions:', {
        layout: {
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          textColor: theme === 'dark' ? '#D9D9D9' : '#191919',
        },
        grid: {
          vertLines: {
            color: theme === 'dark' ? '#2B2B43' : '#F0F3FA',
          },
          horzLines: {
            color: theme === 'dark' ? '#2B2B43' : '#F0F3FA',
          },
        },
        crosshair: {
          mode: 0, // Normal mode (shows crosshair with x and y)
          vertLine: {
            width: 2,
            color: 'rgba(33, 150, 243, 0.5)',
            style: 0, // Solid line
          },
          horzLine: {
            width: 2,
            color: 'rgba(33, 150, 243, 0.5)',
            style: 0, // Solid line
          },
        },
        priceScale: {
          borderColor: theme === 'dark' ? '#2B2B43' : '#E0E3EB',
        },
        timeScale: {
          borderColor: theme === 'dark' ? '#2B2B43' : '#E0E3EB',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Store references
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      // Handle window resize
      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      // Add resize observer
      const resizeObserver = new ResizeObserver(handleResize);
      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }

      // Cleanup
      // Clean up on unmount
      return () => {
        console.log('Cleaning up chart');
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
        try {
          chart.remove();
        } catch (err) {
          console.error('Error removing chart:', err);
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize chart');
      console.error('Error in chart initialization:', error);
      setError(error);
    }
  }, [theme]);

  // Update chart when zones change
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;

    // Clear existing price lines
    Object.values(priceLinesRef.current).forEach(priceLine => {
      candlestickSeriesRef.current?.removePriceLine(priceLine);
    });
    priceLinesRef.current = {};

    // Add new price lines for each zone
    zones.forEach((zone, index) => {
      const priceLine = candlestickSeriesRef.current?.createPriceLine({
        price: zone.price,
        color: zone.type === 'support' ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `${zone.volume.toFixed(2)} BTC`,
      });

      if (priceLine) {
        priceLinesRef.current[`${zone.type}-${zone.price}`] = priceLine;
      }
    });
  }, [zones]);

  // Update chart when candles change
  useEffect(() => {
    if (!formattedCandles || formattedCandles.length === 0) {
      console.warn('[Chart] No candles data available to update the chart');
      return;
    }

    console.log('[Chart] Updating with', formattedCandles.length, 'candles');
    console.log('[Chart] First candle:', formattedCandles[0]);
    console.log('[Chart] Last candle:', formattedCandles[formattedCandles.length - 1]);
    
    if (!candlestickSeriesRef.current) {
      const error = new Error('Candlestick series is not initialized');
      console.error('[Chart] Error:', error);
      setError(error);
      return;
    }
    
    try {
      // Ensure the data is in the correct format and sorted by time
      const validCandles = formattedCandles
        .filter((candle, index) => {
          // Validate each candle
          const isValid = 
            candle && 
            typeof candle.time === 'number' && 
            typeof candle.open === 'number' &&
            typeof candle.high === 'number' &&
            typeof candle.low === 'number' &&
            typeof candle.close === 'number';
            
          if (!isValid) {
            console.warn(`[Chart] Invalid candle at index ${index}:`, candle);
            return false;
          }
          return true;
        })
        .map(candle => ({
          time: Number(candle.time),
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close)
        }))
        .sort((a, b) => a.time - b.time); // Ensure candles are sorted by time
      
      if (validCandles.length === 0) {
        throw new Error('No valid candles to display after validation');
      }
      
      console.log(`[Chart] Setting ${validCandles.length} valid candles`);
      console.log('[Chart] First valid candle:', validCandles[0]);
      
      // Set the data
      candlestickSeriesRef.current.setData(validCandles);
      
      // Fit the content to the viewport
      if (chartRef.current) {
        console.log('[Chart] Fitting content to viewport');
        
        // First, fit the content
        chartRef.current.timeScale().fitContent();
        
        // Then adjust the visible range with padding
        setTimeout(() => {
          try {
            if (chartRef.current) {
              const timeScale = chartRef.current.timeScale();
              const visibleRange = timeScale.getVisibleRange();
              
              if (visibleRange) {
                const range = visibleRange.to - visibleRange.from;
                const padding = range * 0.05; // 5% padding
                
                timeScale.setVisibleRange({
                  from: visibleRange.from - padding,
                  to: visibleRange.to + padding,
                });
                
                console.log('[Chart] Visible range set:', {
                  from: new Date((visibleRange.from - padding) * 1000).toISOString(),
                  to: new Date((visibleRange.to + padding) * 1000).toISOString(),
                  originalRange: {
                    from: new Date(visibleRange.from * 1000).toISOString(),
                    to: new Date(visibleRange.to * 1000).toISOString(),
                  },
                  padding: `${padding / 3600}h`
                });
              }
            }
          } catch (err) {
            console.error('[Chart] Error adjusting visible range:', err);
          }
        }, 100);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update chart data');
      console.error('[Chart] Error updating chart:', {
        message: error.message,
        stack: error.stack,
        formattedCandlesLength: formattedCandles?.length,
        firstCandle: formattedCandles?.[0],
        lastCandle: formattedCandles?.[formattedCandles?.length - 1],
      });
      setError(error);
    }
  }, [formattedCandles]);
  
  // Combine loading and error states
  const [error, setError] = useState<Error | null>(null);
  const isLoading = isLoadingCandles || isLoadingZones;
  const errorToDisplay = error || candleError || zonesError;
  
  // Determine if we should show loading or error state
  const showLoading = isLoading || (!formattedCandles?.length && !errorToDisplay);
  
  // Loading state
  if (showLoading) {
    return (
      <div className="relative w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div 
          ref={chartContainerRef} 
          className="w-full h-full min-h-[500px] bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Loading chart data...</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Fetching latest market data</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (errorToDisplay) {
    return (
      <div className="relative w-full h-full border border-red-200 dark:border-red-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-red-50 dark:bg-red-900/10 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error loading chart</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {errorToDisplay.message || 'Failed to load chart data. Please try again.'}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={chartContainerRef}
      style={{ width: '100%', height: '100%' }}
      className="relative"
    />
  );
};

export default LightweightChart;
