import { render, screen } from '@/test-utils/test-utils';
import SignalCard from '../SignalCard';

describe('SignalCard', () => {
  const baseSignal = {
    type: 'BUY' as const,
    timestamp: Date.now(),
    confidence: 0.85,
    indicators: {
      rsi: 30.5,
      macd: {
        value: 12.5,
        signal: 10.2,
        histogram: 2.3,
      },
    },
  };

  it('renders the signal type correctly', () => {
    render(<SignalCard signal={baseSignal} />);
    expect(screen.getByText('Trading Signal')).toBeInTheDocument();
    expect(screen.getByText('Buy')).toBeInTheDocument();
  });

  it('displays the timestamp if provided', () => {
    const timestamp = new Date('2023-01-01T12:00:00Z').getTime();
    render(<SignalCard signal={{ ...baseSignal, timestamp }} />);
    
    // The exact format depends on the locale, so we'll just check for the date parts
    expect(screen.getByText(/Time:/)).toHaveTextContent('1/1/2023');
  });

  it('displays the confidence percentage', () => {
    render(<SignalCard signal={baseSignal} />);
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('displays indicator values when provided', () => {
    render(<SignalCard signal={baseSignal} />);
    
    expect(screen.getByText('Indicators')).toBeInTheDocument();
    expect(screen.getByText('RSI: 30.50')).toBeInTheDocument();
    expect(screen.getByText('MACD: 12.5000')).toBeInTheDocument();
    expect(screen.getByText('Signal: 10.2000')).toBeInTheDocument();
    expect(screen.getByText('Hist: 2.3000')).toBeInTheDocument();
  });

  it('applies correct styles based on signal type', () => {
    const { rerender } = render(<SignalCard signal={baseSignal} />);
    expect(screen.getByText('Buy').parentElement).toHaveClass('bg-green-100', 'border-green-500');
    
    rerender(<SignalCard signal={{ ...baseSignal, type: 'SELL' }} />);
    expect(screen.getByText('Sell').parentElement).toHaveClass('bg-red-100', 'border-red-500');
    
    rerender(<SignalCard signal={{ ...baseSignal, type: 'NEUTRAL' }} />);
    expect(screen.getByText('Neutral').parentElement).toHaveClass('bg-gray-100', 'border-gray-500');
  });

  it('applies custom className if provided', () => {
    render(<SignalCard signal={baseSignal} className="custom-class" />);
    expect(screen.getByText('Trading Signal').closest('div')).toHaveClass('custom-class');
  });
});
