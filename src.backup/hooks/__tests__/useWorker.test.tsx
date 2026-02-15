import { renderHook, act } from '@testing-library/react-hooks';
import { useWorker } from '../useWorker';

// Mock the Worker class
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
}));

describe('useWorker', () => {
  const workerPath = '/mock-worker.js';
  let mockWorker: any;

  beforeEach(() => {
    // Reset the mock worker before each test
    mockWorker = new Worker('');
    jest.clearAllMocks();
  });

  it('should initialize worker correctly', () => {
    const { result } = renderHook(() => useWorker(workerPath));
    
    expect(Worker).toHaveBeenCalledWith(workerPath);
    expect(result.current.worker).toBeDefined();
  });

  it('should post message to worker', () => {
    const { result } = renderHook(() => useWorker(workerPath));
    const testMessage = { type: 'TEST', payload: 'test' };
    
    act(() => {
      result.current.postMessage(testMessage);
    });
    
    expect(mockWorker.postMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should handle incoming messages', () => {
    const onMessage = jest.fn();
    const testMessage = { data: { type: 'RESULT', payload: 'test' } };
    
    const { result } = renderHook(() => 
      useWorker(workerPath, { onMessage })
    );
    
    // Simulate message from worker
    act(() => {
      mockWorker.onmessage(testMessage);
    });
    
    expect(onMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should handle worker errors', () => {
    const onError = jest.fn();
    const testError = new Error('Worker error');
    
    const { result } = renderHook(() => 
      useWorker(workerPath, { onError })
    );
    
    // Simulate error from worker
    act(() => {
      mockWorker.onerror(testError);
    });
    
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should terminate worker on unmount', () => {
    const { result, unmount } = renderHook(() => useWorker(workerPath));
    
    unmount();
    
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should queue messages when worker is not ready', () => {
    // Mock worker not being ready
    const postMessageSpy = jest.spyOn(Worker.prototype, 'postMessage');
    
    const { result } = renderHook(() => useWorker(workerPath));
    
    // Clear the initial postMessage call from the mock
    postMessageSpy.mockClear();
    
    // Try to post message before worker is ready
    act(() => {
      result.current.postMessage({ type: 'QUEUED' });
    });
    
    // Message should be queued, not posted yet
    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
