'use client';

import React, { useEffect, useState } from 'react';

interface OrderBookData {
  bids: [number, number][]; // [price, amount]
  asks: [number, number][]; // [price, amount]
}

export default function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This is a placeholder. In a real application, you would connect to a WebSocket
    // from an exchange (e.g., Coinbase Pro, Binance) to get real-time order book data.
    // For simplicity, we'll simulate some data or fetch from a REST API if available.

    const fetchOrderBook = async () => {
      try {
        // Example: Fetching from a mock API or a public REST endpoint if available
        // For a real-time solution, WebSockets are preferred.
        const response = await fetch('/api/mock-orderbook'); // You would create this API route
        if (!response.ok) {
          throw new Error('Failed to fetch order book data');
        }
        const data = await response.json();
        setOrderBook(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    // Set up an interval for polling if using REST, or manage WebSocket connection
    const interval = setInterval(fetchOrderBook, 5000); // Poll every 5 seconds for demo
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-3 bg-gray-50 rounded">Loading order book...</div>;
  if (error) return <div className="p-3 bg-red-100 rounded text-red-800">Error: {error}</div>;

  // Simple visualization: display top 5 bids and asks
  const displayLimit = 5;
  const sortedBids = [...orderBook.bids].sort((a, b) => b[0] - a[0]).slice(0, displayLimit);
  const sortedAsks = [...orderBook.asks].sort((a, b) => a[0] - b[0]).slice(0, displayLimit);

  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Live Order Book</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <h4 className="font-semibold text-green-600">Bids (Buy)</h4>
          {sortedBids.map(([price, amount], index) => (
            <div key={index} className="flex justify-between">
              <span>{price.toFixed(2)}</span>
              <span>{amount.toFixed(4)}</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-semibold text-red-600">Asks (Sell)</h4>
          {sortedAsks.map(([price, amount], index) => (
            <div key={index} className="flex justify-between">
              <span>{price.toFixed(2)}</span>
              <span>{amount.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Order Book Imbalance */}
      {orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
        <>
          {(() => {
            const bidVolume = orderBook.bids.reduce((sum, bid) => sum + bid[1], 0);
            const askVolume = orderBook.asks.reduce((sum, ask) => sum + ask[1], 0);
            const totalVolume = bidVolume + askVolume;
            const bidPercentage = totalVolume > 0 ? (bidVolume / totalVolume) * 100 : 50;

            return (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Order Book Imbalance</h4>
                <div className="w-full bg-red-500 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${bidPercentage}%` }}
                  ></div>
                </div>
                <p className="text-center text-xs mt-1">
                  <span className="text-green-600">{bidPercentage.toFixed(1)}% Buy</span> /{' '}
                  <span className="text-red-600">{(100 - bidPercentage).toFixed(1)}% Sell</span>
                </p>
              </div>
            );
          })()}
        </>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Note: For real-time data, a WebSocket connection to an exchange is recommended.
      </p>
    </div>
  );
}