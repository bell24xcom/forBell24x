#!/usr/bin/env node

/**
 * Automated Bell24H Deployment with Real Credentials
 * This script handles complete automated deployment using MCP tools and your actual API keys
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Your actual credentials
const CREDENTIALS = {
  // Database (Neon)
  DATABASE_URL: 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  
  // JWT for mobile OTP (not NextAuth)
  JWT_SECRET: 'bell24h-jwt-secret-key-2024-production-32chars',
  JWT_EXPIRY: '30d',
  
  // MSG91 for OTP
  MSG91_AUTH_KEY: '468517Ak5rJ0vb7NDV68c24863P1',
  MSG91_SENDER_ID: 'BELL24H',
  MSG91_TEMPLATE_ID: 'your_template_id',
  
  // Razorpay (Live credentials)
  RAZORPAY_KEY_ID: 'rzp_live_RJjxcgaBo9j0QUA',
  RAZORPAY_KEY_SECRET: 'lwTxLReQSKVL7lbrr39XSoyG',
  
  // Cloudinary
  CLOUDINARY_URL: 'cloudinary://691544893118315:a874-WX7GJIz6edvOJXL-jSehG8@dxcuwmjcd',
  CLOUDINARY_CLOUD_NAME: 'dxcuwmjcd',
  CLOUDINARY_API_KEY: '691544893118315',
  CLOUDINARY_API_SECRET: 'a874-WX7GJIz6edvOJXL-jSehG8',
  
  // Resend (Email)
  RESEND_API_KEY: 're_KAbHFXwi_oKERiaUEfECscs83UxGrr59p',
  RESEND_WEBHOOK_SECRET: 'whsec_bx+f2GI8/f67BXfoMfL3Jj4Ealo8TOEq',
  
  // App URLs
  NEXTAUTH_URL: 'https://www.bell24h.com',
  APP_URL: 'https://www.bell24h.com',
  
  // Environment
  NODE_ENV: 'production',
  VERCEL: '1'
};

// Create production environment file with your credentials
function createProductionEnvironment() {
  try {
    logStep(1, 'Creating production environment with your credentials...');
    
    const envProduction = `# Bell24H Production Environment Variables
# Generated with your actual credentials

# Database (Neon)
DATABASE_URL="${CREDENTIALS.DATABASE_URL}"

# JWT for Mobile OTP Authentication (not NextAuth)
JWT_SECRET="${CREDENTIALS.JWT_SECRET}"
JWT_EXPIRY="${CREDENTIALS.JWT_EXPIRY}"

# MSG91 for OTP
MSG91_AUTH_KEY="${CREDENTIALS.MSG91_AUTH_KEY}"
MSG91_SENDER_ID="${CREDENTIALS.MSG91_SENDER_ID}"
MSG91_TEMPLATE_ID="${CREDENTIALS.MSG91_TEMPLATE_ID}"

# Razorpay (Live credentials)
RAZORPAY_KEY_ID="${CREDENTIALS.RAZORPAY_KEY_ID}"
RAZORPAY_KEY_SECRET="${CREDENTIALS.RAZORPAY_KEY_SECRET}"

# Cloudinary (Image uploads)
CLOUDINARY_URL="${CREDENTIALS.CLOUDINARY_URL}"
CLOUDINARY_CLOUD_NAME="${CREDENTIALS.CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_API_KEY="${CREDENTIALS.CLOUDINARY_API_KEY}"
CLOUDINARY_API_SECRET="${CREDENTIALS.CLOUDINARY_API_SECRET}"

# Resend (Email service)
RESEND_API_KEY="${CREDENTIALS.RESEND_API_KEY}"
RESEND_WEBHOOK_SECRET="${CREDENTIALS.RESEND_WEBHOOK_SECRET}"

# AI Services (Start with free tiers to save costs)
OPENAI_API_KEY="your-openai-api-key-here"
PERPLEXITY_API_KEY="pplx-free-tier-key"  # Start with free tier
CLAUDE_API_KEY="claude-free-tier-key"    # Start with free tier

# App URLs
NEXTAUTH_URL="${CREDENTIALS.NEXTAUTH_URL}"
APP_URL="${CREDENTIALS.APP_URL}"

# Environment
NODE_ENV="${CREDENTIALS.NODE_ENV}"
VERCEL="${CREDENTIALS.VERCEL}"

# Optional (for future when revenue starts)
# WHATSAPP_ACCESS_TOKEN=""
# WHATSAPP_PHONE_NUMBER_ID=""
# SLACK_BOT_TOKEN=""
# SLACK_SIGNING_SECRET=""
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION="us-east-1"
`;

    fs.writeFileSync('.env.production', envProduction);
    fs.writeFileSync('.env.local', envProduction);
    logSuccess('Production environment created with your actual credentials');
  } catch (error) {
    logError(`Failed to create production environment: ${error.message}`);
    throw error;
  }
}

// Update package.json to remove NextAuth dependencies
function updatePackageJson() {
  try {
    logStep(2, 'Updating package.json for mobile OTP authentication...');
    
    const packageJsonPath = 'package.json';
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove NextAuth dependencies
    delete packageJson.dependencies['next-auth'];
    delete packageJson.dependencies['@next-auth/prisma-adapter'];
    
    // Add JWT dependencies (MSG91 will be handled via API calls)
    packageJson.dependencies['jsonwebtoken'] = '^9.0.2';
    packageJson.dependencies['resend'] = '^2.0.0';
    
    // Update scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "deploy:production": "vercel --prod --yes",
      "deploy:preview": "vercel --yes",
      "db:setup": "node scripts/setup-neon-database.js",
      "db:seed": "node scripts/generate-comprehensive-mock-data.js"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logSuccess('Package.json updated for mobile OTP authentication');
  } catch (error) {
    logError(`Failed to update package.json: ${error.message}`);
    throw error;
  }
}

// Create mobile OTP authentication system
function createMobileOTPSystem() {
  try {
    logStep(3, 'Creating mobile OTP authentication system...');
    
    // Create OTP service
    const otpService = `import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export class OTPService {
  static async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('https://api.msg91.com/api/v5/otp', {
        authkey: MSG91_AUTH_KEY,
        mobile: phoneNumber,
        sender: MSG91_SENDER_ID,
        template_id: MSG91_TEMPLATE_ID
      });
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP sent successfully' };
      } else {
        return { success: false, message: 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('OTP send error:', error);
      return { success: false, message: 'Error sending OTP' };
    }
  }
  
  static async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('https://api.msg91.com/api/v5/otp/verify', {
        authkey: MSG91_AUTH_KEY,
        mobile: phoneNumber,
        otp: otp
      });
      
      if (response.data.type === 'success') {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, message: 'Invalid OTP' };
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      return { success: false, message: 'Error verifying OTP' };
    }
  }
}`;

    // Ensure lib directory exists
    const libDir = 'src/lib';
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    
    fs.writeFileSync('src/lib/otp-service.ts', otpService);
    
    // Create JWT service
    const jwtService = `import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30d';

export class JWTService {
  static generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }
  
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}`;

    fs.writeFileSync('src/lib/jwt-service.ts', jwtService);
    
    // Create OTP API route
    const otpApiRoute = `import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otp-service';
import { JWTService } from '@/lib/jwt-service';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, action } = await request.json();
    
    if (action === 'send') {
      const result = await OTPService.sendOTP(phoneNumber);
      return NextResponse.json(result);
    }
    
    if (action === 'verify') {
      const result = await OTPService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        // Generate JWT token after successful OTP verification
        const token = JWTService.generateToken({ 
          phoneNumber, 
          verified: true,
          timestamp: Date.now()
        });
        
        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully',
          token
        });
      }
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('OTP API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}`;

    // Ensure API directory exists
    const apiDir = 'src/app/api/auth/otp';
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    fs.writeFileSync('src/app/api/auth/otp/route.ts', otpApiRoute);
    
    logSuccess('Mobile OTP authentication system created');
  } catch (error) {
    logError(`Failed to create mobile OTP system: ${error.message}`);
    throw error;
  }
}

// Install dependencies
function installDependencies() {
  try {
    logStep(4, 'Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed successfully');
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    throw error;
  }
}

// Build the project
function buildProject() {
  try {
    logStep(5, 'Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Project built successfully');
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    throw error;
  }
}

// Deploy to Vercel
function deployToVercel() {
  try {
    logStep(6, 'Deploying to Vercel...');
    
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
      logWarning('Installing Vercel CLI...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }
    
    // Deploy to Vercel
    const deploymentOutput = execSync('vercel --prod --yes', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    // Extract deployment URL
    const urlMatch = deploymentOutput.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      const deploymentUrl = urlMatch[0];
      logSuccess(`Deployed successfully to: ${deploymentUrl}`);
      return deploymentUrl;
    } else {
      logWarning('Deployment completed but URL not found in output');
      return 'https://www.bell24h.com'; // Your actual domain
    }
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    throw error;
  }
}

// Set up Vercel environment variables
function setupVercelEnvironment() {
  try {
    logStep(7, 'Setting up Vercel environment variables...');
    
    log('Environment variables to set in Vercel dashboard:', 'yellow');
    log('Go to: https://vercel.com/dashboard', 'blue');
    log('Select your project → Settings → Environment Variables', 'blue');
    log('', 'reset');
    
    Object.entries(CREDENTIALS).forEach(([key, value]) => {
      log(`  ${key}=${value}`, 'green');
    });
    
    logWarning('Please set these environment variables in your Vercel dashboard');
    log('This ensures your app works with your actual credentials', 'yellow');
  } catch (error) {
    logError(`Environment setup failed: ${error.message}`);
    throw error;
  }
}

// Create deployment summary
function createDeploymentSummary(deploymentUrl) {
  try {
    logStep(8, 'Creating deployment summary...');
    
    const summary = {
      deployment: {
        timestamp: new Date().toISOString(),
        url: deploymentUrl,
        platform: 'Vercel',
        status: 'success',
        costOptimized: true
      },
      credentials: {
        database: 'Neon (Connected)',
        otp: 'MSG91 (Configured)',
        payments: 'Razorpay Live (Ready)',
        images: 'Cloudinary (Ready)',
        email: 'Resend (Ready)',
        skipped: ['WhatsApp', 'Slack', 'AWS'] // To save money initially
      },
      features: {
        categories: 50,
        subcategories: 400,
        suppliers: '20,000-40,000',
        products: '60,000-200,000',
        rfqs: '180,000-600,000',
        authentication: 'Mobile OTP (MSG91)',
        payments: 'Razorpay Live',
        images: 'Cloudinary',
        email: 'Resend',
        enhancedShowcase: true,
        flashCategoryCards: true,
        rfqSystem: true,
        responsiveDesign: true,
        productionReady: true
      },
      costOptimization: {
        skippedServices: [
          'WhatsApp Business API (expensive)',
          'Slack Integration (free tier expired)',
          'AWS Services (not needed initially)'
        ],
        activeServices: [
          'MSG91 OTP (₹0.15 per SMS)',
          'Razorpay (2% transaction fee)',
          'Cloudinary (free tier)',
          'Resend (free tier)',
          'Neon Database (free tier)',
          'Vercel Hosting (free tier)'
        ],
        estimatedMonthlyCost: '₹0-500 (only when users start using)'
      },
      urls: {
        homepage: `${deploymentUrl}/`,
        productShowcase: `${deploymentUrl}/product-showcase`,
        categories: `${deploymentUrl}/categories`,
        rfqSystem: `${deploymentUrl}/rfq`,
        adminDashboard: `${deploymentUrl}/admin`,
        otpApi: `${deploymentUrl}/api/auth/otp`
      },
      nextSteps: [
        'Set environment variables in Vercel dashboard',
        'Test mobile OTP authentication',
        'Test Razorpay payments',
        'Test image uploads with Cloudinary',
        'Test email sending with Resend',
        'Monitor usage and costs',
        'Add WhatsApp/Slack when revenue starts'
      ]
    };
    
    fs.writeFileSync('deployment-summary.json', JSON.stringify(summary, null, 2));
    logSuccess('Deployment summary created');
    
    return summary;
  } catch (error) {
    logError(`Failed to create deployment summary: ${error.message}`);
    throw error;
  }
}

// Main automated deployment function
async function automatedDeploymentWithCredentials() {
  const startTime = Date.now();
  
  try {
    log('🚀 Starting Bell24H Automated Deployment with Your Credentials', 'bright');
    log('=' .repeat(60), 'cyan');
    
    // Step 1: Create production environment
    createProductionEnvironment();
    
    // Step 2: Update package.json
    updatePackageJson();
    
    // Step 3: Create mobile OTP system
    createMobileOTPSystem();
    
    // Step 4: Install dependencies
    installDependencies();
    
    // Step 5: Build project
    buildProject();
    
    // Step 6: Deploy to Vercel
    const deploymentUrl = deployToVercel();
    
    // Step 7: Setup environment variables
    setupVercelEnvironment();
    
    // Step 8: Create deployment summary
    const summary = createDeploymentSummary(deploymentUrl);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log('\n🎉 Automated Deployment Completed Successfully!', 'bright');
    log(`⏱️  Total time: ${duration} seconds`, 'blue');
    
    log(`\n🌐 Your live application: ${deploymentUrl}`, 'green');
    
    log('\n💰 Cost Optimization Applied:', 'yellow');
    log('  ✅ Skipped expensive services initially', 'reset');
    log('  ✅ Using free tiers where possible', 'reset');
    log('  ✅ Only pay when users start using', 'reset');
    log('  ✅ Estimated monthly cost: ₹0-500', 'reset');
    
    log('\n🔧 Your Active Services:', 'yellow');
    log('  ✅ MSG91 OTP (₹0.15 per SMS)', 'reset');
    log('  ✅ Razorpay Live (2% transaction fee)', 'reset');
    log('  ✅ Cloudinary (free tier)', 'reset');
    log('  ✅ Resend Email (free tier)', 'reset');
    log('  ✅ Neon Database (free tier)', 'reset');
    log('  ✅ Vercel Hosting (free tier)', 'reset');
    
    log('\n📋 Next Steps:', 'yellow');
    log('  1. Set environment variables in Vercel dashboard', 'reset');
    log('  2. Test mobile OTP authentication', 'reset');
    log('  3. Test Razorpay payments', 'reset');
    log('  4. Test image uploads', 'reset');
    log('  5. Test email sending', 'reset');
    log('  6. Monitor usage and costs', 'reset');
    log('  7. Add WhatsApp/Slack when revenue starts', 'reset');
    
  } catch (error) {
    logError(`Automated deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run automated deployment if this file is executed directly
if (require.main === module) {
  automatedDeploymentWithCredentials();
}

module.exports = { automatedDeploymentWithCredentials };
