import { faker } from '@faker-js/faker';
import { Candle } from '@/lib/types';

export const generateMockCandle = (overrides: Partial<Candle> = {}): Candle => ({
  time: overrides.time || Date.now() / 1000,
  open: overrides.open || faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
  high: overrides.high || faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
  low: overrides.low || faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
  close: overrides.close || faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
  volume: overrides.volume || faker.number.float({ min: 0, max: 1000, fractionDigits: 4 }),
});

export const generateMockCandles = (count: number, interval: number = 60 * 60 * 1000): Candle[] => {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => 
    generateMockCandle({
      time: (now - (count - i - 1) * interval) / 1000,
    })
  );
};

/**
 * Mocks the fetch API response
 * @param data Response data
 * @param status HTTP status code
 * @returns Mocked fetch response
 */
export const mockFetchResponse = <T>(data: T, status = 200): Response => {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
  
  return response;
};

/**
 * Waits for a specified time (for testing async operations)
 * @param ms Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mocks the WebSocket for testing
 */
export class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState: number;
  
  constructor(url: string) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    MockWebSocket.instances.push(this);
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 10);
  }
  
  send(data: string) {
    // Handle subscription messages
    if (data.includes('subscribe')) {
      // Simulate subscription confirmation
      const message = {
        type: 'subscription_succeeded',
        channel: JSON.parse(data).channels[0].name
      };
      
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify(message) });
      }
    }
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
  
  // Test helper to simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
  
  // Reset all mock WebSocket instances
  static reset() {
    MockWebSocket.instances = [];
  }
}

// Assign MockWebSocket to global.WebSocket
Object.defineProperty(global, 'WebSocket', {
  value: MockWebSocket,
  writable: true,
  configurable: true // Allow redefining for tests if needed
});

// The readyState constants (CONNECTING, OPEN, etc.) are usually part of the WebSocket constructor/prototype
// and don't need to be redefined here if MockWebSocket correctly mimics the standard WebSocket API.
// If MockWebSocket instances need these constants, they should be defined on MockWebSocket.prototype or as static properties.
// For now, removing the direct redefinition on global.WebSocket to avoid the overwrite error.

export const mockFetchError = (
  error: string = 'Internal Server Error',
  status: number = 500
) => {
  return Promise.reject({
    ok: false,
    status,
    statusText: error,
    json: () => Promise.resolve({ error }),
    text: () => Promise.resolve(JSON.stringify({ error })),
  });
};

// Helper to wait for all queries to complete
export const waitForQueries = async (ms: number = 0) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

// Helper to mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe() {
    // Trigger callback with an entry that has isIntersecting: true
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver as any;
