import { fetchCandles as cb } from '@/data/coinbase';
import { NextResponse } from 'next/server';

// Define the expected query parameters
type QueryParams = {
  symbol?: string;
  interval?: string;
};

export async function GET(request: Request) {
  try {
    // Parse query parameters from the URL
    const { searchParams } = new URL(request.url);
    const params: QueryParams = {
      symbol: searchParams.get('symbol') || 'BTC-USD', // Default to BTC-USD if not provided
      interval: searchParams.get('interval') || '1h',  // Default to 1h interval if not provided
    };

    // Fetch candles with the provided parameters
    const candles = await cb(params.symbol, params.interval);
    
    // Return the candles data
    return NextResponse.json(candles);
  } catch (error) { 
    console.error('Error fetching candles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' }, 
      { status: 500 }
    );
  }
}

// Define the request handler types for TypeScript
export const dynamic = 'force-dynamic'; // Ensure dynamic route handling
