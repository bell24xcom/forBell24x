import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Deploying Bell24h to Vercel...\n');

try {
  // Step 1: Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful!\n');

  // Step 2: Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  execSync('npx vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Deployment successful!\n');

  // Step 3: Get deployment URL
  console.log('🔗 Getting deployment URL...');
  const result = execSync('npx vercel ls', { encoding: 'utf8' });
  console.log('Deployment URLs:');
  console.log(result);

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
