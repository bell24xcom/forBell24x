#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 BELL24H DEPLOYMENT AUDIT');
console.log('===========================');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check 1: Critical Files Exist
console.log('\n📁 CHECKING CRITICAL FILES...');
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.eslintrc.json',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css'
];

let missingFiles = [];
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  log(`${exists ? '✅' : '❌'} ${file}`, exists ? 'green' : 'red');
  if (!exists) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  log(`\n🚨 MISSING CRITICAL FILES: ${missingFiles.join(', ')}`, 'red');
}

// Check 2: Package.json Dependencies
console.log('\n📦 CHECKING DEPENDENCIES...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = {
    'next': '^14.2.30',
    'react': '^18',
    'react-dom': '^18',
    'typescript': '^5.3.3'
  };
  
  let missingDeps = [];
  Object.entries(requiredDeps).forEach(([dep, version]) => {
    const installed = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    log(`${installed ? '✅' : '❌'} ${dep}: ${installed || 'MISSING'}`, installed ? 'green' : 'red');
    if (!installed) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    log(`\n🚨 MISSING DEPENDENCIES: ${missingDeps.join(', ')}`, 'red');
  }
} catch (error) {
  log('❌ package.json parse error:', 'red');
  log(error.message, 'red');
}

// Check 3: TypeScript Configuration
console.log('\n🔧 CHECKING TYPESCRIPT CONFIG...');
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const requiredOptions = ['lib', 'allowJs', 'skipLibCheck', 'strict'];
  let missingOptions = [];
  requiredOptions.forEach(option => {
    const exists = tsconfig.compilerOptions?.[option] !== undefined;
    log(`${exists ? '✅' : '❌'} compilerOptions.${option}`, exists ? 'green' : 'red');
    if (!exists) {
      missingOptions.push(option);
    }
  });
  
  if (missingOptions.length > 0) {
    log(`\n🚨 MISSING TYPESCRIPT OPTIONS: ${missingOptions.join(', ')}`, 'red');
  }
} catch (error) {
  log('❌ tsconfig.json error:', 'red');
  log(error.message, 'red');
}

// Check 4: App Directory Structure
console.log('\n📂 CHECKING APP STRUCTURE...');
const appStructure = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/globals.css',
  'src/app/auth/login/page.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/suppliers/page.tsx',
  'src/app/pricing/page.tsx'
];

let missingAppFiles = [];
appStructure.forEach(file => {
  const exists = fs.existsSync(file);
  log(`${exists ? '✅' : '❌'} ${file}`, exists ? 'green' : 'red');
  if (!exists) {
    missingAppFiles.push(file);
  }
});

if (missingAppFiles.length > 0) {
  log(`\n🚨 MISSING APP FILES: ${missingAppFiles.join(', ')}`, 'red');
}

// Check 5: Build Test
console.log('\n🏗️ TESTING BUILD...');
try {
  log('Building project...', 'yellow');
  execSync('npm run build', { stdio: 'pipe', timeout: 120000 });
  log('✅ Build successful', 'green');
} catch (error) {
  log('❌ Build failed', 'red');
  log(`Error: ${error.message}`, 'red');
  
  // Analyze build errors
  log('\n🔍 BUILD ERROR ANALYSIS:', 'yellow');
  const errorMsg = error.message.toLowerCase();
  
  if (errorMsg.includes('module not found')) {
    log('🎯 ISSUE: Missing dependencies - run npm install', 'red');
  }
  if (errorMsg.includes('typescript')) {
    log('🎯 ISSUE: TypeScript compilation errors', 'red');
  }
  if (errorMsg.includes('eslint')) {
    log('🎯 ISSUE: ESLint configuration problems', 'red');
  }
  if (errorMsg.includes('css')) {
    log('🎯 ISSUE: CSS/Tailwind configuration issues', 'red');
  }
  if (errorMsg.includes('hydration')) {
    log('🎯 ISSUE: Hydration mismatch - check ClientOnly components', 'red');
  }
}

// Check 6: Runtime Issues
console.log('\n🔍 CHECKING RUNTIME ISSUES...');

// Check for lucide-react imports that might cause issues
const searchForLucideImports = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...searchForLucideImports(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('lucide-react')) {
          files.push(fullPath);
        }
      } catch (error) {
        // Ignore read errors
      }
    }
  }
  return files;
};

const lucideFiles = searchForLucideImports('src');
if (lucideFiles.length > 0) {
  log(`⚠️ Found ${lucideFiles.length} files with lucide-react imports (potential runtime issues):`, 'yellow');
  lucideFiles.slice(0, 5).forEach(file => {
    log(`   ${file}`, 'yellow');
  });
  if (lucideFiles.length > 5) {
    log(`   ... and ${lucideFiles.length - 5} more files`, 'yellow');
  }
} else {
  log('✅ No lucide-react imports found', 'green');
}

// Check 7: Configuration Issues
console.log('\n⚙️ CHECKING CONFIGURATION...');

// Check Next.js config
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  if (nextConfig.includes('optimizeCss')) {
    log('⚠️ optimizeCss enabled - may cause critters dependency issues', 'yellow');
  }
  if (nextConfig.includes('experimental')) {
    log('⚠️ Experimental features enabled - may cause deployment issues', 'yellow');
  }
  log('✅ Next.js config exists', 'green');
} catch (error) {
  log('❌ Next.js config missing or invalid', 'red');
}

// Summary
console.log('\n📊 DEPLOYMENT AUDIT SUMMARY:', 'magenta');
console.log('=====================================');

const totalChecks = criticalFiles.length + 4 + appStructure.length + 3; // dependencies + tsconfig + build + runtime + config
const passedChecks = criticalFiles.filter(f => fs.existsSync(f)).length + 
                    appStructure.filter(f => fs.existsSync(f)).length;

const successRate = (passedChecks / totalChecks) * 100;
log(`Overall Health: ${successRate.toFixed(1)}% (${passedChecks}/${totalChecks} checks passed)`, 
    successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');

if (successRate >= 80) {
  log('\n🎉 DEPLOYMENT READY!', 'green');
} else if (successRate >= 60) {
  log('\n⚠️ DEPLOYMENT NEEDS WORK - Review issues above', 'yellow');
} else {
  log('\n🚨 DEPLOYMENT CRITICAL - Fix required issues', 'red');
}

log('\n🔍 AUDIT COMPLETE - Check output above for issues', 'cyan'); 
