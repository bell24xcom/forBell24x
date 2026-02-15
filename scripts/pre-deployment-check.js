import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console colors
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Configuration
const config = {
    projectRoot: path.resolve(__dirname, '..'),
    requiredFiles: [
        '.env',
        'package.json',
        'composer.json',
        'web.config',
        'storage/app/public',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs'
    ],
    requiredCommands: [
        { name: 'php', version: '8.1' },
        { name: 'node', version: '18.x' },
        { name: 'mysql', version: '8.0' },
        { name: 'redis-cli', version: 'latest' }
    ]
};

// Utility functions
function checkFileExists(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}

function checkCommandVersion(command, requiredVersion) {
    try {
        const output = execSync(`${command} --version`).toString();
        console.log(`${colors.green}✓${colors.reset} ${command} is installed: ${output.trim()}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗${colors.reset} ${command} is not installed or not in PATH`);
        return false;
    }
}

function checkDirectoryPermissions(dirPath) {
    try {
        fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch {
        return false;
    }
}

// Main check function
async function performPreDeploymentCheck() {
    console.log(`${colors.cyan}Starting pre-deployment checks...${colors.reset}\n`);

    // Check required files
    console.log(`${colors.blue}Checking required files:${colors.reset}`);
    let allFilesExist = true;
    for (const file of config.requiredFiles) {
        const filePath = path.join(config.projectRoot, file);
        if (checkFileExists(filePath)) {
            console.log(`${colors.green}✓${colors.reset} ${file} exists`);
        } else {
            console.error(`${colors.red}✗${colors.reset} ${file} is missing`);
            allFilesExist = false;
        }
    }
    console.log('');

    // Check required commands
    console.log(`${colors.blue}Checking required commands:${colors.reset}`);
    let allCommandsExist = true;
    for (const cmd of config.requiredCommands) {
        if (!checkCommandVersion(cmd.name, cmd.version)) {
            allCommandsExist = false;
        }
    }
    console.log('');

    // Check directory permissions
    console.log(`${colors.blue}Checking directory permissions:${colors.reset}`);
    const storageDirs = [
        'storage/app/public',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs'
    ];
    let allPermissionsOk = true;
    for (const dir of storageDirs) {
        const dirPath = path.join(config.projectRoot, dir);
        if (checkDirectoryPermissions(dirPath)) {
            console.log(`${colors.green}✓${colors.reset} ${dir} has correct permissions`);
        } else {
            console.error(`${colors.red}✗${colors.reset} ${dir} has incorrect permissions`);
            allPermissionsOk = false;
        }
    }
    console.log('');

    // Check environment variables
    console.log(`${colors.blue}Checking environment variables:${colors.reset}`);
    const requiredEnvVars = [
        'APP_ENV',
        'APP_DEBUG',
        'APP_URL',
        'DB_CONNECTION',
        'DB_HOST',
        'DB_PORT',
        'DB_DATABASE',
        'DB_USERNAME',
        'DB_PASSWORD',
        'MAIL_MAILER',
        'MAIL_HOST',
        'MAIL_PORT',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'MAIL_ENCRYPTION',
        'MAIL_FROM_ADDRESS',
        'MAIL_FROM_NAME',
        'SENTRY_DSN',
        'REDIS_HOST',
        'REDIS_PASSWORD',
        'REDIS_PORT'
    ];

    let allEnvVarsExist = true;
    for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
            console.log(`${colors.green}✓${colors.reset} ${envVar} is set`);
        } else {
            console.error(`${colors.red}✗${colors.reset} ${envVar} is not set`);
            allEnvVarsExist = false;
        }
    }
    console.log('');

    // Summary
    console.log(`${colors.cyan}Pre-deployment check summary:${colors.reset}`);
    console.log(`Required files: ${allFilesExist ? `${colors.green}✓ All present${colors.reset}` : `${colors.red}✗ Missing files${colors.reset}`}`);
    console.log(`Required commands: ${allCommandsExist ? `${colors.green}✓ All present${colors.reset}` : `${colors.red}✗ Missing commands${colors.reset}`}`);
    console.log(`Directory permissions: ${allPermissionsOk ? `${colors.green}✓ All correct${colors.reset}` : `${colors.red}✗ Permission issues${colors.reset}`}`);
    console.log(`Environment variables: ${allEnvVarsExist ? `${colors.green}✓ All set${colors.reset}` : `${colors.red}✗ Missing variables${colors.reset}`}`);

    if (!allFilesExist || !allCommandsExist || !allPermissionsOk || !allEnvVarsExist) {
        console.error(`\n${colors.red}Pre-deployment checks failed. Please fix the issues above before proceeding.${colors.reset}`);
        process.exit(1);
    }

    console.log(`\n${colors.green}All pre-deployment checks passed successfully!${colors.reset}`);
}

// Run the check
performPreDeploymentCheck().catch(error => {
    console.error(`${colors.red}Error during pre-deployment check:${colors.reset}`, error);
    process.exit(1);
});

class DeploymentChecker {
  constructor(customConfig = {}) {
    this.config = { ...config, ...customConfig };
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllChecks() {
    try {
      this.header('🚀 Starting Pre-deployment Checks');
      
      // Run all check methods
      await this.checkRequiredFiles();
      await this.checkEnvironmentVariables();
      await this.checkDependencies();
      await this.checkBuildProcess();
      await this.checkTests();
      await this.checkPerformance();
      await this.checkSecurity();
      await this.checkCodeQuality();
      await this.checkAccessibility();
      await this.checkAPIEndpoints();
      await this.checkDeploymentReadiness();
      
      // Generate summary
      this.generateSummary();
      
      // Return overall status
      return {
        passed: this.passed,
        failed: this.failed,
        warnings: this.warnings,
        isReady: this.failed === 0
      };
    } catch (error) {
      this.error('An error occurred during checks');
      this.error(error.message);
      return {
        passed: this.passed,
        failed: this.failed + 1,
        warnings: this.warnings,
        isReady: false
      };
    }
  }

  async checkRequiredFiles() {
    this.header('📁 Checking Required Files');
    
    this.config.requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.success(`${file} exists`);
      } else {
        this.error(`${file} is missing`);
      }
    });
  }

  async checkEnvironmentVariables() {
    this.header('🔧 Checking Environment Variables');
    
    // Check for .env file
    if (fs.existsSync('.env')) {
      this.success('.env file exists');
      
      const envContent = fs.readFileSync('.env', 'utf8');
      this.config.requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          this.success(`${envVar} is defined`);
        } else {
          this.warning(`${envVar} is not defined in .env`);
        }
      });
    } else {
      this.warning('.env file not found');
    }

    // Check process.env
    this.config.requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        this.success(`${envVar} is available in environment`);
      } else {
        this.warning(`${envVar} is not set in current environment`);
      }
    });
  }

  async checkDependencies() {
    console.log('🔍 Checking Dependencies...');
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for outdated dependencies
      Object.entries(dependencies).forEach(([name, version]) => {
        if (version.includes('^') || version.includes('~')) {
          this.warnings.push(`Consider pinning exact version for ${name}`);
        }
      });
    } catch (error) {
      this.errors.push('Failed to read package.json');
    }
  }

  async checkBuildProcess() {
    console.log('🔍 Checking Build Process...');
    try {
      if (!fs.existsSync('dist') || !fs.existsSync('build')) {
        this.errors.push('Build directories not found. Run build process first.');
      }
    } catch (error) {
      this.errors.push('Failed to check build directories');
    }
  }

  async checkTests() {
    console.log('🔍 Checking Tests...');
    try {
      if (!fs.existsSync('test') || !fs.existsSync('tests')) {
        this.errors.push('Test directories not found. Run tests first.');
      }
    } catch (error) {
      this.errors.push('Failed to check test directories');
    }
  }

  async checkPerformance() {
    this.header('⚡ Checking Performance');
    
    if (fs.existsSync('build')) {
      try {
        const buildPath = 'build/static/js';
        if (fs.existsSync(buildPath)) {
          const jsFiles = fs.readdirSync(buildPath).filter(file => file.endsWith('.js'));
          let totalSize = 0;
          
          jsFiles.forEach(file => {
            const filePath = path.join(buildPath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
          });
          
          const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
          
          if (totalSize < this.config.performance.warningBundleSize) {
            this.success(`JavaScript bundle size: ${sizeInMB}MB`);
          } else if (totalSize < this.config.performance.maxBundleSize) {
            this.warning(`JavaScript bundle size: ${sizeInMB}MB (consider optimization)`);
          } else {
            this.error(`JavaScript bundle size: ${sizeInMB}MB (too large)`);
          }
        }
      } catch (error) {
        this.warning('Could not analyze bundle size');
      }
    }
  }

  async checkSecurity() {
    this.header('🔒 Checking Security');
    
    // Check for sensitive files
    this.config.sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.warning(`Sensitive file found: ${file} (ensure it's in .gitignore)`);
      }
    });

    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
      const requiredIgnores = ['.env', 'node_modules', 'build'];
      
      requiredIgnores.forEach(ignore => {
        if (gitignoreContent.includes(ignore)) {
          this.success(`${ignore} is in .gitignore`);
        } else {
          this.warning(`${ignore} should be in .gitignore`);
        }
      });
    } else {
      this.error('.gitignore file missing');
    }

    // Check for hardcoded secrets
    try {
      const srcFiles = this.getAllFiles('src', this.config.codeQuality.fileExtensions);
      let suspiciousFound = false;
      
      srcFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        this.config.securityPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            this.warning(`Potential hardcoded secret in ${file}`);
            suspiciousFound = true;
          }
        });
      });

      if (!suspiciousFound) {
        this.success('No obvious hardcoded secrets found');
      }
    } catch (error) {
      this.warning('Could not scan for hardcoded secrets');
    }
  }

  async checkCodeQuality() {
    this.header('📝 Checking Code Quality');
    
    try {
      // Check for ESLint
      if (fs.existsSync('.eslintrc')) {
        this.success('ESLint configuration found');
        
        // Run ESLint
        try {
          execSync('npx eslint . --ext .js,.jsx,.ts,.tsx', { stdio: 'pipe' });
          this.success('ESLint passed with no errors');
        } catch (error) {
          this.warning('ESLint found issues - review the output');
        }
      } else {
        this.warning('No ESLint configuration found');
      }

      // Check for Prettier
      if (fs.existsSync('.prettierrc')) {
        this.success('Prettier configuration found');
      } else {
        this.warning('No Prettier configuration found');
      }

      // Check for TypeScript
      if (fs.existsSync('tsconfig.json')) {
        this.success('TypeScript configuration found');
        
        // Run TypeScript compiler
        try {
          execSync('npx tsc --noEmit', { stdio: 'pipe' });
          this.success('TypeScript compilation passed');
        } catch (error) {
          this.warning('TypeScript compilation found issues');
        }
      }

      // Check for code coverage
      if (fs.existsSync('coverage')) {
        const coverageSummary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const totalCoverage = coverageSummary.total.lines.pct;
        
        if (totalCoverage >= 80) {
          this.success(`Code coverage: ${totalCoverage}%`);
        } else if (totalCoverage >= 60) {
          this.warning(`Code coverage: ${totalCoverage}% (aim for 80%)`);
        } else {
          this.error(`Code coverage: ${totalCoverage}% (too low)`);
        }
      } else {
        this.warning('No code coverage report found');
      }

    } catch (error) {
      this.warning('Could not complete code quality checks');
    }
  }

  async checkAccessibility() {
    this.header('♿ Checking Accessibility');
    
    try {
      // Check for accessibility dependencies
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasA11yDeps = packageJson.dependencies && (
        packageJson.dependencies['@axe-core/react'] ||
        packageJson.dependencies['react-axe'] ||
        packageJson.dependencies['@testing-library/jest-dom']
      );

      if (hasA11yDeps) {
        this.success('Accessibility testing dependencies found');
      } else {
        this.warning('Consider adding accessibility testing dependencies');
      }

      // Check for ARIA attributes in components
      const srcFiles = this.getAllFiles('src', ['.jsx', '.tsx']);
      let hasAriaAttributes = false;
      
      srcFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('aria-')) {
          hasAriaAttributes = true;
        }
      });

      if (hasAriaAttributes) {
        this.success('ARIA attributes found in components');
      } else {
        this.warning('No ARIA attributes found - consider adding them');
      }

      // Check for semantic HTML
      const htmlFiles = this.getAllFiles('src', ['.html']);
      let hasSemanticHTML = false;
      
      htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('<main>') || 
            content.includes('<nav>') || 
            content.includes('<article>') || 
            content.includes('<section>')) {
          hasSemanticHTML = true;
        }
      });

      if (hasSemanticHTML) {
        this.success('Semantic HTML elements found');
      } else {
        this.warning('Consider using semantic HTML elements');
      }

    } catch (error) {
      this.warning('Could not complete accessibility checks');
    }
  }

  async checkAPIEndpoints() {
    this.header('🔌 Checking API Endpoints');
    
    try {
      // Check for API configuration
      const apiConfig = this.findAPIConfig();
      if (apiConfig) {
        this.success('API configuration found');
        
        // Check for environment-specific API URLs
        if (apiConfig.includes('process.env')) {
          this.success('API URLs are environment-aware');
        } else {
          this.warning('Consider using environment variables for API URLs');
        }
      } else {
        this.warning('No API configuration found');
      }

      // Check for API error handling
      const srcFiles = this.getAllFiles('src', ['.js', '.jsx', '.ts', '.tsx']);
      let hasErrorHandling = false;
      
      srcFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('try') && content.includes('catch')) {
          hasErrorHandling = true;
        }
      });

      if (hasErrorHandling) {
        this.success('API error handling found');
      } else {
        this.warning('Consider adding API error handling');
      }

      // Check for API documentation
      if (fs.existsSync('api-docs') || fs.existsSync('docs/api')) {
        this.success('API documentation found');
      } else {
        this.warning('Consider adding API documentation');
      }

    } catch (error) {
      this.warning('Could not complete API endpoint checks');
    }
  }

  findAPIConfig() {
    const possiblePaths = [
      'src/config/api.js',
      'src/config/api.ts',
      'src/services/api.js',
      'src/services/api.ts',
      'src/utils/api.js',
      'src/utils/api.ts'
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return fs.readFileSync(path, 'utf8');
      }
    }

    return null;
  }

  async checkDeploymentReadiness() {
    console.log('🔍 Checking Deployment Readiness...');
    // Add deployment readiness check logic here
  }

  generateSummary() {
    this.header('📊 Summary Report');
    
    const totalChecks = this.passed + this.failed + this.warnings;
    const passPercentage = ((this.passed / totalChecks) * 100).toFixed(1);
    
    this.log(`\n${colors.bold}Overall Status:${colors.reset}`);
    this.log(`Total Checks: ${totalChecks}`);
    this.log(`Passed: ${colors.green}${this.passed}${colors.reset}`);
    this.log(`Failed: ${colors.red}${this.failed}${colors.reset}`);
    this.log(`Warnings: ${colors.yellow}${this.warnings}${colors.reset}`);
    this.log(`Pass Rate: ${colors.bold}${passPercentage}%${colors.reset}`);

    // Deployment readiness verdict
    this.log(`\n${colors.bold}Deployment Readiness:${colors.reset}`);
    if (this.failed === 0 && this.warnings < 3) {
      this.log(`${colors.green}✅ Ready for deployment${colors.reset}`);
    } else if (this.failed === 0) {
      this.log(`${colors.yellow}⚠️  Ready with warnings${colors.reset}`);
    } else {
      this.log(`${colors.red}❌ Not ready for deployment${colors.reset}`);
    }

    // Recommendations
    if (this.failed > 0 || this.warnings > 0) {
      this.log(`\n${colors.bold}Recommendations:${colors.reset}`);
      
      if (this.failed > 0) {
        this.log(`${colors.red}Critical Issues to Fix:${colors.reset}`);
        this.log('1. Address all failed checks before deployment');
        this.log('2. Review error messages above for details');
      }
      
      if (this.warnings > 0) {
        this.log(`\n${colors.yellow}Suggested Improvements:${colors.reset}`);
        this.log('1. Address warnings to improve deployment quality');
        this.log('2. Consider performance optimizations');
        this.log('3. Review security recommendations');
      }
    }

    // Next steps
    this.log(`\n${colors.bold}Next Steps:${colors.reset}`);
    if (this.failed === 0 && this.warnings === 0) {
      this.log(`${colors.green}1. Proceed with deployment${colors.reset}`);
      this.log(`${colors.green}2. Monitor application performance${colors.reset}`);
      this.log(`${colors.green}3. Keep dependencies updated${colors.reset}`);
    } else if (this.failed === 0) {
      this.log(`${colors.yellow}1. Review and address warnings${colors.reset}`);
      this.log(`${colors.yellow}2. Consider performance improvements${colors.reset}`);
      this.log(`${colors.yellow}3. Proceed with deployment after addressing warnings${colors.reset}`);
    } else {
      this.log(`${colors.red}1. Fix all failed checks${colors.reset}`);
      this.log(`${colors.red}2. Run the checker again${colors.reset}`);
      this.log(`${colors.red}3. Do not proceed with deployment until all checks pass${colors.reset}`);
    }
  }

  header(title) {
    console.log(`\n${colors.bold}${title}${colors.reset}`);
    console.log('================================');
  }

  log(message) {
    console.log(message);
  }

  error(message) {
    console.error(colors.red(message));
    this.failed++;
  }

  success(message) {
    console.log(colors.green(message));
    this.passed++;
  }

  warning(message) {
    console.warn(colors.yellow(message));
    this.warnings++;
  }

  getAllFiles(directory, extensions) {
    const files = [];
    const walk = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.lstatSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      });
    };
    walk(directory);
    return files;
  }
}

// Create and run checker if this file is executed directly
if (import.meta.main) {
  const checker = new DeploymentChecker();
  checker.runAllChecks().then(result => {
    process.exit(result.isReady ? 0 : 1);
  });
}

export default DeploymentChecker; 