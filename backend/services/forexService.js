const axios = require('axios');
const ForexData = require('../models/ForexData');

// In-memory map to keep moving windows for each currency pair
const movingWindows = new Map(); 
// key: `${base}-${target}`, value: { queue3: [], sum3: 0, queue5: [], sum5: 0, queue15: [], sum15: 0 }

// Function to fetch current rates from Exchange Rate API
const fetchCurrentRates = async () => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const data = response.data;
    
    console.log('📊 Fetched rates from Exchange Rate API');
    return {
      base: data.base,
      rates: data.rates,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('❌ Error fetching rates:', error.message);
    throw error;
  }
};

// Function to store forex data in database
const storeForexData = async (rateData) => {
  try {
    const { base, rates, timestamp } = rateData;
    const storedPairs = [];

    for (const [target, rate] of Object.entries(rates)) {
      if (target === base) continue; // Skip same currency

      const pair = `${base}${target}`;
      
      const newEntry = new ForexData({
        base,
        target,
        pair,
        rate,
        timestamp,
        source: 'exchangerate-api'
      });

      await newEntry.save();
      storedPairs.push(pair);
      
      // Calculate moving averages
      await calculateMovingAverages(base, target, rate, newEntry._id);
    }

    console.log(`💾 Stored ${storedPairs.length} currency pairs`);
    return storedPairs;
  } catch (error) {
    console.error('❌ Error storing forex data:', error.message);
    throw error;
  }
};

// Function to calculate moving averages (3, 5, 15 minutes)
const calculateMovingAverages = async (base, target, newRate, entryId) => {
  const key = `${base}-${target}`;

  if (!movingWindows.has(key)) {
    movingWindows.set(key, { 
      queue3: [], sum3: 0, 
      queue5: [], sum5: 0, 
      queue15: [], sum15: 0 
    });
  }

  const window = movingWindows.get(key);

  // Calculate SMA3
  window.queue3.push(newRate);
  window.sum3 += newRate;
  if (window.queue3.length > 3) {
    const removed = window.queue3.shift();
    window.sum3 -= removed;
  }
  const sma3 = window.sum3 / window.queue3.length;

  // Calculate SMA5
  window.queue5.push(newRate);
  window.sum5 += newRate;
  if (window.queue5.length > 5) {
    const removed = window.queue5.shift();
    window.sum5 -= removed;
  }
  const sma5 = window.sum5 / window.queue5.length;

  // Calculate SMA15
  window.queue15.push(newRate);
  window.sum15 += newRate;
  if (window.queue15.length > 15) {
    const removed = window.queue15.shift();
    window.sum15 -= removed;
  }
  const sma15 = window.sum15 / window.queue15.length;

  // Update the entry with moving averages
  await ForexData.findByIdAndUpdate(entryId, { 
    sma3: sma3.toFixed(6), 
    sma5: sma5.toFixed(6), 
    sma15: sma15.toFixed(6) 
  });

  console.log(`📈 ${base}-${target}: Rate=${newRate}, SMA3=${sma3.toFixed(6)}, SMA5=${sma5.toFixed(6)}, SMA15=${sma15.toFixed(6)}`);
};

// Function to get latest rates for dashboard
const getLatestRates = async () => {
  try {
    const latestData = await ForexData.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$pair',
          latestRate: { $first: '$rate' },
          sma3: { $first: '$sma3' },
          sma5: { $first: '$sma5' },
          sma15: { $first: '$sma15' },
          timestamp: { $first: '$timestamp' },
          base: { $first: '$base' },
          target: { $first: '$target' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return latestData;
  } catch (error) {
    console.error('❌ Error getting latest rates:', error.message);
    throw error;
  }
};

// Function to get historical data for a specific pair
const getHistoricalData = async (pair, limit = 100) => {
  try {
    const historicalData = await ForexData.find({ pair })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('rate sma3 sma5 sma15 timestamp')
      .lean();

    return historicalData.reverse(); // Return in chronological order
  } catch (error) {
    console.error('❌ Error getting historical data:', error.message);
    throw error;
  }
};

// Function to get all available currency pairs
const getAvailablePairs = async () => {
  try {
    const pairs = await ForexData.distinct('pair');
    return pairs.sort();
  } catch (error) {
    console.error('❌ Error getting available pairs:', error.message);
    throw error;
  }
};

module.exports = {
  fetchCurrentRates,
  storeForexData,
  calculateMovingAverages,
  getLatestRates,
  getHistoricalData,
  getAvailablePairs
};
