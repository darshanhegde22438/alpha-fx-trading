const forexService = require('../services/forexService');
const ForexData = require('../models/ForexData');

const forexController = {
  // Get latest forex data for dashboard
  async getLatestRates(req, res) {
    try {
      const data = await forexService.getLatestRates();
      res.json({
        success: true,
        data: data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in getLatestRates:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch latest rates',
        error: error.message 
      });
    }
  },

  // Get historical data for a specific pair
  async getHistoricalData(req, res) {
    try {
      const { pair } = req.params;
      const { limit = 100 } = req.query;
      
      const historicalData = await forexService.getHistoricalData(pair.toUpperCase(), parseInt(limit));

      res.json({
        success: true,
        data: historicalData,
        pair: pair.toUpperCase(),
        count: historicalData.length
      });
    } catch (error) {
      console.error('Error in getHistoricalData:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch historical data',
        error: error.message 
      });
    }
  },

  // Get all available currency pairs
  async getAvailablePairs(req, res) {
    try {
      const pairs = await forexService.getAvailablePairs();
      res.json({
        success: true,
        data: pairs,
        count: pairs.length
      });
    } catch (error) {
      console.error('Error in getAvailablePairs:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch available pairs',
        error: error.message 
      });
    }
  },

  // Get database statistics
  async getStats(req, res) {
    try {
      const forexCount = await ForexData.countDocuments();
      const uniquePairs = await ForexData.distinct('pair');
      
      const oldestRecord = await ForexData.findOne().sort({ timestamp: 1 });
      const latestRecord = await ForexData.findOne().sort({ timestamp: -1 });

      res.json({
        success: true,
        data: {
          forexDataPoints: forexCount,
          uniquePairs: uniquePairs.length,
          pairs: uniquePairs,
          oldestRecord: oldestRecord?.timestamp || null,
          latestRecord: latestRecord?.timestamp || null
        }
      });
    } catch (error) {
      console.error('Error in getStats:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message 
      });
    }
  },

  // Get moving averages for a specific pair
  async getMovingAverages(req, res) {
    try {
      const { pair } = req.params;
      const { limit = 50 } = req.query;
      
      const historicalData = await forexService.getHistoricalData(pair.toUpperCase(), parseInt(limit));
      
      // Filter out entries without moving averages
      const dataWithMA = historicalData.filter(entry => 
        entry.sma3 !== null && entry.sma5 !== null && entry.sma15 !== null
      );

      res.json({
        success: true,
        data: dataWithMA,
        pair: pair.toUpperCase(),
        count: dataWithMA.length
      });
    } catch (error) {
      console.error('Error in getMovingAverages:', error.message);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch moving averages',
        error: error.message 
      });
    }
  }
};

module.exports = forexController;
