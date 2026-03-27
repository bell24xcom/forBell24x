const fs = require('fs');
const path = require('path');

class CSSConflictChecker {
  constructor() {
    this.conflicts = [];
    this.fixes = [];
  }

  // Check for common CSS conflicts
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for display property conflicts
      if (this.hasDisplayConflict(line)) {
        this.conflicts.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'display-conflict',
          severity: 'high'
        });
      }
      
      // Check for flexbox conflicts
      if (this.hasFlexConflict(line)) {
        this.conflicts.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'flex-conflict',
          severity: 'medium'
        });
      }
      
      // Check for position conflicts
      if (this.hasPositionConflict(line)) {
        this.conflicts.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          type: 'position-conflict',
          severity: 'medium'
        });
      }
    });
  }
  
  hasDisplayConflict(line) {
    // Check for multiple display properties
    const displayClasses = ['block', 'flex', 'inline-flex', 'inline-block', 'grid', 'table'];
    const foundClasses = displayClasses.filter(cls => 
      line.includes(`${cls}`) || line.includes(`lg:${cls}`) || line.includes(`md:${cls}`) || line.includes(`sm:${cls}`)
    );
    
    return foundClasses.length > 1;
  }
  
  hasFlexConflict(line) {
    // Check for conflicting flex classes
    const conflicts = [
      ['flex-row', 'flex-col'],
      ['justify-start', 'justify-center', 'justify-end'],
      ['items-start', 'items-center', 'items-end']
    ];
    
    return conflicts.some(conflictGroup => 
      conflictGroup.filter(cls => line.includes(cls)).length > 1
    );
  }
  
  hasPositionConflict(line) {
    // Check for position conflicts
    const positionClasses = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
    const foundClasses = positionClasses.filter(cls => line.includes(cls));
    
    return foundClasses.length > 1;
  }
  
  // Generate automatic fixes
  generateFixes() {
    this.conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'display-conflict':
          this.fixes.push({
            ...conflict,
            fix: this.fixDisplayConflict(conflict.content),
            explanation: 'Remove conflicting display properties, keep the most specific one'
          });
          break;
          
        case 'flex-conflict':
          this.fixes.push({
            ...conflict,
            fix: this.fixFlexConflict(conflict.content),
            explanation: 'Resolve conflicting flex properties'
          });
          break;
          
        case 'position-conflict':
          this.fixes.push({
            ...conflict,
            fix: this.fixPositionConflict(conflict.content),
            explanation: 'Remove conflicting position properties'
          });
          break;
      }
    });
  }
  
  fixDisplayConflict(line) {
    // Priority: flex > grid > block > inline-flex > inline-block
    if (line.includes('flex') && !line.includes('inline-flex')) {
      return line.replace(/\b(block|grid|inline-block|table)\b/g, '').replace(/\s+/g, ' ').trim();
    }
    if (line.includes('grid')) {
      return line.replace(/\b(block|flex|inline-flex|inline-block|table)\b/g, '').replace(/\s+/g, ' ').trim();
    }
    return line;
  }
  
  fixFlexConflict(line) {
    // Keep the last specified value for each property
    const flexDirections = ['flex-row', 'flex-col'];
    const justifyOptions = ['justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around'];
    const alignOptions = ['items-start', 'items-center', 'items-end', 'items-stretch'];
    
    let fixed = line;
    
    [flexDirections, justifyOptions, alignOptions].forEach(group => {
      const found = group.filter(cls => fixed.includes(cls));
      if (found.length > 1) {
        // Keep the last one
        const keep = found[found.length - 1];
        found.slice(0, -1).forEach(remove => {
          fixed = fixed.replace(new RegExp(`\\b${remove}\\b`, 'g'), '');
        });
      }
    });
    
    return fixed.replace(/\s+/g, ' ').trim();
  }
  
  fixPositionConflict(line) {
    const positions = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
    const found = positions.filter(pos => line.includes(pos));
    
    if (found.length > 1) {
      // Keep the most specific (absolute > fixed > relative > sticky > static)
      const priority = ['absolute', 'fixed', 'relative', 'sticky', 'static'];
      const keep = priority.find(pos => found.includes(pos));
      
      positions.filter(pos => pos !== keep).forEach(remove => {
        line = line.replace(new RegExp(`\\b${remove}\\b`, 'g'), '');
      });
    }
    
    return line.replace(/\s+/g, ' ').trim();
  }
  
  // Apply fixes automatically
  applyFixes() {
    const fileFixMap = new Map();
    
    // Group fixes by file
    this.fixes.forEach(fix => {
      if (!fileFixMap.has(fix.file)) {
        fileFixMap.set(fix.file, []);
      }
      fileFixMap.get(fix.file).push(fix);
    });
    
    // Apply fixes to each file
    fileFixMap.forEach((fileFixes, filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      
      // Sort fixes by line number (descending) to avoid line number shifts
      fileFixes.sort((a, b) => b.line - a.line);
      
      fileFixes.forEach(fix => {
        if (lines[fix.line - 1]) {
          lines[fix.line - 1] = lines[fix.line - 1].replace(fix.content, fix.fix);
        }
      });
      
      // Write back to file
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`✅ Fixed ${fileFixes.length} conflicts in ${filePath}`);
    });
  }
  
  // Generate report
  generateReport() {
    console.log('\n🔍 CSS CONFLICT ANALYSIS REPORT');
    console.log('================================');
    
    if (this.conflicts.length === 0) {
      console.log('✅ No CSS conflicts found!');
      return;
    }
    
    console.log(`❌ Found ${this.conflicts.length} CSS conflicts:\n`);
    
    this.conflicts.forEach((conflict, index) => {
      console.log(`${index + 1}. ${conflict.type.toUpperCase()}`);
      console.log(`   File: ${conflict.file}`);
      console.log(`   Line: ${conflict.line}`);
      console.log(`   Content: ${conflict.content}`);
      console.log(`   Severity: ${conflict.severity}`);
      console.log('');
    });
    
    if (this.fixes.length > 0) {
      console.log('\n🛠️ SUGGESTED FIXES:');
      console.log('===================');
      
      this.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.explanation}`);
        console.log(`   Original: ${fix.content}`);
        console.log(`   Fixed: ${fix.fix}`);
        console.log('');
      });
    }
  }
}

// Main execution
function checkCSSConflicts() {
  const checker = new CSSConflictChecker();
  
  // Check specific files or directories
  const filesToCheck = [
    'src/components/Navigation.tsx',
    'src/components/GlobalNavigation.tsx',
    'src/app/layout.tsx',
    // Add more files as needed
  ];
  
  console.log('🔍 Checking CSS conflicts in Bell24h components...\n');
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Checking ${file}...`);
      checker.checkFile(file);
    }
  });
  
  checker.generateFixes();
  checker.generateReport();
  
  // Ask if user wants to apply fixes
  if (checker.fixes.length > 0) {
    console.log('\n❓ Would you like to apply these fixes automatically? (y/N)');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Apply fixes? ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🔧 Applying fixes...');
        checker.applyFixes();
        console.log('✅ All fixes applied successfully!');
      } else {
        console.log('❌ Fixes not applied. Manual intervention required.');
      }
      rl.close();
    });
  }
}

// Export for use in other scripts
module.exports = { CSSConflictChecker, checkCSSConflicts };

// Run if called directly
if (require.main === module) {
  checkCSSConflicts();
} 
