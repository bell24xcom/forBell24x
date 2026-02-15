// Comprehensive debugging utility for Bell24H

export const debugUtils = {
  // Global error handler
  setupGlobalErrorHandler() {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
        this.logError('Unhandled Promise Rejection', event.reason);
      });

      // Handle JavaScript errors
      window.addEventListener('error', (event) => {
        console.error('JavaScript Error:', event.error);
        this.logError('JavaScript Error', event.error);
      });

      // Handle React errors (if using React Error Boundary)
      window.addEventListener('error', (event) => {
        if (event.error && event.error.name === 'ReactError') {
          console.error('React Error:', event.error);
          this.logError('React Error', event.error);
        }
      });
    }
  },

  // Log errors with context
  logError(type, error, context = {}) {
    const errorLog = {
      type,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      context
    };

    console.error('🔍 Bell24H Error Log:', errorLog);

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // this.sendToErrorService(errorLog);
    }

    return errorLog;
  },

  // Debug authentication state
  debugAuthState() {
    if (typeof window !== 'undefined') {
      const authData = {
        user: localStorage.getItem('bell24h_user'),
        token: localStorage.getItem('bell24h_auth_token'),
        users: localStorage.getItem('bell24h_users')
      };

      console.log('🔍 Auth State Debug:', authData);
      return authData;
    }
    return null;
  },

  // Debug API calls
  debugApiCall(url, method, data, response) {
    const apiLog = {
      url,
      method,
      data,
      response,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 API Call Debug:', apiLog);
    return apiLog;
  },

  // Debug component state
  debugComponentState(componentName, state) {
    console.log(`🔍 ${componentName} State:`, state);
  },

  // Debug localStorage
  debugLocalStorage() {
    if (typeof window !== 'undefined') {
      const allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            allData[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
            allData[key] = localStorage.getItem(key);
          }
        }
      }
      console.log('🔍 LocalStorage Debug:', allData);
      return allData;
    }
    return null;
  },

  // Clear debug data
  clearDebugData() {
    if (typeof window !== 'undefined') {
      // Clear localStorage items that start with 'bell24h_'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('bell24h_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🔍 Debug data cleared');
    }
  },

  // Test registration flow
  testRegistrationFlow() {
    console.log('🧪 Testing Registration Flow...');
    
    // Test 1: Check if registration form exists
    const registerForm = document.querySelector('form');
    console.log('Registration form found:', !!registerForm);

    // Test 2: Check if login form exists
    const loginForm = document.querySelector('form');
    console.log('Login form found:', !!loginForm);

    // Test 3: Check authentication context
    const authState = this.debugAuthState();
    console.log('Auth state:', authState);

    // Test 4: Check localStorage
    const localStorageData = this.debugLocalStorage();
    console.log('LocalStorage data:', localStorageData);

    return {
      registerForm: !!registerForm,
      loginForm: !!loginForm,
      authState,
      localStorageData
    };
  },

  // Test API endpoints
  async testApiEndpoints() {
    console.log('🧪 Testing API Endpoints...');
    
    const endpoints = [
      '/api/register',
      '/api/auth/login',
      '/api/dashboard',
      '/api/homepage-stats'
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      } catch (error) {
        results[endpoint] = {
          error: error.message,
          status: 'ERROR'
        };
      }
    }

    console.log('API Endpoint Test Results:', results);
    return results;
  }
};

// Auto-setup global error handler
if (typeof window !== 'undefined') {
  debugUtils.setupGlobalErrorHandler();
}

export default debugUtils; 
