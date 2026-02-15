const fs = require('fs');
const path = require('path');

// Function to find all .tsx files recursively
function findTSXFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next' && file !== 'out' && file !== 'dist' && file !== 'build') {
        findTSXFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix unescaped entities in JSX
function fixUnescapedEntities(content) {
  let fixed = content;
  let changes = 0;
  
  // Fix apostrophes in text content (not in code/strings)
  // Match apostrophes that are inside JSX text content, not in code blocks
  fixed = fixed.replace(/(>[^<]*)(['])([^']*?)(['])([^<]*<)/g, (match, before, apos1, text, apos2, after) => {
    // Only replace if it's likely text content, not code
    if (!text.includes('{') && !text.includes('}') && text.length < 100) {
      changes++;
      return before + text.replace(/'/g, '&apos;') + after;
    }
    return match;
  });
  
  // More aggressive: fix standalone apostrophes in JSX children that aren't in expressions
  fixed = fixed.replace(/(>)([^<>{}]*?)'([^<>{}]*?)(<)/g, (match, open, before, after, close) => {
    // Skip if contains { or } (likely JSX expression)
    if (!before.includes('{') && !after.includes('}') && !before.includes('}') && !after.includes('{')) {
      changes++;
      return open + before + '&apos;' + after + close;
    }
    return match;
  });
  
  // Fix common contractions and possessives
  const contractions = [
    { pattern: /(>)([^<>]*?)can't([^<>]*?)(<)/g, replacement: '$2can&apos;t$3' },
    { pattern: /(>)([^<>]*?)don't([^<>]*?)(<)/g, replacement: '$2don&apos;t$3' },
    { pattern: /(>)([^<>]*?)won't([^<>]*?)(<)/g, replacement: '$2won&apos;t$3' },
    { pattern: /(>)([^<>]*?)it's([^<>]*?)(<)/g, replacement: '$2it&apos;s$3' },
    { pattern: /(>)([^<>]*?)you're([^<>]*?)(<)/g, replacement: '$2you&apos;re$3' },
    { pattern: /(>)([^<>]*?)we're([^<>]*?)(<)/g, replacement: '$2we&apos;re$3' },
    { pattern: /(>)([^<>]*?)I'm([^<>]*?)(<)/g, replacement: '$2I&apos;m$3' },
  ];
  
  contractions.forEach(({ pattern, replacement }) => {
    if (pattern.test(fixed)) {
      fixed = fixed.replace(pattern, replacement);
      changes++;
    }
  });
  
  return { content: fixed, changes };
}

// Main execution
console.log('🔍 Scanning for unescaped entities in JSX...\n');

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
let totalChanges = 0;

allFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixUnescapedEntities(content);
    
    if (result.changes > 0) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      fixedCount++;
      totalChanges += result.changes;
      console.log(`✅ ${path.relative(__dirname, filePath)} - Fixed ${result.changes} entities`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n✅ Complete!`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Total entities fixed: ${totalChanges}`);

