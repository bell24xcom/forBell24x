#!/usr/bin/env node

/**
 * 🚀 AUTOMATED NEON TO NEON DATABASE MIGRATION
 * This script automatically migrates all Neon references to Neon database
 */

const fs = require('fs');
const path = require('path');

// Your real Neon database URL
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Files that contain Neon references
const NEON_FILES = [
  'DEPLOYMENT_GUIDE.md',
  'NEON_SETUP_GUIDE.md', 
  'neon.env.example',
  'neon.json',
  'src/lib/db-connection.ts',
  'scripts/setup-production-db.js',
  'setup-db.js',
  'scripts/init-db.js',
  'push-schema.js'
];

// Neon patterns to replace
const NEON_PATTERNS = [
  {
    search: /neon\.app/g,
    replace: 'neon.tech'
  },
  {
    search: /Neon/g,
    replace: 'Neon'
  },
  {
    search: /NEON/g,
    replace: 'NEON'
  },
  {
    search: /neon/g,
    replace: 'neon'
  },
  {
    search: /postgresql:\/\/postgres:.*@.*\.proxy\.rlwy\.net:.*\/neon/g,
    replace: NEON_DATABASE_URL
  },
  {
    search: /postgresql:\/\/.*@.*\.proxy\.rlwy\.net:.*\/neon/g,
    replace: NEON_DATABASE_URL
  },
  {
    search: /localhost:5432/g,
    replace: 'ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech:5432'
  }
];

console.log('🚀 Starting Neon to Neon Database Migration...\n');

let totalFilesProcessed = 0;
let totalReplacements = 0;

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    let originalContent = content;

    // Apply all replacement patterns
    NEON_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.search);
      if (matches) {
        content = content.replace(pattern.search, pattern.replace);
        fileReplacements += matches.length;
      }
    });

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath} (${fileReplacements} replacements)`);
      totalReplacements += fileReplacements;
    } else {
      console.log(`➖ No changes: ${filePath}`);
    }

    totalFilesProcessed++;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all identified files
console.log('📁 Processing Neon reference files...\n');

NEON_FILES.forEach(file => {
  const filePath = path.join(__dirname, file);
  processFile(filePath);
});

// Update environment files
console.log('\n🔧 Updating environment files...\n');

const envFiles = ['.env.local', '.env.production', 'env.production'];
envFiles.forEach(envFile => {
  const filePath = path.join(__dirname, envFile);
  processFile(filePath);
});

// Create new .env.local with Neon database
console.log('\n📝 Creating .env.local with Neon database...\n');

const envLocalContent = `# Bell24h Local Environment Variables
# Migrated from Neon to Neon Database

# Database Configuration - NEON DATABASE
DATABASE_URL="${NEON_DATABASE_URL}"
DIRECT_URL="${NEON_DATABASE_URL}"

# Authentication & Security
NEXTAUTH_SECRET="bell24h-production-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# MSG91 OTP Configuration
MSG91_AUTH_KEY="your_msg91_key_here"
MSG91_SENDER_ID="BELL24H"

# Payment Gateway (Development)
STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"
RAZORPAY_KEY_ID="rzp_test_your_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Redis (Optional - using in-memory fallback)
REDIS_URL="redis://localhost:6379"
`;

try {
  fs.writeFileSync(path.join(__dirname, '.env.local'), envLocalContent);
  console.log('✅ Created .env.local with Neon database configuration');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}

// Update package.json scripts if needed
console.log('\n📦 Checking package.json scripts...\n');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    let updated = false;

    if (packageJson.scripts) {
      Object.keys(packageJson.scripts).forEach(scriptName => {
        const script = packageJson.scripts[scriptName];
        if (script.includes('neon')) {
          packageJson.scripts[scriptName] = script.replace(/neon/g, 'neon');
          updated = true;
        }
      });
    }

    if (updated) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json scripts');
    } else {
      console.log('➖ No package.json scripts needed updating');
    }
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Migration Summary
console.log('\n🎉 MIGRATION COMPLETE!\n');
console.log('📊 Migration Summary:');
console.log(`   Files processed: ${totalFilesProcessed}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`   Database migrated to: Neon PostgreSQL`);
console.log(`   Connection string: ${NEON_DATABASE_URL.substring(0, 50)}...`);

console.log('\n✅ NEXT STEPS:');
console.log('1. Test database connection: node test-neon-connection.js');
console.log('2. Push schema to Neon: npx prisma db push');
console.log('3. Generate Prisma client: npx prisma generate');
console.log('4. Test the application: npm run dev');

console.log('\n🚀 Your Bell24h project is now fully migrated to Neon database!');
