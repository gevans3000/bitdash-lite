'use client';

import React, { useState, useEffect } from 'react';

interface PositionSizerProps {
  entryPrice: number | null;
  stopLossPrice: number | null;
}

const PositionSizer: React.FC<PositionSizerProps> = ({ entryPrice, stopLossPrice }) => {
  const [accountSize, setAccountSize] = useState<number>(10000); // Default account size
  const [riskPercent, setRiskPercent] = useState<number>(1); // Default risk percentage
  const [positionSize, setPositionSize] = useState<number>(0);
  const [dollarRisk, setDollarRisk] = useState<number>(0);

  useEffect(() => {
    if (entryPrice === null || stopLossPrice === null || accountSize <= 0 || riskPercent <= 0) {
      setPositionSize(0);
      setDollarRisk(0);
      return;
    }

    const calculatedDollarRisk = accountSize * (riskPercent / 100);
    setDollarRisk(calculatedDollarRisk);

    const riskPerCoin = Math.abs(entryPrice - stopLossPrice);

    if (riskPerCoin === 0) {
      setPositionSize(0); // Avoid division by zero
      return;
    }

    const calculatedPositionSize = calculatedDollarRisk / riskPerCoin;
    setPositionSize(calculatedPositionSize);

  }, [entryPrice, stopLossPrice, accountSize, riskPercent]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Position Sizer</h3>
      
      <div className="mb-3">
        <label htmlFor="accountSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Size ($)</label>
        <input
          type="number"
          id="accountSize"
          value={accountSize}
          onChange={(e) => setAccountSize(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          step="1000"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="riskPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Risk per Trade (%)</label>
        <input
          type="number"
          id="riskPercent"
          value={riskPercent}
          onChange={(e) => setRiskPercent(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          step="0.1"
        />
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Entry Price:</p>
        <p className="text-md font-bold text-gray-900 dark:text-white">{entryPrice ? `$${entryPrice.toFixed(2)}` : 'N/A'}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stop-Loss Price:</p>
        <p className="text-md font-bold text-gray-900 dark:text-white">{stopLossPrice ? `$${stopLossPrice.toFixed(2)}` : 'N/A'}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dollar Risk:</p>
        <p className="text-md font-bold text-red-500">{`$${dollarRisk.toFixed(2)}`}</p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Calculated Position Size:</p>
        <p className="text-xl font-bold text-blue-800 dark:text-blue-100">{`${positionSize.toFixed(4)} BTC`}</p>
      </div>
    </div>
  );
};

export default PositionSizer;