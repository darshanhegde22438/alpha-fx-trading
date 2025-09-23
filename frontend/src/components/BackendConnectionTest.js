import React, { useState, useEffect } from 'react';
import { testAPIConnection, forexAPI } from '../services/api';

const BackendConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runConnectionTest = async () => {
    setIsRunning(true);
    setConnectionStatus('testing');
    setTestResults({});

    const results = {};

    try {
      // Test 1: Basic API connection
      console.log('🔍 Test 1: Basic API connection...');
      try {
        const healthResponse = await testAPIConnection();
        results.health = {
          status: 'success',
          message: 'API server is running',
          data: healthResponse.data
        };
      } catch (error) {
        results.health = {
          status: 'error',
          message: error.message,
          error: error
        };
      }

      // Test 2: Forex rates endpoint
      console.log('🔍 Test 2: Forex rates endpoint...');
      try {
        const ratesResponse = await forexAPI.getLatestRates();
        results.rates = {
          status: 'success',
          message: `Fetched ${ratesResponse.data.data?.length || 0} currency pairs`,
          data: ratesResponse.data
        };
      } catch (error) {
        results.rates = {
          status: 'error',
          message: error.message,
          error: error
        };
      }

      // Test 3: Stats endpoint
      console.log('🔍 Test 3: Stats endpoint...');
      try {
        const statsResponse = await forexAPI.getStats();
        results.stats = {
          status: 'success',
          message: 'Database stats retrieved',
          data: statsResponse.data
        };
      } catch (error) {
        results.stats = {
          status: 'error',
          message: error.message,
          error: error
        };
      }

      // Test 4: Available pairs endpoint
      console.log('🔍 Test 4: Available pairs endpoint...');
      try {
        const pairsResponse = await forexAPI.getAvailablePairs();
        results.pairs = {
          status: 'success',
          message: `Found ${pairsResponse.data.data?.length || 0} available pairs`,
          data: pairsResponse.data
        };
      } catch (error) {
        results.pairs = {
          status: 'error',
          message: error.message,
          error: error
        };
      }

      setTestResults(results);

      // Determine overall status
      const hasErrors = Object.values(results).some(result => result.status === 'error');
      setConnectionStatus(hasErrors ? 'partial' : 'success');

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus('error');
      setTestResults({ error: { status: 'error', message: error.message } });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'partial': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'partial': return '⚠️';
      default: return '⏳';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>🔍 Backend Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runConnectionTest}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            backgroundColor: isRunning ? '#6b7280' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '12px'
          }}
        >
          {isRunning ? '🔄 Testing...' : '🚀 Run Connection Test'}
        </button>
        
        <span style={{ 
          color: getStatusColor(connectionStatus),
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {getStatusIcon(connectionStatus)} {connectionStatus.toUpperCase()}
        </span>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div style={{ 
          display: 'grid', 
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
        }}>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>
                  {getStatusIcon(result.status)}
                </span>
                <h3 style={{ 
                  margin: 0, 
                  color: getStatusColor(result.status),
                  textTransform: 'capitalize'
                }}>
                  {testName}
                </h3>
              </div>
              
              <p style={{ 
                margin: '0 0 8px 0', 
                color: '#374151',
                fontSize: '14px'
              }}>
                {result.message}
              </p>
              
              {result.data && (
                <details style={{ fontSize: '12px', color: '#6b7280' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    View Response Data
                  </summary>
                  <pre style={{ 
                    backgroundColor: '#f3f4f6',
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    fontSize: '11px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
              
              {result.error && (
                <details style={{ fontSize: '12px', color: '#dc2626' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    View Error Details
                  </summary>
                  <pre style={{ 
                    backgroundColor: '#fef2f2',
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    fontSize: '11px',
                    color: '#dc2626'
                  }}>
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f0f9ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>
          📋 Test Instructions
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
          <li>Make sure the backend server is running on <code>http://localhost:5000</code></li>
          <li>Ensure MongoDB is running and connected</li>
          <li>Check that the forex data fetching cron job is working</li>
          <li>Verify all API endpoints are responding correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default BackendConnectionTest;
