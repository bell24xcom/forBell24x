import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PerplexityClient } from './lib/perplexity.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Check for API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('Error: PERPLEXITY_API_KEY is not set in .env file');
  process.exit(1);
}

// Initialize the client
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY
});

// Test the connection
async function testConnection() {
  try {
    console.log('🔄 Testing Perplexity API connection...');
    const result = await client.testConnection();
    
    console.log('✅ Connection successful!');
    console.log('\nAvailable models:');
    result.data.forEach((model: any) => {
      console.log(`- ${model.id} (${model.owned_by})`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Connection failed:');
    if (error instanceof Error) {
      console.error(error.message);
      if (error.cause) {
        console.error('Cause:', error.cause);
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the test
testConnection();
