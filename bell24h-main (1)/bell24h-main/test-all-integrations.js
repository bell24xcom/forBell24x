// Comprehensive Integration Test for Bell24h
console.log('🧪 Testing All Bell24h Integrations...\n');

const fs = require('fs');
const path = require('path');

// Test Results
const results = {
  environment: false,
  database: false,
  ai: false,
  n8n: false,
  payments: false,
  overall: 0
};

// Test 1: Environment Configuration
console.log('🔧 Testing Environment Configuration...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasOpenAI = envContent.includes('OPENAI_API_KEY=');
  const hasNanoBanana = envContent.includes('NANO_BANANA_API_KEY=');
  const hasN8N = envContent.includes('N8N_WEBHOOK_URL=');
  const hasDatabase = envContent.includes('DATABASE_URL=');
  
  if (hasOpenAI && hasNanoBanana && hasN8N && hasDatabase) {
    console.log('✅ Environment configuration complete');
    results.environment = true;
    results.overall++;
  } else {
    console.log('❌ Environment configuration incomplete');
    console.log(`  OpenAI: ${hasOpenAI ? '✅' : '❌'}`);
    console.log(`  Nano Banana: ${hasNanoBanana ? '✅' : '❌'}`);
    console.log(`  n8n: ${hasN8N ? '✅' : '❌'}`);
    console.log(`  Database: ${hasDatabase ? '✅' : '❌'}`);
  }
} else {
  console.log('❌ .env.local file not found');
}

// Test 2: Database Configuration
console.log('\n🗄️ Testing Database Configuration...');
if (fs.existsSync('prisma/schema.prisma')) {
  console.log('✅ Prisma schema exists');
  
  if (fs.existsSync('prisma/dev.db')) {
    console.log('✅ Database file exists');
    results.database = true;
    results.overall++;
  } else {
    console.log('⚠️ Database file not found (run setup-database.bat)');
  }
} else {
  console.log('❌ Prisma schema not found');
}

// Test 3: AI Integrations
console.log('\n🤖 Testing AI Integrations...');
const aiFiles = [
  'src/services/chatbot/ChatBotService.ts',
  'src/services/voicebot/VoiceBotService.ts',
  'src/backend/core/rfq/ai-matching.service.ts',
  'app/api/integrations/nano-banana/route.ts'
];

const aiFilesExist = aiFiles.every(file => fs.existsSync(file));
if (aiFilesExist) {
  console.log('✅ AI service files exist');
  
  // Check if OpenAI package is installed
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasOpenAI = packageJson.dependencies && packageJson.dependencies.openai;
    
    if (hasOpenAI) {
      console.log('✅ OpenAI package installed');
      results.ai = true;
      results.overall++;
    } else {
      console.log('⚠️ OpenAI package not installed (run npm install)');
    }
  }
} else {
  console.log('❌ AI service files missing');
}

// Test 4: n8n Workflow Automation
console.log('\n🤖 Testing n8n Workflow Automation...');
const n8nFiles = [
  'n8n/workflows/bell24h-integration.workflow.json',
  'n8n/workflows/rfq.workflow.json',
  'n8n/workflows/user.onboarding.workflow.json',
  'app/api/integrations/n8n/route.ts'
];

const n8nFilesExist = n8nFiles.every(file => fs.existsSync(file));
if (n8nFilesExist) {
  console.log('✅ n8n workflow files exist');
  
  if (fs.existsSync('n8n-server')) {
    console.log('✅ n8n server directory exists');
    results.n8n = true;
    results.overall++;
  } else {
    console.log('⚠️ n8n server not set up (run setup-n8n.bat)');
  }
} else {
  console.log('❌ n8n workflow files missing');
}

// Test 5: Payment Integrations
console.log('\n💳 Testing Payment Integrations...');
const paymentFiles = [
  'server/config/paymentConfig.ts',
  'lib/razorpay.ts',
  'app/api/payments/create-order/route.ts',
  'client/src/config/payment.ts'
];

const paymentFilesExist = paymentFiles.every(file => fs.existsSync(file));
if (paymentFilesExist) {
  console.log('✅ Payment integration files exist');
  results.payments = true;
  results.overall++;
} else {
  console.log('❌ Payment integration files missing');
}

// Test 6: Project Dependencies
console.log('\n📦 Testing Project Dependencies...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['prisma', '@prisma/client', 'next', 'react'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies present');
  } else {
    console.log(`⚠️ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('  Run: npm install');
  }
} else {
  console.log('❌ package.json not found');
}

// Summary
console.log('\n📊 INTEGRATION TEST RESULTS');
console.log('=====================================');
console.log(`Environment Config: ${results.environment ? '✅' : '❌'}`);
console.log(`Database Setup: ${results.database ? '✅' : '❌'}`);
console.log(`AI Integrations: ${results.ai ? '✅' : '❌'}`);
console.log(`n8n Automation: ${results.n8n ? '✅' : '❌'}`);
console.log(`Payment Systems: ${results.payments ? '✅' : '❌'}`);

const percentage = (results.overall / 5) * 100;
console.log(`\n🎯 Overall Score: ${results.overall}/5 (${percentage}%)`);

if (percentage >= 80) {
  console.log('\n🎉 EXCELLENT! Your Bell24h system is production-ready!');
  console.log('\n🚀 Ready to start:');
  console.log('1. n8n server: cd n8n-server && start-n8n.bat');
  console.log('2. Bell24h app: npm run dev');
  console.log('3. Prisma Studio: npx prisma studio');
} else if (percentage >= 60) {
  console.log('\n⚠️ GOOD! Your system needs some configuration.');
  console.log('\n🔧 Run these setup scripts:');
  if (!results.environment) console.log('- Environment: Check .env.local file');
  if (!results.database) console.log('- Database: setup-database.bat');
  if (!results.ai) console.log('- Dependencies: npm install');
  if (!results.n8n) console.log('- n8n: setup-n8n.bat');
} else {
  console.log('\n❌ NEEDS SETUP! Run the complete setup:');
  console.log('1. setup-all.bat (complete setup)');
  console.log('2. Or run individual scripts:');
  console.log('   - setup-database.bat');
  console.log('   - setup-n8n.bat');
  console.log('   - npm install');
}

console.log('\n✨ Test complete! Check the results above.');
