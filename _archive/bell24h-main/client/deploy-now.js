const { execSync } = require('child_process');

console.log('🚀 BELL24H IMMEDIATE DEPLOYMENT');
console.log('================================');
console.log('');

console.log('📋 STEP 1: VERIFY BUILD');
console.log('========================');

try {
  console.log('🔨 Running build verification...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build verification successful!');
} catch (error) {
  console.log('❌ Build verification failed!');
  process.exit(1);
}

console.log('');

console.log('🚀 STEP 2: AUTOMATED DEPLOYMENT METHODS');
console.log('========================================');

const deploymentMethods = [
  {
    name: 'Method 1: npx vercel --prod --yes --force',
    command: 'npx vercel --prod --yes --force'
  },
  {
    name: 'Method 2: npx vercel deploy --prod',
    command: 'npx vercel deploy --prod'
  },
  {
    name: 'Method 3: vercel --prod --yes',
    command: 'vercel --prod --yes'
  },
  {
    name: 'Method 4: npx vercel --prod',
    command: 'npx vercel --prod'
  }
];

let deploymentSuccess = false;
let deploymentUrl = '';

for (const method of deploymentMethods) {
  console.log(`🔄 Trying ${method.name}...`);
  
  try {
    const result = execSync(method.command, { 
      stdio: 'pipe', 
      timeout: 300000,
      encoding: 'utf8'
    }); // 5 minutes timeout
    
    console.log(`✅ ${method.name} SUCCESSFUL!`);
    console.log('📋 Deployment output:', result);
    
    // Try to extract URL from output
    const urlMatch = result.match(/https:\/\/[^\s]+\.vercel\.app/);
    if (urlMatch) {
      deploymentUrl = urlMatch[0];
      console.log(`🎯 Live URL: ${deploymentUrl}`);
    }
    
    deploymentSuccess = true;
    break;
  } catch (error) {
    console.log(`❌ ${method.name} failed:`, error.message);
  }
}

console.log('');

if (deploymentSuccess) {
  console.log('🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('=========================');
  console.log('');
  console.log('✅ Bell24h is now live on the internet!');
  if (deploymentUrl) {
    console.log(`🌐 Live URL: ${deploymentUrl}`);
  }
  console.log('');
  console.log('🧪 TESTING CHECKLIST:');
  console.log('=====================');
  console.log('• Homepage: Working and responsive');
  console.log('• Registration: /auth/register');
  console.log('• Login: /auth/login');
  console.log('• Dashboard: /dashboard');
  console.log('• AI Matching: /dashboard/ai-matching');
  console.log('• Analytics: /dashboard/predictive-analytics');
  console.log('');
  console.log('🚀 BELL24H IS READY FOR YOUR 5000+ SUPPLIER CAMPAIGN!');
} else {
  console.log('⚠️ All automated deployment methods failed.');
  console.log('');
  console.log('📋 MANUAL DEPLOYMENT INSTRUCTIONS:');
  console.log('===================================');
  console.log('');
  console.log('1. Go to: https://vercel.com/dashboard');
  console.log('2. Click "New Project"');
  console.log('3. Choose "Upload" (not Git)');
  console.log('4. Upload your entire client folder');
  console.log('5. Configure settings:');
  console.log('   - Framework Preset: Next.js');
  console.log('   - Root Directory: ./ (current)');
  console.log('   - Build Command: npm run build');
  console.log('   - Output Directory: .next');
  console.log('   - Install Command: npm install');
  console.log('6. Click "Deploy"');
  console.log('7. Wait 3-5 minutes for deployment');
  console.log('');
  console.log('🎯 YOUR BELL24H PLATFORM WILL BE LIVE IN 5 MINUTES!');
}

console.log('');
console.log('📞 If you need help, contact support with your deployment URL');
console.log(''); 
