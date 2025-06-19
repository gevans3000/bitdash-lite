import React from 'react';

interface PriceTickerProps {
  price: number | string;
  change24h?: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceTicker({ 
  price, 
  change24h = 0,
  currency = 'USD',
  size = 'md'
}: PriceTickerProps) {
  const isPositive = change24h >= 0;
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className="flex flex-col">
      <div className={`font-bold ${sizeClasses[size]}`}>
        {typeof price === 'number' ? price.toLocaleString() : price} {currency}
      </div>
      {change24h !== undefined && (
        <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change24h).toFixed(2)}% (24h)
        </div>
      )}
    </div>
  );
}
