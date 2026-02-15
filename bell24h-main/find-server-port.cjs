/**
 * 🎯 FIND BELL24H DEVELOPMENT SERVER PORT
 * Quick script to detect which port the server is running on
 */

const http = require('http');

console.log('🔍 SCANNING FOR BELL24H DEVELOPMENT SERVER...\n');

const portsToCheck = [3000, 3001, 3002, 3003, 3004, 3005];

async function checkPort(port) {
  return new Promise((resolve) => {
    console.log(`📡 Checking port ${port}...`);
    
    const request = http.get(`http://localhost:${port}`, { timeout: 3000 }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200 && data.includes('Bell24H')) {
          console.log(`✅ FOUND BELL24H SERVER ON PORT ${port}!`);
          console.log(`🌐 URL: http://localhost:${port}`);
          resolve({ port, found: true, status: response.statusCode });
          return;
        }
        
        if (response.statusCode === 200) {
          console.log(`⚠️  Port ${port} responds but doesn't contain Bell24H content`);
          resolve({ port, found: false, status: response.statusCode });
          return;
        }
        
        console.log(`❌ Port ${port} returned HTTP ${response.statusCode}`);
        resolve({ port, found: false, status: response.statusCode });
      });
    });
    
    request.on('timeout', () => {
      request.destroy();
      console.log(`⏰ Port ${port} timeout`);
      resolve({ port, found: false, status: 'timeout' });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Port ${port} error: ${error.code}`);
      resolve({ port, found: false, status: 'error' });
    });
  });
}

async function findServer() {
  console.log('🚀 Starting port scan...\n');
  
  const results = [];
  
  for (const port of portsToCheck) {
    const result = await checkPort(port);
    results.push(result);
    
    if (result.found) {
      console.log('\n🎯 SUCCESS! Bell24H server found and responding!');
      console.log(`\n📋 NEXT STEPS:`);
      console.log(`1. Update your platform tests to use port ${port}`);
      console.log(`2. Run: node quick-platform-test.cjs (after updating port)`);
      console.log(`3. Check all critical features are working`);
      console.log(`\n🔗 Quick test: Open http://localhost:${port} in browser`);
      return port;
    }
    
    // Small delay between checks
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n❌ No Bell24H server found on common ports');
  console.log('\n📋 TROUBLESHOOTING STEPS:');
  console.log('1. Check if dev server is starting: npm run dev');
  console.log('2. Look for errors in server logs');
  console.log('3. Check if Next.js is compiling successfully');
  console.log('4. Ensure all dependencies are installed');
  
  return null;
}

// Run the scanner
findServer().catch(error => {
  console.error('❌ Scanner failed:', error);
  process.exit(1);
}); 