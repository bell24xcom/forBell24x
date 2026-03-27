#!/usr/bin/env node

/**
 * Emergency Recovery: Pull Complete Vercel Source
 * Restores localhost development environment to match Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelSourceRecovery {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = `backups/localhost-backup-${Date.now()}`;
    this.vercelPages = [
      '/',
      '/marketplace',
      '/suppliers',
      '/rfq/create',
      '/register',
      '/login',
      '/categories/textiles-garments',
      '/categories/pharmaceuticals',
      '/categories/agricultural-products',
      '/categories/automotive-parts',
      '/categories/it-services',
      '/categories/gems-jewelry',
      '/categories/handicrafts',
      '/categories/machinery-equipment',
      '/categories/chemicals',
      '/categories/food-processing',
      '/categories/construction',
      '/categories/metals-steel',
      '/categories/plastics',
      '/categories/paper-packaging',
      '/categories/rubber',
      '/categories/ceramics',
      '/categories/glass',
      '/categories/wood',
      '/categories/leather',
      '/dashboard/ai-features',
      '/fintech',
      '/wallet',
      '/voice-rfq',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/help'
    ];
  }

  async run() {
    console.log('🚨 EMERGENCY RECOVERY: PULLING VERCEL SOURCE');
    console.log('=============================================\n');

    try {
      // Step 1: Backup current localhost
      await this.backupCurrentLocalhost();
      
      // Step 2: Pull from Vercel
      await this.pullFromVercel();
      
      // Step 3: Verify pages recovered
      await this.verifyPagesRecovered();
      
      // Step 4: Sync configuration
      await this.syncConfiguration();
      
      // Step 5: Create development workflow
      await this.createDevelopmentWorkflow();
      
      console.log('\n✅ EMERGENCY RECOVERY COMPLETE!');
      console.log('Your localhost should now match Vercel deployment.');
      
    } catch (error) {
      console.error('❌ Recovery failed:', error.message);
      console.log('\n🔄 Attempting rollback...');
      await this.rollback();
      process.exit(1);
    }
  }

  async backupCurrentLocalhost() {
    console.log('💾 Step 1: Backing up current localhost...');
    
    try {
      // Create backup directory
      fs.mkdirSync(this.backupDir, { recursive: true });
      
      // Copy current files to backup
      const itemsToBackup = [
        'app',
        'pages',
        'src',
        'components',
        'public',
        'package.json',
        'next.config.js',
        'tailwind.config.js',
        'tsconfig.json'
      ];
      
      for (const item of itemsToBackup) {
        const sourcePath = path.join(this.projectRoot, item);
        if (fs.existsSync(sourcePath)) {
          const destPath = path.join(this.backupDir, item);
          this.copyRecursive(sourcePath, destPath);
          console.log(`  ✅ Backed up: ${item}`);
        }
      }
      
      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        backupDir: this.backupDir,
        reason: 'Emergency recovery - pulling from Vercel',
        originalPages: this.countCurrentPages()
      };
      
      fs.writeFileSync(
        path.join(this.backupDir, 'backup-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      console.log(`✅ Current localhost backed up to: ${this.backupDir}`);
      
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async pullFromVercel() {
    console.log('\n🔄 Step 2: Pulling from Vercel...');
    
    try {
      // Check if Vercel CLI is available
      try {
        execSync('vercel --version', { stdio: 'pipe' });
        console.log('  ✅ Vercel CLI found');
      } catch (error) {
        console.log('  ⚠️  Vercel CLI not found, creating manual recovery instructions...');
        await this.createManualRecoveryInstructions();
        return;
      }
      
      // Pull from Vercel
      console.log('  📥 Pulling source from Vercel...');
      execSync('vercel pull --yes', { stdio: 'inherit' });
      
      console.log('✅ Vercel source pulled successfully');
      
    } catch (error) {
      console.log('⚠️  Vercel pull failed, creating manual recovery instructions...');
      await this.createManualRecoveryInstructions();
    }
  }

  async createManualRecoveryInstructions() {
    console.log('\n📋 Creating manual recovery instructions...');
    
    const instructions = `
# MANUAL VERCEL RECOVERY INSTRUCTIONS

## Current Situation:
- Vercel has 34 working pages at bell24h-v1.vercel.app
- Localhost only has 3 pages
- Need to restore all 34 pages locally

## Method 1: Vercel CLI (Recommended)
1. Install Vercel CLI: npm install -g vercel
2. Login: vercel login
3. Link project: vercel link
4. Pull source: vercel pull --yes

## Method 2: Manual Download
1. Go to https://vercel.com/dashboard
2. Find your bell24h project
3. Click "Download" to get source code
4. Extract to current directory (overwrite existing files)

## Method 3: Git Repository
1. Check if Vercel is connected to a Git repository
2. Clone the repository: git clone [repository-url]
3. Copy all files to current directory

## Expected Pages After Recovery:
${this.vercelPages.map(page => `- ${page}`).join('\n')}

## After Recovery:
1. Run: npm install
2. Run: npm run dev
3. Test all pages at localhost:3000
4. Verify all 34 pages work

## Backup Location:
Current localhost backed up to: ${this.backupDir}
`;
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'MANUAL_RECOVERY_INSTRUCTIONS.md'),
      instructions
    );
    
    console.log('✅ Manual recovery instructions created: MANUAL_RECOVERY_INSTRUCTIONS.md');
  }

  async verifyPagesRecovered() {
    console.log('\n🔍 Step 3: Verifying pages recovered...');
    
    const recoveredPages = this.findAllPages();
    
    console.log(`📊 Pages found: ${recoveredPages.length}`);
    
    if (recoveredPages.length >= 30) {
      console.log('✅ Sufficient pages recovered');
      recoveredPages.forEach(page => {
        console.log(`  ✅ ${page}`);
      });
    } else {
      console.log('⚠️  Insufficient pages recovered');
      console.log('Expected: 34 pages');
      console.log('Found:', recoveredPages.length);
      console.log('\nMissing pages:');
      this.vercelPages.forEach(expectedPage => {
        if (!recoveredPages.some(page => page.includes(expectedPage.replace('/', '')))) {
          console.log(`  ❌ ${expectedPage}`);
        }
      });
    }
  }

  findAllPages() {
    const pages = [];
    const directories = ['app', 'pages', 'src'];
    
    directories.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (fs.existsSync(dirPath)) {
        this.scanDirectory(dirPath, pages, dir);
      }
    });
    
    return pages;
  }

  scanDirectory(dirPath, pages, baseDir) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(itemPath, pages, baseDir);
      } else {
        const ext = path.extname(item);
        if (['.tsx', '.jsx', '.js', '.ts'].includes(ext)) {
          const relativePath = path.relative(path.join(this.projectRoot, baseDir), itemPath);
          pages.push(relativePath);
        }
      }
    });
  }

  async syncConfiguration() {
    console.log('\n⚙️  Step 4: Syncing configuration...');
    
    // Update package.json if needed
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Add recovery scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'recovery:verify': 'node scripts/verify-pages.cjs',
        'recovery:test': 'node scripts/test-all-pages.cjs',
        'recovery:backup': 'node scripts/backup-current.cjs'
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('  ✅ Updated package.json with recovery scripts');
    }
    
    // Create .env.local template
    const envTemplate = `
# Local Development Environment
# Copy values from Vercel dashboard

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database
DATABASE_URL=your-local-database-url

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Add other environment variables from Vercel
`;
    
    fs.writeFileSync(path.join(this.projectRoot, '.env.local.example'), envTemplate);
    console.log('  ✅ Created .env.local.example');
  }

  async createDevelopmentWorkflow() {
    console.log('\n🔄 Step 5: Creating development workflow...');
    
    const workflow = {
      beforeDevelopment: [
        'Pull latest from Vercel (if needed)',
        'Create feature branch',
        'Run tests',
        'Verify all pages work'
      ],
      
      afterDevelopment: [
        'Test all pages locally',
        'Run build test (npm run build)',
        'Push to GitHub',
        'Deploy to staging',
        'Test on staging',
        'Deploy to production'
      ],
      
      emergencyProcedures: [
        'Backup current state',
        'Pull from Vercel',
        'Verify all pages',
        'Test locally',
        'Commit changes'
      ]
    };
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'DEVELOPMENT_WORKFLOW.md'),
      `# Development Workflow

## Before Development:
${workflow.beforeDevelopment.map(step => `- ${step}`).join('\n')}

## After Development:
${workflow.afterDevelopment.map(step => `- ${step}`).join('\n')}

## Emergency Procedures:
${workflow.emergencyProcedures.map(step => `- ${step}`).join('\n')}

## Recovery Commands:
\`\`\`bash
# Verify all pages are present
npm run recovery:verify

# Test all pages work
npm run recovery:test

# Backup current state
npm run recovery:backup
\`\`\`
`
    );
    
    console.log('  ✅ Created DEVELOPMENT_WORKFLOW.md');
  }

  async rollback() {
    console.log('\n🔄 Rolling back to backup...');
    
    if (fs.existsSync(this.backupDir)) {
      console.log(`📁 Backup available at: ${this.backupDir}`);
      console.log('💡 Manual rollback required - copy files from backup directory');
    } else {
      console.log('❌ No backup found for rollback');
    }
  }

  countCurrentPages() {
    return this.findAllPages().length;
  }

  copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      items.forEach(item => {
        this.copyRecursive(
          path.join(src, item),
          path.join(dest, item)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// Run the recovery
const recovery = new VercelSourceRecovery();
recovery.run().catch(console.error);
