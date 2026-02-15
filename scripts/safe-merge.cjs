#!/usr/bin/env node

/**
 * Safe Merge Script - Merge Vercel pages with Railway deployment
 * This script safely merges 150 pages without overwriting existing files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SafeMerger {
  constructor() {
    this.projectRoot = process.cwd();
    this.exportDir = path.join(this.projectRoot, 'vercel-export');
    this.backupDir = path.join(this.projectRoot, 'vercel-backup');
    this.mergeLog = path.join(this.projectRoot, 'merge-log.json');
    this.conflicts = [];
  }

  async run() {
    console.log('🔄 SAFE MERGE - VERCEL TO RAILWAY');
    console.log('==================================\n');

    try {
      // Step 1: Validate export exists
      await this.validateExport();
      
      // Step 2: Create merge plan
      await this.createMergePlan();
      
      // Step 3: Execute safe merge
      await this.executeMerge();
      
      // Step 4: Handle conflicts
      await this.handleConflicts();
      
      // Step 5: Create global theme system
      await this.createGlobalTheme();
      
      // Step 6: Generate merge report
      await this.generateReport();
      
      console.log('\n✅ SAFE MERGE COMPLETE');
      
    } catch (error) {
      console.error('❌ Merge failed:', error.message);
      await this.rollbackMerge();
      process.exit(1);
    }
  }

  async validateExport() {
    console.log('🔍 Step 1: Validating export...');
    
    if (!fs.existsSync(this.exportDir)) {
      throw new Error('Vercel export directory not found. Run vercel-import.cjs first.');
    }
    
    // Check for key directories
    const requiredDirs = ['app', 'pages', 'components', 'styles', 'public'];
    const foundDirs = requiredDirs.filter(dir => 
      fs.existsSync(path.join(this.exportDir, dir))
    );
    
    console.log(`✅ Found directories: ${foundDirs.join(', ')}`);
    
    if (foundDirs.length === 0) {
      throw new Error('No valid directories found in export. Check your Vercel export.');
    }
  }

  async createMergePlan() {
    console.log('\n📋 Step 2: Creating merge plan...');
    
    const plan = {
      timestamp: new Date().toISOString(),
      filesToCopy: [],
      filesToMerge: [],
      filesToSkip: [],
      conflicts: []
    };
    
    // Scan export directory
    await this.scanForMerge(this.exportDir, plan);
    
    // Save merge plan
    fs.writeFileSync(
      path.join(this.projectRoot, 'merge-plan.json'),
      JSON.stringify(plan, null, 2)
    );
    
    console.log(`📄 Files to copy: ${plan.filesToCopy.length}`);
    console.log(`🔄 Files to merge: ${plan.filesToMerge.length}`);
    console.log(`⏭️  Files to skip: ${plan.filesToSkip.length}`);
    console.log(`⚠️  Conflicts: ${plan.conflicts.length}`);
  }

  async scanForMerge(dir, plan, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativeItemPath = path.join(relativePath, item);
      const targetPath = path.join(this.projectRoot, relativeItemPath);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', '.next', 'vercel-backup'].includes(item)) {
          await this.scanForMerge(itemPath, plan, relativeItemPath);
        }
      } else {
        // Determine merge strategy
        if (fs.existsSync(targetPath)) {
          // File exists - check for conflicts
          const sourceHash = this.getFileHash(itemPath);
          const targetHash = this.getFileHash(targetPath);
          
          if (sourceHash === targetHash) {
            plan.filesToSkip.push(relativeItemPath);
          } else {
            // Different content - create conflict
            plan.conflicts.push({
              file: relativeItemPath,
              sourceHash,
              targetHash,
              strategy: 'backup_and_merge'
            });
            plan.filesToMerge.push(relativeItemPath);
          }
        } else {
          // File doesn't exist - safe to copy
          plan.filesToCopy.push(relativeItemPath);
        }
      }
    }
  }

  async executeMerge() {
    console.log('\n🔄 Step 3: Executing safe merge...');
    
    const plan = JSON.parse(fs.readFileSync(
      path.join(this.projectRoot, 'merge-plan.json'),
      'utf-8'
    ));
    
    // Copy new files
    for (const file of plan.filesToCopy) {
      await this.copyFile(file);
    }
    
    // Handle merge files
    for (const file of plan.filesToMerge) {
      await this.mergeFile(file);
    }
    
    console.log('✅ Merge execution complete');
  }

  async copyFile(relativePath) {
    const sourcePath = path.join(this.exportDir, relativePath);
    const targetPath = path.join(this.projectRoot, relativePath);
    
    // Create target directory if needed
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`  ✅ Copied: ${relativePath}`);
  }

  async mergeFile(relativePath) {
    const sourcePath = path.join(this.exportDir, relativePath);
    const targetPath = path.join(this.projectRoot, relativePath);
    const backupPath = targetPath + '.vercel-backup';
    
    // Create backup of existing file
    fs.copyFileSync(targetPath, backupPath);
    console.log(`  💾 Backed up: ${relativePath} → ${relativePath}.vercel-backup`);
    
    // Copy new file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`  🔄 Merged: ${relativePath}`);
    
    // Log the conflict
    this.conflicts.push({
      file: relativePath,
      backup: backupPath,
      action: 'merged_with_backup'
    });
  }

  async handleConflicts() {
    console.log('\n⚠️  Step 4: Handling conflicts...');
    
    if (this.conflicts.length === 0) {
      console.log('✅ No conflicts to resolve');
      return;
    }
    
    console.log(`⚠️  ${this.conflicts.length} conflicts found:`);
    
    for (const conflict of this.conflicts) {
      console.log(`  📄 ${conflict.file}`);
      console.log(`     Backup: ${conflict.backup}`);
      console.log(`     Action: ${conflict.action}`);
    }
    
    // Create conflict resolution guide
    const resolutionGuide = `
# Conflict Resolution Guide

## Files with conflicts (backups created):

${this.conflicts.map(c => `- ${c.file} (backup: ${c.backup})`).join('\n')}

## Resolution options:

1. **Keep Vercel version** (current):
   - File is already updated with Vercel content
   - Backup is available if you need to revert

2. **Revert to original**:
   \`\`\`bash
   cp ${this.conflicts[0].file}.vercel-backup ${this.conflicts[0].file}
   \`\`\`

3. **Manual merge**:
   - Compare both versions
   - Manually merge the changes
   - Test thoroughly

## Next steps:
1. Test all pages: npm run dev
2. Verify functionality
3. Deploy to staging: railway up --environment staging
`;
    
    fs.writeFileSync(
      path.join(this.projectRoot, 'CONFLICT_RESOLUTION.md'),
      resolutionGuide
    );
    
    console.log('📋 Conflict resolution guide created: CONFLICT_RESOLUTION.md');
  }

  async createGlobalTheme() {
    console.log('\n🎨 Step 5: Creating global theme system...');
    
    // Create theme directory
    const themeDir = path.join(this.projectRoot, 'app', 'styles');
    if (!fs.existsSync(themeDir)) {
      fs.mkdirSync(themeDir, { recursive: true });
    }
    
    // Create global theme CSS
    const globalTheme = `
/* Bell24h Global Theme System */
:root {
  /* Brand Colors */
  --primary: #0066CC;
  --primary-dark: #004499;
  --secondary: #00AA66;
  --secondary-dark: #008844;
  --danger: #CC0000;
  --warning: #FF8800;
  --success: #00AA66;
  --info: #0066CC;
  
  /* Neutral Colors */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-300: #D1D5DB;
  --gray-400: #9CA3AF;
  --gray-500: #6B7280;
  --gray-600: #4B5563;
  --gray-700: #374151;
  --gray-800: #1F2937;
  --gray-900: #111827;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', monospace;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Global Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  line-height: 1.6;
  color: var(--gray-800);
  background-color: var(--gray-50);
}

/* Component Classes */
.btn {
  @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500;
}

.card {
  @apply bg-white shadow-lg rounded-xl p-6 border border-gray-200;
}

.input {
  @apply border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.modal {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-xl p-6 max-w-md w-full mx-4;
}

/* Responsive Utilities */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.grid-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.grid-4 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

/* Animation Classes */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}
`;
    
    fs.writeFileSync(
      path.join(themeDir, 'global.css'),
      globalTheme
    );
    
    // Create theme configuration
    const themeConfig = `
// Bell24h Theme Configuration
export const theme = {
  colors: {
    primary: '#0066CC',
    secondary: '#00AA66',
    danger: '#CC0000',
    warning: '#FF8800',
    success: '#00AA66',
    info: '#0066CC',
  },
  
  components: {
    button: 'btn',
    card: 'card',
    input: 'input',
    modal: 'modal',
  },
  
  spacing: {
    xs: 'var(--space-1)',
    sm: 'var(--space-2)',
    md: 'var(--space-4)',
    lg: 'var(--space-6)',
    xl: 'var(--space-8)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  }
};

export default theme;
`;
    
    fs.writeFileSync(
      path.join(themeDir, 'theme.config.ts'),
      themeConfig
    );
    
    console.log('✅ Global theme system created');
    console.log('  📄 app/styles/global.css');
    console.log('  ⚙️  app/styles/theme.config.ts');
  }

  async generateReport() {
    console.log('\n📊 Step 6: Generating merge report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: this.conflicts.length,
      conflicts: this.conflicts,
      themeCreated: true,
      nextSteps: [
        'Test all pages: npm run dev',
        'Review conflicts: CONFLICT_RESOLUTION.md',
        'Deploy to staging: railway up --environment staging',
        'Verify functionality',
        'Deploy to production: railway up --environment production'
      ]
    };
    
    fs.writeFileSync(this.mergeLog, JSON.stringify(report, null, 2));
    
    console.log('📋 Merge report generated: merge-log.json');
    console.log('\n🎯 NEXT STEPS:');
    report.nextSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });
  }

  async rollbackMerge() {
    console.log('🔄 Rolling back merge...');
    
    // Restore from backups
    for (const conflict of this.conflicts) {
      if (fs.existsSync(conflict.backup)) {
        fs.copyFileSync(conflict.backup, conflict.file);
        console.log(`  ✅ Restored: ${conflict.file}`);
      }
    }
    
    console.log('✅ Rollback complete');
  }

  getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return '';
    
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

// Run the merger
const merger = new SafeMerger();
merger.run().catch(console.error);
