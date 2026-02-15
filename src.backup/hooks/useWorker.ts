import { useEffect, useRef, useCallback, useMemo } from 'react';

type WorkerMessage<T = any> = {
  type: string;
  payload: T;
};

type WorkerOptions = {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: ErrorEvent) => void;
};

export function useWorker<T = any, R = any>(
  workerPath: string,
  options: WorkerOptions = {}
) {
  const workerRef = useRef<Worker | null>(null);
  const messageQueue = useRef<Array<WorkerMessage>>([]);
  const isProcessing = useRef(false);

  // Initialize the worker
  useEffect(() => {
    const worker = new Worker(workerPath);
    workerRef.current = worker;

    const handleMessage = (event: MessageEvent) => {
      if (options.onMessage) {
        options.onMessage(event);
      }
    };

    const handleError = (error: ErrorEvent) => {
      console.error('Worker error:', error);
      if (options.onError) {
        options.onError(error);
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Process any queued messages
    if (messageQueue.current.length > 0) {
      messageQueue.current.forEach((message) => {
        worker.postMessage(message);
      });
      messageQueue.current = [];
    }

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
    };
  }, [workerPath, options]);

  // Function to send a message to the worker
  const postMessage = useCallback((message: WorkerMessage<T>) => {
    if (workerRef.current) {
      workerRef.current.postMessage(message);
    } else {
      // Queue the message if the worker isn't ready yet
      messageQueue.current.push(message);
    }
  }, []);

  // Function to send a message and wait for a response
  const postMessageWithResponse = useCallback(
    (message: WorkerMessage<T>): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event: MessageEvent) => {
          messageChannel.port1.close();
          resolve(event.data);
        };

        messageChannel.port1.onmessageerror = (error) => {
          messageChannel.port1.close();
          reject(error);
        };

        workerRef.current.postMessage(
          {
            ...message,
            _transfer: [messageChannel.port2],
          },
          [messageChannel.port2]
        );
      });
    },
    []
  );

  // Function to terminate the worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return useMemo(
    () => ({
      postMessage,
      postMessageWithResponse,
      terminate,
      worker: workerRef.current,
    }),
    [postMessage, postMessageWithResponse, terminate]
  );
}

export default useWorker;
