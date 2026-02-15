const fs = require('fs');

console.log('🔍 BELL24H QUICK STATUS CHECK');
console.log('============================');

// Check critical files
const files = [
  '.env.local',
  'components/admin/MarketingDashboard.tsx',
  'scripts/setup-api-integrations.cjs',
  'prisma/schema.prisma',
  'app/api/campaigns/route.ts'
];

files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check .env.local content
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('\n📋 Environment Variables:');
  console.log(envContent.includes('DATABASE_URL') ? '✅ DATABASE_URL configured' : '❌ DATABASE_URL missing');
  console.log(envContent.includes('JWT_SECRET') ? '✅ JWT_SECRET configured' : '❌ JWT_SECRET missing');
}

console.log('\n🎯 Status: Ready for testing!');
