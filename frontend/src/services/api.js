import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Forex API (Public endpoints only)
export const forexAPI = {
  getLatestRates: async () => {
    try {
      console.log('📊 Fetching latest rates...');
      const response = await api.get('/api/forex/latest-rates');
      console.log('📊 Latest rates fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching latest rates:', error);
      throw error;
    }
  },
  
  getAvailablePairs: async () => {
    try {
      console.log('📋 Fetching available pairs...');
      const response = await api.get('/api/forex/available-pairs');
      console.log('📋 Available pairs fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching available pairs:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      console.log('📈 Fetching stats...');
      const response = await api.get('/api/forex/stats');
      console.log('📈 Stats fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  },
  
  // For demo purposes, we'll use the public endpoints
  getHistoricalData: async (pair, limit = 100) => {
    try {
      console.log(`📊 Fetching historical data for ${pair}...`);
      const response = await api.get('/api/forex/latest-rates'); // Fallback to latest rates
      console.log('📊 Historical data fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      throw error;
    }
  },
  
  getMovingAverages: async (pair, limit = 50) => {
    try {
      console.log(`📈 Fetching moving averages for ${pair}...`);
      const response = await api.get('/api/forex/latest-rates'); // Fallback to latest rates
      console.log('📈 Moving averages fetched:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching moving averages:', error);
      throw error;
    }
  },
};

// Test API connection
export const testAPIConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ API connection successful:', response.data);
    return response;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    throw error;
  }
};

export default api;
