/**
 * Bell24h Voice RFQ Test Script
 * 
 * This script tests the Voice RFQ API endpoints with multilingual support.
 */
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const AUDIO_FILE_PATH_EN = path.join(__dirname, 'test-voice-sample-en.mp3');
const AUDIO_FILE_PATH_HI = path.join(__dirname, 'test-voice-sample-hi.mp3');

/**
 * Test the voice RFQ upload endpoint with English audio
 */
async function testVoiceRfqUploadEnglish() {
  try {
    console.log('Testing Voice RFQ upload with English audio...');
    
    // Check if test audio file exists
    if (!fs.existsSync(AUDIO_FILE_PATH_EN)) {
      console.error(`English test audio file not found at ${AUDIO_FILE_PATH_EN}`);
      console.log('Please provide an English test audio file for the voice RFQ test.');
      console.log('If you don\'t have one, you can use the original test-voice-sample.mp3 file.');
      console.log('Just rename it to test-voice-sample-en.mp3');
      return false;
    }
    
    // Create form data with audio file
    const form = new FormData();
    form.append('audio', fs.createReadStream(AUDIO_FILE_PATH_EN));
    form.append('languagePreference', 'en'); // Explicitly setting English
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq/process`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders ? form.getHeaders() : {}
    });
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ upload test (English) successful');
      console.log('Transcription:', data.transcript);
      console.log('Detected Language:', data.detectedLanguage);
      console.log('Analyzed RFQ:', JSON.stringify(data.analyzedRfq, null, 2));
      return true;
    } else {
      console.error('Voice RFQ upload test (English) failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ upload (English):', error.message);
    return false;
  }
}

/**
 * Test the voice RFQ upload endpoint with Hindi audio
 */
async function testVoiceRfqUploadHindi() {
  try {
    console.log('\nTesting Voice RFQ upload with Hindi audio...');
    
    // Check if test audio file exists
    if (!fs.existsSync(AUDIO_FILE_PATH_HI)) {
      console.warn(`Hindi test audio file not found at ${AUDIO_FILE_PATH_HI}`);
      console.log('Skipping Hindi audio test. To test Hindi audio support, please provide a Hindi test audio file.');
      return true; // Not failing the test if the file doesn't exist
    }
    
    // Create form data with audio file
    const form = new FormData();
    form.append('audio', fs.createReadStream(AUDIO_FILE_PATH_HI));
    form.append('languagePreference', 'auto'); // Let it auto-detect Hindi
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq/process`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders ? form.getHeaders() : {}
    });
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ upload test (Hindi) successful');
      console.log('Transcription:', data.transcript);
      console.log('Detected Language:', data.detectedLanguage);
      if (data.translatedText) {
        console.log('Translated Text:', data.translatedText);
      } else {
        console.warn('No translation provided - this might be an issue if Hindi was correctly detected');
      }
      console.log('Analyzed RFQ:', JSON.stringify(data.analyzedRfq, null, 2));
      return true;
    } else {
      console.error('Voice RFQ upload test (Hindi) failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ upload (Hindi):', error.message);
    return false;
  }
}

/**
 * Test the voice RFQ upload endpoint with audio enhancement
 */
async function testVoiceRfqUploadWithEnhancement() {
  try {
    console.log('\nTesting Voice RFQ upload with audio enhancement...');
    
    // We'll reuse the English sample but request enhancement
    if (!fs.existsSync(AUDIO_FILE_PATH_EN)) {
      console.warn(`Test audio file not found at ${AUDIO_FILE_PATH_EN}`);
      console.log('Skipping audio enhancement test.');
      return true; // Not failing the test if the file doesn't exist
    }
    
    // Create form data with audio file
    const form = new FormData();
    form.append('audio', fs.createReadStream(AUDIO_FILE_PATH_EN));
    form.append('languagePreference', 'en');
    form.append('enhanceAudio', 'true'); // Request audio enhancement
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq/process`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders ? form.getHeaders() : {}
    });
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ upload test with audio enhancement successful');
      console.log('Transcription with enhancement:', data.transcript);
      console.log('Detected Language:', data.detectedLanguage);
      console.log('Analyzed RFQ:', JSON.stringify(data.analyzedRfq, null, 2));
      return true;
    } else {
      console.error('Voice RFQ upload test with audio enhancement failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ upload with audio enhancement:', error.message);
    return false;
  }
}

/**
 * Test the voice RFQ listing endpoint
 */
async function testVoiceRfqListing() {
  try {
    console.log('\nTesting Voice RFQ listing...');
    
    // Make API request
    const response = await fetch(`${API_URL}/api/voice-rfq`);
    
    // Parse response
    const data = await response.json();
    
    // Check response
    if (response.status === 200 && data.success) {
      console.log('Voice RFQ listing test successful');
      console.log(`Found ${data.rfqs.length} voice RFQs`);
      if (data.rfqs.length > 0) {
        const rfq = data.rfqs[0];
        console.log('First RFQ:', JSON.stringify({
          title: rfq.title,
          description: rfq.description,
          language: rfq.detectedLanguage || 'Not specified'
        }, null, 2));
      }
      return true;
    } else {
      console.error('Voice RFQ listing test failed');
      console.error('Error:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error testing voice RFQ listing:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=======================================');
  console.log('Bell24h Multilingual Voice RFQ API Tests');
  console.log('=======================================\n');
  
  const uploadEnglishResult = await testVoiceRfqUploadEnglish();
  const uploadHindiResult = await testVoiceRfqUploadHindi();
  const uploadEnhancementResult = await testVoiceRfqUploadWithEnhancement();
  const listingResult = await testVoiceRfqListing();
  
  console.log('\n=======================================');
  console.log('Test Results Summary');
  console.log('=======================================');
  console.log('Voice RFQ Upload Test (English):', uploadEnglishResult ? 'PASSED' : 'FAILED');
  console.log('Voice RFQ Upload Test (Hindi):', uploadHindiResult ? 'PASSED' : 'FAILED');
  console.log('Voice RFQ Upload Test (Enhancement):', uploadEnhancementResult ? 'PASSED' : 'FAILED');
  console.log('Voice RFQ Listing Test:', listingResult ? 'PASSED' : 'FAILED');
  console.log('=======================================');
  
  // Return success status
  return uploadEnglishResult && uploadHindiResult && uploadEnhancementResult && listingResult;
}

// Run tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
