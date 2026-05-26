import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to recursively find all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      // Only process text files
      const ext = path.extname(file).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.txt', '.yml', '.yaml', '.env', '.sh', '.bat'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

// Function to update file content
function updateFileContent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace Bell24h with Bell24h (case-sensitive)
    content = content.replace(/Bell24h/g, 'Bell24h');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
async function updateBrandConsistency() {
  console.log('🚀 BELL24H BRAND CONSISTENCY UPDATE');
  console.log('=' .repeat(50));
  
  const projectRoot = path.join(__dirname);
  const allFiles = getAllFiles(projectRoot);
  
  console.log(`📁 Found ${allFiles.length} files to check...`);
  
  let updatedCount = 0;
  const updatedFiles = [];
  
  for (const file of allFiles) {
    if (updateFileContent(file)) {
      updatedCount++;
      updatedFiles.push(file);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 UPDATE SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Files updated: ${updatedCount}`);
  console.log(`📁 Total files checked: ${allFiles.length}`);
  
  if (updatedFiles.length > 0) {
    console.log('\n📝 Updated files:');
    updatedFiles.forEach(file => {
      console.log(`   • ${path.relative(projectRoot, file)}`);
    });
  }
  
  console.log('\n🎯 Brand consistency update complete!');
  console.log('💡 All "Bell24h" instances have been updated to "Bell24h"');
}

// Run the update
updateBrandConsistency().catch(console.error); 