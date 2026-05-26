/**
 * Auth System Test Script
 * 
 * This script tests the authentication system to ensure it's working properly.
 * It creates a test user, attempts to login, and verifies the user data.
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  username: 'testuser_' + Date.now().toString().slice(-5),
  password: 'TestPassword123!',
  companyName: 'Test Company',
  email: `test_${Date.now().toString().slice(-5)}@example.com`,
  phone: '1234567890',
  gstNumber: 'GST123456789'
};

// Store cookies between requests
let cookies = '';

const makeRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies ? { Cookie: cookies } : {})
    },
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  // Store cookies for subsequent requests
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    cookies = setCookieHeader;
  }
  
  return response;
};

const testHealthCheck = async () => {
  console.log('📊 Testing database connection...');
  try {
    const response = await makeRequest('/health-check');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database connection successful:', data.message);
      return true;
    } else {
      console.error('❌ Database connection failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection check failed:', error.message);
    return false;
  }
};

const testRegistration = async () => {
  console.log(`📝 Testing user registration for ${TEST_USER.username}...`);
  try {
    const response = await makeRequest('/auth/register', 'POST', TEST_USER);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful:', data.username);
      return true;
    } else {
      console.error('❌ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return false;
  }
};

const testLogin = async () => {
  console.log(`🔑 Testing login for ${TEST_USER.username}...`);
  try {
    const response = await makeRequest('/auth/login', 'POST', {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful:', data.username);
      return true;
    } else {
      console.error('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
};

const testGetMe = async () => {
  console.log('👤 Testing user profile retrieval...');
  try {
    const response = await makeRequest('/auth/me');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Profile retrieval successful:', data.username);
      return true;
    } else {
      const data = await response.json();
      console.error('❌ Profile retrieval failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Profile retrieval error:', error.message);
    return false;
  }
};

const testLogout = async () => {
  console.log('🚪 Testing logout...');
  try {
    const response = await makeRequest('/auth/logout', 'POST');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Logout successful:', data.message);
      return true;
    } else {
      console.error('❌ Logout failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    return false;
  }
};

const testUnauthenticatedAccess = async () => {
  console.log('🔒 Testing unauthenticated access...');
  try {
    const response = await makeRequest('/auth/me');
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Unauthorized access correctly blocked');
      return true;
    } else {
      console.error('❌ Security issue: Unauthenticated access was allowed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Unauthenticated access test error:', error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🧪 Starting Bell24h Authentication System Tests...');
  console.log('============================================');
  
  // First check database connection
  const dbOk = await testHealthCheck();
  if (!dbOk) {
    console.error('❌ Tests cannot continue without database connection');
    return;
  }
  
  // Run the auth tests
  const registerOk = await testRegistration();
  if (!registerOk) {
    console.error('❌ Tests cannot continue without registration');
    return;
  }
  
  const loginOk = await testLogin();
  if (!loginOk) {
    console.error('❌ Tests cannot continue without login');
    return;
  }
  
  await testGetMe();
  await testLogout();
  await testUnauthenticatedAccess();
  
  console.log('============================================');
  console.log('🧪 Auth system tests completed!');
};

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
});