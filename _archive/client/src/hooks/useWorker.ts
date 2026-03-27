import { useState, useEffect, useCallback } from 'react';

interface WorkerOptions {
  onMessage?: (data: any) => void;
  onError?: (error: ErrorEvent) => void;
  onMessageError?: (error: MessageEvent) => void;
}

export function useWorker(scriptUrl: string, options: WorkerOptions = {}) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onMessage, onError, onMessageError } = options;

  useEffect(() => {
    try {
      const newWorker = new Worker(scriptUrl);

      newWorker.onmessage = event => {
        if (onMessage) {
          onMessage(event.data);
        }
      };

      newWorker.onerror = event => {
        setError(new Error(event.message));
        if (onError) {
          onError(event);
        }
      };

      newWorker.onmessageerror = event => {
        if (onMessageError) {
          onMessageError(event);
        }
      };

      setWorker(newWorker);
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create worker'));
    }

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, [scriptUrl, onMessage, onError, onMessageError]);

  const postMessage = useCallback(
    (data: any) => {
      if (worker && isReady) {
        worker.postMessage(data);
      }
    },
    [worker, isReady]
  );

  const terminate = useCallback(() => {
    if (worker) {
      worker.terminate();
      setWorker(null);
      setIsReady(false);
    }
  }, [worker]);

  return {
    worker,
    isReady,
    error,
    postMessage,
    terminate,
  };
}
