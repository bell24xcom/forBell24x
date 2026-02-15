import { aiClient } from '../lib/ai-client';
import { subscriptionService } from '../services/subscription-service';
import { razorpay } from '../lib/razorpay';
import { n8nMarketing } from '../lib/n8n-trigger';

async function testAIClient() {
  console.log('Testing AI Client...');

  try {
    // Test voice processing
    const audioBuffer = Buffer.from('dummy audio data');
    const voiceResult = await aiClient.processVoiceRFQ(audioBuffer, 'hindi');
    console.log('Voice processing result:', voiceResult);

    // Test video processing
    const videoBuffer = Buffer.from('dummy video data');
    const videoResult = await aiClient.processVideoRFQ(videoBuffer);
    console.log('Video processing result:', videoResult);

    // Test content generation
    const contentResult = await aiClient.generateContent('Create a product description for industrial pumps');
    console.log('Content generation result:', contentResult);

    // Test embeddings
    const embeddingResult = await aiClient.getEmbeddings('Sample RFQ text for testing');
    console.log('Embeddings result:', embeddingResult.length, 'dimensions');

    // Test long document analysis
    const documentResult = await aiClient.analyzeLongDocument('Sample long document text...');
    console.log('Long document analysis result:', documentResult);

    console.log('AI Client tests passed!');
  } catch (error) {
    console.error('AI Client test failed:', error);
  }
}

async function testSubscriptionService() {
  console.log('Testing Subscription Service...');

  try {
    // Initialize user
    await subscriptionService.initializeUser('test-user-123');

    // Get offerings
    const offerings = await subscriptionService.getOfferings();
    console.log('Available plans:', offerings);

    // Check subscription status
    const status = await subscriptionService.checkSubscriptionStatus();
    console.log('Subscription status:', status);

    console.log('Subscription Service tests passed!');
  } catch (error) {
    console.error('Subscription Service test failed:', error);
  }
}

async function testRazorpay() {
  console.log('Testing Razorpay Integration...');

  try {
    // Create test order
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100
      currency: 'INR',
      receipt: 'test-receipt-123',
      notes: {
        test: 'true'
      }
    });
    console.log('Order created:', order.id);

    // Verify payment (dummy test)
    const isValid = razorpay.verifyPayment(order.id, 'dummy-payment-id', 'dummy-signature');
    console.log('Payment verification:', isValid);

    console.log('Razorpay tests passed!');
  } catch (error) {
    console.error('Razorpay test failed:', error);
  }
}

async function testN8NIntegration() {
  console.log('Testing N8N Integration...');

  try {
    // Test payment success notification
    await n8nMarketing.notifyPaymentSuccess({
      orderId: 'test-order-123',
      amount: 10000,
      email: 'test@example.com',
      name: 'Test User',
      rfqTitle: 'Test RFQ'
    });
    console.log('Payment success notification sent');

    // Test subscription activation
    await n8nMarketing.notifySubscriptionActivated({
      userId: 'test-user-123',
      plan: 'pro',
      email: 'test@example.com',
      name: 'Test User'
    });
    console.log('Subscription activation notification sent');

    console.log('N8N Integration tests passed!');
  } catch (error) {
    console.error('N8N Integration test failed:', error);
  }
}

async function runAllTests() {
  console.log('Starting Integration Tests...');
  console.log('================================');

  await testAIClient();
  await testSubscriptionService();
  await testRazorpay();
  await testN8NIntegration();

  console.log('================================');
  console.log('All Integration Tests Completed!');
}

// Run tests
runAllTests().catch(console.error);