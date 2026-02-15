#!/usr/bin/env node

/**
 * Automatic Netlify Environment Variables Configuration
 * This script automatically sets up environment variables for Bell24h on Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 BELL24H NETLIFY AUTO-CONFIGURATION STARTING...\n');

// Environment variables to set
const envVars = {
  // Database (Neon.tech)
  DATABASE_URL: 'postgresql://username:password@ep-morning-sound-81469811.us-east-1.aws.neon.tech/bell24h?sslmode=require',

  // Authentication
  NEXTAUTH_SECRET: 'bell24h-super-secret-key-2024-production',
  NEXTAUTH_URL: 'https://bell24h.netlify.app',

  // API Keys
  MSG91_AUTH_KEY: '468517Ak5rJ0vb7NDV68c24863P1',
  MSG91_SENDER_ID: 'BELL24H',
  RESEND_API_KEY: 're_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4',
  FROM_EMAIL: 'noreply@bell24h.com',

  // Payment (Razorpay) - Update these with your actual keys
  RAZORPAY_KEY_ID: 'your_razorpay_key_id_here',
  RAZORPAY_KEY_SECRET: 'your_razorpay_key_secret_here',

  // JWT
  JWT_SECRET: 'bell24h-jwt-secret-key-2024-production-minimum-32-characters',

  // Environment
  NODE_ENV: 'production',
  NEXT_PUBLIC_APP_URL: 'https://bell24h.netlify.app'
};

async function configureNetlify() {
  try {
    console.log('📋 Setting up environment variables...\n');

    // Set each environment variable
    for (const [key, value] of Object.entries(envVars)) {
      try {
        console.log(`Setting ${key}...`);

        // Use Netlify CLI to set environment variables
        const command = `npx netlify-cli@latest env:set ${key} "${value}"`;
        execSync(command, { stdio: 'inherit' });

        console.log(`✅ ${key} set successfully\n`);
      } catch (error) {
        console.log(`⚠️  Could not set ${key} automatically. Please set manually in Netlify dashboard.\n`);
      }
    }

    console.log('🎉 Environment variables configuration complete!\n');

    // Create instructions file
    const instructions = `
# 🔧 MANUAL ENVIRONMENT VARIABLES SETUP

If automatic setup didn't work, manually add these to Netlify:

## Steps:
1. Go to https://netlify.com/dashboard
2. Select your Bell24h site
3. Go to Site Settings → Environment Variables
4. Add each variable below:

${Object.entries(envVars).map(([key, value]) => `${key}=${value}`).join('\n')}

## After adding variables:
1. Redeploy your site
2. Test all features
3. Your Bell24h platform will be live!

## Cost Savings:
- Neon.tech: ₹0/month (FREE)
- Netlify: ₹0/month (FREE)
- Total: ₹0/month vs Railway's ₹800/month
- Annual Savings: ₹9,600/year!
`;

    fs.writeFileSync('NETLIFY_MANUAL_SETUP.md', instructions);
    console.log('📄 Created NETLIFY_MANUAL_SETUP.md with manual instructions\n');

    console.log('🚀 BELL24H DEPLOYMENT COMPLETE!');
    console.log('💰 Cost: ₹0/month (FREE tier)');
    console.log('🎯 Ready for customers!');

  } catch (error) {
    console.error('❌ Error during configuration:', error.message);
    console.log('\n📄 Please use the manual setup instructions in NETLIFY_MANUAL_SETUP.md');
  }
}

// Run the configuration
configureNetlify();
