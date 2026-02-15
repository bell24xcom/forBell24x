import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Compression filter function
const shouldCompress = (req: Request, res: Response) => {
  // Don't compress responses with this request header
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Use compression by default
  return compression.filter(req, res);
};

// Compression options
export const compressionOptions = {
  filter: shouldCompress,
  level: 6, // Default compression level
  threshold: 1024, // Only compress responses larger than 1KB
  windowBits: 15,
  memLevel: 8,
  strategy: 0,
  chunkSize: 16 * 1024,
};

// Create compression middleware
export const compress = compression(compressionOptions);

// Custom compression middleware for specific routes
export const selectiveCompression = (req: Request, res: Response, next: NextFunction) => {
  // List of routes that should always be compressed
  const alwaysCompressRoutes = [
    '/api/reports',
    '/api/analytics',
    '/api/export',
  ];

  // List of routes that should never be compressed
  const neverCompressRoutes = [
    '/api/stream',
    '/api/websocket',
  ];

  const path = req.path;

  if (neverCompressRoutes.some(route => path.startsWith(route))) {
    req.headers['x-no-compression'] = 'true';
  } else if (alwaysCompressRoutes.some(route => path.startsWith(route))) {
    delete req.headers['x-no-compression'];
  }

  next();
};

// Dynamic compression level based on response size
export const dynamicCompression = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (typeof body === 'string' || Buffer.isBuffer(body)) {
      const size = Buffer.byteLength(body);
      
      // Adjust compression level based on response size
      if (size > 1024 * 1024) { // > 1MB
        compressionOptions.level = 9; // Maximum compression
      } else if (size > 100 * 1024) { // > 100KB
        compressionOptions.level = 6; // Default compression
      } else {
        compressionOptions.level = 1; // Minimal compression
      }
    }

    return originalSend.call(this, body);
  };

  next();
}; 