const { execSync } = require('child_process');

console.log('Starting simplified build process...');

try {
  console.log('1. Installing dependencies...');
  execSync('npm install --silent', { stdio: 'inherit' });
  
  console.log('2. Generating Prisma client...');
  execSync('npx prisma generate --silent', { stdio: 'inherit' });
  
  console.log('3. Building Next.js application...');
  execSync('npx next build --no-lint', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
