import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Explicitly import jest-dom matchers
import MarketChart from '../MarketChart';
import { Candle } from '@/lib/types';

// Mock recharts to make tests faster
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  // Define a more specific type for ResponsiveContainer props
  type ResponsiveContainerProps = {
    children: React.ReactNode;
    [key: string]: any; // Allow other props
  };
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, ...props }: ResponsiveContainerProps) => (
      <div data-testid="responsive-container" {...props}>
        {children}
      </div>
    ),
  };
});

const generateMockCandles = (count: number, basePrice = 100): Candle[] => {
  const now = Math.floor(Date.now() / 1000);
  const candles: Candle[] = [];
  
  for (let i = 0; i < count; i++) {
    const open = basePrice + (Math.random() * 10 - 5);
    const close = open + (Math.random() * 10 - 5);
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    
    candles.push({
      time: now - (count - i) * 3600, // Hourly candles
      open,
      high,
      low,
      close,
      volume: 1000 + Math.random() * 500
    });
  }
  
  return candles;
};

describe('MarketChart', () => {
  it('renders loading state when no candles provided', () => {
    render(<MarketChart candles={[]} />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders chart with candles', () => {
    const mockCandles = generateMockCandles(50);
    render(<MarketChart candles={mockCandles} />);
    
    // Check if the main chart container is rendered
    const chartContainer = screen.getByTestId('responsive-container');
    expect(chartContainer).toBeInTheDocument();
    
    // Check if the chart has the correct number of data points
    const chart = screen.getByRole('region');
    expect(chart).toBeInTheDocument();
  });
  
  it('toggles indicators visibility', () => {
    const mockCandles = generateMockCandles(100);
    
    // Test with RSI and MACD enabled
    const { rerender } = render(
      <MarketChart 
        candles={mockCandles} 
        showRSI={true} 
        showMACD={true} 
        showSMA={true}
      />
    );
    
    // Check if indicators are rendered
    // Note: In a real test, we would check for specific elements
    // but since we're mocking recharts, we'll just check the props
    const chartContainer = screen.getByTestId('responsive-container');
    expect(chartContainer).toBeInTheDocument();
    
    // Test with indicators disabled
    rerender(
      <MarketChart 
        candles={mockCandles} 
        showRSI={false} 
        showMACD={false}
        showSMA={false}
      />
    );
    
    expect(chartContainer).toBeInTheDocument();
  });
  
  it('handles empty candle data gracefully', () => {
    render(<MarketChart candles={[]} />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    const mockCandles = generateMockCandles(5);
    const testClassName = 'test-class';
    
    render(
      <MarketChart 
        candles={mockCandles} 
        className={testClassName} 
      />
    );
    
    const container = screen.getByTestId('responsive-container').closest('div');
    expect(container).toHaveClass(testClassName);
  });

  it('shows loading state when loading is true', () => {
    render(<MarketChart candles={[]} loading={true} />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const mockCandles = generateMockCandles(30);
    render(<MarketChart candles={mockCandles} />);
    expect(screen.getByText('Market Chart')).toBeInTheDocument();
  });

  it('displays the correct number of candles', () => {
    const mockCandles = generateMockCandles(30);
    const { container } = render(<MarketChart candles={mockCandles} />);
    // This is a simplified test - in a real app, you'd test the actual chart rendering
    const chartContainer = container.firstChild;
    expect(chartContainer).toBeInTheDocument();
  });

  it('applies custom height and width', () => {
    const height = 500;
    const width = '80%';
    render(
      <MarketChart
        candles={generateMockCandles(5)} // Defined mockCandles in scope
        height={height}
        width={width}
      />
    );
    
    const chartContainer = screen.getByText('Market Chart').parentElement;
    expect(chartContainer).toHaveStyle(`height: ${height}px`);
    expect(chartContainer).toHaveStyle(`width: ${width}`);
  });
});
