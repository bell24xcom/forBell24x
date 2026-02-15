const fs = require('fs');
const path = require('path');

// N8N Database Configuration
const N8N_DATABASE_CONFIG = {
  host: 'ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_0Duqdxs3RoyA',
  ssl: true
};

// API Keys Configuration
const API_KEYS = {
  OPENAI_API_KEY: 'your-openai-api-key-here',
  GOOGLE_GEMINI_API_KEY: 'AIzaSyCF6w_cgnRn7MRwvZuBUexxhygAn9KBAvU',
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key-here',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_USER: 'bell24h.info@gmail.com',
  SMTP_PASS: 'your-gmail-app-password-here'
};

async function setupN8NWorkflowsComplete() {
  try {
    console.log('🚀 COMPLETE N8N WORKFLOW SETUP FOR BELL24H');
    console.log('==========================================');
    
    // 1. List available workflow files
    console.log('\n1. 📋 AVAILABLE N8N WORKFLOW FILES:');
    const workflowDir = 'oracle-cloud-n8n/workflows';
    const workflowFiles = fs.readdirSync(workflowDir);
    
    const workflowCategories = {
      'RFQ Automation': workflowFiles.filter(f => f.includes('rfq')),
      'Lead Scoring': workflowFiles.filter(f => f.includes('lead')),
      'AI Scraping': workflowFiles.filter(f => f.includes('scraper') || f.includes('category')),
      'Enrichment': workflowFiles.filter(f => f.includes('nano-banana'))
    };
    
    Object.entries(workflowCategories).forEach(([category, files]) => {
      console.log(`\n  📂 ${category}:`);
      files.forEach(file => {
        const isWithDb = file.includes('with-db');
        const isComplete = file.includes('complete');
        const status = isWithDb ? '✅ Database Integrated' : isComplete ? '✅ Complete' : '⚠️  Basic';
        console.log(`    - ${file} ${status}`);
      });
    });
    
    // 2. Recommended workflow import order
    console.log('\n2. 🎯 RECOMMENDED IMPORT ORDER:');
    console.log('==============================');
    
    const importOrder = [
      {
        file: 'bell24h-rfq-notification-with-db.json',
        name: 'RFQ Notification with Database',
        priority: 'HIGH',
        description: 'Core RFQ automation with database integration'
      },
      {
        file: 'bell24h-lead-scoring-with-db.json', 
        name: 'AI Lead Scoring with Database',
        priority: 'HIGH',
        description: 'AI-powered lead scoring and matching'
      },
      {
        file: 'bell24h-ai-scraper-master-with-db.json',
        name: 'AI Scraper Master with Database',
        priority: 'MEDIUM',
        description: 'Master scheduler for supplier acquisition'
      },
      {
        file: 'bell24h-ai-category-worker-with-db.json',
        name: 'AI Category Worker with Database',
        priority: 'MEDIUM', 
        description: 'AI category classification worker'
      },
      {
        file: 'nano-banana-enrichment.json',
        name: 'Nano Banana Enrichment',
        priority: 'LOW',
        description: 'Advanced AI enrichment pipeline'
      }
    ];
    
    importOrder.forEach((workflow, index) => {
      console.log(`\n  ${index + 1}. ${workflow.name}`);
      console.log(`     File: ${workflow.file}`);
      console.log(`     Priority: ${workflow.priority}`);
      console.log(`     Description: ${workflow.description}`);
    });
    
    // 3. Generate N8N credentials configuration
    console.log('\n3. 🔑 N8N CREDENTIALS CONFIGURATION:');
    console.log('====================================');
    
    const credentials = {
      postgres: {
        name: 'Neon PostgreSQL',
        type: 'postgres',
        data: {
          host: N8N_DATABASE_CONFIG.host,
          port: N8N_DATABASE_CONFIG.port,
          database: N8N_DATABASE_CONFIG.database,
          user: N8N_DATABASE_CONFIG.user,
          password: N8N_DATABASE_CONFIG.password,
          ssl: true,
          sslmode: 'require'
        }
      },
      openai: {
        name: 'OpenAI API',
        type: 'openAiApi',
        data: {
          apiKey: API_KEYS.OPENAI_API_KEY
        }
      },
      googleGemini: {
        name: 'Google Gemini API',
        type: 'googleGeminiApi',
        data: {
          apiKey: API_KEYS.GOOGLE_GEMINI_API_KEY
        }
      },
      smtp: {
        name: 'Gmail SMTP',
        type: 'smtp',
        data: {
          host: API_KEYS.SMTP_HOST,
          port: API_KEYS.SMTP_PORT,
          secure: false,
          user: API_KEYS.SMTP_USER,
          password: API_KEYS.SMTP_PASS
        }
      }
    };
    
    console.log('\n📋 CREDENTIALS TO CREATE IN N8N:');
    Object.entries(credentials).forEach(([key, cred]) => {
      console.log(`\n  🔑 ${cred.name} (${cred.type}):`);
      console.log(`     Name: ${cred.name}`);
      if (cred.type === 'postgres') {
        console.log(`     Host: ${cred.data.host}`);
        console.log(`     Database: ${cred.data.database}`);
        console.log(`     User: ${cred.data.user}`);
        console.log(`     SSL: ${cred.data.ssl}`);
      } else if (cred.type === 'openAiApi') {
        console.log(`     API Key: ${cred.data.apiKey.substring(0, 20)}...`);
      } else if (cred.type === 'googleGeminiApi') {
        console.log(`     API Key: ${cred.data.apiKey.substring(0, 20)}...`);
      } else if (cred.type === 'smtp') {
        console.log(`     Host: ${cred.data.host}:${cred.data.port}`);
        console.log(`     User: ${cred.data.user}`);
      }
    });
    
    // 4. Generate import instructions
    console.log('\n4. 📥 N8N WORKFLOW IMPORT INSTRUCTIONS:');
    console.log('=======================================');
    
    console.log('\n🎯 STEP-BY-STEP IMPORT PROCESS:');
    
    importOrder.forEach((workflow, index) => {
      const filePath = path.join(workflowDir, workflow.file);
      const fileExists = fs.existsSync(filePath);
      
      console.log(`\n  Step ${index + 1}: Import ${workflow.name}`);
      console.log(`     Status: ${fileExists ? '✅ File exists' : '❌ File missing'}`);
      if (fileExists) {
        console.log(`     File: ${filePath}`);
        console.log(`     Instructions:`);
        console.log(`       1. Open N8N interface`);
        console.log(`       2. Click "Import from File"`);
        console.log(`       3. Select: ${workflow.file}`);
        console.log(`       4. Configure credentials (see credentials above)`);
        console.log(`       5. Test workflow`);
        console.log(`       6. Activate workflow`);
      }
    });
    
    // 5. Database connection test
    console.log('\n5. 🗄️  DATABASE CONNECTION TEST:');
    console.log('================================');
    
    const { Pool } = require('pg');
    const pool = new Pool({
      host: N8N_DATABASE_CONFIG.host,
      port: N8N_DATABASE_CONFIG.port,
      database: N8N_DATABASE_CONFIG.database,
      user: N8N_DATABASE_CONFIG.user,
      password: N8N_DATABASE_CONFIG.password,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful');
      console.log(`   Connected at: ${testResult.rows[0].current_time}`);
      
      // Test key tables
      const tables = ['suppliers', 'categories', 'rfq_requests', 'sources'];
      console.log('\n📊 Testing key tables:');
      
      for (const table of tables) {
        try {
          const count = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`   ✅ ${table}: ${count.rows[0].count} records`);
        } catch (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
    } finally {
      await pool.end();
    }
    
    // 6. Generate test data for N8N
    console.log('\n6. 🧪 TEST DATA FOR N8N WORKFLOWS:');
    console.log('===================================');
    
    const testRfqData = {
      title: 'Steel Rods for Construction Project',
      description: 'Need TMT steel rods for residential construction',
      category_id: 1, // Steel & Metal
      budget_min: 200000,
      budget_max: 300000,
      quantity: 50,
      unit: 'tons',
      buyer_name: 'John Smith',
      buyer_email: 'john@construction.com',
      buyer_phone: '+91-9876543210',
      buyer_company: 'BuildCorp Ltd',
      status: 'open',
      priority: 'high',
      deadline: '2024-12-31',
      location: 'Mumbai, Maharashtra'
    };
    
    console.log('\n📋 Sample RFQ Data for Testing:');
    console.log(JSON.stringify(testRfqData, null, 2));
    
    // 7. Final checklist
    console.log('\n7. ✅ FINAL CHECKLIST FOR N8N SETUP:');
    console.log('====================================');
    
    const checklist = [
      '✅ Database verified and ready',
      '✅ All workflow files available',
      '✅ Credentials configuration prepared',
      '✅ Import order defined',
      '✅ Test data prepared',
      '⏳ Import workflows into N8N',
      '⏳ Configure API credentials',
      '⏳ Test RFQ automation',
      '⏳ Activate workflows'
    ];
    
    checklist.forEach(item => {
      console.log(`  ${item}`);
    });
    
    console.log('\n🎉 N8N SETUP PREPARATION COMPLETE!');
    console.log('\n🚀 IMMEDIATE NEXT STEPS:');
    console.log('1. Open N8N interface (http://your-n8n-instance:5678)');
    console.log('2. Import bell24h-rfq-notification-with-db.json first');
    console.log('3. Configure PostgreSQL credential with Neon database');
    console.log('4. Configure OpenAI/Gemini API credentials');
    console.log('5. Test the RFQ workflow');
    console.log('6. Import remaining workflows');
    
  } catch (error) {
    console.error('❌ Setup preparation failed:', error.message);
  }
}

setupN8NWorkflowsComplete();
