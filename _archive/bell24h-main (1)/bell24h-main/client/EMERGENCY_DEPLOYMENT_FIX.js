#!/usr/bin/env node

/**
 * EMERGENCY DEPLOYMENT FIX FOR BELL24H
 * 
 * This script will deploy the enhanced Bell24h marketplace to fix the 404 error
 * on bell24h.vercel.app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY DEPLOYMENT FIX FOR BELL24H');
console.log('==========================================');

// Check if we're in the correct directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ ERROR: package.json not found. Please run this script from the client directory.');
    process.exit(1);
}

console.log('✅ Found package.json - proceeding with deployment...');

try {
    // Step 1: Install dependencies
    console.log('\n📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');

    // Step 2: Build the project
    console.log('\n🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Project built successfully');

    // Step 3: Deploy to Vercel
    console.log('\n🚀 Deploying to Vercel...');
    console.log('This will deploy to bell24h.vercel.app');
    
    // Deploy with production flag
    execSync('npx vercel --prod --yes', { stdio: 'inherit' });
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('==========================================');
    console.log('✅ Your enhanced Bell24h marketplace should now be live at:');
    console.log('   https://bell24h.vercel.app');
    console.log('');
    console.log('🔍 Please verify the deployment by visiting the URL above.');
    console.log('   You should see your professional Bell24h marketplace, not a 404 error.');
    console.log('');
    console.log('📋 If you still see issues, try these troubleshooting steps:');
    console.log('   1. Wait 2-3 minutes for deployment to propagate');
    console.log('   2. Clear your browser cache');
    console.log('   3. Try incognito/private browsing mode');
    console.log('   4. Check Vercel dashboard for deployment status');
    console.log('');
    console.log('🚀 Your Bell24h marketplace is now ready for the 5000+ supplier campaign!');

} catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED!');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔧 TROUBLESHOOTING OPTIONS:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify Vercel CLI is installed: npm install -g vercel');
    console.log('   3. Login to Vercel: vercel login');
    console.log('   4. Try manual deployment via Vercel dashboard');
    console.log('');
    console.log('📞 If issues persist, consider:');
    console.log('   - Creating a new Vercel project');
    console.log('   - Uploading files manually via Vercel dashboard');
    console.log('   - Using Git deployment if repository is connected');
    
    process.exit(1);
} 
