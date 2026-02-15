// This worker handles heavy computations off the main thread

// Import any required libraries that work in Web Workers
// Note: You can't use browser APIs like `window` or `document` in a worker

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'COMPUTE':
      // Perform heavy computation
      const result = heavyComputation(payload);
      // Send the result back to the main thread
      self.postMessage({ type: 'COMPUTE_RESULT', payload: result });
      break;
      
    case 'PROCESS_DATA':
      // Process large datasets
      const processed = processData(payload);
      self.postMessage({ type: 'DATA_PROCESSED', payload: processed });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};

// Example of a heavy computation function
function heavyComputation(data: any): any {
  // Implement your computation logic here
  // This runs in a separate thread
  console.log('Running heavy computation in worker');
  
  // Simulate heavy computation
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += Math.sqrt(i);
  }
  
  return { result, input: data };
}

// Example of data processing function
function processData(data: any[]): any {
  // Process the data
  console.log('Processing data in worker');
  
  // Example: Filter, map, or reduce large datasets
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now()
  }));
}

// Export for TypeScript module type
export {};
