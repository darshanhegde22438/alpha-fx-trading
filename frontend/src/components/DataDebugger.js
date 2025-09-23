import React, { useState, useEffect } from 'react';
import { forexAPI } from '../services/api';

const DataDebugger = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runDebug = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Running data debug...');
      
      const [ratesResponse, statsResponse] = await Promise.all([
        forexAPI.getLatestRates(),
        forexAPI.getStats()
      ]);

      const debugInfo = {
        timestamp: new Date().toISOString(),
        ratesResponse: {
          success: ratesResponse.data.success,
          dataType: Array.isArray(ratesResponse.data.data) ? 'array' : typeof ratesResponse.data.data,
          dataLength: Array.isArray(ratesResponse.data.data) ? ratesResponse.data.data.length : 'N/A',
          sampleData: Array.isArray(ratesResponse.data.data) && ratesResponse.data.data.length > 0 
            ? ratesResponse.data.data.slice(0, 3) 
            : ratesResponse.data.data,
          fullResponse: ratesResponse.data
        },
        statsResponse: {
          success: statsResponse.data.success,
          data: statsResponse.data.data,
          fullResponse: statsResponse.data
        }
      };

      setDebugData(debugInfo);
      console.log('🔍 Debug data collected:', debugInfo);
      
    } catch (err) {
      console.error('❌ Debug error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDataStructure = (data) => {
    if (!data) return 'No data';
    
    if (Array.isArray(data)) {
      if (data.length === 0) return 'Empty array';
      
      const firstItem = data[0];
      const analysis = {
        type: 'array',
        length: data.length,
        sampleItem: firstItem,
        sampleKeys: firstItem ? Object.keys(firstItem) : [],
        hasId: firstItem && 'id' in firstItem,
        hasPair: firstItem && 'pair' in firstItem,
        hasRate: firstItem && 'rate' in firstItem,
        hasSMA: firstItem && ('sma3' in firstItem || 'sma5' in firstItem || 'sma15' in firstItem)
      };
      
      return analysis;
    }
    
    return typeof data;
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h2>🔍 Data Structure Debugger</h2>
      
      <button 
        onClick={runDebug}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#6b7280' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '🔄 Debugging...' : '🚀 Run Data Debug'}
      </button>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugData && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Rates Analysis */}
          <div style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
              📊 Rates Data Analysis
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Success:</strong> {debugData.ratesResponse.success ? '✅ Yes' : '❌ No'}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Data Type:</strong> {debugData.ratesResponse.dataType}
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Data Length:</strong> {debugData.ratesResponse.dataLength}
            </div>

            {debugData.ratesResponse.sampleData && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Sample Data:</strong>
                <pre style={{
                  backgroundColor: '#f3f4f6',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(debugData.ratesResponse.sampleData, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <strong>Data Structure Analysis:</strong>
              <pre style={{
                backgroundColor: '#f0f9ff',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {JSON.stringify(analyzeDataStructure(debugData.ratesResponse.sampleData), null, 2)}
              </pre>
            </div>
          </div>

          {/* Stats Analysis */}
          <div style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
              📈 Stats Data Analysis
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Success:</strong> {debugData.statsResponse.success ? '✅ Yes' : '❌ No'}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong>Stats Data:</strong>
              <pre style={{
                backgroundColor: '#f3f4f6',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {JSON.stringify(debugData.statsResponse.data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Full Response Data */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              🔍 View Full API Responses
            </summary>
            <div style={{ marginTop: '12px' }}>
              <h4>Rates Response:</h4>
              <pre style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '11px',
                border: '1px solid #e5e7eb'
              }}>
                {JSON.stringify(debugData.ratesResponse.fullResponse, null, 2)}
              </pre>
              
              <h4>Stats Response:</h4>
              <pre style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '11px',
                border: '1px solid #e5e7eb'
              }}>
                {JSON.stringify(debugData.statsResponse.fullResponse, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default DataDebugger;
