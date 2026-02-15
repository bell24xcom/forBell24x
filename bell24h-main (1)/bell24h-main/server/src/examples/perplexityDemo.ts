import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PerplexityClient, type Message } from '../lib/perplexity.js';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Utility function to print section headers
function printSection(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`🔹 ${title}`);
  console.log('='.repeat(60));
}

// Utility function to print success messages
function printSuccess(message: string, data?: any) {
  console.log(`✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Utility function to print errors
function printError(message: string, error: unknown) {
  console.error(`❌ ${message}`);
  if (error instanceof Error) {
    console.error(error.message);
    if ('response' in error && error.response) {
      const response = error.response as { status?: number; data?: any };
      console.error('Response status:', response.status);
      console.error('Response data:', response.data);
    }
  } else {
    console.error('Unknown error occurred:', error);
  }
}

// Test different chat scenarios
async function testChatScenarios(client: PerplexityClient) {
  printSection('Testing Chat Scenarios');
  
  try {
    // Simple chat
    const simpleChat = await client.chat(
      'What is the capital of France?',
      'You are a helpful assistant.'
    );
    printSuccess('Simple chat test passed');
    console.log('Response:', simpleChat);
    
    // Multi-turn conversation
    const conversation: Message[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' },
      { role: 'assistant', content: 'The capital of France is Paris.' },
      { role: 'user', content: 'What is its population?' }
    ];
    
    const multiTurnResponse = await client.createChatCompletion({
      model: 'sonar',
      messages: conversation,
      temperature: 0.7,
    });
    
    printSuccess('Multi-turn conversation test passed');
    console.log('Response:', multiTurnResponse.choices[0]?.message?.content);
    
  } catch (error) {
    printError('Chat scenario test failed', error);
    throw error;
  }
}

// Test different models
async function testModels(client: PerplexityClient) {
  printSection('Testing Different Models');
  
  const models = [
    'sonar',
    'sonar-pro',
    'sonar-reasoning',
    'sonar-reasoning-pro',
    'sonar-deep-research',
    'r1-1776'
  ];
  
  for (const model of models) {
    try {
      console.log(`\nTesting model: ${model}`);
      const response = await client.chat(
        `Hello, this is a test of the ${model} model. Can you confirm which model you are?`,
        'You are a helpful assistant.'
      );
      console.log(`✅ ${model} response received`);
      console.log(response);
    } catch (error) {
      console.error(`❌ Error with model ${model}:`);
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
    
    // Add delay between model tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Test error handling
async function testErrorHandling(client: PerplexityClient) {
  printSection('Testing Error Handling');
  
  // Test with invalid model
  try {
    console.log('Testing with invalid model...');
    await client.createChatCompletion({
      model: 'invalid-model-name',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  } catch (error) {
    printSuccess('Correctly handled invalid model error', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Test with empty messages
  try {
    console.log('\nTesting with empty messages...');
    await client.createChatCompletion({
      model: 'sonar',
      messages: [],
    });
  } catch (error) {
    printSuccess('Correctly handled empty messages error', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Perplexity API Integration Tests');
  console.log('='.repeat(60));
  
  // Check if API key is available
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: PERPLEXITY_API_KEY is not set in environment variables');
    console.log('\nPlease create a .env file in the project root with:');
    console.log('PERPLEXITY_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    // Initialize client
    const client = new PerplexityClient({
      apiKey,
      requestsPerMinute: 10, // Conservative rate limit for testing
      maxRetries: 3,
      retryDelay: 1000,
    });
    
    printSection('Client Initialization');
    console.log('✅ Client initialized successfully');
    
    // Run test scenarios
    await testChatScenarios(client);
    await testModels(client);
    await testErrorHandling(client);
    
    printSection('All Tests Completed');
    console.log('✨ All integration tests completed successfully!');
    
  } catch (error) {
    printError('Test suite failed', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
