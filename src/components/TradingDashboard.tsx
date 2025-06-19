"use client";

import { useEffect, useState } from 'react';
import { PriceData, TradingSignal } from '@/lib/types';
import { getSimplePrice } from '@/data/coingecko'; // Keep for now, but will be removed later
import TradingViewWidget from './TradingViewWidget';
import SignalCard from './SignalCard';
import SentimentGauge from './SentimentGauge';
import VolatilityMeter from './VolatilityMeter'; // New import
import TrendCard from './TrendCard'; // New import
import { format } from 'date-fns';
import OrderBook from './OrderBook';

export default function TradingDashboard() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [priceData, setPriceData] = useState<PriceData>({ price: 0, change: 0 });
  const [signal, setSignal] = useState<TradingSignal>({ direction: 'NEUTRAL', strength: 'WEAK', timestamp: Date.now(), indicators: {}, reason: 'Initializing signal...' }); // Use TradingSignal type
  const [lastUpdate, setLastUpdate] = useState<string>('');

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
          <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border" style={{ height: '500px' }}>
            <TradingViewWidget />
          </div>
          <div className="md:col-span-1">
            <OrderBook />
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
