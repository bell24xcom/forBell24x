/**
 * Import 10 Live RFQs into n8n Webhook
 * 
 * This script imports sample RFQs into n8n for testing the automation workflow
 * Run: node scripts/import-rfqs-to-n8n.js
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.bell24h.com/webhook/rfq-new';

// Sample RFQs with realistic data
const sampleRFQs = [
  {
    id: 1001,
    price: 125000,
    lead_time: 7,
    supplier_rating: 4.8,
    distance_km: 89,
    past_on_time_rate: 0.97,
    rfq_length: 100,
    buyer_tier: 2,
    quantity: 300,
    urgency_score: 0.8,
    region: 1,
    past_success_rate: 0.95,
    negotiations_count: 3,
    previous_orders: 28,
    multimodal_rfq: 1,
    transcript_length: 325,
    industry_type: 1,
    quoted_suppliers: 9,
    supplier_id: 1,
    supplier_phone: '+919819049523',
    supplier_name: 'India Steel Corp',
    category: 'Steel & Metals',
    description: 'Steel pipes required for construction project'
  },
  {
    id: 1002,
    price: 85000,
    lead_time: 10,
    supplier_rating: 4.6,
    distance_km: 120,
    past_on_time_rate: 0.94,
    rfq_length: 150,
    buyer_tier: 1,
    quantity: 200,
    urgency_score: 0.7,
    region: 2,
    past_success_rate: 0.92,
    negotiations_count: 2,
    previous_orders: 15,
    multimodal_rfq: 0,
    transcript_length: 250,
    industry_type: 2,
    quoted_suppliers: 7,
    supplier_id: 2,
    supplier_phone: '+919876543210',
    supplier_name: 'Vijay Textiles',
    category: 'Textiles',
    description: 'Cotton fabric for manufacturing'
  },
  {
    id: 1003,
    price: 200000,
    lead_time: 5,
    supplier_rating: 4.9,
    distance_km: 45,
    past_on_time_rate: 0.98,
    rfq_length: 80,
    buyer_tier: 3,
    quantity: 500,
    urgency_score: 0.9,
    region: 1,
    past_success_rate: 0.97,
    negotiations_count: 4,
    previous_orders: 45,
    multimodal_rfq: 1,
    transcript_length: 400,
    industry_type: 1,
    quoted_suppliers: 12,
    supplier_id: 3,
    supplier_phone: '+919765432109',
    supplier_name: 'ElectroSmart',
    category: 'Electronics',
    description: 'Electronic components for assembly'
  },
  {
    id: 1004,
    price: 95000,
    lead_time: 14,
    supplier_rating: 4.5,
    distance_km: 200,
    past_on_time_rate: 0.91,
    rfq_length: 120,
    buyer_tier: 1,
    quantity: 150,
    urgency_score: 0.6,
    region: 3,
    past_success_rate: 0.88,
    negotiations_count: 1,
    previous_orders: 8,
    multimodal_rfq: 0,
    transcript_length: 180,
    industry_type: 3,
    quoted_suppliers: 5,
    supplier_id: 4,
    supplier_phone: '+919654321098',
    supplier_name: 'AgroFresh Ltd',
    category: 'Agriculture',
    description: 'Organic fertilizers for farming'
  },
  {
    id: 1005,
    price: 150000,
    lead_time: 8,
    supplier_rating: 4.7,
    distance_km: 75,
    past_on_time_rate: 0.96,
    rfq_length: 110,
    buyer_tier: 2,
    quantity: 250,
    urgency_score: 0.75,
    region: 1,
    past_success_rate: 0.93,
    negotiations_count: 3,
    previous_orders: 22,
    multimodal_rfq: 1,
    transcript_length: 300,
    industry_type: 1,
    quoted_suppliers: 8,
    supplier_id: 5,
    supplier_phone: '+919543210987',
    supplier_name: 'ChemTech Industries',
    category: 'Chemicals',
    description: 'Industrial chemicals for production'
  },
  {
    id: 1006,
    price: 110000,
    lead_time: 12,
    supplier_rating: 4.4,
    distance_km: 150,
    past_on_time_rate: 0.89,
    rfq_length: 130,
    buyer_tier: 1,
    quantity: 180,
    urgency_score: 0.65,
    region: 2,
    past_success_rate: 0.85,
    negotiations_count: 2,
    previous_orders: 12,
    multimodal_rfq: 0,
    transcript_length: 220,
    industry_type: 4,
    quoted_suppliers: 6,
    supplier_id: 6,
    supplier_phone: '+919432109876',
    supplier_name: 'MachineryWorks',
    category: 'Machinery',
    description: 'Heavy machinery for construction'
  },
  {
    id: 1007,
    price: 175000,
    lead_time: 6,
    supplier_rating: 4.8,
    distance_km: 60,
    past_on_time_rate: 0.97,
    rfq_length: 95,
    buyer_tier: 3,
    quantity: 400,
    urgency_score: 0.85,
    region: 1,
    past_success_rate: 0.96,
    negotiations_count: 5,
    previous_orders: 38,
    multimodal_rfq: 1,
    transcript_length: 350,
    industry_type: 1,
    quoted_suppliers: 11,
    supplier_id: 7,
    supplier_phone: '+919321098765',
    supplier_name: 'TextileMasters',
    category: 'Textiles',
    description: 'Premium textile materials'
  },
  {
    id: 1008,
    price: 90000,
    lead_time: 15,
    supplier_rating: 4.3,
    distance_km: 180,
    past_on_time_rate: 0.87,
    rfq_length: 140,
    buyer_tier: 1,
    quantity: 120,
    urgency_score: 0.55,
    region: 3,
    past_success_rate: 0.82,
    negotiations_count: 1,
    previous_orders: 6,
    multimodal_rfq: 0,
    transcript_length: 200,
    industry_type: 5,
    quoted_suppliers: 4,
    supplier_id: 8,
    supplier_phone: '+919210987654',
    supplier_name: 'FoodPro Distributors',
    category: 'Food & Beverages',
    description: 'Food packaging materials'
  },
  {
    id: 1009,
    price: 140000,
    lead_time: 9,
    supplier_rating: 4.6,
    distance_km: 95,
    past_on_time_rate: 0.93,
    rfq_length: 105,
    buyer_tier: 2,
    quantity: 220,
    urgency_score: 0.7,
    region: 1,
    past_success_rate: 0.91,
    negotiations_count: 3,
    previous_orders: 18,
    multimodal_rfq: 1,
    transcript_length: 280,
    industry_type: 2,
    quoted_suppliers: 7,
    supplier_id: 9,
    supplier_phone: '+919109876543',
    supplier_name: 'PlasticWorks',
    category: 'Plastics',
    description: 'Plastic raw materials'
  },
  {
    id: 1010,
    price: 160000,
    lead_time: 7,
    supplier_rating: 4.7,
    distance_km: 70,
    past_on_time_rate: 0.95,
    rfq_length: 100,
    buyer_tier: 2,
    quantity: 280,
    urgency_score: 0.8,
    region: 1,
    past_success_rate: 0.94,
    negotiations_count: 4,
    previous_orders: 25,
    multimodal_rfq: 1,
    transcript_length: 320,
    industry_type: 1,
    quoted_suppliers: 9,
    supplier_id: 10,
    supplier_phone: '+919098765432',
    supplier_name: 'MetalForge Industries',
    category: 'Metals',
    description: 'Metal sheets for fabrication'
  }
];

async function importRFQ(rfq) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rfq),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ RFQ #${rfq.id} imported successfully`);
      return { success: true, rfqId: rfq.id, data };
    } else {
      const error = await response.text();
      console.error(`❌ RFQ #${rfq.id} failed: ${error}`);
      return { success: false, rfqId: rfq.id, error };
    }
  } catch (error) {
    console.error(`❌ RFQ #${rfq.id} error:`, error.message);
    return { success: false, rfqId: rfq.id, error: error.message };
  }
}

async function importAllRFQs() {
  console.log('🚀 Starting RFQ import to n8n...\n');
  console.log(`📡 Webhook URL: ${N8N_WEBHOOK_URL}\n`);

  const results = [];
  
  for (const rfq of sampleRFQs) {
    const result = await importRFQ(rfq);
    results.push(result);
    
    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n📊 Import Summary:');
  console.log('='.repeat(50));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${sampleRFQs.length}`);
  console.log(`❌ Failed: ${failed}/${sampleRFQs.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed RFQs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - RFQ #${r.rfqId}: ${r.error}`);
    });
  }

  console.log('\n🎉 RFQ import completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check n8n workflows to verify RFQs were processed');
  console.log('2. Check Google Sheets for logged winners');
  console.log('3. Verify MSG91 SMS were sent');
  console.log('4. Check SHAP API responses');
}

// Run import
importAllRFQs().catch(console.error);

