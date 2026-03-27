const axios = require('axios');

// WhatsApp Business API configuration
const WHATSAPP_CONFIG = {
  // Replace with your actual WhatsApp Business API credentials
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'your-access-token',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'your-phone-number-id',
  apiUrl: 'https://graph.facebook.com/v18.0'
};

// Sample supplier data for verification
const SUPPLIERS = [
  { name: 'Rajesh Kumar', phone: '+919876543210', company: 'Tech Solutions Pvt Ltd', category: 'Electronics' },
  { name: 'Priya Sharma', phone: '+919876543211', company: 'Manufacturing Co', category: 'Textiles' },
  { name: 'Amit Patel', phone: '+919876543212', company: 'Auto Parts Ltd', category: 'Automotive' },
  { name: 'Sunita Singh', phone: '+919876543213', company: 'Food Processing Inc', category: 'Food & Beverage' },
  { name: 'Vikram Reddy', phone: '+919876543214', company: 'Construction Materials', category: 'Construction' },
  { name: 'Anita Gupta', phone: '+919876543215', company: 'Pharmaceuticals Ltd', category: 'Healthcare' },
  { name: 'Suresh Jain', phone: '+919876543216', company: 'Chemical Industries', category: 'Chemicals' },
  { name: 'Meera Nair', phone: '+919876543217', company: 'Textile Mills', category: 'Textiles' },
  { name: 'Ravi Verma', phone: '+919876543218', company: 'Electronics Hub', category: 'Electronics' },
  { name: 'Kavita Joshi', phone: '+919876543219', company: 'Packaging Solutions', category: 'Packaging' },
  { name: 'Deepak Sharma', phone: '+919876543220', company: 'Steel Works', category: 'Metals' },
  { name: 'Neha Agarwal', phone: '+919876543221', company: 'Plastic Industries', category: 'Plastics' },
  { name: 'Rohit Kumar', phone: '+919876543222', company: 'Rubber Products', category: 'Rubber' },
  { name: 'Pooja Mehta', phone: '+919876543223', company: 'Ceramic Works', category: 'Ceramics' },
  { name: 'Arun Tiwari', phone: '+919876543224', company: 'Glass Manufacturing', category: 'Glass' },
  { name: 'Sneha Das', phone: '+919876543225', company: 'Paper Products', category: 'Paper' },
  { name: 'Manoj Singh', phone: '+919876543226', company: 'Wood Industries', category: 'Wood' },
  { name: 'Ritu Pandey', phone: '+919876543227', company: 'Leather Goods', category: 'Leather' },
  { name: 'Sanjay Kumar', phone: '+919876543228', company: 'Furniture Works', category: 'Furniture' },
  { name: 'Anjali Reddy', phone: '+919876543229', company: 'Home Appliances', category: 'Appliances' },
  { name: 'Vishal Agarwal', phone: '+919876543230', company: 'Sports Equipment', category: 'Sports' },
  { name: 'Shilpa Jain', phone: '+919876543231', company: 'Toys Manufacturing', category: 'Toys' },
  { name: 'Naveen Patel', phone: '+919876543232', company: 'Stationery Items', category: 'Stationery' },
  { name: 'Kiran Sharma', phone: '+919876543233', company: 'Jewelry Works', category: 'Jewelry' },
  { name: 'Rakesh Verma', phone: '+919876543234', company: 'Cosmetics Ltd', category: 'Cosmetics' },
  { name: 'Geeta Singh', phone: '+919876543235', company: 'Fashion Accessories', category: 'Fashion' },
  { name: 'Ajay Kumar', phone: '+919876543236', company: 'Footwear Industries', category: 'Footwear' },
  { name: 'Poonam Tiwari', phone: '+919876543237', company: 'Handicrafts Ltd', category: 'Handicrafts' },
  { name: 'Suresh Nair', phone: '+919876543238', company: 'Art Supplies', category: 'Art' },
  { name: 'Rekha Das', phone: '+919876543239', company: 'Garden Tools', category: 'Garden' }
];

// WhatsApp message templates
const MESSAGE_TEMPLATES = {
  verification: `🔔 *Bell24h Supplier Verification*

Hello {{name}},

Welcome to Bell24h - India's leading B2B marketplace!

We're excited to have {{company}} join our verified supplier network for {{category}} products.

*Next Steps:*
1. Complete your profile verification
2. Upload business documents
3. Start receiving quality leads

*Benefits:*
✅ Verified supplier badge
✅ Priority lead access
✅ AI-powered matching
✅ Secure transactions

Reply with "VERIFY" to start the process.

Best regards,
Bell24h Team
📞 +91-9876543210
🌐 www.bell24h.com`,

  followUp: `🔔 *Bell24h - Verification Reminder*

Hi {{name}},

This is a friendly reminder to complete your supplier verification for {{company}}.

*Why verify?*
• Get 3x more leads
• Build buyer trust
• Access premium features
• Secure payments

Complete verification in 2 minutes: https://bell24h.com/verify

Need help? Reply "HELP"

Bell24h Team`,

  welcome: `🎉 *Welcome to Bell24h!*

Hi {{name}},

Congratulations! {{company}} is now a verified supplier on Bell24h.

*Your account is ready:*
✅ Profile verified
✅ Trust score: 100/100
✅ Lead notifications enabled
✅ Premium features unlocked

*Start now:*
1. Browse active RFQs
2. Submit competitive quotes
3. Win more business

Dashboard: https://bell24h.com/supplier/dashboard

Happy selling!
Bell24h Team`
};

async function sendWhatsAppMessage(phoneNumber, template, variables = {}) {
  try {
    const message = template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);

    const response = await axios.post(
      `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, messageId: response.data.messages[0].id };
  } catch (error) {
    console.error(`Failed to send message to ${phoneNumber}:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function sendVerificationMessages() {
  console.log('📱 Starting WhatsApp verification campaign for 30 suppliers');
  console.log('========================================================');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < SUPPLIERS.length; i++) {
    const supplier = SUPPLIERS[i];
    console.log(`\n${i + 1}/30 - Sending to ${supplier.name} (${supplier.phone})`);

    // Send verification message
    const result = await sendWhatsAppMessage(
      supplier.phone,
      MESSAGE_TEMPLATES.verification,
      {
        name: supplier.name,
        company: supplier.company,
        category: supplier.category
      }
    );

    if (result.success) {
      console.log(`✅ Message sent successfully (ID: ${result.messageId})`);
      successCount++;
    } else {
      console.log(`❌ Failed to send message: ${result.error}`);
      failureCount++;
    }

    // Add delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 Campaign Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${((successCount / SUPPLIERS.length) * 100).toFixed(1)}%`);

  // Schedule follow-up messages (simulated)
  console.log('\n⏰ Scheduling follow-up messages...');
  console.log('Follow-up messages will be sent in 24 hours for non-responders');
  console.log('Welcome messages will be sent after verification completion');
}

// Simulate sending messages (since we don't have actual WhatsApp API credentials)
async function simulateWhatsAppMessages() {
  console.log('📱 Simulating WhatsApp verification campaign for 30 suppliers');
  console.log('================================================================');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < SUPPLIERS.length; i++) {
    const supplier = SUPPLIERS[i];
    console.log(`\n${i + 1}/30 - Sending to ${supplier.name} (${supplier.phone})`);

    // Simulate message sending
    const success = Math.random() > 0.1; // 90% success rate simulation

    if (success) {
      console.log(`✅ Message sent successfully (Simulated)`);
      console.log(`📄 Message preview:`);
      console.log(`   "🔔 Bell24h Supplier Verification`);
      console.log(`   Hello ${supplier.name},`);
      console.log(`   Welcome to Bell24h - India's leading B2B marketplace!`);
      console.log(`   We're excited to have ${supplier.company} join our verified supplier network for ${supplier.category} products."`);
      successCount++;
    } else {
      console.log(`❌ Failed to send message (Simulated network error)`);
      failureCount++;
    }

    // Add delay between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Campaign Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${((successCount / SUPPLIERS.length) * 100).toFixed(1)}%`);

  console.log('\n📋 Message Templates Used:');
  console.log('1. Initial verification message');
  console.log('2. Follow-up reminder (24h later)');
  console.log('3. Welcome message (after verification)');

  console.log('\n🎯 Next Steps:');
  console.log('1. Monitor response rates');
  console.log('2. Track verification completions');
  console.log('3. Send follow-up messages to non-responders');
  console.log('4. Analyze campaign performance');
}

// Run the simulation
if (require.main === module) {
  simulateWhatsAppMessages().catch(console.error);
}

module.exports = {
  sendVerificationMessages,
  simulateWhatsAppMessages,
  SUPPLIERS,
  MESSAGE_TEMPLATES
};
