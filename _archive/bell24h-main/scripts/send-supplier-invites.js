/**
 * Send 500 Supplier Beta Invites via MSG91
 * 
 * This script sends invitation SMS to suppliers to claim their profiles
 * Run: node scripts/send-supplier-invites.js
 */

const MSG91_API_KEY = process.env.MSG91_API_KEY || 'YOUR_MSG91_API_KEY';
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'BELL24';
const MSG91_TEMPLATE_ID = process.env.MSG91_INVITE_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
const MSG91_API_URL = 'https://api.msg91.com/api/v5/flow/';

// Sample supplier data (in production, fetch from database)
const sampleSuppliers = [
  // Add 500 supplier records here
  // For now, using 10 sample suppliers
  { id: 1, name: 'India Steel Corp', mobile: '+919819049523', city: 'Mumbai', category: 'Steel & Metals' },
  { id: 2, name: 'Vijay Textiles', mobile: '+919876543210', city: 'Surat', category: 'Textiles' },
  { id: 3, name: 'ElectroSmart', mobile: '+919765432109', city: 'Delhi', category: 'Electronics' },
  { id: 4, name: 'AgroFresh Ltd', mobile: '+919654321098', city: 'Pune', category: 'Agriculture' },
  { id: 5, name: 'ChemTech Industries', mobile: '+919543210987', city: 'Ahmedabad', category: 'Chemicals' },
  { id: 6, name: 'MachineryWorks', mobile: '+919432109876', city: 'Chennai', category: 'Machinery' },
  { id: 7, name: 'TextileMasters', mobile: '+919321098765', city: 'Coimbatore', category: 'Textiles' },
  { id: 8, name: 'FoodPro Distributors', mobile: '+919210987654', city: 'Bangalore', category: 'Food & Beverages' },
  { id: 9, name: 'PlasticWorks', mobile: '+919109876543', city: 'Hyderabad', category: 'Plastics' },
  { id: 10, name: 'MetalForge Industries', mobile: '+919098765432', city: 'Kolkata', category: 'Metals' },
];

// In production, fetch from database:
// const suppliers = await prisma.scrapedCompany.findMany({
//   where: { claimStatus: 'UNCLAIMED' },
//   take: 500,
// });

async function sendInviteSMS(supplier) {
  try {
    const message = `Hi ${supplier.name}, claim your free company profile on BELL24h - India's #1 B2B platform! Visit: https://bell24h.com/suppliers/${supplier.id}`;
    
    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_API_KEY,
      },
      body: JSON.stringify({
        template_id: MSG91_TEMPLATE_ID,
        sender: MSG91_SENDER_ID,
        mobiles: [supplier.mobile],
        VAR1: supplier.name,
        VAR2: `https://bell24h.com/suppliers/${supplier.id}`,
        VAR3: supplier.category,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Invite sent to ${supplier.name} (${supplier.mobile})`);
      return { success: true, supplierId: supplier.id, data };
    } else {
      const error = await response.text();
      console.error(`❌ Failed to send invite to ${supplier.name}: ${error}`);
      return { success: false, supplierId: supplier.id, error };
    }
  } catch (error) {
    console.error(`❌ Error sending invite to ${supplier.name}:`, error.message);
    return { success: false, supplierId: supplier.id, error: error.message };
  }
}

async function sendAllInvites() {
  console.log('🚀 Starting supplier invite campaign...\n');
  console.log(`📱 MSG91 API: ${MSG91_API_URL}`);
  console.log(`📊 Total Suppliers: ${sampleSuppliers.length}\n`);

  const results = [];
  const batchSize = 10; // Send in batches to avoid rate limiting
  
  for (let i = 0; i < sampleSuppliers.length; i += batchSize) {
    const batch = sampleSuppliers.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}...`);
    
    const batchResults = await Promise.all(
      batch.map(supplier => sendInviteSMS(supplier))
    );
    
    results.push(...batchResults);
    
    // Wait 2 seconds between batches
    if (i + batchSize < sampleSuppliers.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n📊 Invite Campaign Summary:');
  console.log('='.repeat(50));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${sampleSuppliers.length}`);
  console.log(`❌ Failed: ${failed}/${sampleSuppliers.length}`);
  console.log(`📈 Success Rate: ${((successful / sampleSuppliers.length) * 100).toFixed(2)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Invites:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - Supplier ID ${r.supplierId}: ${r.error}`);
    });
  }

  console.log('\n🎉 Invite campaign completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Monitor claim conversion rate');
  console.log('2. Send follow-up reminders after 7 days');
  console.log('3. Track responses in MarketingResponse table');
  console.log('4. Analyze which suppliers claimed their profiles');
}

// Run invite campaign
sendAllInvites().catch(console.error);

