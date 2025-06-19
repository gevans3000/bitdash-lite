import { NextRequest } from 'next/server';
import { GET } from '../route';
import * as coinbase from '@/data/coinbase';
import { generateMockCandles } from '@/test-utils/test-helpers';

// Mock the coinbase module
jest.mock('@/data/coinbase');

const mockFetchCandles = coinbase.fetchCandles as jest.MockedFunction<typeof coinbase.fetchCandles>;

describe('GET /api/candles', () => {
  let req: NextRequest;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup a mock request
    req = new NextRequest('http://localhost:3000/api/candles');
  });

  it('should return 200 and data on successful fetch', async () => {
    // Setup mock data
    const mockCandles = generateMockCandles(10);
    mockFetchCandles.mockResolvedValueOnce(mockCandles);
    
    // Call the API route
    const response = await GET(req);
    const data = await response.json();
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(mockCandles);
    expect(mockFetchCandles).toHaveBeenCalledTimes(1);
  });

  it('should return 500 and error message on fetch failure', async () => {
    // Setup mock to reject
    const errorMessage = 'Failed to fetch candles';
    mockFetchCandles.mockRejectedValueOnce(new Error(errorMessage));
    
    // Call the API route
    const response = await GET(req);
    const data = await response.json();
    
    // Verify the error response
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch candle data' });
    expect(mockFetchCandles).toHaveBeenCalledTimes(1);
  });

  it('should pass query parameters to fetchCandles', async () => {
    // Setup mock data
    const mockCandles = generateMockCandles(5);
    mockFetchCandles.mockResolvedValueOnce(mockCandles);
    
    // Call with query parameters
    const reqWithParams = new NextRequest('http://localhost:3000/api/candles?symbol=BTC-USD&interval=1h');
    await GET(reqWithParams);
    
    // Verify fetchCandles was called with the correct parameters
    expect(mockFetchCandles).toHaveBeenCalledWith('BTC-USD', '1h');
  });
});
