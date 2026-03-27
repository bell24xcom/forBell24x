#!/usr/bin/env node

/**
 * Vercel Deployment Script
 * Builds and deploys Bell24h to Vercel with proper error handling
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class VercelDeployer {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildSuccess = false;
    this.deploySuccess = false;
  }

  async deploy() {
    console.log('🚀 Bell24h Vercel Deployment');
    console.log('='.repeat(40));
    
    try {
      // Step 1: Check prerequisites
      await this.checkPrerequisites();
      
      // Step 2: Build the project
      await this.buildProject();
      
      // Step 3: Deploy to Vercel
      await this.deployToVercel();
      
      // Step 4: Generate deployment report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      this.generateErrorReport(error);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('\n🔍 Checking prerequisites...');
    
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('   ✅ Vercel CLI installed');
    } catch (error) {
      console.log('   ⚠️  Vercel CLI not found, installing...');
      try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        console.log('   ✅ Vercel CLI installed successfully');
      } catch (installError) {
        throw new Error('Failed to install Vercel CLI. Please install manually: npm install -g vercel');
      }
    }

    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.log('   ⚠️  .env file not found, creating template...');
      this.createEnvTemplate();
    } else {
      console.log('   ✅ .env file found');
    }

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('   ⚠️  DATABASE_URL not set in environment');
      console.log('   💡 Please set your Neon.tech DATABASE_URL in .env file');
    } else {
      console.log('   ✅ DATABASE_URL configured');
    }

    console.log('   ✅ Prerequisites check complete');
  }

  createEnvTemplate() {
    const envTemplate = `# Bell24h Environment Variables
# Copy this to .env and fill in your values

# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# API Keys
MSG91_API_KEY=your_msg91_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
`;

    fs.writeFileSync('.env.example', envTemplate);
    console.log('   📄 Created .env.example template');
  }

  async buildProject() {
    console.log('\n🔨 Building project...');
    
    try {
      // Install dependencies
      console.log('   📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      
      // Generate Prisma client
      console.log('   🗄️  Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Build Next.js project
      console.log('   🏗️  Building Next.js project...');
      execSync('npm run build', { stdio: 'inherit' });
      
      this.buildSuccess = true;
      console.log('   ✅ Build successful');
      
    } catch (error) {
      console.error('   ❌ Build failed:', error.message);
      throw new Error('Build process failed. Check the errors above.');
    }
  }

  async deployToVercel() {
    console.log('\n🚀 Deploying to Vercel...');
    
    try {
      // Check if already logged in to Vercel
      try {
        execSync('vercel whoami', { stdio: 'pipe' });
        console.log('   ✅ Already logged in to Vercel');
      } catch (error) {
        console.log('   🔐 Please log in to Vercel...');
        execSync('vercel login', { stdio: 'inherit' });
      }

      // Deploy to Vercel
      console.log('   📤 Uploading to Vercel...');
      const deployOutput = execSync('vercel --prod --yes', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Extract deployment URL from output
      const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
      if (urlMatch) {
        this.deploymentUrl = urlMatch[0];
        console.log(`   ✅ Deployed successfully: ${this.deploymentUrl}`);
        this.deploySuccess = true;
      } else {
        console.log('   ✅ Deployed successfully (URL not extracted)');
        this.deploySuccess = true;
      }
      
    } catch (error) {
      console.error('   ❌ Vercel deployment failed:', error.message);
      throw new Error('Vercel deployment failed. Check your Vercel configuration.');
    }
  }

  generateReport() {
    console.log('\n📊 DEPLOYMENT REPORT');
    console.log('='.repeat(40));
    
    console.log(`\n✅ Build Status: ${this.buildSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Deploy Status: ${this.deploySuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (this.deploymentUrl) {
      console.log(`\n🌐 Deployment URL: ${this.deploymentUrl}`);
    }
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Set environment variables in Vercel dashboard');
    console.log('   2. Test all pages and functionality');
    console.log('   3. Monitor performance and errors');
    
    console.log('\n🔧 Environment Variables to Set:');
    console.log('   - DATABASE_URL (Neon.tech connection string)');
    console.log('   - NEXTAUTH_SECRET (random 32+ character string)');
    console.log('   - NEXTAUTH_URL (your Vercel app URL)');
    console.log('   - MSG91_API_KEY (for SMS)');
    console.log('   - SENDGRID_API_KEY (for emails)');
    console.log('   - RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET (for payments)');
    
    console.log('\n🎉 Deployment complete!');
  }

  generateErrorReport(error) {
    console.log('\n❌ ERROR REPORT');
    console.log('='.repeat(40));
    console.log(`Error: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify Vercel CLI is installed: npm install -g vercel');
    console.log('   3. Check your Vercel account permissions');
    console.log('   4. Review build errors above');
    console.log('   5. Ensure all environment variables are set');
  }
}

// Run deployment
async function main() {
  const deployer = new VercelDeployer();
  await deployer.deploy();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Deployment interrupted');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default VercelDeployer;
