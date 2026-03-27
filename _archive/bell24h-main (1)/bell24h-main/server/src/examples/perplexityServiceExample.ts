import PerplexityService from '../services/perplexityService';

async function runExample() {
  console.log('🚀 Starting Perplexity Service Example');
  
  try {
    // Get the singleton instance
    const perplexityService = PerplexityService.getInstance();
    
    // Test the connection
    console.log('🔌 Testing connection to Perplexity API...');
    const isConnected = await perplexityService.testConnection();
    console.log(`✅ Connection ${isConnected ? 'successful' : 'failed'}`);
    
    if (!isConnected) {
      throw new Error('Failed to connect to Perplexity API');
    }
    
    // Example 1: Simple chat
    console.log('\n💬 Example 1: Simple Chat');
    console.log('Question: What is the capital of France?');
    const response = await perplexityService.getChatResponse(
      'What is the capital of France?',
      'You are a helpful assistant.'
    );
    console.log('Response:', response);
    
    // Example 2: Conversation with context
    console.log('\n💬 Example 2: Conversation with Context');
    const conversation = [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: 'What is the capital of France?' },
      { role: 'assistant' as const, content: 'The capital of France is Paris.' },
      { role: 'user' as const, content: 'What is its population?' }
    ];
    
    console.log('Conversation:', JSON.stringify(conversation, null, 2));
    const conversationResponse = await perplexityService.getConversationResponse(conversation);
    console.log('Response:', conversationResponse);
    
    console.log('\n✨ Example completed successfully!');
  } catch (error) {
    console.error('❌ Error in example:', error);
    process.exit(1);
  }
}

// Run the example
runExample().catch(console.error);
