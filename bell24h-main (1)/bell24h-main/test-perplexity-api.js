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

async function testPerplexityAPI() {
  try {
    console.log('Sending request to Perplexity API...');
    const response = await axios.post('http://localhost:3000/ask', {
      query: 'What is AI-powered RFQ matching?',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
    });

    console.log('\n✅ Response from Perplexity API:');
    console.log(JSON.stringify(response.data, null, 2));
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
  }
}

// Run the test
testPerplexityAPI().catch(console.error);
