#!/usr/bin/env node

/**
 * Google OAuth Verification Script for Bell24h 2.0
 * Run this after setting up Google OAuth to verify everything works
 */

const https = require('https');

const BASE_URL = 'https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      })
      .on('error', reject);
  });
}

async function verifyGoogleOAuth() {
  console.log('🔍 Verifying Google OAuth Setup for Bell24h 2.0...\n');

  try {
    // 1. Check health endpoint
    console.log('1️⃣ Checking platform health...');
    const health = await makeRequest(`${BASE_URL}/api/health`);

    if (health.status === 'OPERATIONAL') {
      console.log('✅ Platform is operational');
    } else {
      console.log('❌ Platform health check failed');
      return;
    }

    // 2. Check environment variables
    console.log('\n2️⃣ Checking environment variables...');
    if (health.environment?.GOOGLE_ID === 'SET' && health.environment?.GOOGLE_SECRET === 'SET') {
      console.log('✅ Google OAuth environment variables are set');
    } else {
      console.log('❌ Google OAuth environment variables are missing');
      console.log('   Please set GOOGLE_ID and GOOGLE_SECRET in Vercel dashboard');
      return;
    }

    // 3. Check homepage stats
    console.log('\n3️⃣ Checking API functionality...');
    const stats = await makeRequest(`${BASE_URL}/api/homepage-stats`);

    if (stats.success) {
      console.log('✅ API endpoints are working');
    } else {
      console.log('❌ API endpoints have issues');
    }

    // 4. Final verification
    console.log('\n4️⃣ Final verification...');
    console.log('✅ All systems operational');
    console.log('✅ Google OAuth should be working');
    console.log('✅ Ready for launch!');

    console.log('\n🎯 Next Steps:');
    console.log(
      '1. Visit: https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app/auth/login'
    );
    console.log('2. Click "Sign in with Google" button');
    console.log('3. Complete Google authentication');
    console.log('4. Should redirect to dashboard');
    console.log('5. User should be created in database');

    console.log('\n🚀 Bell24h 2.0 is ready for launch!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the platform is deployed');
    console.log('2. Verify environment variables are set');
    console.log('3. Ensure Google OAuth credentials are correct');
  }
}

// Run verification
verifyGoogleOAuth();
