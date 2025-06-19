import React from 'react';
import { Signal } from '@/lib/types';

interface SignalCardProps {
  signal: Signal;
  className?: string;
}

export default function SignalCard({ signal, className = '' }: SignalCardProps) {
  const signalClass = {
    BUY: 'bg-green-100 border-green-500',
    SELL: 'bg-red-100 border-red-500',
    NEUTRAL: 'bg-gray-100 border-gray-500'
  }[signal.type];

  const signalText = {
    BUY: 'Buy',
    SELL: 'Sell',
    NEUTRAL: 'Neutral'
  }[signal.type];

  return (
    <div className={`p-4 rounded-lg border ${signalClass} ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trading Signal</h3>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-white">
          {signalText}
        </span>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {signal.timestamp && (
          <div>Time: {new Date(signal.timestamp).toLocaleString()}</div>
        )}
        {signal.confidence !== undefined && (
          <div>Confidence: {Math.round(signal.confidence * 100)}%</div>
        )}
      </div>
      
      {signal.indicators && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-1">Indicators</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {signal.indicators.rsi !== undefined && (
              <div>RSI: {signal.indicators.rsi.toFixed(2)}</div>
            )}
            {signal.indicators.macd && (
              <>
                <div>MACD: {signal.indicators.macd.value.toFixed(4)}</div>
                <div>Signal: {signal.indicators.macd.signal.toFixed(4)}</div>
                <div>Hist: {signal.indicators.macd.histogram.toFixed(4)}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
