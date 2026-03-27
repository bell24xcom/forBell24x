import express, { type Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from '../routes/aiRoutes';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

class TestServer {
  private app: Express;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(express.json());
  }

  private configureRoutes() {
    // API routes
    this.app.use('/api/ai', aiRoutes);

    // Simple test route
    this.app.get('/', (_req, res) => {
      res.send('AI Service is running');
    });
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on http://localhost:${this.port}`);
      console.log(`📡 AI API available at http://localhost:${this.port}/api/ai`);
      console.log(`🩺 Health check: http://localhost:${this.port}/api/ai/health`);
    });
  }
}

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const server = new TestServer(PORT);
server.start();
