/**
 * Bell24H Download Helper Script
 * 
 * This script provides a simple way to download the Bell24H project from Replit.
 * It creates a minimal zip file containing only the essential files needed for development.
 * 
 * Run this script to create a download-ready zip file.
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Starting Bell24H download preparation...');

// Create a download directory if it doesn't exist
if (!fs.existsSync('download')) {
  fs.mkdirSync('download');
  console.log('Created download directory');
}

// Function to create a zip archive
function createDownloadZip() {
  return new Promise((resolve, reject) => {
    console.log('Creating download zip file...');
    
    const output = fs.createWriteStream('download/bell24h-download.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Listen for archive events
    output.on('close', () => {
      console.log(`✅ Download zip created successfully (${archive.pointer()} total bytes)`);
      resolve();
    });
    
    archive.on('error', (err) => {
      console.error(`Error creating download zip: ${err}`);
      reject(err);
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Add important files from the root directory
    const rootFilesToInclude = [
      '.env.example',
      '.gitignore',
      'README.md',
      'package.json',
      'tsconfig.json',
      'drizzle.config.ts',
      'vite.config.js',
      'bell24h-unified-startup.js',
      'build.js',
      'export-project.js'
    ];
    
    rootFilesToInclude.forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    });
    
    // Add source code directories (essential for development)
    const directoriesToInclude = [
      'client/src',
      'server',
      'shared'
    ];
    
    directoriesToInclude.forEach(dir => {
      if (fs.existsSync(dir)) {
        archive.directory(dir, dir);
      }
    });
    
    // Create README for the download
    const readmeContent = `# Bell24H Project Download

This zip file contains the essential source code and configuration files for the Bell24H B2B marketplace platform.

## Getting Started

1. Extract the zip file to a local directory
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Set up environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Fill in the required environment variables
4. Start the development server:
   \`\`\`
   node bell24h-unified-startup.js
   \`\`\`

## Building for Production

Run the following command to build the project for production:
\`\`\`
node build.js
\`\`\`

## Creating a Full Export

For a complete project export with all files, run:
\`\`\`
node export-project.js
\`\`\`

## Project Structure

- \`client/src\`: Frontend React application
- \`server\`: Backend Express server
- \`shared\`: Shared types and utilities
- \`build.js\`: Script to build the project for production
- \`export-project.js\`: Script to create a complete project export
- \`bell24h-unified-startup.js\`: Script to start the application

## Environment Variables

Set the following environment variables in your \`.env\` file:

- \`DATABASE_URL\`: PostgreSQL connection string
- \`SESSION_SECRET\`: Secret for session management
- \`OPENAI_API_KEY\`: API key for OpenAI integration

## Features

- Voice-Based RFQ with multilingual support
- Enhanced User Roles & Permissions system
- ACL (Access Control Lists) for granular permissions
- Voice analytics dashboard
- Blockchain integration via Polygon
`;
    
    // Add the download README
    const readmePath = 'download/README.md';
    fs.writeFileSync(readmePath, readmeContent);
    archive.file(readmePath, { name: 'README.md' });
    
    // Add an install script to make setup easier
    const installScriptContent = `#!/usr/bin/env node

/**
 * Bell24H Install Script
 * 
 * This script helps set up the Bell24H project after download.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Bell24H Project Setup');
console.log('========================');

// Function to install dependencies
function installDependencies() {
  console.log('\\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
}

// Function to set up environment variables
function setupEnv() {
  console.log('\\n🔐 Setting up environment variables...');
  
  if (fs.existsSync('.env')) {
    console.log('ℹ️ .env file already exists');
    return askToContinue();
  }
  
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file from .env.example');
    console.log('ℹ️ Please edit the .env file to set required environment variables');
    return askToContinue();
  } else {
    console.log('⚠️ No .env.example file found. Creating a basic .env file...');
    
    const basicEnv = \`# Bell24H Environment Variables
DATABASE_URL=postgresql://username:password@localhost:5432/bell24h
SESSION_SECRET=change_this_to_a_secure_random_string
OPENAI_API_KEY=your_openai_api_key\`;
    
    fs.writeFileSync('.env', basicEnv);
    console.log('✅ Created basic .env file');
    console.log('ℹ️ Please edit the .env file to set required environment variables');
    return askToContinue();
  }
}

// Function to ask if user wants to continue
function askToContinue() {
  return new Promise((resolve) => {
    rl.question('\\nContinue with setup? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        resolve(true);
      } else {
        console.log('Setup aborted by user');
        resolve(false);
      }
    });
  });
}

// Function to run setup process
async function setup() {
  try {
    console.log('Starting Bell24H setup process...');
    
    const dependenciesInstalled = installDependencies();
    if (!dependenciesInstalled) {
      console.log('⚠️ Failed to install dependencies. Setup cannot continue.');
      rl.close();
      return;
    }
    
    const shouldContinue = await setupEnv();
    if (!shouldContinue) {
      rl.close();
      return;
    }
    
    console.log('\\n🚀 Setup completed successfully!');
    console.log('\\nTo start the development server, run:');
    console.log('node bell24h-unified-startup.js');
    
    rl.close();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    rl.close();
  }
}

// Start setup
setup();
`;
    
    // Add the install script
    const installScriptPath = 'download/install.js';
    fs.writeFileSync(installScriptPath, installScriptContent);
    archive.file(installScriptPath, { name: 'install.js' });
    
    // Finalize the archive
    archive.finalize();
  });
}

// Check if archiver is installed, if not install it
function checkDependencies() {
  return new Promise((resolve, reject) => {
    try {
      require.resolve('archiver');
      console.log('Archiver dependency is already installed');
      resolve();
    } catch (e) {
      console.log('Installing archiver dependency...');
      exec('npm install archiver', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing archiver: ${error.message}`);
          return reject(error);
        }
        
        console.log('✅ Archiver installed successfully');
        resolve();
      });
    }
  });
}

// Main process
async function prepareDownload() {
  try {
    await checkDependencies();
    await createDownloadZip();
    
    console.log('\n🎉 Download preparation completed successfully!');
    console.log('The minimal project has been packaged into download/bell24h-download.zip');
    console.log('You can download this file from Replit to get started with development.');
  } catch (error) {
    console.error('❌ Download preparation failed:', error);
  }
}

// Start the process
prepareDownload();