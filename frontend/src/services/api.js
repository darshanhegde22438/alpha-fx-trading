import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Forex API (Public endpoints only)
export const forexAPI = {
  getLatestRates: () => api.get('/api/forex/latest-rates'),
  getAvailablePairs: () => api.get('/api/forex/available-pairs'),
  getStats: () => api.get('/api/forex/stats'),
  // For demo purposes, we'll use the public endpoints
  getHistoricalData: (pair, limit = 100) => 
    api.get(`/api/forex/latest-rates`), // Fallback to latest rates
  getMovingAverages: (pair, limit = 50) => 
    api.get(`/api/forex/latest-rates`), // Fallback to latest rates
};

export default api;
