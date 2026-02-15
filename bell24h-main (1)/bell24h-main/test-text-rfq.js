const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000'; // Ensure your server is running on this port
const RFQ_ENDPOINT = `${API_URL}/api/voice-rfq`;

// Test Data
const testCases = [
  { description: "I need 10 laptops", language: "en-US", expectedProduct: "laptops", expectedQuantity: "10" },
  { description: "मुझे 5 किलो चीनी चाहिए", language: "hi-IN", expectedProduct: "चीनी", expectedQuantity: "5" },
  { description: "J'ai besoin de 2 claviers", language: "fr-FR", expectedProduct: "claviers", expectedQuantity: "2" },
  { description: "Necesito 3 monitores", language: "es-ES", expectedProduct: "monitores", expectedQuantity: "3" },
  { description: "我需要 8 个鼠标", language: "zh-CN", expectedProduct: "鼠标", expectedQuantity: "8" },
  // Add more test cases as needed
];

async function sendRfqRequest(rfqData) {
  try {
    const response = await fetch(RFQ_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(rfqData),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error sending RFQ for language ${rfqData.language}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

async function runTests() {
  console.log('=======================================');
  console.log('Bell24H Text-Based RFQ API Tests');
  console.log('=======================================\n');

  let allTestsPassed = true;

  for (const testCase of testCases) {
    console.log(`Testing RFQ: "${testCase.description}" (Language: ${testCase.language})`);
    const { status, data } = await sendRfqRequest(testCase);

    if (status === 200 && data.status === 'created' && data.rfq) {
      const { product, quantity } = data.rfq;
      // Basic check - more sophisticated checks might be needed depending on NLP/regex accuracy
      const productMatch = product && product.toLowerCase().includes(testCase.expectedProduct.toLowerCase());
      const quantityMatch = quantity && quantity.toString() === testCase.expectedQuantity;

      if (productMatch && quantityMatch) {
        console.log(`  PASSED: RFQ created. Product: ${product}, Quantity: ${quantity}`);
      } else {
        allTestsPassed = false;
        console.error(`  FAILED: RFQ created, but product/quantity mismatch.`);
        console.error(`    Expected: Product ~${testCase.expectedProduct}, Quantity ${testCase.expectedQuantity}`);
        console.error(`    Received: Product ${product}, Quantity ${quantity}`);
        console.error(`    Full response:`, JSON.stringify(data, null, 2));
      }
    } else if (status === 422) {
        allTestsPassed = false;
        console.error(`  FAILED (422 Unprocessable Entity): Could not extract RFQ details.`);
        console.error(`    Response:`, JSON.stringify(data, null, 2));
    }
    else {
      allTestsPassed = false;
      console.error(`  FAILED: Request failed with status ${status}.`);
      console.error(`    Response:`, JSON.stringify(data, null, 2));
    }
    console.log('---');
  }

  console.log('\n=======================================');
  console.log('Test Results Summary');
  console.log('=======================================');
  if (allTestsPassed) {
    console.log('All text-based RFQ tests PASSED!');
  } else {
    console.log('Some text-based RFQ tests FAILED.');
  }
  console.log('=======================================');
  return allTestsPassed;
}

// Run tests
runTests()
  .then((success) => {
    // Ensure GOOGLE_APPLICATION_CREDENTIALS is set if you expect Google NLP to work.
    // If it's not set, the API will fall back to regex parsing.
    console.log("\nReminder: For Google NLP to be used, ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is correctly set before starting your server.");
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test execution error:', error);
    process.exit(1);
  });
