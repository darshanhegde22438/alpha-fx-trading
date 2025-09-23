const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  const tests = [
    {
      name: 'Health Check',
      url: '/health',
      description: 'Basic server health check'
    },
    {
      name: 'Database Test',
      url: '/test-db',
      description: 'Database connection test'
    },
    {
      name: 'Latest Rates',
      url: '/api/forex/latest-rates',
      description: 'Fetch latest forex rates'
    },
    {
      name: 'Available Pairs',
      url: '/api/forex/available-pairs',
      description: 'Get available currency pairs'
    },
    {
      name: 'Stats',
      url: '/api/forex/stats',
      description: 'Get database statistics'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📊 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Description: ${test.description}`);
      
      const response = await axios.get(`${API_BASE_URL}${test.url}`, {
        timeout: 5000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Success: ${response.data.success !== false ? 'Yes' : 'No'}`);
      
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          console.log(`   📊 Data Count: ${response.data.data.length}`);
        } else if (typeof response.data.data === 'object') {
          console.log(`   📊 Data Keys: ${Object.keys(response.data.data).join(', ')}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        console.log(`   ❌ Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('');
    }
  }

  console.log('🏁 Backend connection test completed!');
}

// Run the test
testBackendConnection().catch(console.error);
