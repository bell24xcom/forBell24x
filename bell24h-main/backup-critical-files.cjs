const fs = require('fs');
const path = require('path');

console.log('🚨 BELL24H CRITICAL FILES BACKUP - EXECUTING NOW 🚨');
console.log('This will backup all essential files before complete project destruction...\n');

// Create backup directory
const backupDir = path.join(__dirname, 'BELL24H_BACKUP_' + new Date().toISOString().replace(/[:.]/g, '-'));
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log(`📁 Backup directory created: ${backupDir}\n`);

// Critical directories to backup
const criticalDirs = [
    'client/src',
    'client/prisma',
    'client/public',
    'client/next.config.js',
    'client/package.json',
    'client/package-lock.json',
    'client/tsconfig.json',
    'client/vercel.json'
];

// Critical files to backup
const criticalFiles = [
    'BELL24H_CRITICAL_FIXES_COMPLETE.md',
    'BELL24H_MASTER_AUDIT_REPORT.md',
    'BELL24H_FINAL_STATUS_REPORT.md',
    'BELL24H_IMPLEMENTATION_COMPLETE.md',
    'BELL24H_COMPREHENSIVE_AUDIT_REPORT.md',
    'BELL24H_VIDEO_AUDIT_REPORT.md',
    'BELL24H_RFQ_NAVIGATION_AI_AUDIT_ASSESSMENT.md',
    'BELL24H_CATEGORIES_SUBCATEGORIES_RFQ_COMPREHENSIVE_REPORT.md',
    'BELL24H_100_PERCENT_COMPLETE.md',
    'BELL24H_2.0_IMPLEMENTATION_COMPLETE.md',
    'BELL24H_AUTOMATED_TESTING_SCRIPTS.js',
    'BELL24H_MANUAL_TESTING_CHECKLIST.md',
    'BELL24H_TESTING_GUIDE.md',
    'BELL24H_COMPLETE_TESTING_SCRIPT.md',
    'BELL24H_HOMEPAGE_TESTING_SCRIPT.md',
    'BELL24H_LIVE_TESTING_SCRIPT.md',
    'BELL24H_FINAL_COMPLETION_VERIFICATION.md',
    'BELL24H_FINAL_STATUS.md',
    'BELL24H_STATUS_REPORT.md',
    'BELL24H_IMPLEMENTATION_SUMMARY.md',
    'BELL24H_IMPLEMENTATION_ROADMAP.md',
    'BELL24H_COMPLETION_PLAN.md',
    'BELL24H_COMPLETE_IMPLEMENTATION_PLAN.md',
    'BELL24H_PHASE1_COMPLETION_REPORT.md',
    'BELL24H_PHASE1_SUCCESS_SUMMARY.md',
    'BELL24H_PHASED_DEPLOYMENT_STRATEGY.md',
    'BELL24H_RECONSTRUCTION_ROADMAP.md',
    'BELL24H_REALISTIC_STATUS_REPORT.md',
    'BELL24H_COMPLETION_REPORT.md',
    'BELL24H_100_PERCENT_COMPLETION_FINAL.md',
    'BELL24H_FINAL_COMPLETION_VERIFICATION.md',
    'BELL24H_FINAL_STATUS.md',
    'BELL24H_STATUS_REPORT.md',
    'BELL24H_IMPLEMENTATION_ROADMAP.md',
    'BELL24H_LIVE_TESTING_SCRIPT.md',
    'BELL24H_HOMEPAGE_TESTING_SCRIPT.md',
    'BELL24H_COMPLETE_TESTING_SCRIPT.md',
    'BRAND_CONSISTENCY_COMPLETE.md',
    'UI_IMPROVEMENTS_IMPLEMENTED.md',
    'ENTERPRISE_FEATURE_AUDIT_REPORT.md',
    'ENTERPRISE_THEME_ANALYSIS.md',
    'AUTHENTICATION_SYSTEM_SUMMARY.md',
    'UNIFIED_MARKETPLACE_DEPLOYMENT.md',
    'INDIAN_DEPLOYMENT_STRATEGY.md',
    'PRODUCTION_READINESS_AUDIT.md',
    'PRODUCTION_READINESS_REPORT.md',
    'COMPLIANCE.md',
    'SECURITY.md',
    'DEPLOYMENT.md',
    'LOCAL_DEVELOPMENT.md',
    'TESTING.md',
    'TESTING_STRATEGY.md',
    'TESTING_GUIDE.md',
    'ARCHITECTURE.md',
    'FEATURES.md',
    'README.md',
    'revenue-plan.md',
    'action-plan.md'
];

console.log('📋 Starting backup of critical files...\n');

// Backup critical files
let backedUpFiles = 0;
criticalFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            const destPath = path.join(backupDir, file);
            fs.copyFileSync(file, destPath);
            console.log(`✅ Backed up: ${file}`);
            backedUpFiles++;
        } else {
            console.log(`⚠️  File not found: ${file}`);
        }
    } catch (error) {
        console.log(`❌ Failed to backup ${file}: ${error.message}`);
    }
});

console.log(`\n📁 Starting backup of critical directories...\n`);

// Backup critical directories
let backedUpDirs = 0;
criticalDirs.forEach(dir => {
    try {
        if (fs.existsSync(dir)) {
            const destPath = path.join(backupDir, dir);
            
            if (fs.statSync(dir).isDirectory()) {
                // Copy directory recursively
                copyDirRecursive(dir, destPath);
                console.log(`✅ Backed up directory: ${dir}`);
            } else {
                // Copy single file
                fs.copyFileSync(dir, destPath);
                console.log(`✅ Backed up file: ${dir}`);
            }
            backedUpDirs++;
        } else {
            console.log(`⚠️  Directory/File not found: ${dir}`);
        }
    } catch (error) {
        console.log(`❌ Failed to backup ${dir}: ${error.message}`);
    }
});

// Helper function to copy directories recursively
function copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

console.log(`\n🎯 BACKUP COMPLETE!`);
console.log(`📊 Summary:`);
console.log(`   - Files backed up: ${backedUpFiles}`);
console.log(`   - Directories backed up: ${backedUpDirs}`);
console.log(`   - Backup location: ${backupDir}`);
console.log(`\n🚨 READY FOR COMPLETE PROJECT DESTRUCTION 🚨`);
console.log(`\nNext steps:`);
console.log(`1. Verify backup in: ${backupDir}`);
console.log(`2. Close all terminals and Cursor`);
console.log(`3. Delete entire bell24h directory`);
console.log(`4. Create fresh Next.js project`);
console.log(`5. Restore from backup`);

// Create a summary file
const summary = `BELL24H BACKUP SUMMARY
Generated: ${new Date().toISOString()}
Files backed up: ${backedUpFiles}
Directories backed up: ${backedUpDirs}
Backup location: ${backupDir}

CRITICAL FILES PRESERVED:
${criticalFiles.join('\n')}

CRITICAL DIRECTORIES PRESERVED:
${criticalDirs.join('\n')}

RESTORATION INSTRUCTIONS:
1. Create new Next.js project: npx create-next-app@latest bell24h-clean
2. Copy src/ directory from backup to new project
3. Copy prisma/ directory from backup to new project
4. Copy public/ directory from backup to new project
5. Copy configuration files from backup
6. Install dependencies: npm install
7. Test: npm run dev

This backup contains your complete Bell24h application code and configuration.
`;

fs.writeFileSync(path.join(backupDir, 'BACKUP_SUMMARY.md'), summary);
console.log(`\n📝 Backup summary created: ${path.join(backupDir, 'BACKUP_SUMMARY.md')}`);
