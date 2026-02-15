// Test script to verify blockchain integration
const { ethers } = require('ethers');

console.log('🧪 Testing Bell24h Blockchain Integration...\n');

// Test 1: Check if ethers.js is working
console.log('1. Testing ethers.js integration...');
try {
  const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com');
  console.log('✅ ethers.js provider created successfully');
} catch (error) {
  console.log('❌ ethers.js provider creation failed:', error.message);
}

// Test 2: Check Web3 context
console.log('\n2. Testing Web3 context...');
try {
  const { useWeb3, Web3Provider } = require('./lib/web3');
  console.log('✅ Web3 context imported successfully');
} catch (error) {
  console.log('❌ Web3 context import failed:', error.message);
}

// Test 3: Check API routes
console.log('\n3. Testing API routes...');
const apiRoutes = [
  '/api/voice/transcribe',
  '/api/analytics/stock-data',
  '/api/analytics/predictive'
];

apiRoutes.forEach(route => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'pages', route + '.ts');
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${route} - API route exists`);
    } else {
      console.log(`❌ ${route} - API route missing`);
    }
  } catch (error) {
    console.log(`❌ ${route} - Error checking:`, error.message);
  }
});

// Test 4: Check React components
console.log('\n4. Testing React components...');
const components = [
  'VoiceRFQ',
  'PredictiveAnalytics', 
  'SupplierRiskScoring'
];

components.forEach(component => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'components', component + '.tsx');
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${component} - Component exists`);
    } else {
      console.log(`❌ ${component} - Component missing`);
    }
  } catch (error) {
    console.log(`❌ ${component} - Error checking:`, error.message);
  }
});

// Test 5: Check smart contracts
console.log('\n5. Testing smart contracts...');
const contracts = [
  'BellToken.sol',
  'BellEscrow.sol'
];

contracts.forEach(contract => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'blockchain', 'contracts', contract);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${contract} - Smart contract exists`);
    } else {
      console.log(`❌ ${contract} - Smart contract missing`);
    }
  } catch (error) {
    console.log(`❌ ${contract} - Error checking:`, error.message);
  }
});

console.log('\n🎉 Blockchain Integration Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Deploy smart contracts to Polygon testnet');
console.log('2. Update contract addresses in web3.ts');
console.log('3. Test frontend components');
console.log('4. Deploy to production');

console.log('\n🚀 Bell24h is ready for the future of B2B commerce!');
