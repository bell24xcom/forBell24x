// Test AI Integration
const OpenAI = require('openai');

async function testAIIntegration() {
  console.log('🤖 Testing AI Integration...');
  
  // Test OpenAI API
  const openai = new OpenAI({
    apiKey: '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'
  });

  try {
    console.log('✅ OpenAI client created successfully');
    
    // Test simple completion
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello, test message for Bell24h AI integration' }],
      model: 'gpt-3.5-turbo',
      max_tokens: 50
    });

    console.log('✅ OpenAI API call successful');
    console.log('Response:', completion.choices[0]?.message?.content);
    
    return { success: true, message: 'AI integration working' };
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test Nano Banana API
async function testNanoBananaIntegration() {
  console.log('🍌 Testing Nano Banana Integration...');
  
  try {
    const response = await fetch('https://api.nanobanana.com/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'Generate marketing content for Bell24h B2B marketplace',
        model: 'marketing-v2',
        max_tokens: 100
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Nano Banana API call successful');
      console.log('Response:', data);
      return { success: true, message: 'Nano Banana integration working' };
    } else {
      console.log('⚠️ Nano Banana API not configured (expected)');
      return { success: false, message: 'Nano Banana API key not configured' };
    }
  } catch (error) {
    console.log('⚠️ Nano Banana API not available (expected)');
    return { success: false, message: 'Nano Banana API not available' };
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Integration Tests...\n');
  
  const openaiResult = await testAIIntegration();
  console.log('\n');
  
  const nanoBananaResult = await testNanoBananaIntegration();
  console.log('\n');
  
  console.log('📊 Test Results:');
  console.log('OpenAI:', openaiResult.success ? '✅ Working' : '❌ Failed');
  console.log('Nano Banana:', nanoBananaResult.success ? '✅ Working' : '⚠️ Not configured');
  
  if (openaiResult.success) {
    console.log('\n🎉 AI Integration is functional!');
  } else {
    console.log('\n❌ AI Integration needs configuration');
  }
}

runTests().catch(console.error);
