import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PerplexityClient } from '../lib/perplexity.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Check for API key
if (!process.env.PERPLEXITY_API_KEY) {
  console.error('❌ Error: PERPLEXITY_API_KEY is not set in .env file');
  process.exit(1);
}

// Initialize the client with rate limiting (20 requests per minute)
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  rateLimitPerMinute: 20, // Adjust based on your needs
  maxRetries: 3,
});

// Example conversation
const conversation = [
  {
    role: 'system' as const,
    content: 'You are a helpful assistant that provides concise answers.'
  },
  {
    role: 'user' as const,
    content: 'What is the capital of France?'
  }
];

// Test chat completion
async function testChatCompletion() {
  try {
    console.log('🚀 Testing chat completion...');
    
    // Simple chat
    const response1 = await client.chat(
      'What is the capital of France?',
      'You are a helpful assistant.'
    );
    
    console.log('\n💬 Simple Chat Response:');
    console.log(response1);
    
    // Advanced chat completion with more options
    const response2 = await client.createChatCompletion({
      model: 'sonar-small-chat',
      messages: conversation,
      temperature: 0.7,
      max_tokens: 150,
    });
    
    console.log('\n✨ Advanced Chat Completion:');
    console.log(response2.choices[0]?.message?.content);
    
    // Test rate limiting with multiple requests
    console.log('\n⏳ Testing rate limiting with multiple requests...');
    const requests = Array(5).fill(0).map((_, i) => 
      client.chat(`Test message ${i + 1}`, 'You are a helpful assistant.')
        .then(() => console.log(`✅ Request ${i + 1} completed at ${new Date().toISOString()}`))
        .catch(err => console.error(`❌ Request ${i + 1} failed:`, err.message))
    );
    
    await Promise.all(requests);
    
    // Test error handling
    console.log('\n⚠️ Testing error handling...');
    try {
      await client.createChatCompletion({
        model: 'non-existent-model',
        messages: [{ role: 'user', content: 'This should fail' }],
      });
    } catch (error: any) {
      console.log('✅ Error handled successfully:');
      console.log(`  Status: ${error.status || 'N/A'}`);
      console.log(`  Message: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error instanceof Error) {
      console.error(error.message);
      if ('status' in error) {
        console.error(`Status: ${(error as any).status}`);
      }
      if ('code' in error) {
        console.error(`Code: ${(error as any).code}`);
      }
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run the example
console.log('🚀 Starting Perplexity API example...');
testChatCompletion().then(() => {
  console.log('\n✨ Example completed successfully!');  
}).catch(error => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
