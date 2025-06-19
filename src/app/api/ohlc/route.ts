import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coinId') || 'bitcoin';
    const vsCurrency = searchParams.get('vsCurrency') || 'usd';
    const days = searchParams.get('days') || '7';

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=${vsCurrency}&days=${days}`;
    const response = await fetch(url, {
        headers: {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
        }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLC candles from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching OHLC candles from CoinGecko:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';