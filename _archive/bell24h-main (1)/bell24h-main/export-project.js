/**
 * Bell24H Project Export Script
 * 
 * This script creates a comprehensive zip archive of the Bell24H project
 * that can be downloaded from Replit and deployed elsewhere.
 * 
 * Features:
 * 1. Creates a production build of the application
 * 2. Includes all necessary configuration files
 * 3. Excludes node_modules and other unnecessary files
 * 4. Creates a zip file that can be easily downloaded
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Starting Bell24H export process...');

// Create an export directory if it doesn't exist
if (!fs.existsSync('export')) {
  fs.mkdirSync('export');
  console.log('Created export directory');
}

// Function to build the project
function buildProject() {
  return new Promise((resolve, reject) => {
    console.log('Building the project...');
    
    // Run the build script
    exec('node build.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building project: ${error.message}`);
        return reject(error);
      }
      
      console.log(stdout);
      
      if (stderr) {
        console.error(`Build stderr: ${stderr}`);
      }
      
      console.log('✅ Project build completed successfully');
      resolve();
    });
  });
}

// Function to create a zip archive
function createZipArchive() {
  return new Promise((resolve, reject) => {
    console.log('Creating zip archive...');
    
    const output = fs.createWriteStream('export/bell24h-project.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Listen for archive events
    output.on('close', () => {
      console.log(`✅ Archive created successfully (${archive.pointer()} total bytes)`);
      resolve();
    });
    
    archive.on('error', (err) => {
      console.error(`Error creating archive: ${err}`);
      reject(err);
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Add build directory to the archive
    archive.directory('build/', 'bell24h');
    
    // Add important files from the root directory
    const rootFilesToInclude = [
      '.env',
      '.env.example',
      '.gitignore',
      'README.md',
      'package.json',
      'tsconfig.json',
      'drizzle.config.ts',
      'vite.config.js',
      'bell24h-unified-startup.js',
      'build.js',
      'file_list.txt'
    ];
    
    rootFilesToInclude.forEach(file => {
      if (fs.existsSync(file)) {
        archive.file(file, { name: `bell24h/${file}` });
      }
    });
    
    // Add source code directories (for reference and development)
    const directoriesToInclude = [
      'client/src',
      'server',
      'shared'
    ];
    
    directoriesToInclude.forEach(dir => {
      if (fs.existsSync(dir)) {
        archive.directory(dir, `bell24h/${dir}`);
      }
    });
    
    // Create file list for verification
    const fileListStream = fs.createWriteStream('file_list.txt');
    
    function writeFileList(dir, base = '') {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(base, file);
        
        if (fs.statSync(filePath).isDirectory()) {
          // Skip node_modules and other large directories that aren't needed
          if (file !== 'node_modules' && file !== '.git' && file !== '.cache') {
            fileListStream.write(`DIR: ${relativePath}\n`);
            writeFileList(filePath, relativePath);
          }
        } else {
          fileListStream.write(`FILE: ${relativePath}\n`);
        }
      });
    }
    
    writeFileList('.');
    fileListStream.end();
    
    // Wait for the file list to be written
    fileListStream.on('close', () => {
      // Add the file list to the archive
      archive.file('file_list.txt', { name: 'bell24h/file_list.txt' });
      
      // Finalize the archive
      archive.finalize();
    });
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

// Main export process
async function exportProject() {
  try {
    await checkDependencies();
    await buildProject();
    await createZipArchive();
    
    console.log('\n🎉 Export process completed successfully!');
    console.log('The complete project has been packaged into export/bell24h-project.zip');
    console.log('You can download this file from Replit and deploy it anywhere.');
  } catch (error) {
    console.error('❌ Export process failed:', error);
  }
}

// Start the export process
exportProject();