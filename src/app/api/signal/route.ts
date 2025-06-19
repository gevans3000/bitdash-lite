import { NextResponse } from 'next/server';
import { fetchKrakenCandles } from '@/data/kraken';
import { generateSignal } from '@/lib/signals'; // Import the new generateSignal
import { TradingSignal } from '@/lib/types'; // Import TradingSignal interface

export async function GET() {
  try {
    // Fetch true 5-minute and 60-minute (1-hour) candles from Kraken
    const fiveMinCandles = await fetchKrakenCandles('BTC/USD', 5);
    const oneHourCandles = await fetchKrakenCandles('BTC/USD', 60);

    // Generate the trading signal using the new logic
    const signal: TradingSignal = generateSignal(fiveMinCandles, oneHourCandles);

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Error generating signal:', error);
    return NextResponse.json(
      {
        direction: 'NEUTRAL',
        strength: 'WEAK',
        indicators: {},
        timestamp: Date.now(),
        reason: `Error fetching data or generating signal: ${error instanceof Error ? error.message : String(error)}`,
      } as TradingSignal,
      { status: 500 }
    );
  }
}