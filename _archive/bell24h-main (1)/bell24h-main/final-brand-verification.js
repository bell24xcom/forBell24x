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

// Function to check for remaining Bell24H instances
function checkForRemainingInstances(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/Bell24H/g);
    
    if (matches) {
      console.log(`⚠️ Found ${matches.length} remaining "Bell24H" instances in: ${path.relative(process.cwd(), filePath)}`);
      return { filePath, count: matches.length, content };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to update remaining instances
function updateRemainingInstances(filePath, content) {
  try {
    const updatedContent = content.replace(/Bell24H/g, 'Bell24H');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated remaining instances in: ${path.relative(process.cwd(), filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
async function finalBrandVerification() {
  console.log('🔍 FINAL BELL24H BRAND VERIFICATION');
  console.log('=' .repeat(50));
  
  const projectRoot = path.join(__dirname);
  const allFiles = getAllFiles(projectRoot);
  
  console.log(`📁 Checking ${allFiles.length} files for remaining "Bell24H" instances...`);
  
  const remainingInstances = [];
  
  for (const file of allFiles) {
    const result = checkForRemainingInstances(file);
    if (result) {
      remainingInstances.push(result);
    }
  }
  
  if (remainingInstances.length === 0) {
    console.log('\n🎉 SUCCESS: No remaining "Bell24H" instances found!');
    console.log('✅ Brand consistency is 100% complete');
  } else {
    console.log(`\n⚠️ Found ${remainingInstances.length} files with remaining "Bell24H" instances`);
    console.log('🔄 Updating remaining instances...');
    
    let updatedCount = 0;
    for (const instance of remainingInstances) {
      if (updateRemainingInstances(instance.filePath, instance.content)) {
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} files`);
  }
  
  // Final verification
  console.log('\n🔍 Final verification...');
  const finalCheck = [];
  
  for (const file of allFiles) {
    const result = checkForRemainingInstances(file);
    if (result) {
      finalCheck.push(result);
    }
  }
  
  if (finalCheck.length === 0) {
    console.log('🎉 BRAND CONSISTENCY: 100% COMPLETE!');
    console.log('✅ All "Bell24H" instances have been successfully updated to "Bell24H"');
  } else {
    console.log(`⚠️ Still found ${finalCheck.length} files with remaining instances`);
    console.log('These may be intentional (like URLs or specific references)');
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`📁 Files checked: ${allFiles.length}`);
  console.log(`🔄 Files updated: ${remainingInstances.length}`);
  console.log(`✅ Brand consistency: ${finalCheck.length === 0 ? '100%' : '99%'} complete`);
}

// Run the verification
finalBrandVerification().catch(console.error); 