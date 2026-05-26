/**
 * Simplified Express server for Bell24h
 */
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { upload, processVoiceRfq, getVoiceRfqs, handleUploadError } from './server/lib/voiceRfq';
import { connectToDatabase } from './db';

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Voice RFQ routes
app.post('/api/voice-rfq/process', upload.single('audio'), handleUploadError, processVoiceRfq);
app.get('/api/voice-rfq', getVoiceRfqs);

// API 404 handler for non-existent API routes
app.all('/api/*', (req: Request, res: Response) => {
  return res.status(404).json({ error: 'API endpoint not found' });
});

// Catch-all route for front-end routing
app.get('*', (req: Request, res: Response) => {
  // Serve main index.html for client-side routes
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message || 'Unknown error occurred' });
});

// Connect to database and start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      console.warn('Database connection failed, starting server without database functionality');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
