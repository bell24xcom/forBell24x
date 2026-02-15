/**
 * Bell24H Project Build Script
 * 
 * This script builds the Bell24H application for production.
 * It creates a production-ready build of both the client and server.
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting Bell24H build process...');

// Create a build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
  console.log('Created build directory');
}

// Build the client (React)
console.log('Building client application...');
exec('cd client && npx vite build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error building client: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Client build stderr: ${stderr}`);
  }
  
  console.log('✅ Client build completed successfully');
  console.log(stdout);
  
  // Copy client build to the build directory
  console.log('Copying client build to build directory...');
  fs.cpSync('client/dist', 'build/client', { recursive: true });
  console.log('✅ Client build files copied to build/client');
  
  // Build the server (TypeScript)
  console.log('Building server application...');
  exec('cd server && npx tsc', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error building server: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Server build stderr: ${stderr}`);
    }
    
    console.log('✅ Server build completed successfully');
    console.log(stdout);
    
    // Copy server build and relevant files to the build directory
    console.log('Copying server files to build directory...');
    fs.cpSync('server/dist', 'build/server', { recursive: true });
    console.log('✅ Server build files copied to build/server');
    
    // Copy package.json and other necessary files
    console.log('Copying package.json and other required files...');
    fs.copyFileSync('package.json', 'build/package.json');
    
    if (fs.existsSync('.env')) {
      fs.copyFileSync('.env', 'build/.env');
    }
    
    if (fs.existsSync('bell24h-unified-startup.js')) {
      fs.copyFileSync('bell24h-unified-startup.js', 'build/bell24h-unified-startup.js');
    }
    
    // Copy shared directory
    if (fs.existsSync('shared')) {
      fs.cpSync('shared', 'build/shared', { recursive: true });
    }
    
    console.log('✅ Configuration files copied');
    
    // Create a production start script
    const startScript = `
#!/usr/bin/env node

/**
 * Bell24H Production Start Script
 */
const { spawn } = require('child_process');
const path = require('path');

// Start the server in production mode
console.log('🚀 Starting Bell24H in production mode...');
const server = spawn('node', [
  'bell24h-unified-startup.js',
  '--production'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

// Handle server exit
server.on('close', (code) => {
  console.log(\`Server process exited with code \${code}\`);
  process.exit(code);
});
    `;
    
    fs.writeFileSync('build/start.js', startScript);
    fs.chmodSync('build/start.js', '755');
    console.log('✅ Created production start script');
    
    console.log('\n🎉 Build process completed successfully!');
    console.log('The production build is available in the build/ directory');
    console.log('To start the application in production mode, run: node build/start.js');
  });
});