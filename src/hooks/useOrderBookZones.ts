import { useState, useEffect, useCallback } from 'react';
import { OrderBook, LiquidityZone } from '@/lib/types';

interface UseOrderBookZonesProps {
  priceGrouping?: number;
  volumeThreshold?: number;
  refetchInterval?: number;
}

// Helper type for the order book entries
interface OrderBookEntry {
  price: number;
  size: number;
}

export const useOrderBookZones = ({
  priceGrouping = 10,
  volumeThreshold = 50,
  refetchInterval = 5000,
}: UseOrderBookZonesProps = {}) => {
  const [zones, setZones] = useState<LiquidityZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateLiquidityZones = useCallback((data: OrderBook): LiquidityZone[] => {
    if (!data?.bids || !data?.asks) return [];

    // Process bids (support levels)
    const supportZones = processZones(data.bids, 'support', priceGrouping, volumeThreshold);
    
    // Process asks (resistance levels)
    const resistanceZones = processZones(data.asks, 'resistance', priceGrouping, volumeThreshold);

    // Combine and sort by volume (highest first)
    return [...supportZones, ...resistanceZones]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10); // Limit to top 10 zones
  }, [priceGrouping, volumeThreshold]);

  const processZones = (
    orders: [number, number][],
    type: 'support' | 'resistance',
    grouping: number,
    threshold: number
  ): LiquidityZone[] => {
    const zonesMap = new Map<number, number>();

    // Group orders by price levels
    orders.forEach(([price, size]) => {
      // Round down to nearest grouping (e.g., 50012.34 -> 50010 with grouping 10)
      const groupedPrice = Math.floor(price / grouping) * grouping;
      zonesMap.set(groupedPrice, (zonesMap.get(groupedPrice) || 0) + size);
    });

    // Convert to zones array and filter by threshold
    return Array.from(zonesMap.entries())
      .filter(([_, volume]) => volume >= threshold)
      .map(([price, volume]) => ({
        type,
        price,
        volume,
      } as LiquidityZone));
  };

  const fetchOrderBook = useCallback(async () => {
    console.log('Fetching order book data...');
    try {
      setIsLoading(true);
      const response = await fetch('/api/mock-orderbook');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: OrderBook = await response.json();
      console.log('Fetched order book data:', data);
      
      if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) {
        throw new Error('Invalid order book data format');
      }
      
      const newZones = calculateLiquidityZones(data);
      console.log('Calculated liquidity zones:', newZones);
      setZones(newZones);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load order book data');
      console.error('Error in fetchOrderBook:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateLiquidityZones]);

  // Initial fetch
  useEffect(() => {
    fetchOrderBook();
  }, [fetchOrderBook]);

  // Set up polling if refetchInterval is provided
  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(fetchOrderBook, refetchInterval);
    return () => clearInterval(intervalId);
  }, [fetchOrderBook, refetchInterval]);

  return { zones, isLoading, error };
};

export default useOrderBookZones;
