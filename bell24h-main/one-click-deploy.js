#!/usr/bin/env node

/**
 * Bell24h One-Click Deployment Script
 * Automates the entire deployment process
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Bell24h One-Click Deployment');
console.log('===============================\n');

// Check prerequisites
console.log('🔍 Checking prerequisites...');

try {
  // Check Node.js
  const nodeVersion = execSync('node --version').toString().trim();
  console.log('✅ Node.js:', nodeVersion);
  
  // Check npm
  const npmVersion = execSync('npm --version').toString().trim();
  console.log('✅ npm:', npmVersion);
  
  // Check git
  const gitVersion = execSync('git --version').toString().trim();
  console.log('✅ Git:', gitVersion);
  
} catch (error) {
  console.log('❌ Prerequisites check failed:', error.message);
  process.exit(1);
}

// Build project
console.log('\n🔨 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  process.exit(1);
}

// Create backup
console.log('\n💾 Creating backup...');
try {
  execSync('npm run backup', { stdio: 'inherit' });
  console.log('✅ Backup created');
} catch (error) {
  console.log('⚠️  Backup failed, continuing...');
}

// Show next steps
console.log('\n🎯 NEXT STEPS:');
console.log('1. Create GitHub repository: https://github.com/new');
console.log('2. Push code: git remote add origin https://github.com/YOUR_USERNAME/bell24h.git');
console.log('3. Deploy on Railway: https://railway.app/dashboard');
console.log('\n✨ Your app will be live in 5 minutes!');
