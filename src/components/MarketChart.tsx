import React, { useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  BarChart,
  Bar,
  TooltipProps
} from 'recharts';
import { format } from 'date-fns';
import { Candle } from '@/lib/types';

interface MarketChartProps {
  candles: Candle[];
  height?: number | string;
  width?: number | string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showVolume?: boolean;
  showSMA?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  className?: string;
  loading?: boolean; // Added loading prop
}

const formatDate = (timestamp: number) => {
  return format(new Date(timestamp * 1000), 'MMM dd, yyyy');
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded border border-gray-200 text-sm">
        <p className="font-medium">{formatDate(data.time / 1000)}</p>
        <div className="mt-1 space-y-1">
          <p>Open: {data.open?.toFixed(2) || 'N/A'}</p>
          <p>High: {data.high?.toFixed(2) || 'N/A'}</p>
          <p>Low: {data.low?.toFixed(2) || 'N/A'}</p>
          <p>Close: {data.close?.toFixed(2) || 'N/A'}</p>
          {data.volume && <p>Volume: {data.volume.toFixed(2)}</p>}
        </div>
      </div>
    );
  }
  return null;
};

export default function MarketChart({ 
  candles = [], 
  height = 400, 
  width = '100%',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showVolume = true,
  showSMA = true,
  showRSI = false,
  showMACD = false,
  className = '',
  loading = false // Added loading prop with default value
}: MarketChartProps) {
  // Process candle data for the chart
  const chartData = useMemo(() => {
    return candles.map(candle => ({
      ...candle,
      time: candle.time * 1000, // Convert to milliseconds for recharts
      date: formatDate(candle.time)
    }));
  }, [candles]);

  // Calculate SMA for the chart
  const smaData = useMemo(() => {
    if (!showSMA || candles.length < 20) return [];
    const closes = candles.map(c => c.close);
    const sma20 = [];
    let sum = 0;
    
    for (let i = 0; i < closes.length; i++) {
      sum += closes[i];
      if (i >= 19) {
        if (i > 19) sum -= closes[i - 20];
        sma20.push({
          time: candles[i].time * 1000,
          value: sum / 20
        });
      }
    }
    
    return sma20;
  }, [candles, showSMA]);

  // Calculate RSI for the chart
  const rsiData = useMemo(() => {
    if (!showRSI || candles.length < 15) return [];
    
    const closes = candles.map(c => c.close);
    const periods = 14;
    const deltas: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < closes.length; i++) {
      deltas.push(closes[i] - closes[i - 1]);
    }
    
    // Separate gains and losses
    for (const delta of deltas) {
      gains.push(Math.max(0, delta));
      losses.push(Math.abs(Math.min(0, delta)));
    }
    
    // Calculate RSI values
    const rsiValues: { time: number; value: number }[] = [];
    
    if (gains.length >= periods) {
      let avgGain = gains.slice(0, periods).reduce((a, b) => a + b, 0) / periods;
      let avgLoss = losses.slice(0, periods).reduce((a, b) => a + b, 0) / periods;
      
      for (let i = periods; i < gains.length; i++) {
        avgGain = (avgGain * (periods - 1) + gains[i]) / periods;
        avgLoss = (avgLoss * (periods - 1) + losses[i]) / periods;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        rsiValues.push({
          time: candles[i + 1].time * 1000,
          value: rsi
        });
      }
    }
    
    return rsiValues;
  }, [candles, showRSI]);

  // Calculate MACD for the chart
  const macdData = useMemo(() => {
    if (!showMACD || candles.length < 35) return [];
    
    const closes = candles.map(c => c.close);
    const fastPeriod = 12;
    const slowPeriod = 26;
    const signalPeriod = 9;
    
    // Calculate EMAs
    const ema = (values: number[], period: number) => {
      const k = 2 / (period + 1);
      const result: number[] = [];
      
      // Simple moving average used for the first value
      let sum = 0;
      for (let i = 0; i < period; i++) {
        sum += values[i];
      }
      
      let ema = sum / period;
      result.push(ema);
      
      // EMA for subsequent values
      for (let i = period; i < values.length; i++) {
        ema = (values[i] - ema) * k + ema;
        result.push(ema);
      }
      
      return result;
    };
    
    const fastEMA = ema(closes, fastPeriod);
    const slowEMA = ema(closes, slowPeriod);
    
    // Calculate MACD line
    const macdLine: number[] = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = 0; i < minLength; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    // Calculate signal line (EMA of MACD line)
    const signalLine = ema(macdLine, signalPeriod);
    
    // Prepare data for the chart
    const result: { time: number; macd: number; signal: number; histogram: number }[] = [];
    
    const offset = closes.length - macdLine.length;
    
    for (let i = 0; i < signalLine.length; i++) {
      const idx = i + offset + slowPeriod - signalPeriod;
      if (idx >= 0 && idx < candles.length) {
        const histogram = macdLine[i + signalPeriod - 1] - signalLine[i];
        result.push({
          time: candles[idx].time * 1000,
          macd: macdLine[i + signalPeriod - 1],
          signal: signalLine[i],
          histogram
        });
      }
    }
    
    return result;
  }, [candles, showMACD]);

  // Render the main price chart
  const renderPriceChart = useCallback(() => (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        {showXAxis && (
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(new Date(time), 'MMM d')}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
        )}
        {showYAxis && (
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
        )}
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend />}
        
        {/* Price Area */}
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="close"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorPrice)"
          name="Price"
        />
        
        {/* SMA Line */}
        {showSMA && smaData.length > 0 && (
          <Area
            type="monotone"
            dataKey="value"
            data={smaData}
            stroke="#ff7300"
            fill="none"
            dot={false}
            activeDot={false}
            name="SMA 20"
          />
        )}
        
        {/* Reference lines for current price */}
        {chartData.length > 0 && (
          <ReferenceLine
            y={chartData[chartData.length - 1].close}
            stroke="#82ca9d"
            strokeDasharray="3 3"
            label={({ viewBox }) => (
              <text x={viewBox.width - 10} y={viewBox.y} fill="#666" textAnchor="end" fontSize={12}>
                {chartData[chartData.length - 1].close.toFixed(2)}
              </text>
            )}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  ), [chartData, height, showGrid, showLegend, showSMA, showTooltip, showXAxis, showYAxis, smaData, width]);

  // Render RSI chart
  const renderRsiChart = useCallback(() => (
    <div style={{ height: 100, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rsiData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} hide={!showYAxis} width={30} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.1}
            name="RSI"
          />
          <ReferenceLine y={70} stroke="#ff7300" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="#ff7300" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ), [rsiData, showGrid, showYAxis]);

  // Render MACD chart
  const renderMacdChart = useCallback(() => (
    <div style={{ height: 100, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={macdData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey="time" hide />
          <YAxis hide={!showYAxis} width={30} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="macd"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.1}
            name="MACD"
          />
          <Area
            type="monotone"
            dataKey="signal"
            stroke="#ff7300"
            fill="none"
            dot={false}
            name="Signal"
          />
          <Bar dataKey="histogram" fill="#82ca9d" name="Histogram" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ), [macdData, showGrid, showYAxis]);

  // Render volume chart
  const renderVolumeChart = useCallback(() => (
    <div style={{ height: 60, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
          <Bar dataKey="volume" fill="#8884d8" name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ), [chartData]);

  if (loading) { // Added loading state check
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded ${className}`} style={{ height }}>
        <p className="text-gray-500">Loading chart...</p>
      </div>
    );
  }

  if (!candles || candles.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded ${className}`} style={{ height }}>
        <p className="text-gray-500">Loading chart data...</p> {/* Kept original message for no data */}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4">
        {/* Main Price Chart */}
        {renderPriceChart()}
        
        {/* RSI Chart */}
        {showRSI && rsiData.length > 0 && renderRsiChart()}
        
        {/* MACD Chart */}
        {showMACD && macdData.length > 0 && renderMacdChart()}
        
        {/* Volume Chart */}
        {showVolume && renderVolumeChart()}
      </div>
    </div>
  );
}
