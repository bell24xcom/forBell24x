#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 BELL24H DEPLOYMENT CLEANUP');
console.log('==============================');

// Function to recursively find all TypeScript/JavaScript files
function findTsJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !['node_modules', '.next', 'dist', 'build'].includes(file)) {
      findTsJsFiles(filePath, fileList);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to clean problematic imports
function cleanImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove lucide-react imports and replace with emojis
  if (content.includes('lucide-react')) {
    console.log(`🔧 Fixing lucide-react in: ${filePath}`);

    // Common icon mappings
    const iconMappings = {
      Search: '🔍',
      User: '👤',
      Users: '👥',
      Mail: '📧',
      Phone: '📞',
      Lock: '🔒',
      Eye: '👁️',
      EyeOff: '🙈',
      Bell: '🔔',
      Settings: '⚙️',
      LogOut: '🚪',
      Home: '🏠',
      Star: '⭐',
      Heart: '❤️',
      Plus: '➕',
      Minus: '➖',
      Check: '✅',
      X: '❌',
      ChevronRight: '▶️',
      ChevronLeft: '◀️',
      ArrowRight: '→',
      ArrowLeft: '←',
      ArrowUp: '↑',
      ArrowDown: '↓',
      Calendar: '📅',
      Clock: '🕐',
      MapPin: '📍',
      Globe: '🌍',
      Shield: '🛡️',
      Zap: '⚡',
      Truck: '🚚',
      Package: '📦',
      ShoppingCart: '🛒',
      CreditCard: '💳',
      DollarSign: '$',
      TrendingUp: '📈',
      TrendingDown: '📉',
      BarChart: '📊',
      PieChart: '🥧',
      Activity: '📊',
      Download: '⬇️',
      Upload: '⬆️',
      File: '📄',
      Folder: '📁',
      Image: '🖼️',
      Video: '🎥',
      Music: '🎵',
      Mic: '🎤',
      Camera: '📷',
      Edit: '✏️',
      Trash: '🗑️',
      Save: '💾',
      Copy: '📋',
      Share: '📤',
      Link: '🔗',
      ExternalLink: '🔗',
      Menu: '☰',
      MoreHorizontal: '⋯',
      MoreVertical: '⋮',
      Grid: '▦',
      List: '☰',
      Filter: '🔽',
      Sort: '🔀',
      Refresh: '🔄',
      Power: '⚡',
      Wifi: '📶',
      Battery: '🔋',
      Volume: '🔊',
      Play: '▶️',
      Pause: '⏸️',
      Stop: '⏹️',
      FastForward: '⏩',
      Rewind: '⏪',
      SkipForward: '⏭️',
      SkipBack: '⏮️',
    };

    // Remove import statements
    content = content.replace(/import\s+{[^}]*}\s+from\s+['"]lucide-react['"];?\n?/g, '');
    content = content.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"];?\n?/g, '');

    // Replace icon components with emojis
    Object.entries(iconMappings).forEach(([iconName, emoji]) => {
      const iconRegex = new RegExp(`<${iconName}[^>]*\\/>`, 'g');
      content = content.replace(iconRegex, `<span>${emoji}</span>`);

      const iconWithPropsRegex = new RegExp(`<${iconName}[^>]*>.*?<\\/${iconName}>`, 'g');
      content = content.replace(iconWithPropsRegex, `<span>${emoji}</span>`);
    });

    modified = true;
  }

  // Remove next-auth imports
  if (content.includes('next-auth')) {
    console.log(`🔧 Fixing next-auth in: ${filePath}`);
    content = content.replace(/import[^;]*next-auth[^;]*;?\n?/g, '');
    content = content.replace(/import[^;]*@auth\/[^;]*;?\n?/g, '');
    modified = true;
  }

  // Remove @mui/icons-material imports
  if (content.includes('@mui/icons-material')) {
    console.log(`🔧 Fixing @mui/icons-material in: ${filePath}`);
    content = content.replace(/import[^;]*@mui\/icons-material[^;]*;?\n?/g, '');
    modified = true;
  }

  // Remove @radix-ui imports
  if (content.includes('@radix-ui')) {
    console.log(`🔧 Fixing @radix-ui in: ${filePath}`);
    content = content.replace(/import[^;]*@radix-ui[^;]*;?\n?/g, '');
    modified = true;
  }

  // Remove razorpay imports
  if (content.includes('razorpay')) {
    console.log(`🔧 Fixing razorpay in: ${filePath}`);
    content = content.replace(/import[^;]*razorpay[^;]*;?\n?/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// Clean all files in src directory
const srcFiles = findTsJsFiles('./src');
console.log(`\n🔍 Found ${srcFiles.length} files to check...`);

srcFiles.forEach(cleanImports);

console.log('\n✅ CLEANUP COMPLETE!');
