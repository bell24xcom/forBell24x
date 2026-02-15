#!/usr/bin/env node

const https = require('https');
const http = require('http');

// List of URLs to check (all footer links)
const urlsToCheck = [
  '/',
  '/suppliers',
  '/rfq', 
  '/services',
  '/about',
  '/pricing',
  '/contact',
  '/help',
  '/legal/privacy-policy',
  '/legal/terms-of-service',
  '/legal/cancellation-refund-policy',
  '/legal/escrow-terms',
  '/legal/wallet-terms',
  '/legal/shipping-policy',
  '/legal/pricing-policy',
  '/legal/aml-policy',
  '/legal/escrow-services',
  '/upload-invoice',
  '/sitemap.xml',
  '/robots.txt'
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bell24h.com';

async function checkUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      resolve({
        url: fullUrl,
        status: res.statusCode,
        success: res.statusCode === 200
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url: fullUrl,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url: fullUrl,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function checkAllLinks() {
  console.log('🔍 Checking all footer and legal links...\n');
  
  const results = await Promise.all(
    urlsToCheck.map(url => checkUrl(url))
  );
  
  let allPassed = true;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.url} - ${result.status}`);
    } else {
      console.log(`❌ ${result.url} - ${result.status} ${result.error ? `(${result.error})` : ''}`);
      allPassed = false;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total URLs checked: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  if (allPassed) {
    console.log('\n🎉 All links are working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some links failed. Please check the URLs above.');
    process.exit(1);
  }
}

checkAllLinks().catch(console.error);
