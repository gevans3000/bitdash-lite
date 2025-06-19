import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url, {
        headers: {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
        }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch price from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching price from CoinGecko:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';