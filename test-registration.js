// Simple test script to verify registration API
const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        companyName: 'Test Company',
        role: 'buyer',
        phone: '1234567890',
        industry: 'Manufacturing',
        companySize: '50-200'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testRegistration(); 