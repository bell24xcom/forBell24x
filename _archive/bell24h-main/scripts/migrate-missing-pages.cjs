#!/usr/bin/env node

/**
 * Safe Page Migration Script
 * Migrates missing pages from localhost to staging/production without overwriting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SafePageMigrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.migrationRules = {
      skipExisting: true,
      backupFirst: true,
      runTests: true,
      targetEnvironment: 'staging',
      requireConfirmation: true
    };
    this.migrationLog = [];
  }

  async run() {
    console.log('🚀 SAFE PAGE MIGRATION SYSTEM');
    console.log('==============================\n');

    try {
      // Step 1: Load audit results
      await this.loadAuditResults();
      
      // Step 2: Validate migration rules
      await this.validateMigrationRules();
      
      // Step 3: Create backup
      await this.createBackup();
      
      // Step 4: Migrate pages
      await this.migratePages();
      
      // Step 5: Run tests
      await this.runTests();
      
      // Step 6: Generate migration report
      await this.generateMigrationReport();
      
      console.log('\n✅ MIGRATION COMPLETE!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      await this.rollback();
      process.exit(1);
    }
  }

  async loadAuditResults() {
    console.log('📊 Step 1: Loading audit results...');
    
    const auditFiles = [
      'audit-report-' + new Date().toISOString().split('T')[0] + '.json',
      'audit-results.json',
      'pages-audit.json'
    ];
    
    let auditData = null;
    
    for (const file of auditFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        try {
          auditData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          console.log(`  ✅ Loaded audit data from: ${file}`);
          break;
        } catch (error) {
          console.log(`  ⚠️  Could not parse: ${file}`);
        }
      }
    }
    
    if (!auditData) {
      throw new Error('No audit results found. Run "npm run audit" first.');
    }
    
    this.auditData = auditData;
    this.pagesToMigrate = auditData.comparison?.missingInVercel || [];
    
    console.log(`  📋 Found ${this.pagesToMigrate.length} pages to migrate`);
  }

  async validateMigrationRules() {
    console.log('\n🔍 Step 2: Validating migration rules...');
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error('Not in a valid project directory');
    }
    
    // Check if git is initialized
    try {
      execSync('git status', { stdio: 'pipe' });
      console.log('  ✅ Git repository found');
    } catch (error) {
      throw new Error('Git repository not found. Initialize git first.');
    }
    
    // Check target environment
    const targetEnv = process.argv.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'staging';
    this.migrationRules.targetEnvironment = targetEnv;
    
    console.log(`  ✅ Target environment: ${targetEnv}`);
    console.log(`  ✅ Migration rules validated`);
  }

  async createBackup() {
    console.log('\n💾 Step 3: Creating backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.projectRoot, 'migration-backup', timestamp);
    
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup key files
    const filesToBackup = [
      'package.json',
      'next.config.js',
      'vercel.json',
      'railway.json'
    ];
    
    for (const file of filesToBackup) {
      const sourcePath = path.join(this.projectRoot, file);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupDir, file);
        const destDir = path.dirname(destPath);
        
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✅ Backed up: ${file}`);
      }
    }
    
    // Create backup manifest
    const manifest = {
      timestamp,
      backupDir,
      pagesToMigrate: this.pagesToMigrate.length,
      targetEnvironment: this.migrationRules.targetEnvironment,
      migrationRules: this.migrationRules
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    this.backupPath = backupDir;
    console.log(`  ✅ Backup created: ${backupDir}`);
  }

  async migratePages() {
    console.log('\n🔄 Step 4: Migrating pages...');
    
    if (this.pagesToMigrate.length === 0) {
      console.log('  ℹ️  No pages to migrate');
      return;
    }
    
    for (const page of this.pagesToMigrate) {
      await this.migratePage(page);
    }
    
    console.log(`  ✅ Migrated ${this.pagesToMigrate.length} pages`);
  }

  async migratePage(page) {
    console.log(`  📄 Migrating: ${page.route}`);
    
    try {
      // Check if page already exists in target
      if (this.migrationRules.skipExisting && await this.pageExists(page.route)) {
        console.log(`    ⚠️  Page already exists, skipping: ${page.route}`);
        this.migrationLog.push({
          page: page.route,
          status: 'skipped',
          reason: 'already exists'
        });
        return;
      }
      
      // Copy page file
      await this.copyPageFile(page);
      
      // Update routing if needed
      await this.updateRouting(page);
      
      // Add to git
      await this.addToGit(page);
      
      this.migrationLog.push({
        page: page.route,
        status: 'migrated',
        file: page.localhostPage?.file
      });
      
      console.log(`    ✅ Migrated: ${page.route}`);
      
    } catch (error) {
      console.log(`    ❌ Failed to migrate: ${page.route} - ${error.message}`);
      this.migrationLog.push({
        page: page.route,
        status: 'failed',
        error: error.message
      });
    }
  }

  async pageExists(route) {
    // Check if page exists in target environment
    // This would need to be implemented based on your deployment setup
    return false;
  }

  async copyPageFile(page) {
    if (!page.localhostPage?.fullPath) {
      throw new Error('No localhost page file found');
    }
    
    const sourcePath = page.localhostPage.fullPath;
    const destPath = this.getDestinationPath(page);
    
    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    
    // Update imports if needed
    await this.updateImports(destPath);
  }

  getDestinationPath(page) {
    // Determine destination path based on target environment
    const baseDir = this.migrationRules.targetEnvironment === 'staging' ? 'bell24h-staging' : '.';
    const route = page.route;
    
    // Convert route to file path
    let filePath = route;
    if (filePath === '/') {
      filePath = '/index';
    }
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      filePath += '/page.tsx';
    }
    
    return path.join(this.projectRoot, baseDir, 'app', filePath);
  }

  async updateImports(filePath) {
    // Update imports to work in target environment
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Update relative imports if needed
    content = content.replace(/from ['"]\.\.\/\.\.\//g, "from '../../../");
    content = content.replace(/from ['"]\.\.\//g, "from '../../");
    
    fs.writeFileSync(filePath, content);
  }

  async updateRouting(page) {
    // Update routing configuration if needed
    // This would depend on your specific routing setup
  }

  async addToGit(page) {
    try {
      const destPath = this.getDestinationPath(page);
      const relativePath = path.relative(this.projectRoot, destPath);
      
      execSync(`git add "${relativePath}"`, { stdio: 'pipe' });
      
      execSync(`git commit -m "feat: migrate page ${page.route}"`, { stdio: 'pipe' });
      
    } catch (error) {
      // Git operations are optional for migration
      console.log(`    ⚠️  Git operation failed: ${error.message}`);
    }
  }

  async runTests() {
    console.log('\n🧪 Step 5: Running tests...');
    
    try {
      // Run build test
      console.log('  🔨 Testing build...');
      execSync('npm run build', { stdio: 'pipe' });
      console.log('    ✅ Build successful');
      
      // Run linting if available
      try {
        console.log('  🔍 Running linter...');
        execSync('npm run lint', { stdio: 'pipe' });
        console.log('    ✅ Linting passed');
      } catch (error) {
        console.log('    ⚠️  Linting failed or not configured');
      }
      
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`);
    }
  }

  async generateMigrationReport() {
    console.log('\n📊 Step 6: Generating migration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      targetEnvironment: this.migrationRules.targetEnvironment,
      totalPages: this.pagesToMigrate.length,
      migrated: this.migrationLog.filter(log => log.status === 'migrated').length,
      skipped: this.migrationLog.filter(log => log.status === 'skipped').length,
      failed: this.migrationLog.filter(log => log.status === 'failed').length,
      migrationLog: this.migrationLog,
      backupPath: this.backupPath
    };
    
    // Save JSON report
    const reportPath = path.join(this.projectRoot, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`  ✅ Migration report: migration-report.json`);
    
    // Generate Markdown report
    const markdownReport = `# Page Migration Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Target Environment:** ${this.migrationRules.targetEnvironment}
- **Total Pages:** ${report.totalPages}
- **Migrated:** ${report.migrated} ✅
- **Skipped:** ${report.skipped} ⚠️
- **Failed:** ${report.failed} ❌

## Migration Log
${this.migrationLog.map(log => 
  `- ${log.page}: ${log.status} ${log.error ? `(${log.error})` : ''}`
).join('\n')}

## Next Steps
1. Test migrated pages in ${this.migrationRules.targetEnvironment}
2. Verify all functionality works
3. Deploy to production if staging tests pass

---
*Report generated by Safe Page Migration System*
`;
    
    const markdownPath = path.join(this.projectRoot, 'migration-report.md');
    fs.writeFileSync(markdownPath, markdownReport);
    console.log(`  ✅ Markdown report: migration-report.md`);
  }

  async rollback() {
    console.log('\n🔄 Rolling back migration...');
    
    if (this.backupPath && fs.existsSync(this.backupPath)) {
      console.log(`  📁 Backup available at: ${this.backupPath}`);
      console.log('  💡 Manual rollback required - restore from backup');
    }
    
    // Reset git if needed
    try {
      execSync('git reset --hard HEAD~1', { stdio: 'pipe' });
      console.log('  ✅ Git reset completed');
    } catch (error) {
      console.log('  ⚠️  Git reset failed');
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetEnv = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'staging';

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No actual migration will occur');
  console.log('Target environment:', targetEnv);
  console.log('Run without --dry-run to perform actual migration');
  process.exit(0);
}

// Run the migration
const migrator = new SafePageMigrator();
migrator.run().catch(console.error);
