#!/usr/bin/env node

/**
 * Create Staging Environment Script
 * Sets up a safe staging environment for testing new features
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class StagingEnvironment {
  constructor() {
    this.projectRoot = process.cwd();
    this.stagingDir = path.join(this.projectRoot, 'bell24h-staging');
  }

  async run() {
    console.log('🚀 CREATING STAGING ENVIRONMENT');
    console.log('===============================\n');

    try {
      // Step 1: Create staging directory
      await this.createStagingDirectory();
      
      // Step 2: Copy production code
      await this.copyProductionCode();
      
      // Step 3: Setup staging configuration
      await this.setupStagingConfig();
      
      // Step 4: Create admin panel structure
      await this.createAdminStructure();
      
      // Step 5: Setup Railway deployment
      await this.setupRailwayStaging();
      
      console.log('\n✅ STAGING ENVIRONMENT READY');
      
    } catch (error) {
      console.error('❌ Staging setup failed:', error.message);
      process.exit(1);
    }
  }

  async createStagingDirectory() {
    console.log('📁 Step 1: Creating staging directory...');
    
    if (fs.existsSync(this.stagingDir)) {
      console.log('⚠️  Staging directory already exists, cleaning...');
      fs.rmSync(this.stagingDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.stagingDir, { recursive: true });
    console.log(`✅ Staging directory created: ${this.stagingDir}`);
  }

  async copyProductionCode() {
    console.log('\n📋 Step 2: Copying production code...');
    
    // Copy key directories and files
    const itemsToCopy = [
      'app',
      'components',
      'styles',
      'public',
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      'vercel.json'
    ];
    
    for (const item of itemsToCopy) {
      const sourcePath = path.join(this.projectRoot, item);
      const destPath = path.join(this.stagingDir, item);
      
      if (fs.existsSync(sourcePath)) {
        const stat = fs.statSync(sourcePath);
        
        if (stat.isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
        
        console.log(`  ✅ Copied: ${item}`);
      } else {
        console.log(`  ⚠️  Not found: ${item}`);
      }
    }
    
    console.log('✅ Production code copied to staging');
  }

  async setupStagingConfig() {
    console.log('\n⚙️  Step 3: Setting up staging configuration...');
    
    // Create staging-specific package.json
    const packagePath = path.join(this.stagingDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Add staging-specific scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'dev:staging': 'next dev -p 3001',
        'build:staging': 'next build',
        'start:staging': 'next start -p 3001'
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('  ✅ Updated package.json for staging');
    }
    
    // Create staging environment file
    const envContent = `
# Staging Environment Variables
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging-bell24h.up.railway.app
NEXT_PUBLIC_API_URL=https://staging-bell24h.up.railway.app

# Database (staging)
DATABASE_URL=${{StagingPostgres.DATABASE_URL}}

# JWT
JWT_SECRET=staging-jwt-secret-key-32-chars

# Admin Panel
ADMIN_ENABLED=true
ADMIN_SECRET_KEY=staging-admin-secret

# Feature Flags
FEATURE_ADMIN_PANEL=true
FEATURE_MARKETING_DASHBOARD=true
FEATURE_ESCROW_SYSTEM=false
`;
    
    fs.writeFileSync(path.join(this.stagingDir, '.env.staging'), envContent);
    console.log('  ✅ Created .env.staging');
    
    // Create staging-specific next.config.js
    const nextConfigContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: 'staging',
  },
  // Staging-specific configurations
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
`;
    
    fs.writeFileSync(path.join(this.stagingDir, 'next.config.staging.js'), nextConfigContent);
    console.log('  ✅ Created next.config.staging.js');
  }

  async createAdminStructure() {
    console.log('\n🏗️  Step 4: Creating admin panel structure...');
    
    const adminDir = path.join(this.stagingDir, 'app', 'admin');
    fs.mkdirSync(adminDir, { recursive: true });
    
    // Create admin layout
    const adminLayout = `
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bell24h Admin Panel',
  description: 'Admin dashboard for Bell24h B2B Marketplace',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Bell24h Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/admin/marketing" className="text-gray-700 hover:text-gray-900">
                Marketing
              </a>
              <a href="/admin/transactions" className="text-gray-700 hover:text-gray-900">
                Transactions
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
`;
    
    fs.writeFileSync(path.join(adminDir, 'layout.tsx'), adminLayout);
    
    // Create admin dashboard
    const adminDashboard = `
export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h2>
        <p className="text-gray-600">
          This is the staging admin panel. New features will be tested here
          before being deployed to production.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">M</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Marketing Dashboard
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Coming Soon
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Transactions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Coming Soon
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Management
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Coming Soon
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
    
    fs.mkdirSync(path.join(adminDir, 'dashboard'), { recursive: true });
    fs.writeFileSync(path.join(adminDir, 'dashboard', 'page.tsx'), adminDashboard);
    
    console.log('  ✅ Created admin panel structure');
  }

  async setupRailwayStaging() {
    console.log('\n🚂 Step 5: Setting up Railway staging...');
    
    // Create Railway configuration
    const railwayConfig = {
      "build": {
        "builder": "NIXPACKS"
      },
      "deploy": {
        "startCommand": "npm run start:staging",
        "healthcheckPath": "/",
        "healthcheckTimeout": 100,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
      }
    };
    
    fs.writeFileSync(
      path.join(this.stagingDir, 'railway.json'),
      JSON.stringify(railwayConfig, null, 2)
    );
    
    // Create deployment instructions
    const deployInstructions = `
# Railway Staging Deployment Instructions

## Prerequisites:
1. Install Railway CLI: npm install -g @railway/cli
2. Login to Railway: railway login
3. Create new project: railway new

## Deploy to Staging:
\`\`\`bash
cd ${this.stagingDir}
railway login
railway link
railway up --environment staging
\`\`\`

## Environment Variables to Set:
- NODE_ENV=staging
- DATABASE_URL=${{StagingPostgres.DATABASE_URL}}
- JWT_SECRET=staging-jwt-secret-key-32-chars
- NEXT_PUBLIC_APP_URL=https://staging-bell24h.up.railway.app

## Staging URL:
https://staging-bell24h.up.railway.app

## Admin Panel:
https://staging-bell24h.up.railway.app/admin

## Notes:
- This is a staging environment for testing
- Production site remains unchanged at bell24h-v1.vercel.app
- All new features will be tested here first
`;
    
    fs.writeFileSync(
      path.join(this.stagingDir, 'DEPLOYMENT_INSTRUCTIONS.md'),
      deployInstructions
    );
    
    console.log('  ✅ Created Railway configuration');
    console.log('  ✅ Created deployment instructions');
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Run the staging setup
const staging = new StagingEnvironment();
staging.run().catch(console.error);
