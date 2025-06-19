import { render, screen } from '@/test-utils/test-utils';
import PriceTicker from '../PriceTicker';

describe('PriceTicker', () => {
  it('displays the price with default currency (USD)', () => {
    render(<PriceTicker price={50000} />);
    expect(screen.getByText('50,000 USD')).toBeInTheDocument();
  });

  it('displays the price with custom currency', () => {
    render(<PriceTicker price={50000} currency="EUR" />);
    expect(screen.getByText('50,000 EUR')).toBeInTheDocument();
  });

  it('formats string prices correctly', () => {
    render(<PriceTicker price="50000.50" />);
    expect(screen.getByText('50000.50 USD')).toBeInTheDocument();
  });

  it('displays 24h change when provided', () => {
    render(<PriceTicker price={50000} change24h={5.25} />);
    expect(screen.getByText('▲ 5.25% (24h)')).toBeInTheDocument();
    expect(screen.getByText('▲ 5.25% (24h)')).toHaveClass('text-green-500');
  });

  it('displays negative change in red', () => {
    render(<PriceTicker price={50000} change24h={-3.5} />);
    expect(screen.getByText('▼ 3.5% (24h)')).toBeInTheDocument();
    expect(screen.getByText('▼ 3.5% (24h)')).toHaveClass('text-red-500');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<PriceTicker price={50000} size="sm" />);
    expect(screen.getByText('50,000 USD').parentElement).toHaveClass('text-2xl');
    
    rerender(<PriceTicker price={50000} size="md" />);
    expect(screen.getByText('50,000 USD').parentElement).toHaveClass('text-4xl');
    
    rerender(<PriceTicker price={50000} size="lg" />);
    expect(screen.getByText('50,000 USD').parentElement).toHaveClass('text-6xl');
  });
});
