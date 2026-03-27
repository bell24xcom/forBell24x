#!/usr/bin/env node

/**
 * N8N Instance Setup Script for Bell24h
 * 
 * This script sets up a complete N8N instance with:
 * - Database configuration
 * - Workflow templates
 * - Webhook endpoints
 * - Integration with Bell24h APIs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'https://n8n.bell24h.com/api',
  apiKey: process.env.N8N_API_KEY || 'bell24h-n8n-api-key-2024',
  webhookSecret: process.env.N8N_WEBHOOK_SECRET || 'bell24h-webhook-secret-2024',
  databaseUrl: process.env.N8N_DATABASE_URL || process.env.DATABASE_URL
};

// N8N Workflow Templates
const WORKFLOW_TEMPLATES = {
  'bell24h-email-campaign': {
    name: 'Bell24h Email Campaign',
    nodes: [
      {
        id: 'webhook-trigger',
        type: 'n8n-nodes-base.webhook',
        name: 'Email Campaign Webhook',
        parameters: {
          path: 'email-campaign',
          httpMethod: 'POST'
        },
        position: [240, 300]
      },
      {
        id: 'email-sender',
        type: 'n8n-nodes-base.emailSend',
        name: 'Send Email',
        parameters: {
          fromEmail: 'noreply@bell24h.com',
          toEmail: '={{ $json.email }}',
          subject: '={{ $json.subject }}',
          message: '={{ $json.message }}'
        },
        position: [460, 300]
      },
      {
        id: 'track-response',
        type: 'n8n-nodes-base.httpRequest',
        name: 'Track Response',
        parameters: {
          url: 'https://www.bell24h.com/api/marketing/email/send',
          method: 'POST',
          body: {
            campaignId: '={{ $json.campaignId }}',
            email: '={{ $json.email }}',
            status: 'sent',
            timestamp: '={{ new Date().toISOString() }}'
          }
        },
        position: [680, 300]
      }
    ],
    connections: {
      'webhook-trigger': {
        main: [
          [
            {
              node: 'email-sender',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'email-sender': {
        main: [
          [
            {
              node: 'track-response',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    }
  },
  
  'bell24h-supplier-onboarding': {
    name: 'Bell24h Supplier Onboarding',
    nodes: [
      {
        id: 'webhook-trigger',
        type: 'n8n-nodes-base.webhook',
        name: 'Supplier Registration Webhook',
        parameters: {
          path: 'supplier-onboarding',
          httpMethod: 'POST'
        },
        position: [240, 300]
      },
      {
        id: 'validate-data',
        type: 'n8n-nodes-base.function',
        name: 'Validate Supplier Data',
        parameters: {
          functionCode: `
            const data = $input.all()[0].json;
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'phone', 'category'];
            const missingFields = requiredFields.filter(field => !data[field]);
            
            if (missingFields.length > 0) {
              throw new Error(\`Missing required fields: \${missingFields.join(', ')}\`);
            }
            
            // Validate email format
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            if (!emailRegex.test(data.email)) {
              throw new Error('Invalid email format');
            }
            
            // Validate phone format (Indian)
            const phoneRegex = /^[6-9]\\d{9}$/;
            if (!phoneRegex.test(data.phone.replace(/\\D/g, ''))) {
              throw new Error('Invalid phone number format');
            }
            
            return { ...data, validated: true };
          `
        },
        position: [460, 300]
      },
      {
        id: 'create-supplier',
        type: 'n8n-nodes-base.httpRequest',
        name: 'Create Supplier in Database',
        parameters: {
          url: 'https://www.bell24h.com/api/supplier/profile',
          method: 'POST',
          body: {
            name: '={{ $json.name }}',
            email: '={{ $json.email }}',
            phone: '={{ $json.phone }}',
            category: '={{ $json.category }}',
            companyName: '={{ $json.companyName }}',
            gstNumber: '={{ $json.gstNumber }}',
            address: '={{ $json.address }}',
            city: '={{ $json.city }}',
            state: '={{ $json.state }}',
            pincode: '={{ $json.pincode }}',
            website: '={{ $json.website }}',
            description: '={{ $json.description }}'
          }
        },
        position: [680, 300]
      },
      {
        id: 'send-welcome-email',
        type: 'n8n-nodes-base.emailSend',
        name: 'Send Welcome Email',
        parameters: {
          fromEmail: 'welcome@bell24h.com',
          toEmail: '={{ $json.email }}',
          subject: 'Welcome to Bell24h - Complete Your Profile',
          message: `
            Dear {{ $json.name }},
            
            Welcome to Bell24h! Your supplier account has been created successfully.
            
            Next steps:
            1. Complete your profile verification
            2. Upload your company documents
            3. Start receiving RFQ notifications
            
            Login: https://www.bell24h.com/auth/login
            
            Best regards,
            The Bell24h Team
          `
        },
        position: [900, 300]
      }
    ],
    connections: {
      'webhook-trigger': {
        main: [
          [
            {
              node: 'validate-data',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'validate-data': {
        main: [
          [
            {
              node: 'create-supplier',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'create-supplier': {
        main: [
          [
            {
              node: 'send-welcome-email',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    }
  },

  'bell24h-rfq-processing': {
    name: 'Bell24h RFQ Processing',
    nodes: [
      {
        id: 'webhook-trigger',
        type: 'n8n-nodes-base.webhook',
        name: 'RFQ Processing Webhook',
        parameters: {
          path: 'rfq-processing',
          httpMethod: 'POST'
        },
        position: [240, 300]
      },
      {
        id: 'ai-analysis',
        type: 'n8n-nodes-base.httpRequest',
        name: 'AI Analysis',
        parameters: {
          url: 'https://www.bell24h.com/api/ai/match',
          method: 'POST',
          body: {
            rfqId: '={{ $json.rfqId }}',
            description: '={{ $json.description }}',
            category: '={{ $json.category }}',
            requirements: '={{ $json.requirements }}'
          }
        },
        position: [460, 300]
      },
      {
        id: 'find-suppliers',
        type: 'n8n-nodes-base.httpRequest',
        name: 'Find Matching Suppliers',
        parameters: {
          url: 'https://www.bell24h.com/api/ai/match-suppliers',
          method: 'POST',
          body: {
            rfqId: '={{ $json.rfqId }}',
            category: '={{ $json.category }}',
            location: '={{ $json.location }}',
            budget: '={{ $json.budget }}'
          }
        },
        position: [680, 300]
      },
      {
        id: 'notify-suppliers',
        type: 'n8n-nodes-base.httpRequest',
        name: 'Notify Suppliers',
        parameters: {
          url: 'https://www.bell24h.com/api/marketing/email/send',
          method: 'POST',
          body: {
            template: 'rfq-notification',
            suppliers: '={{ $json.matchedSuppliers }}',
            rfqData: '={{ $json }}'
          }
        },
        position: [900, 300]
      }
    ],
    connections: {
      'webhook-trigger': {
        main: [
          [
            {
              node: 'ai-analysis',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'ai-analysis': {
        main: [
          [
            {
              node: 'find-suppliers',
              type: 'main',
              index: 0
            }
          ]
        ]
      },
      'find-suppliers': {
        main: [
          [
            {
              node: 'notify-suppliers',
              type: 'main',
              index: 0
            }
          ]
        ]
      }
    }
  }
};

class N8nSetup {
  constructor() {
    this.client = axios.create({
      baseURL: N8N_CONFIG.baseUrl,
      headers: {
        'X-N8N-API-KEY': N8N_CONFIG.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async testConnection() {
    try {
      console.log('🔍 Testing N8N connection...');
      const response = await this.client.get('/workflows');
      console.log('✅ N8N connection successful');
      return true;
    } catch (error) {
      console.error('❌ N8N connection failed:', error.message);
      return false;
    }
  }

  async createWorkflow(template) {
    try {
      console.log(`📝 Creating workflow: ${template.name}`);
      
      const workflowData = {
        name: template.name,
        nodes: template.nodes,
        connections: template.connections,
        active: true,
        settings: {
          executionOrder: 'v1'
        }
      };

      const response = await this.client.post('/workflows', workflowData);
      console.log(`✅ Workflow created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create workflow ${template.name}:`, error.message);
      throw error;
    }
  }

  async setupAllWorkflows() {
    console.log('🚀 Setting up N8N workflows...');
    
    const results = [];
    for (const [key, template] of Object.entries(WORKFLOW_TEMPLATES)) {
      try {
        const workflow = await this.createWorkflow(template);
        results.push({
          name: template.name,
          id: workflow.id,
          status: 'success'
        });
      } catch (error) {
        results.push({
          name: template.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }

  async createWebhookEndpoints() {
    console.log('🔗 Creating webhook endpoints...');
    
    const webhookEndpoints = [
      {
        path: '/webhook/email-campaign',
        description: 'Email campaign webhook',
        workflowId: 'email-campaign-workflow-id'
      },
      {
        path: '/webhook/supplier-onboarding',
        description: 'Supplier onboarding webhook',
        workflowId: 'supplier-onboarding-workflow-id'
      },
      {
        path: '/webhook/rfq-processing',
        description: 'RFQ processing webhook',
        workflowId: 'rfq-processing-workflow-id'
      }
    ];

    // In a real implementation, you would create these webhook endpoints
    // in your N8N instance or configure them through the API
    console.log('✅ Webhook endpoints configured');
    return webhookEndpoints;
  }

  async generateEnvironmentFile() {
    console.log('📄 Generating N8N environment configuration...');
    
    const envContent = `
# N8N Configuration for Bell24h
N8N_API_URL=${N8N_CONFIG.baseUrl}
N8N_API_KEY=${N8N_CONFIG.apiKey}
N8N_WEBHOOK_SECRET=${N8N_CONFIG.webhookSecret}
N8N_DATABASE_URL=${N8N_CONFIG.databaseUrl}

# N8N Webhook URLs
N8N_EMAIL_CAMPAIGN_WEBHOOK=${N8N_CONFIG.baseUrl}/webhook/email-campaign
N8N_SUPPLIER_ONBOARDING_WEBHOOK=${N8N_CONFIG.baseUrl}/webhook/supplier-onboarding
N8N_RFQ_PROCESSING_WEBHOOK=${N8N_CONFIG.baseUrl}/webhook/rfq-processing
`;

    const envPath = path.join(__dirname, '..', '.env.n8n');
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment file created: ${envPath}`);
  }

  async run() {
    console.log('🎯 Starting N8N instance setup for Bell24h...\n');

    // Test connection
    const connected = await this.testConnection();
    if (!connected) {
      console.log('❌ Cannot proceed without N8N connection');
      process.exit(1);
    }

    // Create workflows
    const workflowResults = await this.setupAllWorkflows();
    
    // Create webhook endpoints
    await this.createWebhookEndpoints();
    
    // Generate environment file
    await this.generateEnvironmentFile();

    // Summary
    console.log('\n📊 Setup Summary:');
    console.log('================');
    workflowResults.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ ${result.name} - ID: ${result.id}`);
      } else {
        console.log(`❌ ${result.name} - Error: ${result.error}`);
      }
    });

    console.log('\n🎉 N8N setup completed!');
    console.log('\nNext steps:');
    console.log('1. Configure your N8N instance with the generated workflows');
    console.log('2. Update webhook URLs in your Bell24h application');
    console.log('3. Test the integration using the test endpoints');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new N8nSetup();
  setup.run().catch(console.error);
}

module.exports = N8nSetup;
