import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PerplexityClient } from '../lib/perplexity.js';

// Add type for process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PERPLEXITY_API_KEY: string;
    }
  }
}

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error('PERPLEXITY_API_KEY is not set in .env file');
}

// Initialize the client
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY
});

// Test the connection
async function main() {
  try {
    console.log('Starting Perplexity API test...');
    const result = await client.testConnection();
    console.log('Test completed successfully!');
    console.log('Available models:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();
