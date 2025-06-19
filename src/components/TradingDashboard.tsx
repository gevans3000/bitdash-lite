"use client";

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Candle } from '@/lib/types';
import { fetchCandles } from '@/data/coinbase';
import MarketChart from './MarketChart';
import { getSignal } from '@/lib/signals';
import { format } from 'date-fns';

export default function TradingDashboard() {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [interval, _setInterval] = useState('5m'); // Renamed setInterval to _setInterval as it's not used
  const [signal, setSignal] = useState<string>('LOADING...');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Fetch candle data
  const { data: candles = [], isLoading, error } = useQuery<Candle[]>({
    queryKey: ['candles', symbol, interval],
    queryFn: () => fetchCandles(symbol, interval, 100),
    refetchInterval: 300000, // 5 minutes
  });

  // Update trading signal when candles change
  useEffect(() => {
    if (candles.length > 0) {
      const currentSignal = getSignal(candles);
      setSignal(currentSignal);
      setLastUpdate(format(new Date(), 'h:mm:ss a'));
    }
  }, [candles]);

  // Signal styling
  const getSignalStyle = () => {
    switch(signal) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HOLD':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading market data...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading market data</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bitcoin 5-Minute Trading Dashboard</h1>
        
        {/* Signal Card */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Trading Signal</h2>
              <p className="text-sm text-gray-600">Last update: {lastUpdate}</p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getSignalStyle()} font-bold`}>
              {signal}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
              <p className="text-xl font-bold">
                ${candles.length > 0 ? candles[candles.length - 1].close.toFixed(2) : '--'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-gray-500">24h Change</h3>
              <p className="text-xl font-bold">
                {candles.length > 0 
                  ? ((candles[candles.length - 1].close - candles[0].open) / candles[0].open * 100).toFixed(2) + '%'
                  : '--'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <h3 className="text-sm font-medium text-gray-500">Signal Strength</h3>
              <p className="text-xl font-bold">
                {signal === 'BUY' ? 'Strong' : signal === 'SELL' ? 'Medium' : 'Weak'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <MarketChart 
            candles={candles}
            height={500}
            showSMA={true}
            showVolume={true}
          />
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
          <li>BUY signal appears when technical indicators suggest an upward trend</li>
          <li>SELL signal appears when indicators suggest a downward trend</li>
          <li>HOLD means the market is ranging or the trend is unclear</li>
          <li>Data updates every 5 minutes automatically</li>
        </ul>
      </div>
    </div>
  );
}
