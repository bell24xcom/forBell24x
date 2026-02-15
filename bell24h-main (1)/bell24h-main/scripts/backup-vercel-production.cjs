#!/usr/bin/env node

/**
 * Vercel Production Backup Script
 * Creates a complete backup of the live Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelBackup {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, 'vercel-production-backup');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async run() {
    console.log('🛡️  VERCEL PRODUCTION BACKUP');
    console.log('============================\n');

    try {
      // Step 1: Create backup directory
      await this.createBackupDirectory();
      
      // Step 2: Pull from Vercel
      await this.pullFromVercel();
      
      // Step 3: Create archive
      await this.createArchive();
      
      // Step 4: Verify backup
      await this.verifyBackup();
      
      console.log('\n✅ VERCEL PRODUCTION BACKUP COMPLETE');
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      process.exit(1);
    }
  }

  async createBackupDirectory() {
    console.log('📁 Step 1: Creating backup directory...');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    const timestampedDir = path.join(this.backupDir, this.timestamp);
    fs.mkdirSync(timestampedDir, { recursive: true });
    
    console.log(`✅ Backup directory created: ${timestampedDir}`);
    this.backupPath = timestampedDir;
  }

  async pullFromVercel() {
    console.log('\n📥 Step 2: Pulling from Vercel...');
    
    try {
      // Check if vercel CLI is available
      execSync('vercel --version', { stdio: 'pipe' });
      
      // Pull from Vercel
      execSync('vercel pull --yes', { 
        stdio: 'inherit',
        cwd: this.backupPath 
      });
      
      console.log('✅ Vercel pull complete');
      
    } catch (error) {
      console.log('⚠️  Vercel CLI not available, creating manual backup structure...');
      await this.createManualBackup();
    }
  }

  async createManualBackup() {
    console.log('📋 Creating manual backup instructions...');
    
    const instructions = `
# Manual Vercel Backup Instructions

## Current Production Site:
- URL: bell24h-v1.vercel.app
- Status: LIVE and working
- Pages: 150+ pages
- Theme: Blue/purple gradient

## To create backup:

1. **Download from Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Find your bell24h project
   - Click "Download" to get source code
   - Extract to: ${this.backupPath}

2. **Or use Vercel CLI:**
   \`\`\`bash
   cd ${this.backupPath}
   vercel pull --yes
   \`\`\`

3. **Verify backup:**
   - Check that all 150 pages are present
   - Verify UI theme is intact
   - Confirm navigation works
   - Test search functionality

## Backup Contents Should Include:
- app/ directory (all pages)
- components/ directory
- styles/ directory
- public/ directory
- package.json
- next.config.js
- vercel.json
- All configuration files

## Next Steps:
1. Verify backup is complete
2. Create staging environment
3. Add new features to staging only
4. Keep production unchanged
`;
    
    fs.writeFileSync(
      path.join(this.backupPath, 'BACKUP_INSTRUCTIONS.md'),
      instructions
    );
    
    console.log('✅ Manual backup instructions created');
  }

  async createArchive() {
    console.log('\n📦 Step 3: Creating archive...');
    
    try {
      const archiveName = `bell24h-vercel-backup-${this.timestamp}.zip`;
      const archivePath = path.join(this.backupDir, archiveName);
      
      // Create zip archive
      execSync(`zip -r "${archivePath}" .`, {
        stdio: 'inherit',
        cwd: this.backupPath
      });
      
      console.log(`✅ Archive created: ${archiveName}`);
      this.archivePath = archivePath;
      
    } catch (error) {
      console.log('⚠️  Zip command not available, backup stored as directory');
    }
  }

  async verifyBackup() {
    console.log('\n🔍 Step 4: Verifying backup...');
    
    // Check for key files
    const keyFiles = [
      'package.json',
      'next.config.js',
      'vercel.json'
    ];
    
    const keyDirs = [
      'app',
      'components',
      'styles',
      'public'
    ];
    
    let backupValid = true;
    
    // Check files
    for (const file of keyFiles) {
      const filePath = path.join(this.backupPath, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ Found: ${file}`);
      } else {
        console.log(`  ❌ Missing: ${file}`);
        backupValid = false;
      }
    }
    
    // Check directories
    for (const dir of keyDirs) {
      const dirPath = path.join(this.backupPath, dir);
      if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
          console.log(`  ✅ Found: ${dir}/`);
        } else {
          console.log(`  ❌ ${dir} is not a directory`);
          backupValid = false;
        }
      } else {
        console.log(`  ❌ Missing: ${dir}/`);
        backupValid = false;
      }
    }
    
    if (backupValid) {
      console.log('\n✅ Backup verification passed');
    } else {
      console.log('\n⚠️  Backup verification failed - some files missing');
    }
    
    // Create backup manifest
    const manifest = {
      timestamp: this.timestamp,
      backupPath: this.backupPath,
      archivePath: this.archivePath || null,
      verified: backupValid,
      productionUrl: 'bell24h-v1.vercel.app',
      status: 'LIVE - DO NOT MODIFY'
    };
    
    fs.writeFileSync(
      path.join(this.backupDir, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('📋 Backup manifest created');
  }
}

// Run the backup
const backup = new VercelBackup();
backup.run().catch(console.error);
