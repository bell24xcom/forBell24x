/**
 * Bell24H Project Packaging Script
 * 
 * This script creates a ZIP archive of the project for local development
 * or deployment to other platforms. It includes all necessary files while
 * excluding node_modules, .git, and other unnecessary files.
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if archiver is installed by attempting to use it
try {
  // We already imported archiver, so no need to check again
  console.log('✅ Archiver package is available.');
} catch (e) {
  console.log('📦 Installing required package: archiver...');
  execSync('npm install --no-save archiver', { stdio: 'inherit' });
  console.log('✅ Archiver installed successfully.');
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'deployments');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a timestamp string for the filename
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputFilename = `bell24h-${timestamp}.zip`;
const outputPath = path.join(outputDir, outputFilename);

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`✅ Archive created successfully: ${outputPath}`);
  console.log(`📊 Total bytes: ${archive.pointer()}`);
  console.log('\n🚀 Next steps:');
  console.log('1. Download the ZIP file from the "deployments" folder');
  console.log('2. Extract it to your local development environment');
  console.log('3. Run "npm install" to install dependencies');
  console.log('4. Configure environment variables (.env file)');
  console.log('5. Start the application with "npm run dev"');
});

// Listen for warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️ Warning:', err);
  } else {
    throw err;
  }
});

// Listen for errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// List of files and directories to include
const includePatterns = [
  'client/**/*',
  'server/**/*',
  'shared/**/*',
  '.env.example',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'drizzle.config.ts',
  'postcss.config.js',
  'tailwind.config.ts',
  'start-preview.js',
  'README.md',
  'components.json'
];

// List of patterns to exclude
const excludePatterns = [
  'node_modules/**',
  '.git/**',
  'deployments/**',
  '**/.DS_Store',
  'package-for-deployment.js'
];

// Function to check if a file should be excluded
const shouldExclude = (filePath) => {
  return excludePatterns.some(pattern => {
    // Convert pattern to regex
    const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regexPattern.test(filePath);
  });
};

// Add files and directories to the archive
console.log('📦 Packaging Bell24H project...');
includePatterns.forEach(pattern => {
  // Convert glob pattern to regex
  const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  
  // If pattern contains wildcard, use glob
  if (pattern.includes('*')) {
    const directory = pattern.split('/**')[0];
    archive.glob(pattern, {
      ignore: excludePatterns,
      cwd: __dirname
    });
    console.log(`📂 Added: ${pattern}`);
  } else {
    // Otherwise add file directly
    if (fs.existsSync(path.join(__dirname, pattern))) {
      archive.file(path.join(__dirname, pattern), { name: pattern });
      console.log(`📄 Added: ${pattern}`);
    } else {
      console.warn(`⚠️ Warning: ${pattern} not found.`);
    }
  }
});

// Create .env.example file if it doesn't exist
const envExamplePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envExamplePath)) {
  console.log('📄 Creating .env.example file...');
  const envExample = `# Bell24H Environment Variables
# Copy this file to .env and fill in your actual values

# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/bell24h

# Session configuration
SESSION_SECRET=your_secure_random_string_here

# OpenAI API configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Perplexity API configuration
# PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Optional: SendGrid configuration for email notifications
# SENDGRID_API_KEY=your_sendgrid_api_key_here
`;
  fs.writeFileSync(envExamplePath, envExample);
  archive.file(envExamplePath, { name: '.env.example' });
  console.log('✅ Created and added: .env.example');
}

// Create README if it doesn't exist
const readmePath = path.join(__dirname, 'README.md');
if (!fs.existsSync(readmePath)) {
  console.log('📄 Creating README.md file...');
  const readme = `# Bell24H Marketplace

An AI-powered RFQ platform connecting buyers and suppliers with intelligent matching, blockchain security, and comprehensive financial services.

## Features

- Voice-to-RFQ conversion using OpenAI
- Real-time notifications using WebSockets
- GST validation for Indian businesses
- Industry trends analysis
- KredX invoice discounting integration
- Global trade insights for SMEs

## Setup Instructions

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your actual values
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

## License

All rights reserved.
`;
  fs.writeFileSync(readmePath, readme);
  archive.file(readmePath, { name: 'README.md' });
  console.log('✅ Created and added: README.md');
}

// Finalize the archive
archive.finalize();