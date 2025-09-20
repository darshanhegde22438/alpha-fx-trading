import React, { useState } from 'react';
import './TradingHistory.css';

const TradingHistory = ({ history, portfolio }) => {
  const [filter, setFilter] = useState('all'); // all, buy, sell, bot

  const filteredHistory = history.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'bot') return trade.status === 'bot_automated';
    return trade.type === filter;
  });

  const getTradeIcon = (trade) => {
    if (trade.status === 'bot_automated') {
      return trade.type === 'buy' ? '🤖📈' : '🤖📉';
    }
    return trade.type === 'buy' ? '📈' : '📉';
  };

  const getTradeStatusColor = (trade) => {
    if (trade.status === 'bot_automated') return 'bot';
    return trade.type === 'buy' ? 'buy' : 'sell';
  };

  const calculateProfitLoss = (trade) => {
    // This is a simplified calculation
    // In a real app, you'd track entry/exit prices for each position
    const currentRate = 1.0; // Placeholder - would get from current market data
    const entryRate = trade.rate;
    const difference = trade.type === 'buy' 
      ? (currentRate - entryRate) / entryRate * 100
      : (entryRate - currentRate) / entryRate * 100;
    
    return difference;
  };

  return (
    <div className="trading-history">
      <div className="history-header">
        <h3>📊 Trading History</h3>
        <div className="history-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Trades
          </button>
          <button 
            className={`filter-btn ${filter === 'buy' ? 'active' : ''}`}
            onClick={() => setFilter('buy')}
          >
            Buy Orders
          </button>
          <button 
            className={`filter-btn ${filter === 'sell' ? 'active' : ''}`}
            onClick={() => setFilter('sell')}
          >
            Sell Orders
          </button>
          <button 
            className={`filter-btn ${filter === 'bot' ? 'active' : ''}`}
            onClick={() => setFilter('bot')}
          >
            Bot Trades
          </button>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h4>💰 Portfolio Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Balance:</span>
              <span className="summary-value">${portfolio.balance.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Daily Volume:</span>
              <span className="summary-value">${portfolio.dailyVolume.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Daily Limit:</span>
              <span className="summary-value">${portfolio.dailyLimit.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Remaining Limit:</span>
              <span className="summary-value">
                ${(portfolio.dailyLimit - portfolio.dailyVolume).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="positions-card">
          <h4>📈 Open Positions</h4>
          {Object.keys(portfolio.positions).length > 0 ? (
            <div className="positions-list">
              {Object.entries(portfolio.positions).map(([pair, position]) => (
                <div key={pair} className="position-item">
                  <div className="position-pair">{pair}</div>
                  <div className="position-details">
                    <span>Amount: {position.amount.toFixed(2)}</span>
                    <span>Avg Rate: {position.avgRate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-positions">No open positions</p>
          )}
        </div>
      </div>

      <div className="history-content">
        {filteredHistory.length > 0 ? (
          <div className="trades-table">
            <div className="table-header">
              <div className="header-cell">Time</div>
              <div className="header-cell">Pair</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Amount</div>
              <div className="header-cell">Rate</div>
              <div className="header-cell">Total</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Reason</div>
            </div>
            
            <div className="table-body">
              {filteredHistory.map((trade) => (
                <div key={trade.id} className="trade-row">
                  <div className="table-cell time">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="table-cell pair">
                    {trade.pair}
                  </div>
                  <div className={`table-cell type ${getTradeStatusColor(trade)}`}>
                    <span className="trade-icon">{getTradeIcon(trade)}</span>
                    {trade.type.toUpperCase()}
                  </div>
                  <div className="table-cell amount">
                    {trade.amount.toFixed(2)}
                  </div>
                  <div className="table-cell rate">
                    {trade.rate}
                  </div>
                  <div className="table-cell total">
                    ${trade.total.toFixed(2)}
                  </div>
                  <div className={`table-cell status ${trade.status}`}>
                    {trade.status === 'bot_automated' ? '🤖 Bot' : '✅ Manual'}
                  </div>
                  <div className="table-cell reason">
                    {trade.reason || 'Manual trade'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-trades">
            <div className="no-trades-icon">📊</div>
            <h4>No trades found</h4>
            <p>
              {filter === 'all' 
                ? 'Start trading to see your history here'
                : `No ${filter} trades found`
              }
            </p>
          </div>
        )}
      </div>

      <div className="history-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Total Buy Orders</div>
              <div className="stat-value">
                {history.filter(t => t.type === 'buy').length}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-content">
              <div className="stat-label">Total Sell Orders</div>
              <div className="stat-value">
                {history.filter(t => t.type === 'sell').length}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <div className="stat-label">Bot Trades</div>
              <div className="stat-value">
                {history.filter(t => t.status === 'bot_automated').length}
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Total Volume</div>
              <div className="stat-value">
                ${history.reduce((sum, trade) => sum + trade.total, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingHistory;
