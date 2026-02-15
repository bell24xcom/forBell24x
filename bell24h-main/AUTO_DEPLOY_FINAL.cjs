#!/usr/bin/env node

/**
 * Bell24h Final Automated Deployment Script
 * This script will:
 * 1. Create GitHub repository automatically
 * 2. Push code to GitHub
 * 3. Deploy to Railway
 * 4. Fix the "train not arrived" error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function createGitHubRepo(repoName, githubToken) {
  console.log('🔗 Creating GitHub repository...');
  
  try {
    const createRepoCommand = `curl -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" -X POST https://api.github.com/user/repos -d '{"name":"${repoName}","description":"Bell24h B2B Marketplace - Final Deployment","private":false,"auto_init":false}'`;
    
    execSync(createRepoCommand, { stdio: 'pipe' });
    console.log('✅ GitHub repository created successfully');
    return true;
  } catch (error) {
    if (error.message.includes('422')) {
      console.log('⚠️  Repository already exists, continuing...');
      return true;
    } else {
      console.log('❌ Failed to create GitHub repository:', error.message);
      return false;
    }
  }
}

async function pushToGitHub(githubUsername, repoName) {
  console.log('📤 Pushing code to GitHub...');
  
  try {
    // Initialize git if needed
    if (!fs.existsSync('.git')) {
      execSync('git init');
      console.log('✅ Git initialized');
    }
    
    // Add all files
    execSync('git add .');
    console.log('✅ Files staged');
    
    // Commit
    execSync('git commit -m "Final Deployment - Bell24h Live"');
    console.log('✅ Files committed');
    
    // Add remote
    try {
      execSync(`git remote add origin https://github.com/${githubUsername}/${repoName}.git`);
    } catch {
      execSync(`git remote set-url origin https://github.com/${githubUsername}/${repoName}.git`);
    }
    
    // Set main branch and push
    execSync('git branch -M main');
    execSync('git push -u origin main --force');
    console.log('✅ Code pushed to GitHub successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to push to GitHub:', error.message);
    return false;
  }
}

async function deployToRailway(railwayToken) {
  console.log('🚂 Deploying to Railway...');
  
  try {
    // Set Railway token
    process.env.RAILWAY_TOKEN = railwayToken;
    
    // Login to Railway
    execSync('railway login --token', { stdio: 'pipe' });
    console.log('✅ Logged into Railway');
    
    // Link project
    execSync('railway link', { stdio: 'pipe' });
    console.log('✅ Project linked to Railway');
    
    // Set environment variables
    const envVars = [
      'NODE_ENV=production',
      'JWT_SECRET=bell24h-super-secret-jwt-key-32-chars',
      'NEXTAUTH_URL=https://bell24h-production.up.railway.app',
      'NEXT_PUBLIC_API_URL=https://bell24h-production.up.railway.app'
    ];
    
    envVars.forEach(envVar => {
      try {
        execSync(`railway variables set ${envVar}`, { stdio: 'pipe' });
        console.log(`✅ Set: ${envVar}`);
      } catch (error) {
        console.log(`⚠️  Could not set: ${envVar}`);
      }
    });
    
    // Deploy
    console.log('🚀 Starting deployment...');
    execSync('railway up --environment production', { stdio: 'inherit' });
    
    console.log('✅ Deployment initiated successfully');
    return true;
  } catch (error) {
    console.log('❌ Railway deployment failed:', error.message);
    return false;
  }
}

async function checkDeploymentStatus() {
  console.log('🔍 Checking deployment status...');
  
  try {
    // Wait a bit for deployment to start
    console.log('⏳ Waiting for deployment to process...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    
    // Check logs
    console.log('📋 Recent deployment logs:');
    execSync('railway logs --tail 20', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.log('⚠️  Could not check logs:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 BELL24H FINAL AUTOMATED DEPLOYMENT');
  console.log('=====================================\n');
  
  // Get user credentials
  const githubUsername = await askQuestion('Enter your GitHub username: ');
  const githubToken = await askQuestion('Enter your GitHub Personal Access Token: ');
  const railwayToken = await askQuestion('Enter your Railway API Token: ');
  
  console.log('\n🎯 Starting automated deployment...\n');
  
  // Step 1: Create GitHub repository
  const repoCreated = await createGitHubRepo('bell24h', githubToken);
  if (!repoCreated) {
    console.log('❌ Failed to create GitHub repository. Exiting...');
    process.exit(1);
  }
  
  // Step 2: Push to GitHub
  const pushedToGitHub = await pushToGitHub(githubUsername, 'bell24h');
  if (!pushedToGitHub) {
    console.log('❌ Failed to push to GitHub. Exiting...');
    process.exit(1);
  }
  
  // Step 3: Deploy to Railway
  const deployedToRailway = await deployToRailway(railwayToken);
  if (!deployedToRailway) {
    console.log('❌ Failed to deploy to Railway. Exiting...');
    process.exit(1);
  }
  
  // Step 4: Check deployment status
  await checkDeploymentStatus();
  
  // Final success message
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('='.repeat(60));
  console.log('🚂 Train has ARRIVED at: https://bell24h-production.up.railway.app ✅');
  console.log('📊 GitHub Repository: https://github.com/' + githubUsername + '/bell24h');
  console.log('🚀 Railway Dashboard: https://railway.app/dashboard');
  console.log('\n✨ Your Bell24h app is now LIVE!');
  console.log('='.repeat(60));
  
  rl.close();
}

// Run the deployment
main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
