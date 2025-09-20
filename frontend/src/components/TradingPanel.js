import React, { useState, useEffect } from 'react';
import './TradingPanel.css';

const TradingPanel = ({ pair, pairData, portfolio, onTrade }) => {
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract base and target currencies from pair
  const [baseCurrency, targetCurrency] = pair ? pair.split('USD') : ['', ''];

  useEffect(() => {
    if (targetCurrency) {
      setSelectedCurrency(targetCurrency);
    }
  }, [targetCurrency]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const tradeAmount = parseFloat(amount);
    const currentRate = parseFloat(pairData.latestRate);
    const totalCost = tradeAmount * currentRate;

    // Check if user has enough balance
    if (tradeType === 'buy' && totalCost > portfolio.balance) {
      alert('Insufficient balance for this trade');
      return;
    }

    // Check daily volume limit
    if (portfolio.dailyVolume + totalCost > portfolio.dailyLimit) {
      alert('Daily trading limit exceeded');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      onTrade({
        type: tradeType,
        amount: tradeAmount,
        rate: currentRate,
        total: totalCost
      });

      // Reset form
      setAmount('');
      alert(`${tradeType.toUpperCase()} order executed successfully!`);
    } catch (error) {
      alert('Trade execution failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTradeRecommendation = () => {
    if (!pairData) return null;

    const currentRate = parseFloat(pairData.latestRate);
    const sma3 = parseFloat(pairData.sma3);
    const sma5 = parseFloat(pairData.sma5);
    const sma15 = parseFloat(pairData.sma15);

    if (currentRate > sma3 && currentRate > sma5 && currentRate > sma15) {
      return { type: 'buy', strength: 'strong', reason: 'All timeframes bullish' };
    } else if (currentRate < sma3 && currentRate < sma5 && currentRate < sma15) {
      return { type: 'sell', strength: 'strong', reason: 'All timeframes bearish' };
    } else if (currentRate > sma3 && currentRate > sma5) {
      return { type: 'buy', strength: 'moderate', reason: 'Short and medium term bullish' };
    } else if (currentRate < sma3 && currentRate < sma5) {
      return { type: 'sell', strength: 'moderate', reason: 'Short and medium term bearish' };
    } else {
      return { type: 'hold', strength: 'weak', reason: 'Mixed signals' };
    }
  };

  const recommendation = getTradeRecommendation();

  return (
    <div className="trading-panel">
      <div className="panel-header">
        <h3>Manual Trading - {pair}</h3>
        <div className="current-rate-display">
          <span className="rate-label">Current Rate:</span>
          <span className="rate-value">{pairData.latestRate}</span>
        </div>
      </div>

      <div className="trading-content">
        <div className="trade-form">
          <div className="form-group">
            <label>Trade Type:</label>
            <div className="trade-type-selector">
              <button
                className={`trade-type-btn ${tradeType === 'buy' ? 'active buy' : ''}`}
                onClick={() => setTradeType('buy')}
              >
                📈 BUY
              </button>
              <button
                className={`trade-type-btn ${tradeType === 'sell' ? 'active sell' : ''}`}
                onClick={() => setTradeType('sell')}
              >
                📉 SELL
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Currency Pair:</label>
            <div className="currency-display">
              <span className="currency-pair">{pair}</span>
              <span className="currency-description">
                {tradeType === 'buy' 
                  ? `Buying ${targetCurrency} with USD` 
                  : `Selling ${targetCurrency} for USD`
                }
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Quantity ({targetCurrency}):</label>
            <div className="quantity-input-group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter quantity"
                min="0"
                step="0.01"
                className="quantity-input"
              />
              <div className="quantity-buttons">
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => setAmount((parseFloat(amount) || 0) + 100)}
                >
                  +100
                </button>
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => setAmount((parseFloat(amount) || 0) + 1000)}
                >
                  +1K
                </button>
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => setAmount((parseFloat(amount) || 0) + 10000)}
                >
                  +10K
                </button>
              </div>
            </div>
          </div>

          <div className="trade-summary">
            <div className="summary-item">
              <span className="summary-label">Current Rate:</span>
              <span className="summary-value">{pairData.latestRate}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Quantity:</span>
              <span className="summary-value">
                {amount || '0'} {targetCurrency}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Cost:</span>
              <span className="summary-value">
                ${amount ? (parseFloat(amount) * parseFloat(pairData.latestRate)).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Trade Type:</span>
              <span className={`summary-value ${tradeType}`}>
                {tradeType === 'buy' ? '📈 BUY' : '📉 SELL'}
              </span>
            </div>
          </div>

          <button
            className={`execute-trade-btn ${tradeType}`}
            onClick={handleTrade}
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? 'Executing...' : `Execute ${tradeType.toUpperCase()}`}
          </button>
        </div>

        <div className="trading-info">
          <div className="recommendation-card">
            <h4>AI Recommendation</h4>
            <div className={`recommendation ${recommendation.type} ${recommendation.strength}`}>
              <div className="recommendation-icon">
                {recommendation.type === 'buy' && '📈'}
                {recommendation.type === 'sell' && '📉'}
                {recommendation.type === 'hold' && '⏳'}
              </div>
              <div className="recommendation-content">
                <div className="recommendation-action">
                  {recommendation.type.toUpperCase()}
                </div>
                <div className="recommendation-reason">
                  {recommendation.reason}
                </div>
              </div>
            </div>
          </div>

          <div className="portfolio-info">
            <h4>Portfolio Status</h4>
            <div className="portfolio-stats">
              <div className="stat-item">
                <span className="stat-label">Available Balance:</span>
                <span className="stat-value">${portfolio.balance.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Daily Volume:</span>
                <span className="stat-value">
                  ${portfolio.dailyVolume.toLocaleString()} / ${portfolio.dailyLimit.toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Remaining Limit:</span>
                <span className="stat-value">
                  ${(portfolio.dailyLimit - portfolio.dailyVolume).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="risk-warning">
            <h4>⚠️ Risk Warning</h4>
            <p>
              Forex trading involves substantial risk and may not be suitable for all investors. 
              Past performance is not indicative of future results. Please trade responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPanel;
