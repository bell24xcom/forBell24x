const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Environment Setup Script
 * Creates .env.local from template with secure defaults
 */

class EnvSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.envExamplePath = path.join(this.projectRoot, 'env.local.example');
    this.envLocalPath = path.join(this.projectRoot, '.env.local');
  }

  generateSecureSecret(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  async createEnvLocal() {
    console.log('🔧 Setting up local environment...\n');

    // Check if .env.local already exists
    if (fs.existsSync(this.envLocalPath)) {
      console.log('⚠️  .env.local already exists. Creating backup...');
      const backupPath = `${this.envLocalPath}.backup.${Date.now()}`;
      fs.copyFileSync(this.envLocalPath, backupPath);
      console.log(`✅ Backup created: ${backupPath}`);
    }

    // Read the example file
    if (!fs.existsSync(this.envExamplePath)) {
      throw new Error('env.local.example file not found. Please create it first.');
    }

    let envContent = fs.readFileSync(this.envExamplePath, 'utf8');

    // Generate secure secrets for development
    const secrets = {
      NEXTAUTH_SECRET: this.generateSecureSecret(),
      JWT_SECRET: this.generateSecureSecret(),
      ADMIN_PASSWORD: this.generateSecureSecret(16)
    };

    // Replace placeholder values
    Object.entries(secrets).forEach(([key, value]) => {
      const placeholder = `your-${key.toLowerCase().replace(/_/g, '-')}-here`;
      envContent = envContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Set development-specific values
    envContent = envContent.replace('your-nextauth-secret-key-here', secrets.NEXTAUTH_SECRET);
    envContent = envContent.replace('your-jwt-secret-key-here', secrets.JWT_SECRET);
    envContent = envContent.replace('admin123', secrets.ADMIN_PASSWORD);

    // Write the new .env.local file
    fs.writeFileSync(this.envLocalPath, envContent);

    console.log('✅ .env.local created successfully!');
    console.log('\n🔐 Generated secure secrets:');
    console.log(`   NEXTAUTH_SECRET: ${secrets.NEXTAUTH_SECRET.substring(0, 8)}...`);
    console.log(`   JWT_SECRET: ${secrets.JWT_SECRET.substring(0, 8)}...`);
    console.log(`   ADMIN_PASSWORD: ${secrets.ADMIN_PASSWORD.substring(0, 8)}...`);
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Update DATABASE_URL with your local database credentials');
    console.log('   2. Add your API keys for external services');
    console.log('   3. Configure email settings if needed');
    console.log('   4. Never commit .env.local to version control');
    
    return true;
  }

  async validateEnvLocal() {
    console.log('🔍 Validating .env.local configuration...\n');

    if (!fs.existsSync(this.envLocalPath)) {
      throw new Error('.env.local file not found. Run setup first.');
    }

    const envContent = fs.readFileSync(this.envLocalPath, 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'NEXT_PUBLIC_API_URL'
    ];

    const missingVars = [];
    const placeholderVars = [];

    requiredVars.forEach(varName => {
      const regex = new RegExp(`^${varName}=`, 'm');
      if (!regex.test(envContent)) {
        missingVars.push(varName);
      } else {
        const value = envContent.match(new RegExp(`^${varName}="?([^"\\n]+)"?`, 'm'))?.[1];
        if (value && (value.includes('your-') || value.includes('placeholder'))) {
          placeholderVars.push(varName);
        }
      }
    });

    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
    }

    if (placeholderVars.length > 0) {
      console.log('⚠️  Environment variables with placeholder values:');
      placeholderVars.forEach(varName => console.log(`   - ${varName}`));
    }

    if (missingVars.length === 0 && placeholderVars.length === 0) {
      console.log('✅ All required environment variables are configured');
      return true;
    }

    return false;
  }

  async showEnvStatus() {
    console.log('📊 Environment Configuration Status:\n');

    const files = [
      { name: '.env.local', path: this.envLocalPath, required: true },
      { name: 'env.local.example', path: this.envExamplePath, required: false },
      { name: '.env.production.example', path: path.join(this.projectRoot, '.env.production.example'), required: false }
    ];

    files.forEach(file => {
      const exists = fs.existsSync(file.path);
      const status = exists ? '✅' : (file.required ? '❌' : '⚠️ ');
      console.log(`${status} ${file.name} ${exists ? 'exists' : 'missing'}`);
    });

    if (fs.existsSync(this.envLocalPath)) {
      console.log('\n🔍 .env.local validation:');
      await this.validateEnvLocal();
    }
  }
}

// CLI Interface
async function main() {
  const setup = new EnvSetup();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'create':
        await setup.createEnvLocal();
        break;
        
      case 'validate':
        await setup.validateEnvLocal();
        break;
        
      case 'status':
        await setup.showEnvStatus();
        break;
        
      default:
        console.log('🔧 Environment Setup Script');
        console.log('\nUsage:');
        console.log('  node scripts/setup-env.cjs create   - Create .env.local from template');
        console.log('  node scripts/setup-env.cjs validate - Validate .env.local configuration');
        console.log('  node scripts/setup-env.cjs status   - Show environment status');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = EnvSetup;
