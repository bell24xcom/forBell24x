// Test script for Bell24H registration system
const testRegistration = async () => {
  console.log('🧪 Testing Bell24H Registration System...\n');

  const testCases = [
    {
      name: 'Valid Registration',
      data: {
        email: 'test@example.com',
        password: 'securepassword123',
        companyName: 'Test Company Ltd',
        businessType: 'supplier',
        name: 'John Doe',
        phone: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstin: '22AAAAA0000A1Z5',
        pan: 'ABCDE1234F'
      },
      expected: 'success'
    },
    {
      name: 'Invalid Email',
      data: {
        email: 'invalid-email',
        password: 'securepassword123',
        companyName: 'Test Company Ltd',
        name: 'John Doe',
        phone: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      expected: 'validation_error'
    },
    {
      name: 'Weak Password',
      data: {
        email: 'test@example.com',
        password: '123',
        companyName: 'Test Company Ltd',
        name: 'John Doe',
        phone: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      expected: 'validation_error'
    },
    {
      name: 'Missing Required Fields',
      data: {
        email: 'test@example.com',
        password: 'securepassword123'
        // Missing companyName, name, etc.
      },
      expected: 'validation_error'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (testCase.expected === 'success' && result.success) {
        console.log('✅ PASSED');
        passedTests++;
      } else if (testCase.expected === 'validation_error' && !result.success) {
        console.log('✅ PASSED (Validation error as expected)');
        passedTests++;
      } else {
        console.log('❌ FAILED');
        console.log('Expected:', testCase.expected);
        console.log('Got:', result);
      }
    } catch (error) {
      console.log('❌ FAILED (Network error)');
      console.log('Error:', error.message);
    }
    
    console.log('---\n');
  }

  console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Registration system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the registration system.');
  }
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testRegistration = testRegistration;
} else {
  // Node.js environment
  testRegistration();
}

module.exports = { testRegistration }; 
