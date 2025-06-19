import { NextResponse } from 'next/server';

// Generate a random number between min and max
function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random order book data
function generateMockOrderBook() {
  const basePrice = 50000 + (Math.random() * 2000 - 1000); // Random price around 50,000
  const spread = 100; // Base spread
  
  // Generate bids (below current price)
  const bids: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const price = basePrice - (i * 5) - (Math.random() * 10);
    const size = Math.random() * 5; // Random size up to 5 BTC
    bids.push([Number(price.toFixed(2)), Number(size.toFixed(4))]);
  }
  
  // Generate asks (above current price)
  const asks: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const price = basePrice + spread + (i * 5) + (Math.random() * 10);
    const size = Math.random() * 5; // Random size up to 5 BTC
    asks.push([Number(price.toFixed(2)), Number(size.toFixed(4))]);
  }
  
  // Add some larger orders at key levels to simulate support/resistance
  // Add a large buy wall (support)
  const supportLevel = Math.floor(basePrice / 100) * 100 - 100; // Round down to nearest 100 - 100
  bids.unshift([supportLevel, 25 + Math.random() * 25]);
  
  // Add a large sell wall (resistance)
  const resistanceLevel = Math.ceil(basePrice / 100) * 100 + 100; // Round up to nearest 100 + 100
  asks.unshift([resistanceLevel, 20 + Math.random() * 30]);
  
  return {
    bids: bids.sort((a, b) => b[0] - a[0]), // Sort bids in descending order
    asks: asks.sort((a, b) => a[0] - b[0]),  // Sort asks in ascending order
    timestamp: Date.now()
  };
}

export async function GET() {
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Generate fresh mock data for each request
  const mockOrderBook = generateMockOrderBook();
  
  // Set cache control headers to prevent caching
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, max-age=0');
  
  return new NextResponse(JSON.stringify(mockOrderBook), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(headers)
    }
  });
}