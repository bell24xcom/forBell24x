const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'uploads');
const extractedDir = path.join(uploadDir, 'extracted');

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(extractedDir)) {
  fs.mkdirSync(extractedDir, { recursive: true });
}

console.log('Starting Bell24H Voice RFQ Demo...');

// Check if we have the OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set. Voice processing will not work.');
  console.log('Please set the API key in the Secrets tab.');
}

// Run the application
try {
  // Run database migrations
  console.log('Setting up database...');
  execSync('npx tsx src/db-migrator.ts', { stdio: 'inherit' });
  
  // Seed the database
  console.log('Seeding database...');
  execSync('npx tsx db/seed.ts', { stdio: 'inherit' });
  
  // Run the application
  console.log('Starting server...');
  execSync('npx tsx src/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running application:', error.message);
  process.exit(1);
}