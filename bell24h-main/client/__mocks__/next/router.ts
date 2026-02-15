export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  route: '/test-route',
  pathname: '/test-path',
  query: {},
  asPath: '/test-path',
  basePath: '',
  isLocaleDomain: true,
  isReady: true,
  isPreview: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
});

export const withRouter = (Component: any) => Component;

const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  route: '/test-route',
  pathname: '/test-path',
  query: {},
  asPath: '/test-path',
  basePath: '',
  isLocaleDomain: true,
  isReady: true,
  isPreview: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

export default router;
