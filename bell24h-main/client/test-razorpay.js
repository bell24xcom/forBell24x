/**
 * Razorpay Integration Test Script
 * Tests new live API keys for Bell24h
 */

const Razorpay = require('razorpay');

console.log('🔑 BELL24H RAZORPAY INTEGRATION TEST');
console.log('=====================================');
console.log('');

// Initialize Razorpay with new live keys
const razorpay = new Razorpay({
  key_id: 'rzp_live_RJjxcgaBo9j0UA',
  key_secret: 'lwTxLReQSkVL7lbrr39XSoyG'
});

console.log('✅ Razorpay instance created with new live keys');
console.log('✅ Key ID: rzp_live_RJjxcgaBo9j0UA');
console.log('✅ Key Secret: lwTxLReQSkVL7lbrr39XSoyG');
console.log('✅ Merchant ID: DwqbZimRZG6c3y');
console.log('');

// Test 1: API Connection
console.log('🧪 Test 1: API Connection...');
razorpay.orders.all({ count: 1 })
  .then(() => {
    console.log('✅ Razorpay API connection successful!');
    console.log('✅ Live keys are working correctly');
    console.log('');
    
    // Test 2: Payment Order Creation
    console.log('🧪 Test 2: Payment Order Creation...');
    
    const testOrder = {
      amount: 100, // ₹1 for testing
      currency: 'INR',
      receipt: 'bell24h_test_' + Date.now(),
      payment_capture: 0, // Manual capture for escrow
      notes: {
        test: 'true',
        purpose: 'bell24h_razorpay_integration_test',
        platform: 'bell24h_b2b_marketplace'
      }
    };

    return razorpay.orders.create(testOrder);
  })
  .then((order) => {
    console.log('✅ Test payment order created successfully!');
    console.log('✅ Order ID:', order.id);
    console.log('✅ Amount:', order.amount, 'paise (₹' + (order.amount / 100) + ')');
    console.log('✅ Currency:', order.currency);
    console.log('✅ Status:', order.status);
    console.log('✅ Receipt:', order.receipt);
    console.log('');
    
    // Test 3: Payment Methods
    console.log('🧪 Test 3: Available Payment Methods...');
    return razorpay.payments.methods();
  })
  .then((methods) => {
    console.log('✅ Available payment methods retrieved');
    console.log('✅ Methods count:', Object.keys(methods).length);
    console.log('');
    
    // Test 4: Customer Creation
    console.log('🧪 Test 4: Customer Creation...');
    
    const testCustomer = {
      name: 'Bell24h Test Customer',
      email: 'test@bell24h.com',
      contact: '+919876543210',
      notes: {
        test: 'true',
        platform: 'bell24h'
      }
    };

    return razorpay.customers.create(testCustomer);
  })
  .then((customer) => {
    console.log('✅ Test customer created successfully!');
    console.log('✅ Customer ID:', customer.id);
    console.log('✅ Name:', customer.name);
    console.log('✅ Email:', customer.email);
    console.log('✅ Contact:', customer.contact);
    console.log('');
    
    console.log('🎉 ALL RAZORPAY TESTS PASSED!');
    console.log('=====================================');
    console.log('');
    console.log('✅ API Connection: Working');
    console.log('✅ Payment Orders: Working');
    console.log('✅ Payment Methods: Working');
    console.log('✅ Customer Management: Working');
    console.log('');
    console.log('🚀 Bell24h is ready for live payments!');
    console.log('');
    console.log('⚠️  IMPORTANT NOTES:');
    console.log('• These are LIVE Razorpay keys');
    console.log('• Real money will be charged for payments');
    console.log('• Use test mode for development');
    console.log('• Monitor transactions in Razorpay dashboard');
    console.log('');
    
  })
  .catch((error) => {
    console.log('❌ Razorpay test failed:', error.message);
    console.log('');
    console.log('🔍 TROUBLESHOOTING:');
    console.log('• Check if API keys are correct');
    console.log('• Verify Razorpay account is active');
    console.log('• Check network connectivity');
    console.log('• Verify account permissions');
    console.log('');
    console.log('📞 Support: contact Razorpay support for help');
  });
