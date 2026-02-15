#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', timestamp);
  
  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });
  
  // Files to backup
  const filesToBackup = [
    '.env',
    '.env.local',
    '.env.production',
    'package.json',
    'package-lock.json',
    'next.config.js',
    'vercel.json',
    'railway.json',
    'prisma/schema.prisma'
  ];
  
  console.log('📦 Creating backup at:', backupDir);
  
  filesToBackup.forEach(file => {
    const sourcePath = path.join(process.cwd(), file);
    if (fs.existsSync(sourcePath)) {
      const destPath = path.join(backupDir, file);
      const destDir = path.dirname(destPath);
      
      // Create directory if needed
      fs.mkdirSync(destDir, { recursive: true });
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      console.log('  ✅ Backed up:', file);
    }
  });
  
  // Create backup manifest
  const manifest = {
    timestamp,
    files: filesToBackup.filter(f => fs.existsSync(path.join(process.cwd(), f))),
    gitCommit: execSync('git rev-parse HEAD').toString().trim(),
    branch: execSync('git branch --show-current').toString().trim()
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('✅ Backup complete!');
  return backupDir;
}

if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };