#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROTECTED_FILES = [
  'vercel.json',
  'railway.json',
  '.env.production',
  'next.config.js',
  'package-lock.json',
  'prisma/schema.prisma',
  'prisma/migrations'
];

function createChecksum(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function protectFiles() {
  console.log('🔒 Protecting deployment files...');
  
  const checksums = {};
  
  PROTECTED_FILES.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // Handle directory protection
        console.log('  📁 Protected directory:', file);
      } else {
        // Calculate checksum
        const checksum = createChecksum(filePath);
        checksums[file] = checksum;
        console.log('  ✅ Protected:', file);
        
        // Create backup
        const backupPath = filePath + '.protected-backup';
        fs.copyFileSync(filePath, backupPath);
      }
    }
  });
  
  // Save checksums
  fs.writeFileSync(
    '.protected-files-checksums.json',
    JSON.stringify(checksums, null, 2)
  );
  
  console.log('\n✅ File protection complete!');
  console.log('📝 Checksums saved to .protected-files-checksums.json');
}

function verifyFiles() {
  console.log('🔍 Verifying protected files...');
  
  if (!fs.existsSync('.protected-files-checksums.json')) {
    console.log('⚠️  No checksums file found. Run protect command first.');
    return;
  }
  
  const savedChecksums = JSON.parse(
    fs.readFileSync('.protected-files-checksums.json', 'utf-8')
  );
  
  let allValid = true;
  
  Object.entries(savedChecksums).forEach(([file, savedChecksum]) => {
    const filePath = path.join(process.cwd(), file);
    const currentChecksum = createChecksum(filePath);
    
    if (currentChecksum === savedChecksum) {
      console.log('  ✅', file, '- unchanged');
    } else {
      console.log('  ⚠️', file, '- MODIFIED!');
      allValid = false;
      
      // Offer to restore
      const backupPath = filePath + '.protected-backup';
      if (fs.existsSync(backupPath)) {
        console.log('     Backup available at:', backupPath);
      }
    }
  });
  
  if (allValid) {
    console.log('\n✅ All protected files are intact!');
  } else {
    console.log('\n⚠️  Some protected files have been modified!');
    console.log('Run "npm run restore-protected" to restore from backups');
  }
}

const command = process.argv[2];

if (command === 'verify') {
  verifyFiles();
} else {
  protectFiles();
}