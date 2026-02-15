#!/usr/bin/env node

/**
 * Bell24h Deployment Protection System
 * This script automatically protects your deployments and creates safeguards
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PROTECTED_FILES = [
  'vercel.json',
  'railway.json',
  '.env.production',
  'next.config.js',
  'package-lock.json',
  'prisma/schema.prisma'
];

const DEPLOYMENT_CONFIGS = {
  '.gitignore': `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
.next/
out/
build/
dist/
.vercel/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Backups
*.backup
*.backup.*
backups/

# Deployment locks
.deployment-lock
deployment-state.json`,

  '.deployment-lock': `{
  "locked": false,
  "environment": "development",
  "lastDeployment": null,
  "protectedFiles": ${JSON.stringify(PROTECTED_FILES, null, 2)}
}`,

  'deployment-config.json': `{
  "environments": {
    "development": {
      "url": "http://localhost:3000",
      "branch": "develop",
      "autoBackup": true
    },
    "staging": {
      "url": "https://staging.bell24h.vercel.app",
      "branch": "staging",
      "requiresApproval": true,
      "autoBackup": true
    },
    "production": {
      "url": "https://bell24h.vercel.app",
      "branch": "main",
      "requiresApproval": true,
      "requiresTests": true,
      "autoBackup": true,
      "rollbackEnabled": true
    }
  },
  "backup": {
    "enabled": true,
    "location": "./backups",
    "maxBackups": 10,
    "autoBackupBeforeDeploy": true
  },
  "protection": {
    "preventForceCommit": true,
    "requireTestsBeforeDeploy": true,
    "blockDirectProduction": true
  }
}`
};

class DeploymentProtector {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async setup() {
    console.log('🛡️  Bell24h Deployment Protection Setup');
    console.log('========================================\n');

    // Create necessary directories
    this.createDirectories();

    // Create protection files
    this.createProtectionFiles();

    // Setup git hooks
    this.setupGitHooks();

    // Update package.json scripts
    this.updatePackageScripts();

    console.log('\n✅ Deployment protection setup complete!');
    console.log('\n📚 Available commands:');
    console.log('  npm run deploy:safe    - Safe deployment with checks');
    console.log('  npm run backup         - Create backup');
    console.log('  npm run protect        - Protect files');
    console.log('  npm run verify         - Verify protected files');
  }

  createDirectories() {
    const dirs = ['scripts', 'backups', '.github/workflows'];

    dirs.forEach(dir => {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('📁 Created directory:', dir);
      }
    });
  }

  createProtectionFiles() {
    Object.entries(DEPLOYMENT_CONFIGS).forEach(([fileName, content]) => {
      const filePath = path.join(this.projectRoot, fileName);

      // Create directory if needed
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, content);
      console.log('📄 Created:', fileName);
    });
  }

  setupGitHooks() {
    const hookDir = path.join(this.projectRoot, '.git', 'hooks');

    if (!fs.existsSync(hookDir)) {
      console.log('⚠️  Git not initialized. Skipping hooks setup.');
      return;
    }

    // Pre-commit hook
    const preCommitHook = `#!/bin/sh
# Verify protected files before commit
node scripts/protect-files.cjs verify

# Check for sensitive data
if git diff --cached | grep -E "(JWT_SECRET|DATABASE_URL|API_KEY)" > /dev/null; then
  echo "⚠️  Warning: Possible sensitive data in commit!"
  echo "Please review your changes."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi`;

    fs.writeFileSync(path.join(hookDir, 'pre-commit'), preCommitHook);

    // Make executable (Unix-like systems)
    try {
      execSync(`chmod +x ${path.join(hookDir, 'pre-commit')}`);
    } catch { }

    console.log('🪝 Git hooks configured');
  }

  updatePackageScripts() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    // Add protection scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'deploy:safe': 'node scripts/deploy-safe.cjs',
      'backup': 'node scripts/backup.cjs',
      'protect': 'node scripts/protect-files.cjs',
      'verify': 'node scripts/protect-files.cjs verify',
      'predeploy': 'npm run verify && npm run backup',
      'deploy:staging': 'npm run predeploy && vercel --env preview',
      'deploy:production': 'npm run predeploy && npm test && vercel --prod'
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Updated package.json scripts');
  }
}

// Run setup
const protector = new DeploymentProtector();
protector.setup();