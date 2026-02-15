/**
 * Bell24H Application Starter
 * 
 * This script starts the Bell24H application by running the server.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Bell24H application...');

try {
  // Check if TypeScript is available
  const useTsx = fs.existsSync(path.join(__dirname, 'node_modules', 'tsx'));
  
  // Use tsx for TypeScript files if available
  if (useTsx) {
    console.log('Starting server with tsx...');
    execSync('npx tsx server/index.ts', { stdio: 'inherit' });
  } else {
    // Fallback to node for JavaScript files
    console.log('Starting server with node...');
    execSync('node server/index.js', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error starting application:', error.message);
  process.exit(1);
}
