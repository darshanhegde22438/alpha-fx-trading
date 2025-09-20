import React from 'react';
import './CurrencyTable.css';

const CurrencyTable = ({ rates, onPairSelect, selectedPair, loading, onBuy, onSell, portfolio }) => {
  // Get first 10 currencies only
  const displayRates = Array.isArray(rates) ? rates.slice(0, 10) : [];
  const formatRate = (rate) => {
    return typeof rate === 'number' ? rate.toFixed(6) : 'N/A';
  };

  const formatSMA = (sma) => {
    return sma ? parseFloat(sma).toFixed(6) : 'N/A';
  };

  const getSMAStatus = (rate, sma3, sma5, sma15) => {
    if (!sma3 || !sma5 || !sma15) return 'neutral';
    
    const currentRate = parseFloat(rate);
    const sma3Val = parseFloat(sma3);
    const sma5Val = parseFloat(sma5);
    const sma15Val = parseFloat(sma15);
    
    // Bullish: current rate > all SMAs
    if (currentRate > sma3Val && currentRate > sma5Val && currentRate > sma15Val) {
      return 'bullish';
    }
    
    // Bearish: current rate < all SMAs
    if (currentRate < sma3Val && currentRate < sma5Val && currentRate < sma15Val) {
      return 'bearish';
    }
    
    return 'neutral';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'bullish': return '#10b981';
      case 'bearish': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleBuy = (e, rate) => {
    e.stopPropagation();
    if (onBuy) {
      onBuy({
        pair: rate._id,
        pairData: rate,
        type: 'buy',
        amount: 1000, // Default amount
        rate: parseFloat(rate.latestRate),
        total: 1000 * parseFloat(rate.latestRate)
      });
    }
  };

  const handleSell = (e, rate) => {
    e.stopPropagation();
    if (onSell) {
      onSell({
        pair: rate._id,
        pairData: rate,
        type: 'sell',
        amount: 1000, // Default amount
        rate: parseFloat(rate.latestRate),
        total: 1000 * parseFloat(rate.latestRate)
      });
    }
  };

  const handlePriceClick = (e, rate) => {
    e.stopPropagation();
    // Quick buy on price click
    handleBuy(e, rate);
  };

  if (loading && displayRates.length === 0) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading currency rates...</p>
      </div>
    );
  }

  return (
    <div className="currency-table-container">
      <div className="table-header">
        <h3>Top 10 Currency Pairs</h3>
        <p>Interactive trading table - Click prices to buy, use buttons to trade</p>
      </div>
      <div className="table-wrapper">
        <table className="currency-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Current Rate (Click to Buy)</th>
              <th>SMA 3</th>
              <th>SMA 5</th>
              <th>SMA 15</th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayRates.map((rate) => {
              const status = getSMAStatus(rate.latestRate, rate.sma3, rate.sma5, rate.sma15);
              const isSelected = selectedPair === rate._id;
              
              return (
                <tr 
                  key={rate._id} 
                  className={`table-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => onPairSelect(rate._id)}
                >
                  <td className="pair-cell">
                    <span className="pair-symbol">{rate._id}</span>
                    <span className="pair-description">
                      {rate.base}/{rate.target}
                    </span>
                  </td>
                  <td className="rate-cell">
                    <span 
                      className="rate-value clickable-price"
                      onClick={(e) => handlePriceClick(e, rate)}
                      title="Click to buy at current rate"
                    >
                      {formatRate(rate.latestRate)}
                    </span>
                  </td>
                  <td className="sma-cell">
                    <span className="sma-value">
                      {formatSMA(rate.sma3)}
                    </span>
                  </td>
                  <td className="sma-cell">
                    <span className="sma-value">
                      {formatSMA(rate.sma5)}
                    </span>
                  </td>
                  <td className="sma-cell">
                    <span className="sma-value">
                      {formatSMA(rate.sma15)}
                    </span>
                  </td>
                  <td className="trend-cell">
                    <span 
                      className="trend-indicator"
                      style={{ color: getStatusColor(status) }}
                    >
                      {getStatusIcon(status)}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button 
                        className={`select-button ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPairSelect(rate._id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                      <div className="trade-buttons">
                        <button 
                          className="buy-button"
                          onClick={(e) => handleBuy(e, rate)}
                          title="Quick Buy 1000 units"
                        >
                          📈 Buy
                        </button>
                        <button 
                          className="sell-button"
                          onClick={(e) => handleSell(e, rate)}
                          title="Quick Sell 1000 units"
                        >
                          📉 Sell
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {displayRates.length === 0 && !loading && (
        <div className="no-data">
          <p>No currency data available</p>
        </div>
      )}
    </div>
  );
};

export default CurrencyTable;
