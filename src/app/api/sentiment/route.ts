import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    if (!response.ok) {
      throw new Error(`Failed to fetch Fear & Greed Index: ${response.statusText}`);
    }
    const data = await response.json();
    if (data && data.data && data.data.length > 0) {
      const latestData = data.data[0];
      return NextResponse.json({
        value: parseInt(latestData.value),
        value_classification: latestData.value_classification,
        timestamp: parseInt(latestData.timestamp) * 1000 // Convert to milliseconds
      });
    }
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}