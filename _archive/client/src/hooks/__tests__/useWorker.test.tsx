import { renderHook, act } from '@testing-library/react';
import { useWorker } from '../useWorker';

// Mock the Worker constructor with proper method implementations
const mockWorker = {
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onmessage: null as ((event: MessageEvent) => void) | null,
  onerror: null as ((event: ErrorEvent) => void) | null,
  onmessageerror: null as ((event: MessageEvent) => void) | null,
};

const mockWorkerConstructor = jest.fn().mockImplementation(() => mockWorker);

describe('useWorker', () => {
  beforeEach(() => {
    // Reset the Worker mock and clear all mocks
    jest.clearAllMocks();
    global.Worker = mockWorkerConstructor as any;
  });

  it('should initialize a worker with the correct URL', () => {
    const { result } = renderHook(() => useWorker('/test-worker.js'));

    expect(mockWorkerConstructor).toHaveBeenCalledWith('/test-worker.js');
    expect(result.current.worker).toBeDefined();
    expect(result.current.isReady).toBe(true);
  });

  it('should post message to worker', () => {
    const { result } = renderHook(() => useWorker('/test-worker.js'));
    const testMessage = { type: 'test', data: 'test-data' };

    act(() => {
      result.current.postMessage(testMessage);
    });

    expect(mockWorker.postMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should terminate worker on cleanup', () => {
    const { result, unmount } = renderHook(() => useWorker('/test-worker.js'));

    unmount();

    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should handle worker messages', () => {
    const onMessageMock = jest.fn();
    const { result } = renderHook(() => useWorker('/test-worker.js', { onMessage: onMessageMock }));
    const testMessage = { type: 'response', data: 'response-data' };

    act(() => {
      if (mockWorker.onmessage) {
        mockWorker.onmessage({ data: testMessage } as MessageEvent);
      }
    });

    expect(onMessageMock).toHaveBeenCalledWith(testMessage);
  });

  it('should handle worker errors', () => {
    const onErrorMock = jest.fn();
    const { result } = renderHook(() => useWorker('/test-worker.js', { onError: onErrorMock }));
    const testError = new ErrorEvent('error', { message: 'Worker error' });

    act(() => {
      if (mockWorker.onerror) {
        mockWorker.onerror(testError);
      }
    });

    expect(onErrorMock).toHaveBeenCalledWith(testError);
    expect(result.current.error).toBeDefined();
  });

  it('should handle worker message errors', () => {
    const onMessageErrorMock = jest.fn();
    const { result } = renderHook(() =>
      useWorker('/test-worker.js', { onMessageError: onMessageErrorMock })
    );
    const testMessageError = new MessageEvent('messageerror');

    act(() => {
      if (mockWorker.onmessageerror) {
        mockWorker.onmessageerror(testMessageError);
      }
    });

    expect(onMessageErrorMock).toHaveBeenCalledWith(testMessageError);
  });

  it('should handle worker creation errors', () => {
    // Mock Worker constructor to throw an error
    const errorWorkerConstructor = jest.fn().mockImplementation(() => {
      throw new Error('Failed to create worker');
    });
    global.Worker = errorWorkerConstructor as any;

    const { result } = renderHook(() => useWorker('/invalid-worker.js'));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to create worker');
    expect(result.current.worker).toBeNull();
    expect(result.current.isReady).toBe(false);
  });

  it('should provide terminate function', () => {
    const { result } = renderHook(() => useWorker('/test-worker.js'));

    act(() => {
      result.current.terminate();
    });

    expect(mockWorker.terminate).toHaveBeenCalled();
    expect(result.current.worker).toBeNull();
    expect(result.current.isReady).toBe(false);
  });
});
