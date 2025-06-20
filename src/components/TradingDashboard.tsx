"use client";

import { useEffect, useState } from 'react';
import { PriceData, TradingSignal } from '@/lib/types';
import { getSimplePrice } from '@/data/coingecko'; // Keep for now, but will be removed later
import TradingViewWidget from './TradingViewWidget';
import { useCandles } from '@/hooks/useCandles'; // Import the useCandles hook

import SignalCard from './SignalCard';
import SentimentGauge from './SentimentGauge';
import VolatilityMeter from './VolatilityMeter'; // New import
import TrendCard from './TrendCard'; // New import
import { format } from 'date-fns';
import OrderBook from './OrderBook';
import { ErrorBoundary } from './ErrorBoundary';
import PositionSizer from './PositionSizer'; // Import PositionSizer

export default function TradingDashboard() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [priceData, setPriceData] = useState<PriceData>({ price: 0, change: 0 });
  const [signal, setSignal] = useState<TradingSignal>({ direction: 'NEUTRAL', strength: 'WEAK', timestamp: Date.now(), indicators: {}, reason: 'Initializing signal...' }); // Use TradingSignal type
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const { candles, isLoading: candlesLoading, error: candlesError } = useCandles({ days: 7 }); // Fetch 7 days of candle data
  const [tradeEntryPrice, setTradeEntryPrice] = useState<number | null>(null);
  const [tradeStopLossPrice, setTradeStopLossPrice] = useState<number | null>(null);

  // Fetch price data
  useEffect(() => {
    const fetchPrice = async () => {
      const data = await getSimplePrice();
      setPriceData(data);
      setLastUpdate(format(new Date(), 'h:mm:ss a'));
    };

    fetchPrice();
    const intervalId = setInterval(fetchPrice, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  // Fetch signal data from API
  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const response = await fetch('/api/signal');
        const data: TradingSignal = await response.json();
        setSignal(data);
      } catch (error) {
        console.error("Failed to fetch signal:", error);
        setSignal({ direction: 'NEUTRAL', strength: 'WEAK', timestamp: Date.now(), indicators: {}, reason: 'Error fetching signal.' });
      }
    };

    fetchSignal();
    const signalIntervalId = setInterval(fetchSignal, 300000); // Update every 5 minutes
    return () => clearInterval(signalIntervalId);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bitcoin 5-Minute Trading Dashboard</h1>
        
        {/* Signal Card */}
        <SignalCard signal={signal} className="mb-6" />
          
        {/* Price and 24h Change */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
            <p className="text-xl font-bold">
              ${priceData.price.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-500">24h Change</h3>
            <p className="text-xl font-bold">
              {priceData.change.toFixed(2)}%
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
            <p className="text-xl font-bold">
              {lastUpdate}
            </p>
          </div>
          <SentimentGauge />
          <VolatilityMeter atr={signal.indicators.atr} currentPrice={priceData.price} /> {/* New component */}
          <TrendCard trend={signal.indicators.ema9 && signal.indicators.ema21 ? (signal.indicators.ema9 > signal.indicators.ema21 ? 'Bullish' : 'Bearish') : 'Neutral'} /> {/* New component */}
        </div>
        
        {/* Chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '600px' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol} Chart</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  5m
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  15m
                </button>
                <button className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  1h
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <ErrorBoundary>
                {candlesLoading && <p>Loading chart data...</p>}
                {candlesError && <p className="text-red-500">Error loading chart: {candlesError.message}</p>}
                {!candlesLoading && !candlesError && candles.length > 0 && (
                  <TradingViewWidget />
                )}
                {!candlesLoading && !candlesError && candles.length === 0 && (
                  <p>No chart data available.</p>
                )}
              </ErrorBoundary>
            </div>
          </div>
          <div className="md:col-span-1 flex flex-col space-y-4">
            <OrderBook />
            <PositionSizer entryPrice={tradeEntryPrice} stopLossPrice={tradeStopLossPrice} />
          </div>
        </div>
        
        {/* Trading Pairs */}
        <div className="mt-4 flex space-x-2">
          {['BTC-USD', 'ETH-USD', 'SOL-USD'].map((pair) => (
            <button
              key={pair}
              onClick={() => setSymbol(pair)}
              className={`px-3 py-1 rounded-full text-sm ${
                symbol === pair
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h3 className="font-semibold mb-2">How to use this dashboard:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Signals are generated based on Higher Timeframe trend, Price-VWAP relationship, and RSI Divergence.</li>
          <li>A 'STRONG' signal indicates high confluence of factors.</li>
          <li>'NEUTRAL' means no clear high-probability setup is detected.</li>
          <li>Data updates every 5 minutes automatically.</li>
        </ul>
      </div>
    </div>
  );
}
