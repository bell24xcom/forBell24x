#!/usr/bin/env node

/**
 * DNS Verification Script for Bell24h.com
 * Checks if DNS records are properly configured for Vercel
 */

const dns = require('dns').promises;
const https = require('https');

const DOMAINS = ['bell24h.com', 'www.bell24h.com'];
const EXPECTED_VERCEL_IP = '76.76.19.61';
const VERCELL_CNAME = 'cname.vercel-dns.com';

console.log('🌐 BELL24H DNS VERIFICATION TOOL');
console.log('=====================================\n');

async function checkDNS(domain) {
    console.log(`🔍 Checking DNS for: ${domain}`);
    
    try {
        // Check A records
        const aRecords = await dns.resolve4(domain);
        console.log(`   A Records: ${aRecords.join(', ')}`);
        
        // Check if pointing to Vercel
        const isVercel = aRecords.includes(EXPECTED_VERCEL_IP);
        console.log(`   ✅ Vercel IP: ${isVercel ? 'YES' : 'NO'}`);
        
        // Check CNAME if no A record
        if (aRecords.length === 0) {
            try {
                const cnameRecords = await dns.resolveCname(domain);
                console.log(`   CNAME Records: ${cnameRecords.join(', ')}`);
                const isVercelCname = cnameRecords.some(record => record.includes('vercel'));
                console.log(`   ✅ Vercel CNAME: ${isVercelCname ? 'YES' : 'NO'}`);
            } catch (error) {
                console.log(`   ❌ No CNAME records found`);
            }
        }
        
        // Test HTTPS connection
        await testHTTPSConnection(domain);
        
    } catch (error) {
        console.log(`   ❌ DNS Error: ${error.message}`);
    }
    
    console.log('');
}

async function testHTTPSConnection(domain) {
    return new Promise((resolve) => {
        const url = `https://${domain}`;
        console.log(`   🔗 Testing HTTPS: ${url}`);
        
        const req = https.request(url, { timeout: 10000 }, (res) => {
            console.log(`   ✅ HTTPS Status: ${res.statusCode}`);
            console.log(`   ✅ Server: ${res.headers.server || 'Unknown'}`);
            resolve();
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ HTTPS Error: ${error.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            console.log(`   ⏰ HTTPS Timeout`);
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

async function checkVercelStatus() {
    console.log('🚀 VERCELL DASHBOARD STATUS');
    console.log('============================\n');
    
    console.log('📋 Manual Check Required:');
    console.log('1. Go to: https://vercel.com/dashboard');
    console.log('2. Click on your Bell24h project');
    console.log('3. Go to "Domains" tab');
    console.log('4. Check status of bell24h.com and www.bell24h.com');
    console.log('5. Should show "Valid Configuration" instead of "DNS Change Recommended"\n');
}

async function generateReport() {
    console.log('📊 DNS CONFIGURATION REPORT');
    console.log('============================\n');
    
    console.log('🎯 Expected Configuration:');
    console.log('   bell24h.com → A Record → 76.76.19.61');
    console.log('   www.bell24h.com → A Record → 76.76.19.61');
    console.log('   OR');
    console.log('   www.bell24h.com → CNAME → cname.vercel-dns.com\n');
    
    console.log('⏰ DNS Propagation:');
    console.log('   - Changes take 5-15 minutes to propagate');
    console.log('   - Full propagation can take up to 24 hours');
    console.log('   - Use https://dnschecker.org to verify globally\n');
    
    console.log('🔧 Common Issues:');
    console.log('   - Wrong IP address in A records');
    console.log('   - Missing www subdomain configuration');
    console.log('   - DNS propagation delays');
    console.log('   - Cached DNS records\n');
}

async function main() {
    try {
        // Check each domain
        for (const domain of DOMAINS) {
            await checkDNS(domain);
        }
        
        // Check Vercel status
        await checkVercelStatus();
        
        // Generate report
        await generateReport();
        
        console.log('✅ DNS VERIFICATION COMPLETE!');
        console.log('If all checks pass, your DNS is properly configured for Vercel.');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run the verification
main();
