import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { apiRateLimiter } from './middleware/rateLimiter';
import { csrfProtection } from './middleware/csrfProtection';
import { gdprConsent } from './middleware/gdprConsent';
import { sslRedirect } from './middleware/sslRedirect';
import { rtlSupport } from './middleware/rtlSupport';
import { log } from './vite.js';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { monitoringMiddleware } from './middleware/monitoringMiddleware';
import { createRateLimiter } from './middleware/rateLimiter';
import pino from 'pino';

const app = express();

// Security Middleware
app.use(sslRedirect);
app.use(apiRateLimiter);
app.use(cookieParser());
app.use(csrfProtection);
app.use(gdprConsent);
app.use(rtlSupport);

// Performance monitoring middleware
app.use(monitoringMiddleware);

// Body parsers
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp',
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true
}));

// Debug logging for requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _, next) => {
    log(`${req.method} ${req.url}`);
    next();
  });
}

// Request logging middleware (logs all HTTP requests)
app.use(requestLogger);

// Register API routes
import { registerRoutes } from './routes/index';

// Initialize routes asynchronously
(async () => {
  try {
    await registerRoutes(app);
  } catch (error) {
    console.error('Failed to register routes:', error);
    process.exit(1);
  }
})();

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Bell24H API Server',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Direct test route to verify express is working
app.get('/direct-test', (req, res) => {
  res.json({ 
    message: 'Direct route works!', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    server: 'Bell24H Backend'
  });
});

// Error handling middleware (logs and standardizes errors)
app.use(errorHandler);

const serverConfig = {
  port: process.env.PORT || 5000,
  hostname: '0.0.0.0',
  logger: pino({
    // ... existing code ...
  })
};

export default app;
