/**
 * Bell24H Multilingual Voice RFQ Test Script
 * 
 * This script tests the multilingual Voice RFQ API endpoints with support for
 * Hindi and English languages, audio enhancement, and language detection.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = 'http://localhost:3000';
const TEST_AUDIO_DIR = './test-audio';
const TOKEN_STORAGE_PATH = './.test-auth-token.json';

// Authentication credentials
const TEST_USER = {
  username: 'test_buyer@bell24h.com',
  password: 'Test@123'
};

/**
 * Login to get authentication token
 */
async function login() {
  try {
    // Load cached token if exists
    if (fs.existsSync(TOKEN_STORAGE_PATH)) {
      const tokenData = JSON.parse(fs.readFileSync(TOKEN_STORAGE_PATH, 'utf8'));
      if (tokenData.expiry > Date.now()) {
        console.log('Using cached authentication token');
        return tokenData.token;
      }
    }

    console.log('Logging in to get auth token...');
    const response = await axios.post(`${API_URL}/api/login`, TEST_USER);
    
    if (response.data.token) {
      // Save token with 1 hour expiry
      fs.writeFileSync(
        TOKEN_STORAGE_PATH,
        JSON.stringify({
          token: response.data.token,
          expiry: Date.now() + 60 * 60 * 1000
        })
      );
      
      console.log('Successfully logged in');
      return response.data.token;
    } else {
      throw new Error('Login response did not contain a token');
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test voice RFQ upload endpoint with Hindi audio
 */
async function testVoiceRfqUploadHindi() {
  try {
    console.log('\n=== Testing Voice RFQ Upload (Hindi) ===');
    
    // Create form data with audio file
    const formData = new FormData();
    const audioPath = path.join(TEST_AUDIO_DIR, 'hindi_rfq_sample.mp3');
    
    // If the test audio doesn't exist, create a placeholder
    if (!fs.existsSync(audioPath)) {
      console.log('Test audio file not found. Creating placeholder audio file for test...');
      if (!fs.existsSync(TEST_AUDIO_DIR)) {
        fs.mkdirSync(TEST_AUDIO_DIR, { recursive: true });
      }
      
      // Create a placeholder note explaining that real audio should be provided
      fs.writeFileSync(audioPath, 'This is a placeholder. Replace with real audio file.');
      console.log(`Created placeholder at ${audioPath}. Please replace with an actual Hindi audio recording.`);
      return;
    }
    
    // Load the audio file
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('languagePreference', 'hi');
    
    const token = await login();
    const response = await axios.post(`${API_URL}/api/voice-rfq/process`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('Language detection:', response.data.detectedLanguage);
    console.log('Original transcription:', response.data.transcript);
    console.log('Translated text:', response.data.translatedText);
    console.log('Test completed successfully');
    
    return response.data;
  } catch (error) {
    console.error('Hindi Voice RFQ test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test voice RFQ upload endpoint with English audio
 */
async function testVoiceRfqUploadEnglish() {
  try {
    console.log('\n=== Testing Voice RFQ Upload (English) ===');
    
    // Create form data with audio file
    const formData = new FormData();
    const audioPath = path.join(TEST_AUDIO_DIR, 'english_rfq_sample.mp3');
    
    // If the test audio doesn't exist, create a placeholder
    if (!fs.existsSync(audioPath)) {
      console.log('Test audio file not found. Creating placeholder audio file for test...');
      if (!fs.existsSync(TEST_AUDIO_DIR)) {
        fs.mkdirSync(TEST_AUDIO_DIR, { recursive: true });
      }
      
      // Create a placeholder note explaining that real audio should be provided
      fs.writeFileSync(audioPath, 'This is a placeholder. Replace with real audio file.');
      console.log(`Created placeholder at ${audioPath}. Please replace with an actual English audio recording.`);
      return;
    }
    
    // Load the audio file
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('languagePreference', 'auto'); // Auto-detect language
    
    const token = await login();
    const response = await axios.post(`${API_URL}/api/voice-rfq/process`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('Language detection:', response.data.detectedLanguage);
    console.log('Original transcription:', response.data.transcript);
    console.log('Test completed successfully');
    
    return response.data;
  } catch (error) {
    console.error('English Voice RFQ test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test the voice RFQ with audio enhancement flag
 */
async function testVoiceRfqWithEnhancement() {
  try {
    console.log('\n=== Testing Voice RFQ with Audio Enhancement ===');
    
    // Create form data with audio file and enhancement flag
    const formData = new FormData();
    const audioPath = path.join(TEST_AUDIO_DIR, 'noisy_rfq_sample.mp3');
    
    // If the test audio doesn't exist, create a placeholder
    if (!fs.existsSync(audioPath)) {
      console.log('Test audio file not found. Creating placeholder audio file for test...');
      if (!fs.existsSync(TEST_AUDIO_DIR)) {
        fs.mkdirSync(TEST_AUDIO_DIR, { recursive: true });
      }
      
      // Create a placeholder note explaining that real audio should be provided
      fs.writeFileSync(audioPath, 'This is a placeholder. Replace with real audio file.');
      console.log(`Created placeholder at ${audioPath}. Please replace with an actual noisy audio recording.`);
      return;
    }
    
    // Load the audio file
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('languagePreference', 'auto');
    formData.append('enhanceAudio', 'true');
    
    const token = await login();
    const response = await axios.post(`${API_URL}/api/voice-rfq/process`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('Language detection:', response.data.detectedLanguage);
    console.log('Original transcription:', response.data.transcript);
    console.log('Test completed successfully');
    
    return response.data;
  } catch (error) {
    console.error('Voice RFQ with enhancement test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test the voice RFQ listing endpoint
 */
async function testVoiceRfqListing() {
  try {
    console.log('\n=== Testing Voice RFQ Listing ===');
    
    const token = await login();
    const response = await axios.get(`${API_URL}/api/voice-rfq`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Retrieved ${response.data.rfqs?.length || 0} voice RFQs`);
    
    if (response.data.rfqs && response.data.rfqs.length > 0) {
      console.log('First RFQ language info:');
      console.log('- Detected language:', response.data.rfqs[0].metadata?.detected_language);
      console.log('- Has translation:', response.data.rfqs[0].metadata?.has_translation);
    }
    
    console.log('Test completed successfully');
    
    return response.data;
  } catch (error) {
    console.error('Voice RFQ listing test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('=== Starting Bell24H Multilingual Voice RFQ Tests ===');
    
    // First check if OpenAI API key is present
    if (!process.env.OPENAI_API_KEY) {
      console.warn('WARNING: OPENAI_API_KEY environment variable is not set. Tests may fail.');
      console.warn('Please set the OpenAI API key before running tests.');
    }
    
    // Run tests
    await testVoiceRfqUploadHindi();
    await testVoiceRfqUploadEnglish();
    await testVoiceRfqWithEnhancement();
    await testVoiceRfqListing();
    
    console.log('\n=== All Tests Completed Successfully ===');
  } catch (error) {
    console.error('\n=== Test Execution Failed ===');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testVoiceRfqUploadHindi,
  testVoiceRfqUploadEnglish,
  testVoiceRfqWithEnhancement,
  testVoiceRfqListing,
  runTests
};