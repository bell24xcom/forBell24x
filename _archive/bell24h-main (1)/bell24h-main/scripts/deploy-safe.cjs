#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function safeDeployment() {
  console.log('🚀 Bell24h Safe Deployment System');
  console.log('==================================\n');

  // Check current branch
  const currentBranch = execSync('git branch --show-current').toString().trim();
  console.log('📍 Current branch:', currentBranch);

  // Select environment
  console.log('\n📦 Select deployment environment:');
  console.log('1. Development (local)');
  console.log('2. Staging (preview)');
  console.log('3. Production (live)');

  const envChoice = await askQuestion('\nSelect (1-3): ');

  let environment;
  switch (envChoice) {
    case '1':
      environment = 'development';
      break;
    case '2':
      environment = 'staging';
      break;
    case '3':
      environment = 'production';
      break;
    default:
      console.log('❌ Invalid choice');
      process.exit(1);
  }

  // Production safeguards
  if (environment === 'production') {
    if (currentBranch !== 'main' && currentBranch !== 'master') {
      console.log('\n⚠️  WARNING: You are not on the main branch!');
      const confirm = await askQuestion('Continue anyway? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Deployment cancelled');
        process.exit(0);
      }
    }

    // Run tests
    console.log('\n🧪 Running tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ Tests passed');
    } catch (error) {
      console.log('❌ Tests failed! Fix issues before deploying to production.');
      process.exit(1);
    }
  }

  // Create backup
  console.log('\n💾 Creating backup...');
  const { createBackup } = require('./backup.cjs');
  const backupPath = createBackup();
  console.log('✅ Backup created at:', backupPath);

  // Build project
  console.log('\n🔨 Building project...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.log('❌ Build failed!');
    process.exit(1);
  }

  // Deploy based on environment
  console.log('\n🚀 Deploying to', environment + '...');

  try {
    switch (environment) {
      case 'development':
        console.log('Starting development server...');
        execSync('npm run dev', { stdio: 'inherit' });
        break;

      case 'staging':
        // Try Vercel first
        try {
          execSync('vercel --env preview', { stdio: 'inherit' });
        } catch {
          // Fallback to Railway
          execSync('railway up --environment staging', { stdio: 'inherit' });
        }
        break;

      case 'production':
        const finalConfirm = await askQuestion('\n⚠️  FINAL CONFIRMATION: Deploy to PRODUCTION? (type "DEPLOY"): ');
        if (finalConfirm !== 'DEPLOY') {
          console.log('❌ Production deployment cancelled');
          process.exit(0);
        }

        // Try Vercel first
        try {
          execSync('vercel --prod', { stdio: 'inherit' });
        } catch {
          // Fallback to Railway
          execSync('railway up --environment production', { stdio: 'inherit' });
        }
        break;
    }

    console.log('\n✅ Deployment successful!');

    // Update deployment lock
    const lockFile = '.deployment-lock';
    if (fs.existsSync(lockFile)) {
      const lock = JSON.parse(fs.readFileSync(lockFile, 'utf-8'));
      lock.lastDeployment = {
        environment,
        timestamp: new Date().toISOString(),
        branch: currentBranch,
        backup: backupPath
      };
      fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2));
    }

  } catch (error) {
    console.log('\n❌ Deployment failed!');
    console.log('💡 Backup available at:', backupPath);
    process.exit(1);
  } finally {
    rl.close();
  }
}

safeDeployment();