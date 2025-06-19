interface TrendCardProps {
  trend: 'Bullish' | 'Bearish' | 'Neutral';
}

export default function TrendCard({ trend }: TrendCardProps) {
  const trendColor = trend === 'Bullish' ? 'text-green-600' : trend === 'Bearish' ? 'text-red-600' : 'text-gray-600';
  return (
    <div className="p-3 bg-gray-50 rounded">
      <h3 className="text-sm font-medium text-gray-500">Short-Term Trend</h3>
      <p className={`text-xl font-bold ${trendColor}`}>{trend}</p>
    </div>
  );
}