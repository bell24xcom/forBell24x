#!/usr/bin/env node

/**
 * Bell24h Automated Deployment Script
 * Automatically creates GitHub repo, pushes code, and deploys to Railway
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  repoName: 'bell24h',
  githubUsername: process.env.GITHUB_USERNAME || 'YOUR_GITHUB_USERNAME',
  githubToken: process.env.GITHUB_TOKEN,
  railwayToken: process.env.RAILWAY_TOKEN,
  branch: 'main'
};

// Environment variables for Railway
const RAILWAY_ENV_VARS = {
  'DATABASE_URL': '${Postgres.DATABASE_URL}',
  'NODE_ENV': 'production',
  'JWT_SECRET': 'your-32-char-secret-key-here',
  'NEXTAUTH_URL': 'https://bell24h-production.up.railway.app',
  'NEXT_PUBLIC_API_URL': 'https://bell24h-production.up.railway.app'
};

class AutoDeployer {
  constructor() {
    this.projectRoot = process.cwd();
    this.deploymentLog = [];
    this.startTime = new Date();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.deploymentLog.push(logEntry);
  }

  async run() {
    try {
      this.log('🚀 Starting Bell24h Auto Deployment...');
      
      // Step 1: Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Step 2: Create backup
      await this.createBackup();
      
      // Step 3: Create GitHub repository
      await this.createGitHubRepo();
      
      // Step 4: Push to GitHub
      await this.pushToGitHub();
      
      // Step 5: Deploy to Railway
      await this.deployToRailway();
      
      // Step 6: Set environment variables
      await this.setRailwayEnvVars();
      
      // Step 7: Final deployment status
      await this.finalStatus();
      
      this.log('✅ Auto deployment completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      await this.rollback();
      process.exit(1);
    } finally {
      await this.saveLogs();
    }
  }

  async preDeploymentChecks() {
    this.log('📋 Running pre-deployment checks...');
    
    // Check if required environment variables are set
    if (!CONFIG.githubToken) {
      throw new Error('GITHUB_TOKEN not found in environment variables');
    }
    
    if (!CONFIG.railwayToken) {
      throw new Error('RAILWAY_TOKEN not found in environment variables');
    }
    
    // Check if Railway CLI is installed
    try {
      execSync('railway --version', { stdio: 'pipe' });
      this.log('✅ Railway CLI is installed');
    } catch {
      throw new Error('Railway CLI not found. Please install it first: npm install -g @railway/cli');
    }
    
    // Check if Git is initialized
    if (!fs.existsSync('.git')) {
      this.log('📦 Initializing Git repository...');
      execSync('git init');
    }
    
    this.log('✅ Pre-deployment checks passed');
  }

  async createBackup() {
    this.log('💾 Creating backup before deployment...');
    
    try {
      execSync('npm run backup', { stdio: 'pipe' });
      this.log('✅ Backup created successfully');
    } catch (error) {
      this.log('⚠️ Backup failed, continuing with deployment...', 'warn');
    }
  }

  async createGitHubRepo() {
    this.log('🐙 Creating GitHub repository...');
    
    const repoData = {
      name: CONFIG.repoName,
      description: 'Bell24h B2B Marketplace - Automated Deployment',
      private: false,
      auto_init: false
    };
    
    try {
      // Check if repo already exists
      const checkUrl = `https://api.github.com/repos/${CONFIG.githubUsername}/${CONFIG.repoName}`;
      const response = await this.makeHttpRequest(checkUrl, {
        headers: {
          'Authorization': `token ${CONFIG.githubToken}`,
          'User-Agent': 'Bell24h-AutoDeploy'
        }
      });
      
      if (response.statusCode === 200) {
        this.log('✅ GitHub repository already exists');
        return;
      }
    } catch (error) {
      // Repo doesn't exist, create it
    }
    
    // Create new repository
    const createUrl = `https://api.github.com/user/repos`;
    const response = await this.makeHttpRequest(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${CONFIG.githubToken}`,
        'User-Agent': 'Bell24h-AutoDeploy',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(repoData)
    });
    
    if (response.statusCode === 201) {
      this.log('✅ GitHub repository created successfully');
    } else {
      throw new Error(`Failed to create GitHub repository: ${response.statusCode}`);
    }
  }

  async pushToGitHub() {
    this.log('📤 Pushing code to GitHub...');
    
    try {
      // Add all files
      execSync('git add .', { stdio: 'pipe' });
      
      // Commit changes
      execSync('git commit -m "Auto deployment commit"', { stdio: 'pipe' });
      
      // Set remote origin
      const remoteUrl = `https://${CONFIG.githubToken}@github.com/${CONFIG.githubUsername}/${CONFIG.repoName}.git`;
      try {
        execSync(`git remote add origin ${remoteUrl}`, { stdio: 'pipe' });
      } catch {
        // Remote already exists, update it
        execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'pipe' });
      }
      
      // Push to main branch
      execSync(`git branch -M ${CONFIG.branch}`, { stdio: 'pipe' });
      execSync(`git push -u origin ${CONFIG.branch}`, { stdio: 'pipe' });
      
      this.log('✅ Code pushed to GitHub successfully');
      
    } catch (error) {
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    }
  }

  async deployToRailway() {
    this.log('🚂 Deploying to Railway...');
    
    try {
      // Authenticate with Railway
      execSync(`echo "${CONFIG.railwayToken}" | railway login`, { stdio: 'pipe' });
      
      // Link project (if not already linked)
      try {
        execSync('railway link', { stdio: 'pipe' });
        this.log('✅ Railway project linked');
      } catch {
        this.log('⚠️ Railway project already linked or linking failed', 'warn');
      }
      
      // Deploy to Railway
      execSync('railway up', { stdio: 'inherit' });
      
      this.log('✅ Railway deployment initiated');
      
    } catch (error) {
      throw new Error(`Failed to deploy to Railway: ${error.message}`);
    }
  }

  async setRailwayEnvVars() {
    this.log('🔧 Setting Railway environment variables...');
    
    try {
      for (const [key, value] of Object.entries(RAILWAY_ENV_VARS)) {
        execSync(`railway variables set ${key}="${value}"`, { stdio: 'pipe' });
        this.log(`✅ Set ${key}=${value}`);
      }
      
      this.log('✅ All environment variables set successfully');
      
    } catch (error) {
      this.log(`⚠️ Failed to set some environment variables: ${error.message}`, 'warn');
    }
  }

  async finalStatus() {
    this.log('📊 Final deployment status...');
    
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log(`⏱️ Deployment completed in ${duration} seconds`);
    this.log(`🌐 Production URL: https://bell24h-production.up.railway.app`);
    this.log(`📱 GitHub Repository: https://github.com/${CONFIG.githubUsername}/${CONFIG.repoName}`);
    
    // Check deployment status
    try {
      execSync('railway status', { stdio: 'inherit' });
    } catch {
      this.log('⚠️ Could not check Railway status', 'warn');
    }
  }

  async rollback() {
    this.log('🔄 Attempting rollback...');
    
    try {
      // Restore from backup if available
      const backupDirs = fs.readdirSync('./backups').filter(dir => 
        fs.statSync(path.join('./backups', dir)).isDirectory()
      ).sort().reverse();
      
      if (backupDirs.length > 0) {
        const latestBackup = backupDirs[0];
        this.log(`📦 Restoring from backup: ${latestBackup}`);
        
        // Copy backup files back
        const backupPath = path.join('./backups', latestBackup);
        const files = fs.readdirSync(backupPath, { recursive: true });
        
        for (const file of files) {
          const sourcePath = path.join(backupPath, file);
          const destPath = path.join(this.projectRoot, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, destPath);
          }
        }
        
        this.log('✅ Rollback completed');
      }
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'error');
    }
  }

  async saveLogs() {
    const logContent = this.deploymentLog.join('\n');
    fs.writeFileSync('deployment-log.txt', logContent);
    this.log('📝 Deployment logs saved to deployment-log.txt');
  }

  makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.data) {
        req.write(options.data);
      }

      req.end();
    });
  }
}

// Run the auto deployer
if (require.main === module) {
  const deployer = new AutoDeployer();
  deployer.run().catch(console.error);
}

module.exports = AutoDeployer;
