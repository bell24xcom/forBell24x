const fs = require('fs');
const path = require('path');

// Common Lucide React icons that might be missing
const commonIcons = [
  'Brain', 'AlertTriangle', 'Info', 'ChevronUp', 'ChevronDown', 'MessageSquare',
  'Loader2', 'Target', 'Award', 'LineChart', 'IndianRupee', 'Building', 'AlertCircle',
  'CheckCircle', 'Eye', 'TrendingUp', 'Activity', 'TestTube', 'Security', 'LockOpen',
  'Warning', 'ExpandMore', 'ThumbsUp', 'ThumbsDown', 'ShoppingCart', 'Plus', 'Minus',
  'X', 'Search', 'Filter', 'Settings', 'User', 'Users', 'Mail', 'Phone', 'MapPin',
  'Calendar', 'Clock', 'DollarSign', 'CreditCard', 'Package', 'Truck', 'BarChart',
  'PieChart', 'TrendingDown', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft',
  'ChevronRight', 'ChevronLeft', 'MoreVertical', 'MoreHorizontal', 'Edit', 'Trash',
  'Save', 'Download', 'Upload', 'File', 'Folder', 'Image', 'Video', 'Mic', 'Camera',
  'Home', 'Star', 'Heart', 'Bookmark', 'Share', 'Copy', 'Check', 'XCircle', 'Alert',
  'Bell', 'Shield', 'Lock', 'Unlock', 'Refresh', 'Play', 'Pause', 'Stop', 'Skip',
  'FastForward', 'Rewind', 'Volume', 'Mute', 'Wifi', 'Bluetooth', 'Battery', 'Zap'
];

// Function to find all .tsx files recursively
function findTSXFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next' && file !== 'out' && file !== 'dist' && file !== 'build') {
        findTSXFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to extract icon names from file content
function findMissingIcons(content) {
  const missing = [];
  const iconPattern = /'([A-Z][a-zA-Z0-9]+)' is not defined/g;
  let match;
  
  while ((match = iconPattern.exec(content)) !== null) {
    const iconName = match[1];
    if (commonIcons.includes(iconName) || iconName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      missing.push(iconName);
    }
  }
  
  // Also check for JSX usage without imports
  commonIcons.forEach(icon => {
    const jsxPattern = new RegExp(`<${icon}[\\s/>]`, 'g');
    if (jsxPattern.test(content) && !content.includes(`import.*${icon}.*from`) && !content.includes(`from.*lucide-react.*${icon}`)) {
      if (!missing.includes(icon)) {
        missing.push(icon);
      }
    }
  });
  
  return [...new Set(missing)];
}

// Function to add imports to file
function addImports(filePath, missingIcons) {
  if (missingIcons.length === 0) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if lucide-react import already exists
  const lucideImportPattern = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
  const existingImport = content.match(lucideImportPattern);
  
  if (existingImport) {
    // Add to existing import
    const existingIcons = existingImport[1].split(',').map(i => i.trim()).filter(i => i);
    const allIcons = [...new Set([...existingIcons, ...missingIcons])].sort();
    const newImport = `import { ${allIcons.join(', ')} } from 'lucide-react';`;
    content = content.replace(lucideImportPattern, newImport);
  } else {
    // Add new import at the top after 'use client' if present
    const importLine = `import { ${missingIcons.sort().join(', ')} } from 'lucide-react';\n`;
    
    if (content.startsWith("'use client'")) {
      const lines = content.split('\n');
      lines.splice(1, 0, importLine.trim());
      content = lines.join('\n');
    } else {
      // Find first import and add before it
      const firstImportIndex = content.search(/^import\s+/m);
      if (firstImportIndex !== -1) {
        content = content.slice(0, firstImportIndex) + importLine + content.slice(firstImportIndex);
      } else {
        // No imports, add at the beginning
        content = importLine + content;
      }
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// Main execution
console.log('🔍 Scanning for missing Lucide React icon imports...\n');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(__dirname, 'components');
const appDir = path.join(__dirname, 'app');

const allDirs = [srcDir, componentsDir, appDir].filter(dir => fs.existsSync(dir));

let allFiles = [];
allDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(findTSXFiles(dir));
  }
});

console.log(`Found ${allFiles.length} TSX files to check\n`);

let fixedCount = 0;
let totalMissing = 0;

allFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missingIcons = findMissingIcons(content);
    
    if (missingIcons.length > 0) {
      console.log(`📝 ${path.relative(__dirname, filePath)}`);
      console.log(`   Missing: ${missingIcons.join(', ')}`);
      
      if (addImports(filePath, missingIcons)) {
        fixedCount++;
        totalMissing += missingIcons.length;
        console.log(`   ✅ Fixed!\n`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n✅ Complete!`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Total icons added: ${totalMissing}`);

