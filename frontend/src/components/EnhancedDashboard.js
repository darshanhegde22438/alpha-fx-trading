import React, { useState, useEffect } from 'react';
import { forexAPI, testAPIConnection } from '../services/api';
import CurrencyTable from './CurrencyTable';
import SelectiveChart from './SelectiveChart';
import TradingPanel from './TradingPanel';
import BotTradingPanel from './BotTradingPanel';
import TradingHistory from './TradingHistory';
import './EnhancedDashboard.css';

const EnhancedDashboard = () => {
  const [latestRates, setLatestRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [selectedPair, setSelectedPair] = useState('');
  const [selectedPairData, setSelectedPairData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardType, setDashboardType] = useState('user'); // 'user' or 'bot'
  const [tradingHistory, setTradingHistory] = useState([]);
  const [portfolio, setPortfolio] = useState({
    balance: 1000000, // Starting balance
    dailyVolume: 0,
    dailyLimit: 10000000, // 10 million USD
    positions: {}
  });
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'

  // Define the allowed currencies
  const allowedCurrencies = [
    'VES', 'ZWL', 'TRY', 'ARS', 'NGN', 'SSP', 'IRR', 'AOA', 
    'EGP', 'PKR', 'UZS', 'GHS', 'UAH', 'BRL', 'INR'
  ];

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPair && latestRates.length > 0) {
      const pairData = latestRates.find(item => item._id === selectedPair);
      setSelectedPairData(pairData);
    }
  }, [selectedPair, latestRates]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // First test API connection
      console.log('🔍 Testing API connection...');
      setConnectionStatus('checking');
      try {
        await testAPIConnection();
        console.log('✅ API connection successful');
        setConnectionStatus('connected');
      } catch (apiError) {
        console.error('❌ API connection failed:', apiError);
        setConnectionStatus('disconnected');
        setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000');
        return;
      }

      // Fetch data from backend
      console.log('📊 Fetching dashboard data...');
      const [ratesResponse, statsResponse] = await Promise.all([
        forexAPI.getLatestRates(),
        forexAPI.getStats()
      ]);

      console.log('📊 Raw rates response:', ratesResponse.data);
      console.log('📊 Raw stats response:', statsResponse.data);

      // Check if responses are successful
      if (!ratesResponse.data.success) {
        throw new Error(ratesResponse.data.message || 'Failed to fetch rates');
      }
      if (!statsResponse.data.success) {
        throw new Error(statsResponse.data.message || 'Failed to fetch stats');
      }

      // Filter rates to only include allowed currencies
      const allRates = ratesResponse.data.data || [];
      console.log('📊 All rates:', allRates);
      
      // Check if we have any data at all
      if (!Array.isArray(allRates) || allRates.length === 0) {
        console.warn('⚠️ No rates data received from backend');
        setError('No forex data available. The backend may not have fetched any data yet.');
        return;
      }
      
      const filtered = allRates.filter(rate => {
        // Check if rate exists and has required properties
        if (!rate || typeof rate !== 'object') {
          console.warn('⚠️ Skipping invalid rate entry (not an object):', rate);
          return false;
        }
        
        if (!rate._id || !rate.pair) {
          console.warn('⚠️ Skipping rate entry with missing _id or pair:', rate);
          return false;
        }
        
        // Check if the pair contains any of our allowed currencies
        return allowedCurrencies.some(currency => 
          rate._id.includes(currency) || rate.pair.includes(currency)
        );
      });

      console.log('📊 Filtered rates:', filtered);
      
      // Check if we have any filtered data
      if (filtered.length === 0) {
        console.warn('⚠️ No rates match the allowed currencies filter');
        
        // Show all available currencies for debugging
        const availablePairs = allRates.map(rate => rate.pair || rate._id).filter(Boolean);
        console.log('📊 Available currency pairs from backend:', availablePairs);
        
        // For now, show all currencies as a fallback
        console.log('🔄 Using all available currencies as fallback');
        setFilteredRates(allRates);
        setError(`Showing all available currencies. Target currencies (${allowedCurrencies.join(', ')}) not found in backend data.`);
      } else {
        setFilteredRates(filtered);
        setError('');
      }

      setLatestRates(allRates);
      setStats(statsResponse.data.data);
      
      // Set default selected pair if none selected
      const currentFilteredRates = filtered.length > 0 ? filtered : allRates;
      if (!selectedPair && currentFilteredRates.length > 0) {
        setSelectedPair(currentFilteredRates[0]._id);
      }
      
      setError('');
    } catch (err) {
      console.error('❌ Dashboard data fetch error:', err);
      setError(`Failed to fetch dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
  };

  const handleBuy = (tradeData) => {
    handleTrade(tradeData);
  };

  const handleSell = (tradeData) => {
    handleTrade(tradeData);
  };

  const handleTrade = (tradeData) => {
    const newTrade = {
      id: Date.now(),
      timestamp: new Date(),
      pair: tradeData.pair || selectedPair,
      type: tradeData.type, // 'buy' or 'sell'
      amount: tradeData.amount,
      rate: tradeData.rate,
      total: tradeData.amount * tradeData.rate,
      status: 'completed'
    };

    setTradingHistory(prev => [newTrade, ...prev]);
    
    // Update portfolio
    setPortfolio(prev => ({
      ...prev,
      dailyVolume: prev.dailyVolume + newTrade.total,
      balance: tradeData.type === 'buy' 
        ? prev.balance - newTrade.total 
        : prev.balance + newTrade.total,
      positions: {
        ...prev.positions,
        [tradeData.pair || selectedPair]: {
          amount: (prev.positions[tradeData.pair || selectedPair]?.amount || 0) + 
            (tradeData.type === 'buy' ? tradeData.amount : -tradeData.amount),
          avgRate: tradeData.rate
        }
      }
    }));

    // Show success message
    const pairName = tradeData.pairData?.pair || tradeData.pair || selectedPair;
    alert(`✅ ${tradeData.type.toUpperCase()} order executed! ${tradeData.amount} units at ${tradeData.rate}`);
  };

  const handleBotTrade = (tradeData) => {
    const newTrade = {
      id: Date.now(),
      timestamp: new Date(),
      pair: selectedPair,
      type: tradeData.type,
      amount: tradeData.amount,
      rate: tradeData.rate,
      total: tradeData.amount * tradeData.rate,
      status: 'bot_automated',
      reason: tradeData.reason
    };

    setTradingHistory(prev => [newTrade, ...prev]);
    
    // Update portfolio
    setPortfolio(prev => ({
      ...prev,
      dailyVolume: prev.dailyVolume + newTrade.total,
      balance: tradeData.type === 'buy' 
        ? prev.balance - newTrade.total 
        : prev.balance + newTrade.total,
      positions: {
        ...prev.positions,
        [selectedPair]: {
          amount: (prev.positions[selectedPair]?.amount || 0) + 
            (tradeData.type === 'buy' ? tradeData.amount : -tradeData.amount),
          avgRate: tradeData.rate
        }
      }
    }));
  };

  if (loading && !filteredRates.length) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading enhanced dashboard...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>AlphaFxTrader Enhanced Dashboard</h1>
            <div className="dashboard-type-selector">
              <button 
                className={`type-button ${dashboardType === 'user' ? 'active' : ''}`}
                onClick={() => setDashboardType('user')}
              >
                👤 User Trading
              </button>
              <button 
                className={`type-button ${dashboardType === 'bot' ? 'active' : ''}`}
                onClick={() => setDashboardType('bot')}
              >
                🤖 Bot Trading
              </button>
            </div>
          </div>
          <div className="header-right">
            <div className="portfolio-info">
              <div className="balance">
                <span className="label">Balance:</span>
                <span className="value">${portfolio.balance.toLocaleString()}</span>
              </div>
              <div className="daily-volume">
                <span className="label">Daily Volume:</span>
                <span className="value">${portfolio.dailyVolume.toLocaleString()}</span>
                <span className="limit">/ ${portfolio.dailyLimit.toLocaleString()}</span>
              </div>
            </div>
            <div className="status-indicator">
              <span className={`status-dot ${connectionStatus}`}></span>
              {connectionStatus === 'connected' ? 'Live Data' : 
               connectionStatus === 'checking' ? 'Connecting...' : 
               'Disconnected'}
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
        {/* Currency Selection Section */}
        <div className="currency-selection-section">
          <div className="section-header">
            <h2>Currency Pairs</h2>
            <p>Select a currency pair to view detailed analysis and trading options</p>
          </div>
          <CurrencyTable 
            rates={filteredRates} 
            onPairSelect={handlePairSelect}
            selectedPair={selectedPair}
            loading={loading}
            onBuy={handleBuy}
            onSell={handleSell}
            portfolio={portfolio}
          />
        </div>

        {/* Split Screen Section */}
        {selectedPair && selectedPairData && (
          <div className="split-screen-section">
            {/* Left Side - Text Information */}
            <div className="text-panel">
              <div className="panel-header">
                <h3>{selectedPair} Analysis</h3>
                <div className="current-rate">
                  <span className="rate-label">Current Rate:</span>
                  <span className="rate-value">{selectedPairData.latestRate}</span>
                </div>
              </div>
              
              <div className="analysis-content">
                <div className="moving-averages">
                  <h4>Moving Averages</h4>
                  <div className="ma-grid">
                    <div className="ma-item">
                      <span className="ma-label">SMA 3:</span>
                      <span className="ma-value">{selectedPairData.sma3 || 'N/A'}</span>
                    </div>
                    <div className="ma-item">
                      <span className="ma-label">SMA 5:</span>
                      <span className="ma-value">{selectedPairData.sma5 || 'N/A'}</span>
                    </div>
                    <div className="ma-item">
                      <span className="ma-label">SMA 15:</span>
                      <span className="ma-value">{selectedPairData.sma15 || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="trend-analysis">
                  <h4>Trend Analysis</h4>
                  <div className="trend-signals">
                    <div className="signal-item">
                      <span className="signal-label">Short-term (SMA 3):</span>
                      <span className={`signal-value ${selectedPairData.latestRate > selectedPairData.sma3 ? 'bullish' : 'bearish'}`}>
                        {selectedPairData.latestRate > selectedPairData.sma3 ? '📈 Bullish' : '📉 Bearish'}
                      </span>
                    </div>
                    <div className="signal-item">
                      <span className="signal-label">Medium-term (SMA 5):</span>
                      <span className={`signal-value ${selectedPairData.latestRate > selectedPairData.sma5 ? 'bullish' : 'bearish'}`}>
                        {selectedPairData.latestRate > selectedPairData.sma5 ? '📈 Bullish' : '📉 Bearish'}
                      </span>
                    </div>
                    <div className="signal-item">
                      <span className="signal-label">Long-term (SMA 15):</span>
                      <span className={`signal-value ${selectedPairData.latestRate > selectedPairData.sma15 ? 'bullish' : 'bearish'}`}>
                        {selectedPairData.latestRate > selectedPairData.sma15 ? '📈 Bullish' : '📉 Bearish'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="trading-recommendation">
                  <h4>Trading Recommendation</h4>
                  <div className="recommendation">
                    {selectedPairData.latestRate > selectedPairData.sma3 && 
                     selectedPairData.latestRate > selectedPairData.sma5 && 
                     selectedPairData.latestRate > selectedPairData.sma15 ? (
                      <div className="recommendation-bullish">
                        <span className="recommendation-icon">🚀</span>
                        <span className="recommendation-text">Strong BUY signal - All timeframes bullish</span>
                      </div>
                    ) : selectedPairData.latestRate < selectedPairData.sma3 && 
                      selectedPairData.latestRate < selectedPairData.sma5 && 
                      selectedPairData.latestRate < selectedPairData.sma15 ? (
                      <div className="recommendation-bearish">
                        <span className="recommendation-icon">⚠️</span>
                        <span className="recommendation-text">Strong SELL signal - All timeframes bearish</span>
                      </div>
                    ) : (
                      <div className="recommendation-neutral">
                        <span className="recommendation-icon">⏳</span>
                        <span className="recommendation-text">HOLD - Mixed signals, wait for confirmation</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Chart */}
            <div className="chart-panel">
              <SelectiveChart 
                pair={selectedPair}
                pairData={selectedPairData}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Trading Section */}
        {selectedPair && selectedPairData && (
          <div className="trading-section">
            {dashboardType === 'user' ? (
              <TradingPanel 
                pair={selectedPair}
                pairData={selectedPairData}
                portfolio={portfolio}
                onTrade={handleTrade}
              />
            ) : (
              <BotTradingPanel 
                pair={selectedPair}
                pairData={selectedPairData}
                portfolio={portfolio}
                onTrade={handleBotTrade}
              />
            )}
          </div>
        )}

        {/* Trading History */}
        <div className="history-section">
          <TradingHistory 
            history={tradingHistory}
            portfolio={portfolio}
          />
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;
