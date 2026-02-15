const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create complete backup of current Vercel admin pages
async function backupVercelAdmin() {
  console.log('💾 Creating Vercel Admin Backup...');

  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = `backups/vercel-admin-${timestamp}`;

  // Create backup directory
  if (!fs.existsSync('backups')) {
    fs.mkdirSync('backups');
  }
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`📁 Backup directory: ${backupDir}`);

  // Backup admin pages
  const adminPaths = [
    'app/admin',
    'components/admin',
    'app/api/admin',
    'app/api/campaigns',
    'app/api/auth'
  ];

  for (const adminPath of adminPaths) {
    if (fs.existsSync(adminPath)) {
      const destPath = path.join(backupDir, adminPath);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      try {
        execSync(`xcopy "${adminPath}" "${destPath}" /E /I /H /Y`, { stdio: 'inherit' });
        console.log(`✅ Backed up: ${adminPath}`);
      } catch (error) {
        console.log(`⚠️ Error backing up ${adminPath}: ${error.message}`);
      }
    } else {
      console.log(`❌ Not found: ${adminPath}`);
    }
  }

  // Create backup manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    backupDir: backupDir,
    adminPaths: adminPaths,
    status: 'completed'
  };

  fs.writeFileSync(
    path.join(backupDir, 'backup-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`✅ Vercel admin backup created: ${backupDir}`);
  console.log(`📄 Manifest saved: ${path.join(backupDir, 'backup-manifest.json')}`);

  return backupDir;
}

// Restore from backup
async function restoreFromBackup(backupDir) {
  console.log(`🔄 Restoring from backup: ${backupDir}`);

  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup directory not found: ${backupDir}`);
  }

  const manifestPath = path.join(backupDir, 'backup-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Backup manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const adminPath of manifest.adminPaths) {
    const sourcePath = path.join(backupDir, adminPath);
    if (fs.existsSync(sourcePath)) {
      try {
        execSync(`xcopy "${sourcePath}" "${adminPath}" /E /I /H /Y`, { stdio: 'inherit' });
        console.log(`✅ Restored: ${adminPath}`);
      } catch (error) {
        console.log(`⚠️ Error restoring ${adminPath}: ${error.message}`);
      }
    }
  }

  console.log('✅ Restore completed');
}

// List available backups
function listBackups() {
  console.log('📋 Available Backups:');

  if (!fs.existsSync('backups')) {
    console.log('❌ No backups found');
    return [];
  }

  const backups = fs.readdirSync('backups')
    .filter(dir => dir.startsWith('vercel-admin-'))
    .sort()
    .reverse();

  backups.forEach((backup, index) => {
    const backupPath = path.join('backups', backup);
    const manifestPath = path.join(backupPath, 'backup-manifest.json');

    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`  ${index + 1}. ${backup} (${manifest.timestamp})`);
    } else {
      console.log(`  ${index + 1}. ${backup} (no manifest)`);
    }
  });

  return backups;
}

// Run backup if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'backup') {
    backupVercelAdmin().catch(console.error);
  } else if (command === 'restore') {
    const backupDir = process.argv[3];
    if (!backupDir) {
      console.log('Usage: node backup-vercel-admin.js restore <backup-dir>');
      process.exit(1);
    }
    restoreFromBackup(backupDir).catch(console.error);
  } else if (command === 'list') {
    listBackups();
  } else {
    console.log('Usage:');
    console.log('  node backup-vercel-admin.js backup     - Create backup');
    console.log('  node backup-vercel-admin.js restore <dir> - Restore from backup');
    console.log('  node backup-vercel-admin.js list       - List backups');
  }
}

module.exports = { backupVercelAdmin, restoreFromBackup, listBackups };
