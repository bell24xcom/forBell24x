/**
 * Bell24h Project Download Helper
 * 
 * This script creates a minimal ZIP archive of the project for download,
 * designed to use minimal resources to save Replit tokens.
 * 
 * It includes only essential files and excludes node_modules and other
 * large directories to make downloading faster and more efficient.
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Bell24h Project Download Helper');
console.log('This script creates a minimal download package to save Replit tokens.');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'download');
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
  console.log(`\n📋 Next steps:`);
  console.log('1. Download the ZIP file from the "download" folder');
  console.log('2. Follow instructions in FINAL_STEPS.md to set up locally');
  console.log('3. Run locally to avoid using Replit tokens');
});

// Listen for errors
archive.on('error', function(err) {
  console.error('❌ Error creating archive:', err.message);
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// List of essential files and directories to include
const includePatterns = [
  'client/**/*',
  'server/**/*',
  'shared/**/*',
  '.env.example',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'drizzle.config.ts',
  'postcss.config.js',
  'tailwind.config.ts',
  'components.json',
  'run-app.sh',
  'run-app.bat',
  'Dockerfile',
  'docker-compose.yml',
  'README.md',
  'FEATURES.md',
  'TODO.md',
  'LOCAL_DEVELOPMENT.md',
  'DEPLOYMENT_CHECKLIST.md',
  'DATABASE_MIGRATION.md',
  'HOSTING_PLATFORMS.md',
  'FINAL_STEPS.md',
  'ENV_VARIABLES.md'
];

// List of patterns to exclude to keep the package small
const excludePatterns = [
  'node_modules/**',
  '.git/**',
  'deployments/**',
  'download/**',
  'dist/**',
  'client/dist/**',
  '**/.DS_Store',
  'download-project.js'
];

// Add files and directories to the archive
console.log('📦 Creating minimal download package...');
includePatterns.forEach(pattern => {
  // If pattern contains wildcard, use glob
  if (pattern.includes('*')) {
    archive.glob(pattern, {
      ignore: excludePatterns,
      cwd: __dirname
    });
    console.log(`📂 Added: ${pattern}`);
  } else {
    // Otherwise add file directly if it exists
    if (fs.existsSync(path.join(__dirname, pattern))) {
      archive.file(path.join(__dirname, pattern), { name: pattern });
      console.log(`📄 Added: ${pattern}`);
    } else {
      console.warn(`⚠️ Warning: ${pattern} not found.`);
    }
  }
});

// Finalize the archive
console.log('⏳ Finalizing download package...');
archive.finalize();