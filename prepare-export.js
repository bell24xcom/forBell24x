/**
 * Bell24H Project Export Preparation Script
 * 
 * This script prepares the Bell24H project for export from Replit by:
 * 1. Building the client-side application with Vite
 * 2. Creating a list of all important files
 * 3. Providing instructions for downloading the project
 * 
 * After running this script, use Replit's "Download as zip" option to download the project.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting Bell24H export preparation...');

// Create an export directory if it doesn't exist
if (!fs.existsSync('export')) {
  fs.mkdirSync('export');
  console.log('Created export directory');
}

// Function to build the client application
function buildClientApp() {
  return new Promise((resolve, reject) => {
    console.log('Building client application...');
    
    exec('cd client && npx vite build', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building client: ${error.message}`);
        return reject(error);
      }
      
      console.log(stdout);
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error(`Client build stderr: ${stderr}`);
      }
      
      console.log('✅ Client build completed successfully');
      resolve();
    });
  });
}

// Function to create a file list
function createFileList() {
  return new Promise((resolve, reject) => {
    console.log('Creating file list...');
    
    try {
      const fileListPath = 'export/file_list.txt';
      const fileListStream = fs.createWriteStream(fileListPath);
      
      fileListStream.write('# Bell24H Project File List\n');
      fileListStream.write('# This file contains a list of important files in the project\n\n');
      
      function writeFileList(dir, base = '') {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const relativePath = path.join(base, file);
          
          // Skip node_modules, .git, and other large directories
          if (file === 'node_modules' || file === '.git' || file === '.cache' || 
              file === 'dist' || file === 'build' || file === '.vscode') {
            return;
          }
          
          try {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
              fileListStream.write(`DIR: ${relativePath}/\n`);
              writeFileList(filePath, relativePath);
            } else {
              fileListStream.write(`FILE: ${relativePath}\n`);
            }
          } catch (error) {
            console.error(`Error processing file ${filePath}: ${error.message}`);
          }
        });
      }
      
      writeFileList('.');
      fileListStream.end();
      
      console.log('✅ File list created successfully');
      resolve();
    } catch (error) {
      console.error(`Error creating file list: ${error.message}`);
      reject(error);
    }
  });
}

// Function to create export README
function createExportReadme() {
  return new Promise((resolve, reject) => {
    console.log('Creating export README...');
    
    try {
      const readmePath = 'export/EXPORT_INSTRUCTIONS.md';
      const readmeContent = `# Bell24H Project Export Instructions

## How to Download from Replit

Follow these steps to download the complete Bell24H project from Replit:

1. **Download as ZIP**
   - In the Replit file sidebar, click the three dots (⋮) and select "Download as zip"
   - This will download most of the project files

2. **Check for Missing Files**
   - Open the \`export/file_list.txt\` to see a complete list of important files
   - If any files are missing from your download, you can download them individually by:
     - Right-clicking on the file in Replit's file explorer
     - Selecting "Download"

3. **Special Files to Check**
   - Make sure these critical files are included in your download:
     - \`.env.example\` (rename to \`.env\` and configure when setting up locally)
     - \`package.json\`
     - \`client/dist\` (the built client application)
     - \`tsconfig.json\`
     - \`vite.config.js\`
     - \`server/\` directory
     - \`shared/\` directory

## Setting Up Locally

1. **Install Dependencies**
   \`\`\`
   npm install
   \`\`\`

2. **Configure Environment**
   - Copy \`.env.example\` to \`.env\`
   - Edit \`.env\` to set required environment variables

3. **Start the Application**
   \`\`\`
   node bell24h-unified-startup.js
   \`\`\`

## Project Structure

- \`client/\`: React frontend application
  - \`client/src/\`: Source code
  - \`client/dist/\`: Built application (created during export)
- \`server/\`: Express backend server
- \`shared/\`: Shared types and utilities
- \`bell24h-unified-startup.js\`: Application startup script

## Key Features

- Voice-Based RFQ with multilingual support (Hindi/English)
- Enhanced User Roles & Permissions system
- ACL (Access Control Lists) for fine-grained permissions
- Voice analytics dashboard
- Organization management with team hierarchy

`;
      
      fs.writeFileSync(readmePath, readmeContent);
      console.log('✅ Export README created successfully');
      resolve();
    } catch (error) {
      console.error(`Error creating export README: ${error.message}`);
      reject(error);
    }
  });
}

// Main function to run export preparation
async function prepareExport() {
  try {
    // Build client application
    await buildClientApp();
    
    // Create file list
    await createFileList();
    
    // Create export README
    await createExportReadme();
    
    console.log('\n🎉 Export preparation completed successfully!');
    console.log('\nTo download the project from Replit:');
    console.log('1. In the file explorer, click the three dots (⋮) and select "Download as zip"');
    console.log('2. Follow the instructions in export/EXPORT_INSTRUCTIONS.md if any files are missing');
    console.log('\nYou can now download and use the Bell24H project locally or deploy it elsewhere.');
  } catch (error) {
    console.error('❌ Export preparation failed:', error);
  }
}

// Run the export preparation
prepareExport();