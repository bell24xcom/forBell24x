import express, { type Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { StatusCodes } from 'http-status-codes';

// Import routes
import perplexityRoutes from './routes/perplexityRoutes';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class PerplexityServer {
  private app: Express;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware() {
    // Enable CORS
    this.app.use(cors());
    
    // Parse JSON bodies
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    
    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      next();
    });
  }

  private configureRoutes() {
    // API routes
    this.app.use('/api/perplexity', perplexityRoutes);
    
    // Health check endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        service: 'Perplexity API Service',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });
    
    // 404 handler
    this.app.use((_req, res) => {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        message: 'Endpoint not found',
      });
    });
  }

  private configureErrorHandling() {
    // Error handling middleware
    this.app.use((err: any, _req: any, res: any, _next: any) => {
      console.error('Unhandled error:', err);
      
      const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      const message = err.message || 'Internal Server Error';
      
      res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on http://localhost:${this.port}`);
      console.log(`📡 Perplexity API available at http://localhost:${this.port}/api/perplexity`);
      console.log(`🩺 Health check: http://localhost:${this.port}/api/perplexity/health`);
    });
  }
}

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const server = new PerplexityServer(PORT);
server.start();
