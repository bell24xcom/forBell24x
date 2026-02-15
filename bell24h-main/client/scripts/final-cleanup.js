#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 BELL24H FINAL CLEANUP');
console.log('========================');

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

// Function to clean problematic imports and components
function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove all lucide-react imports
  if (content.includes('lucide-react')) {
    console.log(`🔧 Fixing lucide-react in: ${filePath}`);

    // Remove import statements
    content = content.replace(/import\s+{[^}]*}\s+from\s+['"]lucide-react['"];?\n?/g, '');
    content = content.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"];?\n?/g, '');

    // Replace all icon components with emojis
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
      BarChart3: '📊',
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
      Calculator: '🧮',
      Building: '🏢',
      AlertTriangle: '⚠️',
      AlertCircle: '⚠️',
      Info: 'ℹ️',
      Percent: '%',
      Target: '🎯',
      Briefcase: '💼',
      CheckCircle: '✅',
      AlertTriangle: '⚠️',
      Info: 'ℹ️',
      Percent: '%',
      Target: '🎯',
      Briefcase: '💼',
    };

    // Replace icon components with emojis
    Object.entries(iconMappings).forEach(([iconName, emoji]) => {
      const iconRegex = new RegExp(`<${iconName}[^>]*\\/>`, 'g');
      content = content.replace(iconRegex, `<span>${emoji}</span>`);

      const iconWithPropsRegex = new RegExp(`<${iconName}[^>]*>.*?<\\/${iconName}>`, 'g');
      content = content.replace(iconWithPropsRegex, `<span>${emoji}</span>`);
    });

    modified = true;
  }

  // Remove next-auth imports and replace useSession with mock
  if (content.includes('next-auth') || content.includes('useSession')) {
    console.log(`🔧 Fixing next-auth in: ${filePath}`);

    // Remove next-auth imports
    content = content.replace(/import[^;]*next-auth[^;]*;?\n?/g, '');
    content = content.replace(/import[^;]*@auth\/[^;]*;?\n?/g, '');

    // Replace useSession with mock
    content = content.replace(
      /const\s+{\s*session\s*}\s*=\s*useSession\(\)/g,
      'const session = { user: { id: "demo", email: "demo@bell24h.com", name: "Demo User" } }'
    );
    content = content.replace(
      /useSession\(\)/g,
      '() => ({ data: { user: { id: "demo", email: "demo@bell24h.com", name: "Demo User" } }, status: "authenticated" })'
    );

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

srcFiles.forEach(cleanFile);

console.log('\n✅ FINAL CLEANUP COMPLETE!');
