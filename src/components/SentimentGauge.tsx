'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SentimentData {
  value: number;
  value_classification: string;
  timestamp: number;
}

export default function SentimentGauge() {
  const { data, isLoading, error } = useQuery<SentimentData>({
    queryKey: ['sentiment'],
    queryFn: async () => {
      const response = await fetch('/api/sentiment');
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment data');
      }
      return response.json();
    },
    refetchInterval: 3600000, // Refetch every hour
  });

  if (isLoading) return <div className="p-3 bg-gray-50 rounded">Loading sentiment...</div>;
  if (error) return <div className="p-3 bg-red-100 rounded text-red-800">Error loading sentiment</div>;

  const getColorClass = (value: number) => {
    if (value <= 20) return 'text-red-600'; // Extreme Fear
    if (value <= 40) return 'text-orange-500'; // Fear
    if (value <= 60) return 'text-gray-600'; // Neutral
    if (value <= 80) return 'text-green-500'; // Greed
    return 'text-green-700'; // Extreme Greed
  };

  return (
    <div className="p-3 bg-gray-50 rounded">
      <h3 className="text-sm font-medium text-gray-500">Market Sentiment (Fear & Greed Index)</h3>
      <div className="text-xl font-bold text-center mt-2">
        {data && (
          <>
            <p className={`${getColorClass(data.value)}`}>{data.value} - {data.value_classification}</p>
            <p className="text-xs text-gray-500">Last updated: {new Date(data.timestamp).toLocaleTimeString()}</p>
          </>
        )}
      </div>
    </div>
  );
}