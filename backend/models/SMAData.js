const axios = require('axios');
const ForexData = require('../models/ForexData');
const SMAData = require('../models/SMAData');

class ForexService {
  // Fetch current rates from API
  async fetchCurrentRates() {
    try {
      // Using exchangerate-api.com (free tier)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      return response.data.rates;
    } catch (error) {
      console.error('Error fetching from exchangerate-api, trying freeforexapi:', error.message);
      
      // Fallback to mock data for development
      return {
        'EUR': Math.random() * 0.1 + 0.85,
        'GBP': Math.random() * 0.1 + 0.75,
        'JPY': Math.random() * 10 + 145,
        'AUD': Math.random() * 0.05 + 0.65,
        'CAD': Math.random() * 0.05 + 1.35,
        'CHF': Math.random() * 0.05 + 0.90,
        'CNY': Math.random() * 0.5 + 7.0,
        'INR': Math.random() * 5 + 82
      };
    }
  }

  // Store forex data in MongoDB
  async storeForexData(rates) {
    const timestamp = new Date();
    const documents = [];
    
    for (const [target, rate] of Object.entries(rates)) {
      if (typeof rate === 'number') {
        documents.push({
          base: 'USD',
          target: target,
          pair: `USD${target}`,
          rate: rate,
          timestamp: timestamp
        });
      }
    }
    
    try {
      await ForexData.insertMany(documents);
      console.log(`Stored ${documents.length} forex data points at ${timestamp.toLocaleString()}`);
      return documents.length;
    } catch (error) {
      console.error('Error storing forex data:', error.message);
      return 0;
    }
  }

  // Calculate SMA for given time period
  async calculateSMA(pair, minutes) {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    try {
      const data = await ForexData.find({
        pair: pair,
        timestamp: { $gte: cutoffTime }
      }).sort({ timestamp: 1 });

      if (data.length === 0) return null;

      const sum = data.reduce((acc, item) => acc + item.rate, 0);
      return sum / data.length;
    } catch (error) {
      console.error(`Error calculating SMA for ${pair} (${minutes}min):`, error.message);
      return null;
    }
  }

  // Calculate and store all SMAs for all pairs
  async calculateAndStoreSMAs() {
    try {
      // Get all unique pairs from recent data (last 30 minutes)
      const recentPairs = await ForexData.distinct('pair', {
        timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
      });

      const smaDocuments = [];
      const timestamp = new Date();

      for (const pair of recentPairs) {
        const sma3min = await this.calculateSMA(pair, 3);
        const sma5min = await this.calculateSMA(pair, 5);
        const sma15min = await this.calculateSMA(pair, 15);
        const sma30min = await this.calculateSMA(pair, 30);

        // Count data points used for validation
        const dataPointsCount = await ForexData.countDocuments({
          pair: pair,
          timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
        });

        smaDocuments.push({
          pair: pair,
          sma3min: sma3min,
          sma5min: sma5min,
          sma15min: sma15min,
          sma30min: sma30min,
          calculatedAt: timestamp,
          dataPointsUsed: dataPointsCount
        });
      }

      if (smaDocuments.length > 0) {
        await SMAData.insertMany(smaDocuments);
        console.log(`Calculated and stored SMAs for ${smaDocuments.length} pairs at ${timestamp.toLocaleString()}`);
      }

      return smaDocuments.length;
    } catch (error) {
      console.error('Error calculating SMAs:', error.message);
      return 0;
    }
  }

  // Get latest data with SMAs for frontend
  async getLatestDataWithSMAs() {
    try {
      // Get latest forex data
      const latestForexData = await ForexData.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$pair',
            base: { $first: '$base' },
            target: { $first: '$target' },
            rate: { $first: '$rate' },
            timestamp: { $first: '$timestamp' }
          }
        }
      ]);

      // Get latest SMAs
      const latestSMAs = await SMAData.aggregate([
        { $sort: { calculatedAt: -1 } },
        {
          $group: {
            _id: '$pair',
            sma3min: { $first: '$sma3min' },
            sma5min: { $first: '$sma5min' },
            sma15min: { $first: '$sma15min' },
            sma30min: { $first: '$sma30min' },
            calculatedAt: { $first: '$calculatedAt' },
            dataPointsUsed: { $first: '$dataPointsUsed' }
          }
        }
      ]);

      // Combine forex data with SMAs
      const combinedData = latestForexData.map(forex => {
        const smaData = latestSMAs.find(sma => sma._id === forex._id);
        return {
          _id: forex._id,
          base: forex.base,
          target: forex.target,
          pair: forex._id,
          rate: forex.rate,
          timestamp: forex.timestamp,
          sma3min: smaData?.sma3min || null,
          sma5min: smaData?.sma5min || null,
          sma15min: smaData?.sma15min || null,
          sma30min: smaData?.sma30min || null,
          smaCalculatedAt: smaData?.calculatedAt || null,
          dataPointsUsed: smaData?.dataPointsUsed || 0
        };
      });

      return combinedData;
    } catch (error) {
      console.error('Error getting latest data with SMAs:', error.message);
      return [];
    }
  }
}

module.exports = new ForexService();
