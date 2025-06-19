import React from 'react';
import { TradingSignal } from '@/lib/types'; // Import TradingSignal

interface SignalCardProps {
  signal: TradingSignal; // Use TradingSignal
  className?: string;
}

export default function SignalCard({ signal, className = '' }: SignalCardProps) {
  const signalClass = {
    BUY: 'bg-green-100 border-green-500 text-green-800',
    SELL: 'bg-red-100 border-red-500 text-red-800',
    NEUTRAL: 'bg-gray-100 border-gray-500 text-gray-800'
  }[signal.direction]; // Use signal.direction

  const signalText = {
    BUY: 'Buy',
    SELL: 'Sell',
    NEUTRAL: 'Neutral'
  }[signal.direction]; // Use signal.direction

  return (
    <div className={`p-4 rounded-lg border ${signalClass} ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Trading Signal</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${signalClass.replace('bg-', 'bg-').replace('border-', 'border-')}`}>
          {signalText} ({signal.strength})
        </span>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {signal.timestamp && (
          <div>Time: {new Date(signal.timestamp).toLocaleString()}</div>
        )}
        {/* Confidence is now part of strength, so removed */}
        {signal.reason && (
          <div>Reason: {signal.reason}</div>
        )}
      </div>
      
      {signal.indicators && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-1">Indicators</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {signal.indicators.rsi !== undefined && signal.indicators.rsi !== null && (
              <div>RSI: {signal.indicators.rsi.toFixed(2)}</div>
            )}
            {signal.indicators.vwap !== undefined && signal.indicators.vwap !== null && (
              <div>VWAP: {signal.indicators.vwap.toFixed(2)}</div>
            )}
            {signal.indicators.atr !== undefined && signal.indicators.atr !== null && (
              <div>ATR: {signal.indicators.atr.toFixed(2)}</div>
            )}
            {signal.indicators.ema9 !== undefined && signal.indicators.ema9 !== null && (
              <div>EMA9: {signal.indicators.ema9.toFixed(2)}</div>
            )}
            {signal.indicators.ema21 !== undefined && signal.indicators.ema21 !== null && (
              <div>EMA21: {signal.indicators.ema21.toFixed(2)}</div>
            )}
          </div>
        </div>
      )}

      {signal.tradeParameters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-sm mb-2">Trade Plan:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><strong>Entry:</strong> {signal.tradeParameters.entry}</p>
            <p className="text-red-600"><strong>Stop:</strong> {signal.tradeParameters.stopLoss}</p>
            <p className="text-green-600"><strong>Target 1:</strong> {signal.tradeParameters.profitTarget1}</p>
            <p className="text-green-600"><strong>Target 2:</strong> {signal.tradeParameters.profitTarget2}</p>
          </div>
        </div>
      )}
    </div>
  );
}
