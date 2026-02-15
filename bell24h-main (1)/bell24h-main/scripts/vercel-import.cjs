#!/usr/bin/env node

/**
 * Vercel Import Script - Safely import 150 pages from Vercel
 * This script creates a complete backup and inventory before any changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelImporter {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'vercel-backup');
    this.exportDir = path.join(this.projectRoot, 'vercel-export');
    this.inventoryFile = path.join(this.projectRoot, 'pages-inventory.json');
  }

  async run() {
    console.log('🛡️  VERCEL IMPORT - SAFE MIGRATION STARTING');
    console.log('============================================\n');

    try {
      // Step 1: Create complete backup
      await this.createBackup();
      
      // Step 2: Create migration branch
      await this.createMigrationBranch();
      
      // Step 3: Export from Vercel
      await this.exportFromVercel();
      
      // Step 4: Create pages inventory
      await this.createPagesInventory();
      
      // Step 5: Show summary
      await this.showSummary();
      
      console.log('\n✅ VERCEL IMPORT COMPLETE - READY FOR SAFE MERGE');
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      console.log('\n🔄 ROLLBACK INITIATED...');
      await this.rollback();
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('📦 Step 1: Creating complete backup...');
    
    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    // Backup current state
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `pre-migration-${timestamp}`);
    
    // Copy critical directories
    const dirsToBackup = ['app', 'pages', 'components', 'styles', 'public'];
    
    dirsToBackup.forEach(dir => {
      const sourcePath = path.join(this.projectRoot, dir);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, dir);
        this.copyDirectory(sourcePath, destPath);
        console.log(`  ✅ Backed up: ${dir}`);
      }
    });
    
    // Backup critical files
    const filesToBackup = [
      'package.json',
      'next.config.js',
      'tailwind.config.js',
      'tsconfig.json',
      '.env.local',
      '.env.production'
    ];
    
    filesToBackup.forEach(file => {
      const sourcePath = path.join(this.projectRoot, file);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✅ Backed up: ${file}`);
      }
    });
    
    console.log(`✅ Backup created at: ${backupPath}`);
  }

  async createMigrationBranch() {
    console.log('\n🌿 Step 2: Creating migration branch...');
    
    try {
      // Check if we're on main branch
      const currentBranch = execSync('git branch --show-current').toString().trim();
      
      if (currentBranch === 'main') {
        // Create and switch to migration branch
        execSync('git checkout -b migration/vercel-to-railway');
        console.log('✅ Created migration branch: migration/vercel-to-railway');
      } else {
        console.log(`⚠️  Already on branch: ${currentBranch}`);
      }
    } catch (error) {
      console.log('⚠️  Git operations failed, continuing...');
    }
  }

  async exportFromVercel() {
    console.log('\n📤 Step 3: Exporting from Vercel...');
    
    // Create export directory
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
    
    try {
      // Check if vercel CLI is available
      execSync('vercel --version', { stdio: 'pipe' });
      
      // Pull from Vercel
      console.log('  📥 Pulling from Vercel...');
      execSync('vercel pull --yes', { 
        stdio: 'inherit',
        cwd: this.exportDir 
      });
      
      // Build and export
      console.log('  🔨 Building and exporting...');
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: this.exportDir 
      });
      
      execSync('npm run export', { 
        stdio: 'inherit',
        cwd: this.exportDir 
      });
      
      console.log('✅ Vercel export complete');
      
    } catch (error) {
      console.log('⚠️  Vercel CLI not available, creating manual export structure...');
      await this.createManualExport();
    }
  }

  async createManualExport() {
    console.log('  📁 Creating manual export structure...');
    
    // Create basic structure for manual import
    const manualStructure = {
      'app': 'Next.js 13+ app directory',
      'pages': 'Legacy pages directory',
      'components': 'React components',
      'styles': 'CSS and styling files',
      'public': 'Static assets'
    };
    
    Object.keys(manualStructure).forEach(dir => {
      const dirPath = path.join(this.exportDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Create import instructions
    const instructions = `
# Manual Vercel Import Instructions

## Steps to complete the import:

1. **Download your Vercel deployment:**
   - Go to your Vercel dashboard
   - Download the source code
   - Extract to: ${this.exportDir}

2. **Inventory your pages:**
   - Count all pages in app/ and pages/ directories
   - Document any custom components
   - Note any special configurations

3. **Run the safe merge:**
   \`\`\`bash
   node scripts/safe-merge.cjs
   \`\`\`

## Expected structure:
- app/ (Next.js 13+ pages)
- pages/ (Legacy pages)
- components/ (Reusable components)
- styles/ (CSS files)
- public/ (Static assets)
`;
    
    fs.writeFileSync(
      path.join(this.exportDir, 'IMPORT_INSTRUCTIONS.md'),
      instructions
    );
    
    console.log('✅ Manual export structure created');
  }

  async createPagesInventory() {
    console.log('\n📋 Step 4: Creating pages inventory...');
    
    const inventory = {
      timestamp: new Date().toISOString(),
      totalPages: 0,
      pages: [],
      components: [],
      styles: [],
      assets: []
    };
    
    // Scan current project
    await this.scanDirectory(this.projectRoot, inventory);
    
    // Save inventory
    fs.writeFileSync(this.inventoryFile, JSON.stringify(inventory, null, 2));
    
    console.log(`✅ Inventory created: ${inventory.totalPages} pages found`);
    console.log(`📄 Inventory saved to: ${this.inventoryFile}`);
  }

  async scanDirectory(dir, inventory) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!['node_modules', '.git', '.next', 'vercel-backup', 'vercel-export'].includes(item)) {
          await this.scanDirectory(itemPath, inventory);
        }
      } else {
        // Count pages
        if (item.endsWith('.tsx') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.js')) {
          if (item.includes('page.') || item.includes('index.')) {
            inventory.pages.push(itemPath);
            inventory.totalPages++;
          }
        }
        
        // Count components
        if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
          if (item.includes('component') || item.includes('Component')) {
            inventory.components.push(itemPath);
          }
        }
        
        // Count styles
        if (item.endsWith('.css') || item.endsWith('.scss') || item.endsWith('.sass')) {
          inventory.styles.push(itemPath);
        }
      }
    }
  }

  async showSummary() {
    console.log('\n📊 IMPORT SUMMARY');
    console.log('==================');
    
    // Read inventory
    if (fs.existsSync(this.inventoryFile)) {
      const inventory = JSON.parse(fs.readFileSync(this.inventoryFile, 'utf-8'));
      
      console.log(`📄 Total Pages Found: ${inventory.totalPages}`);
      console.log(`🧩 Components: ${inventory.components.length}`);
      console.log(`🎨 Style Files: ${inventory.styles.length}`);
      console.log(`📁 Export Directory: ${this.exportDir}`);
      console.log(`💾 Backup Directory: ${this.backupDir}`);
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Review the export in: vercel-export/');
    console.log('2. Run safe merge: node scripts/safe-merge.cjs');
    console.log('3. Test all pages: npm run test:migration');
    console.log('4. Deploy to staging: railway up --environment staging');
  }

  async rollback() {
    console.log('🔄 Rolling back changes...');
    
    try {
      // Switch back to main branch
      execSync('git checkout main');
      
      // Remove migration branch
      execSync('git branch -D migration/vercel-to-railway');
      
      console.log('✅ Rollback complete - back to main branch');
    } catch (error) {
      console.log('⚠️  Rollback completed with warnings');
    }
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

// Run the importer
const importer = new VercelImporter();
importer.run().catch(console.error);
