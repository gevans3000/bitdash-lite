import { useEffect, useState } from 'react';

interface VolatilityMeterProps {
  atr?: number | null;
  currentPrice: number;
}

export default function VolatilityMeter({ atr, currentPrice }: VolatilityMeterProps) {
  const [volatilityPercentage, setVolatilityPercentage] = useState(0);

  useEffect(() => {
    if (atr && currentPrice > 0) {
      setVolatilityPercentage((atr / currentPrice) * 100);
    } else {
      setVolatilityPercentage(0);
    }
  }, [atr, currentPrice]);

  const getVolatilityColor = () => {
    if (volatilityPercentage < 0.5) return 'bg-gray-400'; // Low volatility
    if (volatilityPercentage < 1.5) return 'bg-green-500'; // Normal volatility
    return 'bg-red-500'; // High volatility
  };

  return (
    <div className="p-3 bg-gray-50 rounded">
      <h3 className="text-sm font-medium text-gray-500">Volatility (ATR)</h3>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className={`h-2.5 rounded-full ${getVolatilityColor()}`}
          style={{ width: `${Math.min(volatilityPercentage * 40, 100)}%` }}
        ></div>
      </div>
      <p className="text-right text-xs mt-1">{volatilityPercentage.toFixed(2)}%</p>
    </div>
  );
}