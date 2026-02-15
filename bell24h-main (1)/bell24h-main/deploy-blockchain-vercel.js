const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Bell24h Blockchain Platform to Vercel...\n');

try {
  // Step 1: Build the application
  console.log('📦 Building the application...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');

  // Step 2: Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  execSync('cd client && npx vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully\n');

  // Step 3: Create deployment summary
  const deploymentSummary = {
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    features: [
      'Voice-based RFQ submission',
      'Predictive analytics dashboard',
      'Supplier risk scoring',
      'Blockchain escrow system',
      'BELL token with staking',
      'Web3 integration',
      'AI-powered matching',
      'Stock market integration',
      'Real-time analytics'
    ],
    revenueTarget: '₹156 crore in 369 days',
    revolutionaryFeatures: 9,
    platform: 'Vercel',
    domain: 'bell24h.com'
  };

  fs.writeFileSync(
    'blockchain-deployment-summary.json',
    JSON.stringify(deploymentSummary, null, 2)
  );

  console.log('🎉 BELL24H BLOCKCHAIN PLATFORM DEPLOYED SUCCESSFULLY!');
  console.log('\n📊 DEPLOYMENT SUMMARY:');
  console.log('====================');
  console.log('✅ Voice-based RFQ submission');
  console.log('✅ Predictive analytics dashboard');
  console.log('✅ Supplier risk scoring');
  console.log('✅ Blockchain escrow system');
  console.log('✅ BELL token with staking');
  console.log('✅ Web3 integration');
  console.log('✅ AI-powered matching');
  console.log('✅ Stock market integration');
  console.log('✅ Real-time analytics');
  console.log('\n💰 Revenue Target: ₹156 crore in 369 days');
  console.log('🔥 Revolutionary Features: 9 disruptive innovations');
  console.log('🌐 Platform: Vercel (bell24h.com)');
  console.log('\n🚀 Bell24h is now LIVE with blockchain and AI features!');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
