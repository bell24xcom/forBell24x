#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Protected files that should not be modified
const PROTECTED_FILES = [
  'package.json',
  'next.config.js',
  'vercel.json',
  '.github/workflows/deploy.yml',
  '.github/workflows/main.yml'
];

function verify() {
  console.log('🔍 Verifying protected files...');
  
  let hasErrors = false;
  
  for (const file of PROTECTED_FILES) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} is missing`);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.log('❌ Verification failed - some protected files are missing');
    process.exit(1);
  } else {
    console.log('✅ All protected files verified successfully');
  }
}

function create() {
  console.log('🛡️ Creating protection for critical files...');
  
  // Create .deployment-lock if it doesn't exist
  if (!fs.existsSync('.deployment-lock')) {
    const lockData = {
      locked: false,
      created: new Date().toISOString(),
      reason: 'Automatic protection'
    };
    fs.writeFileSync('.deployment-lock', JSON.stringify(lockData, null, 2));
    console.log('✅ Created .deployment-lock');
  }
  
  console.log('✅ File protection setup complete');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'verify':
    verify();
    break;
  case 'create':
    create();
    break;
  default:
    console.log('Usage: node protect-files.js [verify|create]');
    console.log('  verify - Check if protected files exist');
    console.log('  create - Set up file protection');
    process.exit(1);
}
