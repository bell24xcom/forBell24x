/**
 * Bell24h Build Script
 * 
 * This script runs the build process for the Bell24h application.
 * It's designed to be a simple wrapper around npm build commands.
 */

const { exec } = require('child_process');

console.log('📦 Starting Bell24h build process...');

// Function to execute a command and log output
function execCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${description}...`);
    
    const process = exec(command);
    
    process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      // Only show error messages, not warnings
      if (!data.toString().includes('WARNING')) {
        console.error(data.toString());
      }
    });
    
    process.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${description} failed with code ${code}`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Main build function
async function buildProject() {
  try {
    // Build client
    await execCommand('cd client && npx vite build', 'Building client application');
    
    console.log('\n🎉 Build process completed successfully!');
    console.log('The client has been built and is ready for production use.');
    console.log('To prepare the project for export from Replit, run: node prepare-export.js');
  } catch (error) {
    console.error('\n❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Start the build process
buildProject();