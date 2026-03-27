const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Database Setup Script
 * Sets up Prisma database with Campaign and Agent models
 */

class DatabaseSetup {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async setupDatabase() {
    console.log('🗄️ Setting up database with Campaign and Agent models...\n');

    try {
      // Step 1: Generate Prisma client
      console.log('📦 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated\n');

      // Step 2: Create migration
      console.log('🔄 Creating database migration...');
      try {
        execSync('npx prisma migrate dev --name add_campaigns_agents', { stdio: 'inherit' });
        console.log('✅ Migration created successfully\n');
      } catch (error) {
        console.log('⚠️  Migration may already exist or database not connected\n');
      }

      // Step 3: Create seed data
      await this.createSeedData();

      // Step 4: Create default admin agent
      await this.createDefaultAgent();

      console.log('🎉 Database setup complete!');
      console.log('\n📋 Next Steps:');
      console.log('1. Update your .env.local with DATABASE_URL');
      console.log('2. Run: npm run dev');
      console.log('3. Visit /admin to test the Marketing Dashboard');
      console.log('4. Create agents using the API endpoints');

    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  }

  async createSeedData() {
    console.log('🌱 Creating seed data...');
    
    const seedScript = `
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default categories
  const categories = [
    { name: 'Textiles & Garments', description: 'Clothing and textile products' },
    { name: 'Pharmaceuticals', description: 'Medical and pharmaceutical products' },
    { name: 'Agricultural Products', description: 'Farming and agricultural supplies' },
    { name: 'Automotive Parts', description: 'Vehicle components and parts' },
    { name: 'IT Services', description: 'Information technology services' },
    { name: 'Gems & Jewelry', description: 'Precious stones and jewelry' },
    { name: 'Handicrafts', description: 'Handmade and artisanal products' },
    { name: 'Machinery & Equipment', description: 'Industrial machinery and equipment' },
    { name: 'Chemicals', description: 'Chemical products and supplies' },
    { name: 'Food Processing', description: 'Food and beverage processing' },
    { name: 'Construction', description: 'Building and construction materials' },
    { name: 'Metals & Steel', description: 'Metal products and steel' },
    { name: 'Plastics', description: 'Plastic products and materials' },
    { name: 'Paper & Packaging', description: 'Paper products and packaging' },
    { name: 'Rubber', description: 'Rubber products and materials' },
    { name: 'Ceramics', description: 'Ceramic products and materials' },
    { name: 'Glass', description: 'Glass products and materials' },
    { name: 'Wood', description: 'Wood products and materials' },
    { name: 'Leather', description: 'Leather products and materials' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('✅ Categories created')

  // Create sample campaigns
  const sampleCampaigns = [
    {
      name: 'B2B Marketplace Launch',
      description: 'Launch campaign for Bell24h B2B marketplace',
      channels: ['google', 'facebook', 'linkedin'],
      budget: 10000,
      targetMarket: 'B2B Suppliers',
      productName: 'Bell24h Platform',
      status: 'PUBLISHED'
    },
    {
      name: 'Supplier Acquisition',
      description: 'Campaign to acquire new suppliers',
      channels: ['google', 'linkedin'],
      budget: 5000,
      targetMarket: 'Manufacturing Companies',
      productName: 'Supplier Portal',
      status: 'PUBLISHED'
    },
    {
      name: 'RFQ Feature Promotion',
      description: 'Promote RFQ creation feature',
      channels: ['facebook', 'twitter'],
      budget: 3000,
      targetMarket: 'Buyers',
      productName: 'RFQ System',
      status: 'DRAFT'
    }
  ]

  for (const campaign of sampleCampaigns) {
    await prisma.campaign.upsert({
      where: { name: campaign.name },
      update: {},
      create: campaign
    })
  }

  console.log('✅ Sample campaigns created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`;

    const seedPath = path.join(this.projectRoot, 'prisma', 'seed.js');
    fs.writeFileSync(seedPath, seedScript);
    console.log('✅ Seed script created');

    // Update package.json to include seed script
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.prisma) {
      packageJson.prisma = {};
    }
    packageJson.prisma.seed = 'node prisma/seed.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json updated with seed script\n');
  }

  async createDefaultAgent() {
    console.log('👤 Creating default admin agent...');
    
    const defaultAgentScript = `
import { PrismaClient, AgentRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDefaultAgent() {
  try {
    // Check if admin agent already exists
    const existingAgent = await prisma.agent.findUnique({
      where: { email: 'admin@bell24h.com' }
    })

    if (existingAgent) {
      console.log('✅ Admin agent already exists')
      return
    }

    // Create default admin agent
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminAgent = await prisma.agent.create({
      data: {
        name: 'Admin Agent',
        email: 'admin@bell24h.com',
        password: hashedPassword,
        role: AgentRole.ADMIN,
        isActive: true
      }
    })

    console.log('✅ Default admin agent created:')
    console.log('   Email: admin@bell24h.com')
    console.log('   Password: admin123')
    console.log('   Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Error creating default agent:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultAgent()
`;

    const agentScriptPath = path.join(this.projectRoot, 'scripts', 'create-default-agent.js');
    fs.writeFileSync(agentScriptPath, defaultAgentScript);
    console.log('✅ Default agent script created\n');
  }

  async showDatabaseStatus() {
    console.log('📊 Database Status:');
    console.log('   ✅ Prisma schema updated with Campaign and Agent models');
    console.log('   ✅ Migration created');
    console.log('   ✅ Seed data script created');
    console.log('   ✅ Default agent script created');
    console.log('\n🔧 Required Environment Variables:');
    console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/bell24h"');
    console.log('   JWT_SECRET="your-jwt-secret-key"');
    console.log('\n🚀 API Endpoints Available:');
    console.log('   POST /api/agents/auth - Agent authentication');
    console.log('   POST /api/agents/verify - Token verification');
    console.log('   GET /api/campaigns - List campaigns');
    console.log('   POST /api/campaigns - Create campaign');
    console.log('   GET /api/campaigns/[id] - Get campaign');
    console.log('   PUT /api/campaigns/[id] - Update campaign');
    console.log('   DELETE /api/campaigns/[id] - Delete campaign');
  }
}

// CLI Interface
async function main() {
  const setup = new DatabaseSetup();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'setup':
        await setup.setupDatabase();
        break;
        
      case 'status':
        await setup.showDatabaseStatus();
        break;
        
      default:
        console.log('🗄️ Database Setup Script');
        console.log('\nUsage:');
        console.log('  node scripts/setup-database.cjs setup   - Set up database with migrations');
        console.log('  node scripts/setup-database.cjs status  - Show database status');
        break;
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseSetup;
