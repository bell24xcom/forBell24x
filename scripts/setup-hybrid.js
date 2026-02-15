#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Hybrid Code Generation (Spec Kit + Custom Templates)');

async function setup() {
  try {
    // 1. Create necessary directories
    console.log('📁 Creating directories...');
    const dirs = [
      'src/generated',
      'app/suppliers',
      'app/products', 
      'app/rfq',
      'scripts'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created: ${dir}`);
      }
    });

    // 2. Generate API client from OpenAPI spec
    console.log('🔧 Generating API client from OpenAPI specification...');
    try {
      execSync('npx @openapitools/openapi-generator-cli generate -i api-spec.yaml -g typescript-axios -o src/generated/api', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ API client generated successfully');
    } catch (error) {
      console.log('⚠️  API generation failed, but continuing with setup...');
      console.log('   You can run "npm run gen:api" later to generate the API client');
    }

    // 3. Create environment configuration
    console.log('⚙️  Creating environment configuration...');
    const envContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/bell24h"

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# External Services
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
`;

    if (!fs.existsSync('.env.local')) {
      fs.writeFileSync('.env.local', envContent);
      console.log('✅ Created: .env.local');
    }

    // 4. Create TypeScript configuration
    console.log('📝 Creating TypeScript configuration...');
    const tsConfig = {
      "compilerOptions": {
        "target": "es5",
        "lib": ["dom", "dom.iterable", "es6"],
        "allowJs": true,
        "skipLibCheck": true,
        "strict": true,
        "noEmit": true,
        "esModuleInterop": true,
        "module": "esnext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "jsx": "preserve",
        "incremental": true,
        "plugins": [
          {
            "name": "next"
          }
        ],
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"],
          "@/generated/*": ["./src/generated/*"]
        }
      },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      "exclude": ["node_modules"]
    };

    fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));
    console.log('✅ Created: tsconfig.json');

    // 5. Create Next.js configuration
    console.log('⚙️  Creating Next.js configuration...');
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
`;

    if (!fs.existsSync('next.config.js')) {
      fs.writeFileSync('next.config.js', nextConfig);
      console.log('✅ Created: next.config.js');
    }

    // 6. Install dependencies
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.log('⚠️  Dependency installation failed, please run "npm install" manually');
    }

    // 7. Generate sample pages
    console.log('🎨 Generating sample pages...');
    try {
      execSync('node scripts/hybrid-generator.js all', { stdio: 'inherit' });
      console.log('✅ Sample pages generated');
    } catch (error) {
      console.log('⚠️  Page generation failed, you can run "npm run gen:all" later');
    }

    console.log('\n🎉 Hybrid setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm run dev" to start the development server');
    console.log('2. Run "npm run gen:api" to generate API client');
    console.log('3. Run "npm run gen:page <name>" to generate specific pages');
    console.log('4. Run "npm run gen:all" to generate all pages');
    
    console.log('\n🚀 Available commands:');
    console.log('- npm run gen:page suppliers    # Generate suppliers page');
    console.log('- npm run gen:page products     # Generate products page');
    console.log('- npm run gen:page rfq          # Generate RFQ page');
    console.log('- npm run gen:all               # Generate all pages');
    console.log('- npm run gen:api               # Generate API client');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();