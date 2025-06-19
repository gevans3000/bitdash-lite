import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Create a custom renderer that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Renamed cacheTime to gcTime for React Query v5
      },
    },
    // logger: { // Logger option removed/changed in v5
    //   log: console.log,
    //   warn: console.warn,
    //   error: () => {},
    // },
  });

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', router = {}, ...renderOptions }: { route?: string; router?: any } & Omit<RenderOptions, 'queries'> = {}
) {
  const mockRouter = {
    route,
    pathname: route,
    query: {},
    asPath: route,
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    basePath: '',
    ...router,
  };

  const testQueryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppRouterContext.Provider value={mockRouter as any}>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </AppRouterContext.Provider>
  );

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    mockRouter,
    queryClient: testQueryClient,
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };
