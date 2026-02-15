/**
 * Bell24H Project Export Files Script
 * 
 * This script prepares the Bell24H project for export from Replit by:
 * 1. Creating a list of all important files
 * 2. Providing instructions for downloading the project
 * 
 * After running this script, use Replit's "Download as zip" option to download the project.
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Starting Bell24H export file preparation...');

// Create an export directory if it doesn't exist
if (!fs.existsSync('export')) {
  fs.mkdirSync('export');
  console.log('Created export directory');
}

// Function to create a file list
function createFileList() {
  return new Promise((resolve, reject) => {
    console.log('Creating file list...');
    
    try {
      const fileListPath = 'export/important_files.txt';
      const fileListStream = fs.createWriteStream(fileListPath);
      
      fileListStream.write('# Bell24H Project Important Files\n');
      fileListStream.write('# Make sure these files are included in your download\n\n');
      
      // List of critical files and directories
      const criticalItems = [
        'package.json',
        '.env.example',
        'tsconfig.json',
        'vite.config.js',
        'bell24h-unified-startup.js',
        'client/src/',
        'server/',
        'shared/',
        'export-files.js',
        'prepare-export.js',
        'run-build.js',
        '.github/workflows/build.yml'
      ];
      
      criticalItems.forEach(item => {
        if (fs.existsSync(item)) {
          if (fs.statSync(item).isDirectory()) {
            fileListStream.write(`DIR: ${item}\n`);
          } else {
            fileListStream.write(`FILE: ${item}\n`);
          }
        } else {
          fileListStream.write(`MISSING: ${item}\n`);
        }
      });
      
      fileListStream.write('\n# All Source Files\n');
      
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
      
      // Write files in client/src, server, and shared directories
      ['client/src', 'server', 'shared'].forEach(dir => {
        if (fs.existsSync(dir)) {
          fileListStream.write(`\n# Files in ${dir}\n`);
          writeFileList(dir);
        }
      });
      
      fileListStream.end();
      fileListStream.on('finish', () => {
        console.log('✅ File list created successfully');
        resolve();
      });
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
      const readmePath = 'export/README_FOR_EXPORT.md';
      const readmeContent = `# Bell24H Project Export Instructions

## Exporting the Project from Replit

Follow these steps to export the complete Bell24H project from Replit:

### 1. Using Replit's Download Feature

1. **Download as ZIP**
   - In the Replit file sidebar, click the three dots (⋮) and select "Download as zip"
   - This will download most of the project files

2. **Check Important Files**
   - Open the \`export/important_files.txt\` to see a complete list of important files
   - If any files are missing from your download, download them individually:
     - Right-click on the file in Replit's file explorer
     - Select "Download"

### 2. Setting Up Locally

1. **Project Structure**
   Make sure your local project has this structure:
   \`\`\`
   bell24h/
   ├── client/
   │   └── src/
   │       ├── components/
   │       ├── hooks/
   │       ├── lib/
   │       ├── pages/
   │       ├── App.tsx
   │       ├── index.css
   │       └── main.tsx
   ├── server/
   │   ├── routes/
   │   ├── index.ts
   │   ├── routes.ts
   │   ├── storage.ts
   │   └── vite.ts
   ├── shared/
   │   └── schema.ts
   ├── .env.example
   ├── package.json
   ├── tsconfig.json
   ├── vite.config.js
   └── bell24h-unified-startup.js
   \`\`\`

2. **Install Dependencies**
   \`\`\`
   npm install
   \`\`\`

3. **Configure Environment**
   - Copy \`.env.example\` to \`.env\`
   - Update the environment variables:
     \`\`\`
     DATABASE_URL=postgresql://username:password@host:port/database
     SESSION_SECRET=your_secure_session_secret
     OPENAI_API_KEY=your_openai_api_key
     \`\`\`

4. **Start Development Server**
   \`\`\`
   node bell24h-unified-startup.js
   \`\`\`

5. **Build for Production**
   To build the application for production:
   \`\`\`
   # First, make sure @tanstack/react-query is installed
   npm install @tanstack/react-query
   
   # Then build the client
   cd client && npm run build
   \`\`\`

## Bell24H Features

1. **Voice-Based RFQ**
   - Multilingual support (Hindi/English)
   - Audio quality enhancement
   - Language detection and translation

2. **Enhanced User Roles & Permissions**
   - Multi-level organizational hierarchy
   - Role management (owner/admin/manager/member/viewer)
   - ACL implementation with granular resource permissions

3. **Voice Analytics Dashboard**
   - Analysis of voice RFQ submissions
   - Performance metrics and reporting

4. **Blockchain Integration**
   - Secure contracts via Polygon
   - Transparent record keeping

5. **Organization Management**
   - Team hierarchies
   - Permission inheritance

## Troubleshooting

If you encounter issues with dependencies:
1. Make sure all packages in \`package.json\` are installed
2. Check that environment variables are properly set
3. Ensure database connection is configured correctly

For further assistance, refer to the project documentation or contact support.
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

// Create a ZIP preparation instruction file
function createZipInstructions() {
  return new Promise((resolve, reject) => {
    console.log('Creating ZIP instructions...');
    
    try {
      const instructionsPath = 'export/HOW_TO_CREATE_ZIP.md';
      const instructionsContent = `# How to Create a ZIP File of Bell24H Project

Since we encountered issues with automatic ZIP creation in Replit, follow these manual steps:

## Option 1: Using Replit's Download Feature (Recommended)

1. In the Replit file sidebar, click the three dots (⋮) menu
2. Select "Download as zip"
3. This will download most of the project files

## Option 2: Manual Download of Critical Files

If some files are missing in the ZIP from Option 1, download these critical files individually:

1. Right-click on each file in the list below
2. Select "Download" for each one
3. Add them to the ZIP file you downloaded in Option 1

### Critical Files to Check:
- \`package.json\`
- \`.env.example\`
- \`tsconfig.json\`
- \`vite.config.js\`
- \`bell24h-unified-startup.js\`
- All files in \`client/src/\`
- All files in \`server/\`
- All files in \`shared/\`

## Option 3: Using GitHubVZip for Complete Export (For Advanced Users)

If you have GitHub access:

1. Create a new GitHub repository
2. Push the Bell24H project to that repository
3. Download the ZIP from GitHub

## After Downloading

1. Extract the ZIP file to a local directory
2. Follow the setup instructions in \`export/README_FOR_EXPORT.md\`

Remember to check \`export/important_files.txt\` to ensure all necessary files are included in your download.
`;
      
      fs.writeFileSync(instructionsPath, instructionsContent);
      console.log('✅ ZIP instructions created successfully');
      resolve();
    } catch (error) {
      console.error(`Error creating ZIP instructions: ${error.message}`);
      reject(error);
    }
  });
}

// Main function to run export preparation
async function prepareExportFiles() {
  try {
    // Create file list
    await createFileList();
    
    // Create export README
    await createExportReadme();
    
    // Create ZIP instructions
    await createZipInstructions();
    
    console.log('\n🎉 Export file preparation completed successfully!');
    console.log('\nTo download the project from Replit:');
    console.log('1. Read the instructions in export/HOW_TO_CREATE_ZIP.md');
    console.log('2. Follow the steps to download all necessary files');
    console.log('3. Use export/important_files.txt to verify all files are included');
    console.log('\nAfter downloading, follow the setup instructions in export/README_FOR_EXPORT.md');
  } catch (error) {
    console.error('❌ Export file preparation failed:', error);
  }
}

// Run the export file preparation
prepareExportFiles();