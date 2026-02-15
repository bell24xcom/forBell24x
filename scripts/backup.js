#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createBackup() {
  console.log('💾 Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/backup-${timestamp}`;
  
  // Create backup directory
  if (!fs.existsSync('backups')) {
    fs.mkdirSync('backups', { recursive: true });
  }
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup critical files
  const filesToBackup = [
    'package.json',
    'next.config.js',
    'vercel.json',
    '.github/workflows',
    'app',
    'components',
    'lib'
  ];
  
  for (const file of filesToBackup) {
    if (fs.existsSync(file)) {
      const destPath = path.join(backupDir, file);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      if (fs.statSync(file).isDirectory()) {
        execSync(`xcopy "${file}" "${destPath}" /E /I /H /Y`, { stdio: 'pipe' });
      } else {
        fs.copyFileSync(file, destPath);
      }
      
      console.log(`✅ Backed up ${file}`);
    }
  }
  
  // Create backup manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    files: filesToBackup.filter(f => fs.existsSync(f)),
    gitCommit: getGitCommit()
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'backup-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(`✅ Backup created: ${backupDir}`);
  console.log('📋 Backup manifest saved');
}

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Run backup
createBackup();
