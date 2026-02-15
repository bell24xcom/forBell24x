// Simple test script for authentication API
const testAuthAPI = async () => {
  console.log('🧪 Testing Bell24h Authentication API...\n');

  try {
    // Test 1: Send Phone OTP
    console.log('📱 Testing Phone OTP API...');
    const phoneResponse = await fetch('http://localhost:3000/api/auth/send-phone-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    });

    const phoneData = await phoneResponse.json();
    console.log('✅ Phone OTP Response:', phoneData);

    if (phoneData.success) {
      console.log('🎉 Phone OTP API is working!');
      console.log('📱 Demo OTP:', phoneData.demoOTP);
    } else {
      console.log('❌ Phone OTP API failed:', phoneData.error);
    }

  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
};

// Run the test
testAuthAPI();
