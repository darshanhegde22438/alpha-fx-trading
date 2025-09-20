import React, { useState, useEffect } from 'react';
import './BotTradingPanel.css';

const BotTradingPanel = ({ pair, pairData, portfolio, onTrade }) => {
  const [botSettings, setBotSettings] = useState({
    enabled: true,
    maxTradeAmount: 10000,
    riskLevel: 'medium', // low, medium, high
    stopLoss: 2, // percentage
    takeProfit: 5, // percentage
    tradingFrequency: 'aggressive' // conservative, moderate, aggressive
  });
  const [botStatus, setBotStatus] = useState('active');
  const [lastBotAction, setLastBotAction] = useState(null);

  // Extract base and target currencies from pair
  const [baseCurrency, targetCurrency] = pair ? pair.split('USD') : ['', ''];

  useEffect(() => {
    if (botSettings.enabled && pairData) {
      const interval = setInterval(() => {
        checkTradingOpportunity();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [botSettings, pairData]);

  const checkTradingOpportunity = () => {
    if (!pairData || !botSettings.enabled) return;

    const currentRate = parseFloat(pairData.latestRate);
    const sma3 = parseFloat(pairData.sma3);
    const sma5 = parseFloat(pairData.sma5);
    const sma15 = parseFloat(pairData.sma15);

    // Calculate trading signals
    const signals = calculateTradingSignals(currentRate, sma3, sma5, sma15);
    
    if (signals.shouldTrade) {
      executeBotTrade(signals);
    }
  };

  const calculateTradingSignals = (currentRate, sma3, sma5, sma15) => {
    const signals = {
      shouldTrade: false,
      type: null,
      confidence: 0,
      reason: ''
    };

    // Strong bullish signal
    if (currentRate > sma3 && currentRate > sma5 && currentRate > sma15) {
      const bullishStrength = ((currentRate - sma15) / sma15) * 100;
      if (bullishStrength > 0.5) {
        signals.shouldTrade = true;
        signals.type = 'buy';
        signals.confidence = Math.min(bullishStrength * 20, 100);
        signals.reason = `Strong bullish trend detected (${bullishStrength.toFixed(2)}% above SMA15)`;
      }
    }
    // Strong bearish signal
    else if (currentRate < sma3 && currentRate < sma5 && currentRate < sma15) {
      const bearishStrength = ((sma15 - currentRate) / sma15) * 100;
      if (bearishStrength > 0.5) {
        signals.shouldTrade = true;
        signals.type = 'sell';
        signals.confidence = Math.min(bearishStrength * 20, 100);
        signals.reason = `Strong bearish trend detected (${bearishStrength.toFixed(2)}% below SMA15)`;
      }
    }
    // Crossover signals
    else if (sma3 > sma5 && sma5 > sma15 && currentRate > sma3) {
      signals.shouldTrade = true;
      signals.type = 'buy';
      signals.confidence = 75;
      signals.reason = 'Golden cross detected (SMA3 > SMA5 > SMA15)';
    }
    else if (sma3 < sma5 && sma5 < sma15 && currentRate < sma3) {
      signals.shouldTrade = true;
      signals.type = 'sell';
      signals.confidence = 75;
      signals.reason = 'Death cross detected (SMA3 < SMA5 < SMA15)';
    }

    return signals;
  };

  const executeBotTrade = async (signals) => {
    if (!signals.shouldTrade) return;

    // Calculate trade amount based on risk level and confidence
    const baseAmount = botSettings.maxTradeAmount;
    const confidenceMultiplier = signals.confidence / 100;
    const riskMultiplier = botSettings.riskLevel === 'high' ? 1 : 
                          botSettings.riskLevel === 'medium' ? 0.7 : 0.4;
    
    const tradeAmount = baseAmount * confidenceMultiplier * riskMultiplier;
    const currentRate = parseFloat(pairData.latestRate);
    const totalCost = tradeAmount * currentRate;

    // Check limits
    if (totalCost > portfolio.balance) {
      console.log('Bot: Insufficient balance for trade');
      return;
    }

    if (portfolio.dailyVolume + totalCost > portfolio.dailyLimit) {
      console.log('Bot: Daily limit would be exceeded');
      return;
    }

    // Execute the trade
    onTrade({
      type: signals.type,
      amount: tradeAmount,
      rate: currentRate,
      total: totalCost,
      reason: signals.reason,
      confidence: signals.confidence
    });

    setLastBotAction({
      timestamp: new Date(),
      action: signals.type,
      amount: tradeAmount,
      rate: currentRate,
      reason: signals.reason,
      confidence: signals.confidence
    });
  };

  const handleSettingsChange = (setting, value) => {
    setBotSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="bot-trading-panel">
      <div className="panel-header">
        <h3>🤖 Bot Trading - {pair}</h3>
        <div className="bot-status">
          <span className={`status-indicator ${botStatus}`}>
            {botStatus === 'active' ? '🟢' : '🔴'} {botStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bot-content">
        <div className="bot-controls">
          <div className="control-group">
            <label>Bot Status:</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={botSettings.enabled}
                onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>

          <div className="control-group">
            <label>Currency Pair:</label>
            <div className="currency-display">
              <span className="currency-pair">{pair}</span>
              <span className="currency-description">
                Automated trading for {targetCurrency}
              </span>
            </div>
          </div>

          <div className="control-group">
            <label>Max Trade Amount ({targetCurrency}):</label>
            <input
              type="number"
              value={botSettings.maxTradeAmount}
              onChange={(e) => handleSettingsChange('maxTradeAmount', parseFloat(e.target.value))}
              min="100"
              max="100000"
              step="100"
            />
          </div>

          <div className="control-group">
            <label>Risk Level:</label>
            <select
              value={botSettings.riskLevel}
              onChange={(e) => handleSettingsChange('riskLevel', e.target.value)}
            >
              <option value="low">Low Risk (Conservative)</option>
              <option value="medium">Medium Risk (Balanced)</option>
              <option value="high">High Risk (Aggressive)</option>
            </select>
          </div>

          <div className="control-group">
            <label>Stop Loss (%):</label>
            <input
              type="number"
              value={botSettings.stopLoss}
              onChange={(e) => handleSettingsChange('stopLoss', parseFloat(e.target.value))}
              min="0.5"
              max="10"
              step="0.5"
            />
          </div>

          <div className="control-group">
            <label>Take Profit (%):</label>
            <input
              type="number"
              value={botSettings.takeProfit}
              onChange={(e) => handleSettingsChange('takeProfit', parseFloat(e.target.value))}
              min="1"
              max="20"
              step="0.5"
            />
          </div>
        </div>

        <div className="bot-info">
          <div className="trading-strategy">
            <h4>🤖 Trading Strategy</h4>
            <div className="strategy-details">
              <div className="strategy-item">
                <span className="strategy-label">Signal Detection:</span>
                <span className="strategy-value">Moving Average Crossovers</span>
              </div>
              <div className="strategy-item">
                <span className="strategy-label">Entry Conditions:</span>
                <span className="strategy-value">SMA3, SMA5, SMA15 alignment</span>
              </div>
              <div className="strategy-item">
                <span className="strategy-label">Risk Management:</span>
                <span className="strategy-value">
                  {botSettings.stopLoss}% Stop Loss, {botSettings.takeProfit}% Take Profit
                </span>
              </div>
              <div className="strategy-item">
                <span className="strategy-label">Trade Frequency:</span>
                <span className="strategy-value">Every 30 seconds (when signals detected)</span>
              </div>
            </div>
          </div>

          {lastBotAction && (
            <div className="last-action">
              <h4>📊 Last Bot Action</h4>
              <div className="action-details">
                <div className="action-item">
                  <span className="action-label">Time:</span>
                  <span className="action-value">
                    {lastBotAction.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="action-item">
                  <span className="action-label">Action:</span>
                  <span className={`action-value ${lastBotAction.action}`}>
                    {lastBotAction.action.toUpperCase()}
                  </span>
                </div>
                <div className="action-item">
                  <span className="action-label">Amount:</span>
                  <span className="action-value">
                    {lastBotAction.amount.toFixed(2)} units
                  </span>
                </div>
                <div className="action-item">
                  <span className="action-label">Rate:</span>
                  <span className="action-value">{lastBotAction.rate}</span>
                </div>
                <div className="action-item">
                  <span className="action-label">Confidence:</span>
                  <span className="action-value">
                    {lastBotAction.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="action-item">
                  <span className="action-label">Reason:</span>
                  <span className="action-value">{lastBotAction.reason}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bot-performance">
            <h4>📈 Bot Performance</h4>
            <div className="performance-stats">
              <div className="perf-item">
                <span className="perf-label">Daily Volume:</span>
                <span className="perf-value">
                  ${portfolio.dailyVolume.toLocaleString()}
                </span>
              </div>
              <div className="perf-item">
                <span className="perf-label">Remaining Limit:</span>
                <span className="perf-value">
                  ${(portfolio.dailyLimit - portfolio.dailyVolume).toLocaleString()}
                </span>
              </div>
              <div className="perf-item">
                <span className="perf-label">Available Balance:</span>
                <span className="perf-value">
                  ${portfolio.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bot-warning">
            <h4>⚠️ Bot Trading Warning</h4>
            <p>
              Automated trading carries significant risks. The bot uses algorithmic strategies 
              based on moving averages but cannot guarantee profits. Monitor your positions 
              regularly and adjust settings as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotTradingPanel;
