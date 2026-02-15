// Polyfill for requestAnimationFrame
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    function (callback) {
      return setTimeout(callback, 0);
    };

  // @ts-ignore
  window.cancelAnimationFrame =
    window.cancelAnimationFrame ||
    function (id) {
      return clearTimeout(id);
    };
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];

  constructor() {}

  disconnect() {
    return null;
  }

  observe() {
    return null;
  }

  takeRecords() {
    return [];
  }

  unobserve() {
    return null;
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Mock ResizeObserver
class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = (function () {
  let store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (function () {
  let store = {};

  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
if (!window.fetch) {
  // @ts-ignore
  window.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
}

// Mock URL.createObjectURL
if (!window.URL.createObjectURL) {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: jest.fn(),
  });
}

// Mock URL.revokeObjectURL
if (!window.URL.revokeObjectURL) {
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: jest.fn(),
  });
}

// Mock for CSS modules
Object.defineProperty(global, 'CSS', {
  supports: () => false,
});

// Mock for document.createRange
document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

// Mock for document.execCommand
document.execCommand = jest.fn();

// Mock for getSelection
window.getSelection = () => ({
  removeAllRanges: () => {},
  addRange: () => {},
  toString: () => '',
});
