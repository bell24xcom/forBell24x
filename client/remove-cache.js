// Post-build script to remove cache directories for Cloudflare Pages
// This prevents the 25MB file size limit error

const fs = require('fs');
const path = require('path');

const cacheDirs = [
  path.join(__dirname, 'cache'),
  path.join(__dirname, '.next', 'cache'),
  path.join(__dirname, 'cache', 'webpack'),
  path.join(__dirname, 'cache', 'webpack', 'client-production'),
];

console.log('🧹 Removing cache directories for Cloudflare Pages...');

cacheDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed: ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not remove ${dir}: ${error.message}`);
    }
  }
});

console.log('✅ Cache cleanup complete!');

