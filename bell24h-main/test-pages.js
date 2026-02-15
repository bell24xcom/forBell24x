const https = require('https');

// All pages to test
const pages = [
  // Core Pages
  { url: 'https://bell24h-v1.vercel.app/', name: 'Homepage' },
  { url: 'https://bell24h-v1.vercel.app/about', name: 'About' },
  { url: 'https://bell24h-v1.vercel.app/contact', name: 'Contact' },
  { url: 'https://bell24h-v1.vercel.app/pricing', name: 'Pricing' },
  { url: 'https://bell24h-v1.vercel.app/services', name: 'Services' },
  
  // Legal Pages
  { url: 'https://bell24h-v1.vercel.app/privacy', name: 'Privacy Policy' },
  { url: 'https://bell24h-v1.vercel.app/terms', name: 'Terms of Service' },
  { url: 'https://bell24h-v1.vercel.app/help', name: 'Help' },
  
  // Authentication
  { url: 'https://bell24h-v1.vercel.app/auth/login', name: 'Login' },
  { url: 'https://bell24h-v1.vercel.app/auth/register', name: 'Register' },
  { url: 'https://bell24h-v1.vercel.app/auth/landing', name: 'Auth Landing' },
  
  // Dashboard
  { url: 'https://bell24h-v1.vercel.app/dashboard', name: 'Dashboard' },
  { url: 'https://bell24h-v1.vercel.app/dashboard/analytics', name: 'Dashboard Analytics' },
  { url: 'https://bell24h-v1.vercel.app/dashboard/kyc', name: 'Dashboard KYC' },
  
  // Categories
  { url: 'https://bell24h-v1.vercel.app/categories', name: 'Categories' },
  { url: 'https://bell24h-v1.vercel.app/business-categories', name: 'Business Categories' },
  
  // RFQ
  { url: 'https://bell24h-v1.vercel.app/rfq', name: 'RFQ' },
  { url: 'https://bell24h-v1.vercel.app/rfq/create', name: 'RFQ Create' },
  
  // Suppliers
  { url: 'https://bell24h-v1.vercel.app/suppliers', name: 'Suppliers' },
  
  // Admin
  { url: 'https://bell24h-v1.vercel.app/admin', name: 'Admin' },
  { url: 'https://bell24h-v1.vercel.app/admin/dashboard', name: 'Admin Dashboard' },
  
  // Special Features
  { url: 'https://bell24h-v1.vercel.app/beta-launch', name: 'Beta Launch' },
  { url: 'https://bell24h-v1.vercel.app/test-otp', name: 'Test OTP' },
  { url: 'https://bell24h-v1.vercel.app/marketplace', name: 'Marketplace' },
  { url: 'https://bell24h-v1.vercel.app/search', name: 'Search' },
  { url: 'https://bell24h-v1.vercel.app/escrow', name: 'Escrow' },
];

async function testPage(page) {
  return new Promise((resolve) => {
    const url = new URL(page.url);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({
        name: page.name,
        url: page.url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    req.on('error', (err) => {
      resolve({
        name: page.name,
        url: page.url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: page.name,
        url: page.url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.setTimeout(10000);
    req.end();
  });
}

async function runAudit() {
  console.log('🔍 BELL24H COMPREHENSIVE PAGE AUDIT');
  console.log('=====================================');
  console.log('Testing all major pages...\n');

  const results = [];
  
  for (const page of pages) {
    process.stdout.write(`Testing ${page.name}... `);
    const result = await testPage(page);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status}`);
    } else {
      console.log(`❌ ${result.status} ${result.error || ''}`);
    }
  }

  console.log('\n=====================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('=====================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working Pages: ${successful.length}`);
  console.log(`❌ Failed Pages: ${failed.length}`);
  console.log(`📈 Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED PAGES:');
    failed.forEach(page => {
      console.log(`  - ${page.name}: ${page.status} ${page.error || ''}`);
    });
  }
  
  console.log('\n✅ WORKING PAGES:');
  successful.forEach(page => {
    console.log(`  - ${page.name}: ${page.status}`);
  });
}

runAudit().catch(console.error);
