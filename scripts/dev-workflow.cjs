const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Development Workflow Script
 * Prevents future sync issues and ensures safe development practices
 */

const workflow = {
  beforeDevelopment: [
    'Pull latest from Vercel (if needed)',
    'Create feature branch',
    'Run tests',
    'Verify all 34 pages are present'
  ],
  afterDevelopment: [
    'Test all pages locally',
    'Run build check',
    'Push to GitHub',
    'Deploy to staging',
    'Test on staging',
    'Deploy to production'
  ]
};

class DevWorkflow {
  constructor() {
    this.projectRoot = process.cwd();
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
  }

  async runPreDevelopmentChecks() {
    console.log('🔍 Running Pre-Development Checks...\n');
    
    try {
      // Check if all 34 pages are present
      await this.verifyAllPages();
      
      // Check if development server can start
      await this.checkDevServer();
      
      // Verify Git status
      await this.checkGitStatus();
      
      console.log('✅ All pre-development checks passed!\n');
      return true;
    } catch (error) {
      console.error('❌ Pre-development checks failed:', error.message);
      return false;
    }
  }

  async verifyAllPages() {
    console.log('📄 Verifying all 34 pages are present...');
    
    const expectedPages = [
      '/',
      '/marketplace',
      '/suppliers',
      '/rfq/create',
      '/register',
      '/login',
      '/fintech',
      '/wallet',
      '/voice-rfq',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/help',
      '/admin',
      '/dashboard/ai-features',
      '/categories/textiles-garments',
      '/categories/pharmaceuticals',
      '/categories/agricultural-products',
      '/categories/automotive-parts',
      '/categories/it-services',
      '/categories/gems-jewelry',
      '/categories/handicrafts',
      '/categories/machinery-equipment',
      '/categories/chemicals',
      '/categories/food-processing',
      '/categories/construction',
      '/categories/metals-steel',
      '/categories/plastics',
      '/categories/paper-packaging',
      '/categories/rubber',
      '/categories/ceramics',
      '/categories/glass',
      '/categories/wood',
      '/categories/leather'
    ];

    const missingPages = [];
    
    for (const page of expectedPages) {
      const pagePath = this.getPageFilePath(page);
      if (!fs.existsSync(pagePath)) {
        missingPages.push(page);
      }
    }

    if (missingPages.length > 0) {
      throw new Error(`Missing pages: ${missingPages.join(', ')}`);
    }

    console.log(`✅ All ${expectedPages.length} pages verified`);
  }

  getPageFilePath(route) {
    if (route === '/') {
      return path.join(this.projectRoot, 'app', 'page.tsx');
    }
    
    if (route.startsWith('/categories/')) {
      const category = route.split('/')[2];
      return path.join(this.projectRoot, 'app', 'categories', '[category]', 'page.tsx');
    }
    
    const cleanRoute = route.replace(/^\//, '');
    const segments = cleanRoute.split('/');
    
    if (segments.length === 1) {
      return path.join(this.projectRoot, 'app', segments[0], 'page.tsx');
    } else {
      return path.join(this.projectRoot, 'app', ...segments, 'page.tsx');
    }
  }

  async checkDevServer() {
    console.log('🚀 Checking development server capability...');
    
    return new Promise((resolve, reject) => {
      exec('npm run build', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Build failed: ${error.message}`));
        } else {
          console.log('✅ Development server check passed');
          resolve();
        }
      });
    });
  }

  async checkGitStatus() {
    console.log('📋 Checking Git status...');
    
    return new Promise((resolve, reject) => {
      exec('git status --porcelain', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Git check failed: ${error.message}`));
        } else if (stdout.trim()) {
          console.log('⚠️  Uncommitted changes detected');
          console.log(stdout);
        } else {
          console.log('✅ Git repository is clean');
        }
        resolve();
      });
    });
  }

  async createFeatureBranch(branchName) {
    console.log(`🌿 Creating feature branch: ${branchName}`);
    
    return new Promise((resolve, reject) => {
      exec(`git checkout -b feature/${branchName}`, { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to create branch: ${error.message}`));
        } else {
          console.log(`✅ Feature branch 'feature/${branchName}' created`);
          resolve();
        }
      });
    });
  }

  async runPostDevelopmentChecks() {
    console.log('🔍 Running Post-Development Checks...\n');
    
    try {
      // Test all pages locally
      await this.testAllPages();
      
      // Run build check
      await this.checkBuild();
      
      // Run linting
      await this.runLinting();
      
      console.log('✅ All post-development checks passed!\n');
      return true;
    } catch (error) {
      console.error('❌ Post-development checks failed:', error.message);
      return false;
    }
  }

  async testAllPages() {
    console.log('🧪 Testing all pages locally...');
    
    return new Promise((resolve, reject) => {
      exec('node scripts/test-all-pages.cjs', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Page testing failed: ${error.message}`));
        } else {
          console.log('✅ All pages tested successfully');
          console.log(stdout);
          resolve();
        }
      });
    });
  }

  async checkBuild() {
    console.log('🔨 Running build check...');
    
    return new Promise((resolve, reject) => {
      exec('npm run build', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Build failed: ${error.message}`));
        } else {
          console.log('✅ Build check passed');
          resolve();
        }
      });
    });
  }

  async runLinting() {
    console.log('🔍 Running linting...');
    
    return new Promise((resolve, reject) => {
      exec('npm run lint', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️  Linting issues found (non-blocking)');
          console.log(stdout);
        } else {
          console.log('✅ Linting passed');
        }
        resolve(); // Don't fail on linting issues
      });
    });
  }

  async deployToStaging() {
    console.log('🚀 Deploying to staging...');
    
    return new Promise((resolve, reject) => {
      exec('npm run deploy:staging', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Staging deployment failed: ${error.message}`));
        } else {
          console.log('✅ Staged successfully');
          resolve();
        }
      });
    });
  }

  async deployToProduction() {
    console.log('🚀 Deploying to production...');
    
    return new Promise((resolve, reject) => {
      exec('npm run deploy:production', { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Production deployment failed: ${error.message}`));
        } else {
          console.log('✅ Production deployment successful');
          resolve();
        }
      });
    });
  }

  printWorkflow() {
    console.log('📋 Development Workflow:');
    console.log('\n🔍 Before Development:');
    workflow.beforeDevelopment.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    
    console.log('\n🚀 After Development:');
    workflow.afterDevelopment.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    console.log('');
  }
}

// CLI Interface
async function main() {
  const workflow = new DevWorkflow();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'pre':
      await workflow.runPreDevelopmentChecks();
      break;
      
    case 'post':
      await workflow.runPostDevelopmentChecks();
      break;
      
    case 'branch':
      if (!arg) {
        console.error('❌ Please provide a branch name');
        process.exit(1);
      }
      await workflow.createFeatureBranch(arg);
      break;
      
    case 'staging':
      await workflow.deployToStaging();
      break;
      
    case 'production':
      await workflow.deployToProduction();
      break;
      
    case 'show':
      workflow.printWorkflow();
      break;
      
    default:
      console.log('🔧 Development Workflow Script');
      console.log('\nUsage:');
      console.log('  node scripts/dev-workflow.cjs pre          - Run pre-development checks');
      console.log('  node scripts/dev-workflow.cjs post         - Run post-development checks');
      console.log('  node scripts/dev-workflow.cjs branch <name> - Create feature branch');
      console.log('  node scripts/dev-workflow.cjs staging      - Deploy to staging');
      console.log('  node scripts/dev-workflow.cjs production   - Deploy to production');
      console.log('  node scripts/dev-workflow.cjs show         - Show workflow steps');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DevWorkflow;
