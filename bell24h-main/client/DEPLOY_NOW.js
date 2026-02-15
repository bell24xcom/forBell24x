const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BELL24H V2 - DEPLOYMENT SCRIPT');
console.log('=====================================');

try {
  // Step 1: Build the project
  console.log('\n📦 Step 1: Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');

  // Step 2: Check if Vercel CLI is installed
  console.log('\n🔧 Step 2: Checking Vercel CLI...');
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is available');
  } catch (error) {
    console.log('⚠️ Vercel CLI not found, installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Step 3: Deploy to Vercel
  console.log('\n🚀 Step 3: Deploying to Vercel...');
  console.log('Target domain: bell24h.vercel.app');
  
  try {
    execSync('npx vercel --prod --yes', { stdio: 'inherit' });
    console.log('✅ Deployment completed successfully!');
  } catch (error) {
    console.log('❌ Vercel CLI deployment failed');
    console.log('\n📋 MANUAL DEPLOYMENT INSTRUCTIONS:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Find your "bell24h" project');
    console.log('3. Click "Deploy" or "Redeploy"');
    console.log('4. Upload the contents of this client folder');
    console.log('5. Your site will be available at: bell24h.vercel.app');
  }

} catch (error) {
  console.log('❌ Deployment failed:', error.message);
  console.log('\n📋 ALTERNATIVE DEPLOYMENT METHODS:');
  console.log('Method 1: Manual Vercel Upload');
  console.log('- Go to https://vercel.com/dashboard');
  console.log('- Select your "bell24h" project');
  console.log('- Upload the client folder contents');
  
  console.log('\nMethod 2: Git Push (if repository exists)');
  console.log('- git add .');
  console.log('- git commit -m "Deploy Bell24h V2"');
  console.log('- git push origin main');
  
  console.log('\nMethod 3: Vercel CLI from parent directory');
  console.log('- cd ..');
  console.log('- npx vercel --prod --yes');
}

console.log('\n🎉 DEPLOYMENT SCRIPT COMPLETED!');
console.log('Check bell24h.vercel.app for your live site!'); 
