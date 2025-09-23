import React, { useState, useEffect } from 'react';
import { forexAPI } from '../services/api';
import CurrencyTable from './CurrencyTable';
import MovingAverageChart from './MovingAverageChart';
import './Dashboard.css';

const Dashboard = () => {
  const [latestRates, setLatestRates] = useState([]);
  const [selectedPair, setSelectedPair] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ratesResponse, statsResponse] = await Promise.all([
        forexAPI.getLatestRates(),
        forexAPI.getStats()
      ]);

      setLatestRates(ratesResponse.data.data);
      setStats(statsResponse.data.data);
      
      // Set default selected pair if none selected
      if (!selectedPair && ratesResponse.data.data.length > 0) {
        setSelectedPair(ratesResponse.data.data[0]._id);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
  };

  if (loading && !latestRates.length) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>AlphaFxTrader Dashboard</h1>
            <div className="user-info">
              <span className="user-type-badge">
                🌐 Public Access
              </span>
              <span className="user-name">Real-time Forex Trading Dashboard</span>
            </div>
          </div>
          <div className="header-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Live Data
            </div>
          </div>
        </div>
        
        {stats && (
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">📊 Data Points:</span>
              <span className="stat-value">{stats.forexDataPoints.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">💱 Currency Pairs:</span>
              <span className="stat-value">{stats.uniquePairs}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🕐 Last Update:</span>
              <span className="stat-value">
                {stats.latestRecord ? new Date(stats.latestRecord).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🔄 Update Frequency:</span>
              <span className="stat-value">Every 1 minute</span>
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={fetchDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="table-section">
            <div className="section-header">
              <h2>Current Exchange Rates</h2>
              <p>Real-time forex rates with moving averages</p>
            </div>
            <CurrencyTable 
              rates={latestRates} 
              onPairSelect={handlePairSelect}
              selectedPair={selectedPair}
              loading={loading}
            />
          </div>
          
          <div className="chart-section">
            <div className="section-header">
              <h2>Moving Averages Analysis</h2>
              <p>
                {selectedPair ? 
                  `SMA 3, 5, and 15 minutes for ${selectedPair}` : 
                  'Select a currency pair to view moving averages'
                }
              </p>
            </div>
            {selectedPair ? (
              <MovingAverageChart 
                pair={selectedPair}
                loading={loading}
              />
            ) : (
              <div className="chart-placeholder">
                <p>Select a currency pair from the table to view moving averages</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
