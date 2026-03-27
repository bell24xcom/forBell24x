import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { theme } from '@/styles/theme';

type CustomRenderOptions = Omit<RenderOptions, 'queries'> & {
  router?: Partial<NextRouter>;
};

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  forward: jest.fn(),
};

const AllTheProviders = ({
  children,
  routerOptions = {},
}: {
  children: ReactNode;
  routerOptions?: Partial<NextRouter>;
}) => {
  return (
    <RouterContext.Provider value={{ ...mockRouter, ...routerOptions }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </RouterContext.Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { router: routerOptions, ...restOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders routerOptions={routerOptions}>
        {children}
      </AllTheProviders>
    ),
    ...restOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper functions
export const mockNextUseRouter = (router: Partial<NextRouter>) => {
  jest.mock('next/router', () => ({
    useRouter: () => ({
      ...mockRouter,
      ...router,
    }),
  }));
};

export const mockFetch = (data: any, status = 200) => {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );
};

export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

export const mockSession = (sessionData = {}) => {
  const mockSession = {
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2024-01-01T00:00:00.000Z',
      ...sessionData,
    },
    status: 'authenticated',
  };

  jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => mockSession),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(() => Promise.resolve(mockSession.data)),
    getCsrfToken: jest.fn(),
    getProviders: jest.fn(),
    SessionProvider: ({ children }: { children: ReactNode }) => children,
  }));

  return mockSession;
};
