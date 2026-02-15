/**
 * Bell24h Frontend API Configuration
 * Updated to use Oracle Cloud microservices
 */

// Oracle Cloud Service URLs
const ORACLE_IP = '80.225.192.248'; // Your Oracle Cloud IP
const API_BASE_URL = `http://${ORACLE_IP}`;

// Service endpoints
export const API_ENDPOINTS = {
  // ML Service (SHAP/LIME)
  ML_SERVICE: `${API_BASE_URL}/ml`,
  
  // Core API (RFQ, Suppliers, Payments)
  CORE_API: `${API_BASE_URL}/api`,
  
  // Negotiations Service (Future)
  NEGOTIATIONS: `${API_BASE_URL}/negotiations`,
  
  // Analytics Service (Future)
  ANALYTICS: `${API_BASE_URL}/analytics`
};

// ML Service API calls
export const mlService = {
  // Explain supplier matching using SHAP
  explainSupplierMatching: async (data) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ML_SERVICE}/explain/supplier-matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML Service error:', error);
      throw error;
    }
  },

  // Explain RFQ analysis using LIME
  explainRfqAnalysis: async (data) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ML_SERVICE}/explain/rfq-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML Service error:', error);
      throw error;
    }
  },

  // Predict supplier score
  predictSupplierScore: async (data) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ML_SERVICE}/predict/supplier-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML Service error:', error);
      throw error;
    }
  },

  // Predict RFQ success
  predictRfqSuccess: async (data) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ML_SERVICE}/predict/rfq-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML Service error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ML_SERVICE}/health`);
      return await response.json();
    } catch (error) {
      console.error('ML Service health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
};

// Core API service calls
export const coreAPI = {
  // RFQ Management
  getRFQs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/rfqs?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  createRFQ: async (rfqData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rfqData)
      });
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  getRFQ: async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/rfqs/${id}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  // Supplier Management
  getSuppliers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/suppliers?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  getSupplier: async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/suppliers/${id}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  // Quote Management
  createQuote: async (quoteData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  getQuotes: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/quotes?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  // Order Management
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  getOrders: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/orders?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  // Analytics
  getDashboardAnalytics: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/analytics/dashboard`);
      
      if (!response.ok) {
        throw new Error(`Core API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Core API error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CORE_API}/health`);
      return await response.json();
    } catch (error) {
      console.error('Core API health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
};

// Service discovery and health monitoring
export const serviceDiscovery = {
  // Check all services health
  checkAllServices: async () => {
    const [mlHealth, coreHealth] = await Promise.allSettled([
      mlService.healthCheck(),
      coreAPI.healthCheck()
    ]);

    return {
      mlService: mlHealth.status === 'fulfilled' ? mlHealth.value : { status: 'unhealthy', error: mlHealth.reason },
      coreAPI: coreHealth.status === 'fulfilled' ? coreHealth.value : { status: 'unhealthy', error: coreHealth.reason },
      timestamp: new Date().toISOString()
    };
  },

  // Get service status
  getServiceStatus: () => {
    return {
      mlService: API_ENDPOINTS.ML_SERVICE,
      coreAPI: API_ENDPOINTS.CORE_API,
      lastChecked: new Date().toISOString()
    };
  }
};

// Error handling wrapper
export const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      console.error('API call failed:', error);
      
      // Return fallback data or show user-friendly error
      if (error.message.includes('ML Service')) {
        return {
          error: 'AI features temporarily unavailable',
          fallback: true
        };
      }
      
      if (error.message.includes('Core API')) {
        return {
          error: 'Service temporarily unavailable',
          fallback: true
        };
      }
      
      throw error;
    }
  };
};

export default {
  mlService,
  coreAPI,
  serviceDiscovery,
  withErrorHandling
};
