#!/usr/bin/env node

/**
 * EMERGENCY 404 FIX FOR BELL24H
 * 
 * This script will force deploy Bell24h to fix the 404 error
 * on bell24h.vercel.app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY 404 FIX FOR BELL24H');
console.log('==================================');

// Check current directory
console.log('Current directory:', process.cwd());

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ ERROR: package.json not found!');
    console.error('Please run this script from the client directory.');
    process.exit(1);
}

console.log('✅ Found package.json - proceeding with emergency deployment...');

try {
    // Step 1: Complete cleanup
    console.log('\n🧹 Step 1: Complete cleanup...');
    execSync('rm -rf .next .vercel node_modules', { stdio: 'inherit' });
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Cleanup completed');

    // Step 2: Fresh install
    console.log('\n📦 Step 2: Fresh install...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');

    // Step 3: Build project
    console.log('\n🔨 Step 3: Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Project built successfully');

    // Step 4: Force deploy to Vercel
    console.log('\n🚀 Step 4: Force deploying to Vercel...');
    console.log('This will deploy to bell24h.vercel.app');
    
    // Try multiple deployment methods
    try {
        execSync('npx vercel --prod --force --yes', { stdio: 'inherit' });
    } catch (error) {
        console.log('First deployment method failed, trying alternative...');
        try {
            execSync('npx vercel --prod --yes', { stdio: 'inherit' });
        } catch (error2) {
            console.log('Second method failed, trying with login...');
            execSync('npx vercel login', { stdio: 'inherit' });
            execSync('npx vercel --prod --yes', { stdio: 'inherit' });
        }
    }
    
    console.log('\n🎉 EMERGENCY DEPLOYMENT COMPLETE!');
    console.log('==================================');
    console.log('✅ Your Bell24h marketplace should now be live at:');
    console.log('   https://bell24h.vercel.app');
    console.log('');
    console.log('🔍 Please verify the deployment by visiting the URL above.');
    console.log('   You should see your professional Bell24h marketplace, not a 404 error.');
    console.log('');
    console.log('📋 If you still see 404, try these emergency steps:');
    console.log('   1. Go to https://vercel.com/dashboard');
    console.log('   2. Find your "bell24h" project');
    console.log('   3. Click "Settings" → "Functions"');
    console.log('   4. Click "Redeploy" or "New Deployment"');
    console.log('   5. Upload your client folder manually');
    console.log('');
    console.log('🚀 Once live, your Bell24h marketplace will be ready for the 5000+ supplier campaign!');

} catch (error) {
    console.error('\n❌ EMERGENCY DEPLOYMENT FAILED!');
    console.error('Error:', error.message);
    console.log('');
    console.log('🚨 EMERGENCY BACKUP PLAN:');
    console.log('   1. Go to https://vercel.com/dashboard');
    console.log('   2. DELETE your current "bell24h" project');
    console.log('   3. Click "Add New..." → "Project"');
    console.log('   4. Choose "Upload Files"');
    console.log('   5. Upload your ENTIRE client folder');
    console.log('   6. Set domain to bell24h.vercel.app');
    console.log('   7. Deploy as completely new project');
    console.log('');
    console.log('📞 This manual upload should definitely work!');
    
    process.exit(1);
} 
