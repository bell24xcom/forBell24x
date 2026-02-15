const fs = require('fs');
const path = require('path');

// Create deployment package
const deployDir = 'netlify-deploy';

// Ensure deploy directory exists
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy essential files
const filesToCopy = [
  'package.json',
  'next.config.js',
  'postcss.config.cjs',
  'tailwind.config.js'
];

const dirsToCopy = [
  'app',
  'components',
  'lib',
  'public'
];

// Copy files
filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(deployDir, file));
    console.log(`Copied ${file}`);
  }
});

// Copy directories
dirsToCopy.forEach(dir => {
  if (fs.existsSync(dir)) {
    copyDir(dir, path.join(deployDir, dir));
    console.log(`Copied directory ${dir}`);
  }
});

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Deployment package created successfully!');
console.log('Upload the netlify-deploy folder to Netlify');
