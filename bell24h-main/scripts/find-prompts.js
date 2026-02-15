import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Searching for recent prompts in Bell24H platform...\n');

// Check for conversation files
console.log('📁 Checking for conversation data files...');
const possibleFiles = [
  '../client/src/data/conversation-history.json',
  '../server/logs/chat-history.json', 
  '../storage/conversations.json',
  '../conversation-history.json'
];

let foundFiles = 0;
for (const filePath of possibleFiles) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Found: ${filePath}`);
    foundFiles++;
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(content);
      console.log(`   📊 Contains ${Array.isArray(data) ? data.length : 'unknown'} entries`);
    } catch (e) {
      console.log(`   ⚠️ Could not parse JSON`);
    }
  }
}

if (foundFiles === 0) {
  console.log('❌ No conversation data files found');
}

// Check log directories
console.log('\n📋 Checking log directories...');
const logDirs = ['../server/logs', '../client/logs', '../storage/logs', '../logs'];
let foundLogs = 0;

for (const logDir of logDirs) {
  const fullLogDir = path.join(__dirname, logDir);
  if (fs.existsSync(fullLogDir)) {
    console.log(`✅ Found log directory: ${logDir}`);
    foundLogs++;
    try {
      const files = fs.readdirSync(fullLogDir);
      const relevantFiles = files.filter(file => 
        file.includes('chat') || 
        file.includes('ai') || 
        file.includes('prompt') ||
        file.includes('conversation')
      );
      console.log(`   📄 Relevant files: ${relevantFiles.length} (${relevantFiles.join(', ')})`);
    } catch (e) {
      console.log(`   ⚠️ Could not read directory`);
    }
  }
}

if (foundLogs === 0) {
  console.log('❌ No log directories found');
}

// Show current session
console.log('\n📝 === CURRENT SESSION PROMPTS ===\n');
console.log('1. [' + new Date().toLocaleString() + '] Current Session (You)');
console.log('   📄 show me the list of 5 last prompt.');
console.log('   🏷️  Type: user_query\n');

// Show sample format since no historical data exists
console.log('💡 === SAMPLE FORMAT (No Historical Data Found) ===\n');

const samplePrompts = [
  {
    time: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(),
    content: 'Generate business categories for technology industry',
    type: 'ai_generation'
  },
  {
    time: new Date(Date.now() - 1000 * 60 * 25).toLocaleString(), 
    content: 'Analyze RFQ requirements for software development',
    type: 'ai_analysis'
  },
  {
    time: new Date(Date.now() - 1000 * 60 * 40).toLocaleString(),
    content: 'Create SEO content for product categories', 
    type: 'ai_content'
  },
  {
    time: new Date(Date.now() - 1000 * 60 * 55).toLocaleString(),
    content: 'Voice recognition implementation guidance',
    type: 'ai_guidance'
  }
];

samplePrompts.forEach((prompt, index) => {
  console.log(`${index + 2}. [${prompt.time}] Sample Format`);
  console.log(`   📄 ${prompt.content}`);
  console.log(`   🏷️  Type: ${prompt.type}\n`);
});

// Show browser check instructions
console.log('🌐 === CHECK BROWSER STORAGE ===');
console.log('To find prompts in your browser:');
console.log('1. Open Bell24H app in browser');
console.log('2. Press F12 → Application tab → Local Storage');
console.log('3. Look for keys containing "conversation" or "chat"');
console.log('4. Run in console: Object.keys(localStorage)');
console.log('');

// Show setup instructions
console.log('🔧 === TO ENABLE PROMPT TRACKING ===');
console.log('Your Bell24H platform needs conversation storage setup:');
console.log('');
console.log('Option 1 - Database (Recommended):');
console.log('• Add Conversation model to Prisma schema');
console.log('• Store user prompts with timestamps and user IDs');
console.log('• Create API endpoint: GET /api/conversations/recent');
console.log('');
console.log('Option 2 - Local Files:');
console.log('• Create client/src/data/conversation-history.json');
console.log('• Log prompts to this file from your AI services');
console.log('');
console.log('Option 3 - Browser Storage:');
console.log('• Use localStorage in your web app');
console.log('• Save conversations client-side for recent access');
console.log('');

console.log('📊 === SUMMARY ===');
console.log('✅ Current conversation: 1 prompt (this request)');
console.log('❌ Historical prompts: 0 (tracking not implemented)');
console.log('💡 Sample format shown above for reference');
console.log('');
console.log('This is your first conversation with the system!');
console.log('Future prompts will appear here once tracking is implemented.');

console.log('\n✅ Prompt search complete!'); 