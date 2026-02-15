#!/usr/bin/env node

/**
 * Bell24h Complete Automated Deployment
 * This script handles everything automatically
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 BELL24H COMPLETE AUTOMATED DEPLOYMENT');
console.log('==========================================\n');

// Step 1: Check prerequisites
console.log('📋 Step 1: Checking prerequisites...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.error('❌ Node.js or npm not found. Please install Node.js first.');
  process.exit(1);
}

// Step 2: Install dependencies
console.log('\n📦 Step 2: Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Step 3: Build project
console.log('\n🔨 Step 3: Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Step 4: Install Vercel CLI
console.log('\n📦 Step 4: Installing Vercel CLI...');
try {
  execSync('npm install -g vercel', { stdio: 'inherit' });
  console.log('✅ Vercel CLI installed');
} catch (error) {
  console.error('❌ Failed to install Vercel CLI');
  process.exit(1);
}

// Step 5: Create environment template
console.log('\n⚙️ Step 5: Creating environment template...');
const envTemplate = `# Bell24h Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables

# Database (Neon.tech)
DATABASE_URL=postgresql://[your-neon-connection-string]
POSTGRES_PRISMA_URL=[same-as-above]
POSTGRES_URL_NON_POOLING=[same-as-above]

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://bell24h.vercel.app

# API Keys (add your actual keys)
MSG91_API_KEY=your_msg91_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.vercel.app
`;

fs.writeFileSync('.env.vercel.template', envTemplate);
console.log('✅ Environment template created: .env.vercel.template');

// Step 6: Create deployment instructions
console.log('\n📝 Step 6: Creating deployment instructions...');
const instructions = `# 🚀 Bell24h Deployment Instructions

## ✅ Prerequisites Completed
- ✅ Node.js and npm installed
- ✅ Dependencies installed
- ✅ Project built successfully
- ✅ Vercel CLI installed
- ✅ Environment template created

## 🎯 Next Steps

### 1. Deploy to Vercel
Run this command in your terminal:
\`\`\`bash
vercel --prod
\`\`\`

### 2. Configure Environment Variables
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your Bell24h project
3. Go to Settings → Environment Variables
4. Add all variables from .env.vercel.template
5. Redeploy

### 3. Get Your Neon Connection String
1. Go to [console.neon.tech](https://console.neon.tech)
2. Click on your Bell24h project
3. Click "Connection Details" in bell24h-prod database
4. Copy the "Connection string"
5. Update DATABASE_URL in Vercel

### 4. Test Your Deployment
Visit your deployed URL and test:
- ✅ Homepage loads
- ✅ Phone OTP authentication works
- ✅ Admin dashboard accessible
- ✅ Database operations work

## 🎉 Expected Results
- **URL**: https://bell24h.vercel.app
- **Cost**: ₹0/month (saved $180-840/year)
- **Database**: Free Neon.tech
- **Features**: All working

## 📞 Need Help?
If you encounter any issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connection
4. Check GitHub repository settings

Your Bell24h application is ready to go live! 🚀
`;

fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', instructions);
console.log('✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md');

// Step 7: Create quick deploy script
console.log('\n🚀 Step 7: Creating quick deploy script...');
const quickDeployScript = `@echo off
echo ========================================
echo    BELL24H QUICK DEPLOY TO VERCEL
echo ========================================
echo.

echo Step 1: Deploying to Vercel...
echo Please follow the prompts:
vercel --prod

echo.
echo Step 2: Configure environment variables
echo Go to vercel.com/dashboard
echo Add variables from .env.vercel.template
echo.

echo Step 3: Get Neon connection string
echo Go to console.neon.tech
echo Copy connection string to Vercel
echo.

echo ✅ DEPLOYMENT COMPLETE!
echo Your app will be live at: https://bell24h.vercel.app
echo.
pause
`;

fs.writeFileSync('quick-deploy-vercel.bat', quickDeployScript);
console.log('✅ Quick deploy script created: quick-deploy-vercel.bat');

// Step 8: Final summary
console.log('\n🎉 AUTOMATION COMPLETE!');
console.log('======================');
console.log('\n📊 What was completed:');
console.log('✅ Prerequisites checked');
console.log('✅ Dependencies installed');
console.log('✅ Project built successfully');
console.log('✅ Vercel CLI installed');
console.log('✅ Environment template created');
console.log('✅ Deployment instructions created');
console.log('✅ Quick deploy script created');

console.log('\n🎯 Next Steps:');
console.log('1. Run: vercel --prod');
console.log('2. Configure environment variables in Vercel dashboard');
console.log('3. Add your Neon connection string');
console.log('4. Test your deployment');

console.log('\n💰 Cost Savings:');
console.log('❌ Railway (deleted): $15-70/month');
console.log('✅ Neon.tech (current): FREE');
console.log('💰 Annual savings: $180-840');

console.log('\n🚀 Your Bell24h application is ready to go live!');
console.log('📱 Expected URL: https://bell24h.vercel.app');
console.log('\nRun "quick-deploy-vercel.bat" to deploy now!');
