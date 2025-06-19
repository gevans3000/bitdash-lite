import { NextResponse } from 'next/server';

export async function GET() {
  // This is a mock API endpoint for demonstration purposes.
  // In a real application, you would fetch live order book data from an exchange API.
  const mockOrderBook = {
    bids: [
      [104490.00, 0.5],
      [104485.50, 1.2],
      [104480.00, 0.8],
      [104475.25, 2.1],
      [104470.00, 0.3],
    ],
    asks: [
      [104510.00, 0.7],
      [104515.50, 1.0],
      [104520.00, 0.6],
      [104525.75, 1.5],
      [104530.00, 0.4],
    ],
  };

  return NextResponse.json(mockOrderBook);
}