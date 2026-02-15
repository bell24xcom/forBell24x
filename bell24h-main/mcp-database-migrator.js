#!/usr/bin/env node

/**
 * 🚀 MCP DATABASE MIGRATION SERVER
 * Automated Railway to Neon Database Migration
 */

const fs = require('fs');
const path = require('path');

// Your real Neon database URL
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🚀 MCP Database Migration Server Starting...\n');

// Find all Railway references
function findRailwayReferences() {
  const railwayFiles = [];
    const searchPatterns = [
    /railway\.app/gi,
    /Railway/gi,
    /railway/gi,
    /\.proxy\.rlwy\.net/gi,
    /postgresql:\/\/.*@.*\.proxy\.rlwy\.net/gi
  ];

  function searchDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.env'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');

            for (const pattern of searchPatterns) {
              if (pattern.test(content)) {
              railwayFiles.push({
                path: fullPath,
                content: content,
                matches: content.match(pattern) || []
              });
              break;
              }
            }
          } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }

  searchDirectory(path.join(__dirname, 'client'));
  return railwayFiles;
}

// Replace Railway references with Neon
function migrateToNeon(files) {
    const replacements = [
      {
      search: /railway\.app/g,
      replace: 'neon.tech',
      description: 'Railway URLs to Neon URLs'
    },
    {
      search: /Railway/g,
      replace: 'Neon',
      description: 'Railway branding to Neon branding'
    },
    {
      search: /RAILWAY/g,
      replace: 'NEON',
      description: 'Railway constants to Neon constants'
    },
    {
      search: /railway/g,
      replace: 'neon',
      description: 'Railway lowercase to Neon lowercase'
    },
    {
      search: /postgresql:\/\/.*@.*\.proxy\.rlwy\.net:.*\/railway/g,
      replace: NEON_DATABASE_URL,
      description: 'Railway database URLs to Neon database URLs'
    },
    {
      search: /postgresql:\/\/postgres:.*@.*\.proxy\.rlwy\.net:.*\/railway/g,
      replace: NEON_DATABASE_URL,
      description: 'Railway PostgreSQL URLs to Neon URLs'
    }
  ];

  let totalReplacements = 0;
  const migratedFiles = [];

  files.forEach(file => {
    let content = file.content;
    let fileReplacements = 0;

    replacements.forEach(replacement => {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        fileReplacements += matches.length;
      }
    });

    if (fileReplacements > 0) {
      try {
        fs.writeFileSync(file.path, content, 'utf8');
        migratedFiles.push({
          path: file.path,
          replacements: fileReplacements
        });
        totalReplacements += fileReplacements;
        console.log(`✅ Migrated: ${path.relative(__dirname, file.path)} (${fileReplacements} changes)`);
      } catch (error) {
        console.error(`❌ Error migrating ${file.path}:`, error.message);
      }
    }
  });

  return { migratedFiles, totalReplacements };
}

// Create environment files with Neon configuration
function createEnvironmentFiles() {
  const envLocalContent = `# Bell24h Local Environment Variables
# Migrated from Railway to Neon Database via MCP

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

# N8N Automation
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
N8N_API_KEY="your_n8n_api_key"
`;

  const envProductionContent = `# Bell24h Production Environment Variables
# Migrated from Railway to Neon Database via MCP

# Database Configuration - NEON DATABASE
DATABASE_URL="${NEON_DATABASE_URL}"
DIRECT_URL="${NEON_DATABASE_URL}"

# Authentication & Security
NEXTAUTH_SECRET="bell24h-production-secret-key-2024"
NEXTAUTH_URL="https://www.bell24h.com"

# MSG91 OTP Configuration (Add your real API key)
MSG91_AUTH_KEY="your_real_msg91_key_here"
MSG91_SENDER_ID="BELL24H"
MSG91_TEMPLATE_ID="your_template_id_here"

# Payment Gateway (Add your real keys)
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# Redis Configuration (Optional - using in-memory fallback)
REDIS_URL="redis://localhost:6379"

# Application Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://www.bell24h.com"
NEXT_PUBLIC_API_URL="https://www.bell24h.com/api"

# N8N Automation
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
N8N_API_KEY="your_n8n_api_key"

# Analytics & Monitoring
GOOGLE_ANALYTICS_ID="your_ga_id"
SENTRY_DSN="your_sentry_dsn"
`;

  // Create .env.local
  const envLocalPath = path.join(__dirname, 'client', '.env.local');
  try {
    fs.writeFileSync(envLocalPath, envLocalContent, 'utf8');
    console.log('✅ Created .env.local with Neon database');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
  }

  // Update env.production
  const envProductionPath = path.join(__dirname, 'client', 'env.production');
  try {
    fs.writeFileSync(envProductionPath, envProductionContent, 'utf8');
    console.log('✅ Updated env.production with Neon database');
  } catch (error) {
    console.error('❌ Error updating env.production:', error.message);
  }
}

// Main migration function
function performMigration() {
  console.log('🔍 Scanning for Railway references...\n');
  
  const railwayFiles = findRailwayReferences();
  console.log(`Found ${railwayFiles.length} files with Railway references\n`);

  if (railwayFiles.length === 0) {
    console.log('✅ No Railway references found - migration may already be complete!');
    return;
  }

  console.log('🔄 Starting migration to Neon database...\n');
  const { migratedFiles, totalReplacements } = migrateToNeon(railwayFiles);

  console.log('\n📝 Creating environment files...\n');
  createEnvironmentFiles();

  console.log('\n🎉 MCP DATABASE MIGRATION COMPLETE!\n');
  console.log('📊 Migration Summary:');
  console.log(`   Files scanned: ${railwayFiles.length}`);
  console.log(`   Files migrated: ${migratedFiles.length}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log(`   Database: Railway → Neon PostgreSQL`);
  console.log(`   Connection: ${NEON_DATABASE_URL.substring(0, 50)}...`);

  console.log('\n✅ NEXT STEPS:');
  console.log('1. Test database connection: cd client && npm run test:db');
  console.log('2. Push schema to Neon: cd client && npm run db:push');
  console.log('3. Generate Prisma client: cd client && npm run db:generate');
  console.log('4. Test the application: cd client && npm run dev');

  console.log('\n🚀 Your Bell24h project is now fully migrated to Neon database via MCP!');
}

// Run the migration
performMigration();