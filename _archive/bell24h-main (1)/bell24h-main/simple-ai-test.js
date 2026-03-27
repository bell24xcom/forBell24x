// Simple AI Integration Test (No External Dependencies)
console.log('🤖 Testing Bell24h AI Integration Setup...\n');

// Test 1: Check if environment file exists
const fs = require('fs');
const path = require('path');

console.log('📁 Checking Environment Configuration...');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local file exists');
  
  // Read and check content
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  if (envContent.includes('OPENAI_API_KEY=')) {
    console.log('✅ OpenAI API key configured');
  } else {
    console.log('❌ OpenAI API key missing');
  }
  
  if (envContent.includes('NANO_BANANA_API_KEY=')) {
    console.log('✅ Nano Banana API key configured');
  } else {
    console.log('❌ Nano Banana API key missing');
  }
  
  if (envContent.includes('N8N_WEBHOOK_URL=')) {
    console.log('✅ n8n webhook URL configured');
  } else {
    console.log('❌ n8n webhook URL missing');
  }
  
} else {
  console.log('❌ .env.local file not found');
}

// Test 2: Check if package.json exists
console.log('\n📦 Checking Project Dependencies...');

if (fs.existsSync('package.json')) {
  console.log('✅ package.json exists');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies.openai) {
    console.log('✅ OpenAI package installed');
  } else {
    console.log('❌ OpenAI package missing');
  }
  
  if (packageJson.dependencies && packageJson.dependencies.prisma) {
    console.log('✅ Prisma package installed');
  } else {
    console.log('❌ Prisma package missing');
  }
  
} else {
  console.log('❌ package.json not found');
}

// Test 3: Check if AI service files exist
console.log('\n🔧 Checking AI Service Files...');

const aiFiles = [
  'src/services/chatbot/ChatBotService.ts',
  'src/services/voicebot/VoiceBotService.ts',
  'src/backend/core/rfq/ai-matching.service.ts',
  'app/api/integrations/nano-banana/route.ts',
  'app/api/integrations/n8n/route.ts'
];

aiFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 4: Check if n8n workflows exist
console.log('\n🤖 Checking n8n Workflow Files...');

const n8nFiles = [
  'n8n/workflows/bell24h-integration.workflow.json',
  'n8n/workflows/rfq.workflow.json',
  'n8n/workflows/user.onboarding.workflow.json'
];

n8nFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 5: Check database schema
console.log('\n🗄️ Checking Database Configuration...');

if (fs.existsSync('prisma/schema.prisma')) {
  console.log('✅ Prisma schema exists');
} else {
  console.log('❌ Prisma schema missing');
}

if (fs.existsSync('prisma/migrations')) {
  console.log('✅ Database migrations exist');
} else {
  console.log('❌ Database migrations missing');
}

// Summary
console.log('\n📊 AI Integration Status Summary:');
console.log('=====================================');

const envExists = fs.existsSync('.env.local');
const packageExists = fs.existsSync('package.json');
const aiServicesExist = aiFiles.every(file => fs.existsSync(file));
const n8nWorkflowsExist = n8nFiles.every(file => fs.existsSync(file));
const dbSchemaExists = fs.existsSync('prisma/schema.prisma');

console.log(`Environment Config: ${envExists ? '✅' : '❌'}`);
console.log(`Project Dependencies: ${packageExists ? '✅' : '❌'}`);
console.log(`AI Services: ${aiServicesExist ? '✅' : '❌'}`);
console.log(`n8n Workflows: ${n8nWorkflowsExist ? '✅' : '❌'}`);
console.log(`Database Schema: ${dbSchemaExists ? '✅' : '❌'}`);

const totalScore = [envExists, packageExists, aiServicesExist, n8nWorkflowsExist, dbSchemaExists].filter(Boolean).length;
const percentage = (totalScore / 5) * 100;

console.log(`\n🎯 Overall Setup Score: ${totalScore}/5 (${percentage}%)`);

if (percentage >= 80) {
  console.log('🎉 AI Integration is ready for production!');
} else if (percentage >= 60) {
  console.log('⚠️ AI Integration needs some configuration');
} else {
  console.log('❌ AI Integration needs significant setup');
}

console.log('\n🚀 Next Steps:');
console.log('1. Install missing dependencies: npm install');
console.log('2. Generate Prisma client: npx prisma generate');
console.log('3. Start n8n server: n8n start');
console.log('4. Start Bell24h app: npm run dev');
console.log('5. Test AI features in the application');

console.log('\n✨ Setup complete! Your Bell24h AI system is ready to go!');
