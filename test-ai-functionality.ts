import { aiClient } from '../lib/ai-client';
import { aiService } from '../services/ai-service';

async function testVoiceProcessing() {
  console.log('Testing Voice Processing...');
  try {
    const audioBuffer = Buffer.from('dummy audio data');
    const result = await aiClient.processVoiceRFQ(audioBuffer, 'hindi');
    console.log('Voice processing result:', result);
    console.log('Voice processing test passed!');
  } catch (error) {
    console.error('Voice processing test failed:', error);
  }
}

async function testVideoProcessing() {
  console.log('Testing Video Processing...');
  try {
    const videoBuffer = Buffer.from('dummy video data');
    const result = await aiClient.processVideoRFQ(videoBuffer);
    console.log('Video processing result:', result);
    console.log('Video processing test passed!');
  } catch (error) {
    console.error('Video processing test failed:', error);
  }
}

async function testContentGeneration() {
  console.log('Testing Content Generation...');
  try {
    const result = await aiClient.generateContent('Create a product description for industrial pumps');
    console.log('Content generation result:', result);
    console.log('Content generation test passed!');
  } catch (error) {
    console.error('Content generation test failed:', error);
  }
}

async function testEmbeddings() {
  console.log('Testing Embeddings...');
  try {
    const result = await aiClient.getEmbeddings('Sample RFQ text for testing');
    console.log('Embeddings result:', result.length, 'dimensions');
    console.log('Embeddings test passed!');
  } catch (error) {
    console.error('Embeddings test failed:', error);
  }
}

async function testLongDocumentAnalysis() {
  console.log('Testing Long Document Analysis...');
  try {
    const result = await aiClient.analyzeLongDocument('Sample long document text...');
    console.log('Long document analysis result:', result);
    console.log('Long document analysis test passed!');
  } catch (error) {
    console.error('Long document analysis test failed:', error);
  }
}

async function testAIService() {
  console.log('Testing AI Service...');
  try {
    const rfqData = {
      type: 'text',
      text: 'We need 100 units of industrial pumps, 5HP, 3-phase, delivery within 30 days'
    };
    const result = await aiService.processRFQ(rfqData, 'test-user');
    console.log('AI Service result:', result);
    console.log('AI Service test passed!');
  } catch (error) {
    console.error('AI Service test failed:', error);
  }
}

async function runAllTests() {
  console.log('Starting AI Functionality Tests...');
  console.log('================================');

  await testVoiceProcessing();
  await testVideoProcessing();
  await testContentGeneration();
  await testEmbeddings();
  await testLongDocumentAnalysis();
  await testAIService();

  console.log('================================');
  console.log('All AI Functionality Tests Completed!');
}

// Run tests
runAllTests().catch(console.error);