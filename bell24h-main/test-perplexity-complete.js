import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

// Set the Perplexity API key
process.env.PERPLEXITY_API_KEY = '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';

async function testPerplexityAPI() {
  console.log('🔍 Testing Perplexity AI Integration for Bell24H B2B Marketplace...\n');
  
  try {
    console.log('📡 Sending request to Perplexity API...');
    
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for Bell24H, a B2B marketplace. Help users with RFQ matching, product recommendations, and business insights.'
        },
        {
          role: 'user',
          content: 'What are the best practices for creating effective RFQs in B2B marketplaces?'
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
    });

    console.log('\n✅ Perplexity AI Response Received Successfully!');
    console.log('📊 Response Status:', response.status);
    console.log('🤖 AI Response:');
    console.log(response.data.choices[0].message.content);
    
    console.log('\n🎯 Perplexity AI Integration Status: WORKING ✅');
    console.log('🚀 Bell24H can now provide AI-powered RFQ matching and business insights!');
    
    return true;
  } catch (error) {
    console.error('\n❌ Error calling Perplexity API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify API key is valid');
    console.log('2. Check internet connection');
    console.log('3. Ensure Perplexity service is available');
    
    return false;
  }
}

// Test the complete system
async function testCompleteSystem() {
  console.log('🚀 BELL24H COMPLETE SYSTEM TEST\n');
  console.log('=' .repeat(50));
  
  // Test 1: Perplexity AI
  console.log('\n1️⃣ Testing Perplexity AI Integration...');
  const aiWorking = await testPerplexityAPI();
  
  // Test 2: Check if development server is running
  console.log('\n2️⃣ Checking Development Server...');
  try {
    const serverResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('✅ Development server is running on http://localhost:3000');
    console.log('📊 Server Status:', serverResponse.status);
  } catch (error) {
    console.log('⚠️ Development server not running or not accessible');
    console.log('💡 Start with: npm run dev');
  }
  
  // Test 3: Check database connection
  console.log('\n3️⃣ Checking Database Connection...');
  try {
    const dbResponse = await axios.get('http://localhost:3000/api/health', { timeout: 5000 });
    console.log('✅ Database connection working');
    console.log('📊 Health Status:', dbResponse.data);
  } catch (error) {
    console.log('⚠️ Database health check failed or server not running');
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 BELL24H SYSTEM STATUS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`🤖 Perplexity AI: ${aiWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log('🌐 Development Server: ⚠️ Check manually at http://localhost:3000');
  console.log('💾 Database: ⚠️ Check manually');
  
  if (aiWorking) {
    console.log('\n🎉 CRITICAL SUCCESS: Perplexity AI is working!');
    console.log('🚀 Bell24H can provide AI-powered B2B marketplace features:');
    console.log('   • Intelligent RFQ matching');
    console.log('   • Product recommendations');
    console.log('   • Business insights and analytics');
    console.log('   • Voice-powered RFQ creation');
    console.log('   • AI-powered search and discovery');
  } else {
    console.log('\n⚠️ CRITICAL ISSUE: Perplexity AI not working');
    console.log('🔧 This needs to be fixed before launch');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Test complete user flows at http://localhost:3000');
  console.log('3. Verify all features are working');
  console.log('4. Complete final deployment configuration');
}

// Run the complete test
testCompleteSystem().catch(console.error); 