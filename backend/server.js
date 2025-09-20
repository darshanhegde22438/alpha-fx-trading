const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const forexService = require('./services/forexService');

// Import routes
const authRoutes = require('./routes/auth');
const forexRoutes = require('./routes/forex');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forex', forexRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'AlphaFxTrader API server is running',
    version: '1.0.0'
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Try to count users
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: 'Database test successful',
      data: {
        connectionState: dbStates[dbState],
        userCount: userCount,
        databaseName: mongoose.connection.db?.databaseName || 'Unknown'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AlphaFxTrader API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      forex: '/api/forex',
      health: '/health'
    }
  });
});

// Scheduled tasks
console.log('Setting up scheduled tasks...');

// Fetch and store forex data every minute
cron.schedule('0 * * * * *', async () => {
  console.log('🔄 Fetching forex data...');
  try {
    const rateData = await forexService.fetchCurrentRates();
    await forexService.storeForexData(rateData);
    console.log('✅ Forex data fetch completed');
  } catch (error) {
    console.error('❌ Error in scheduled forex data fetch:', error.message);
  }
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 AlphaFxTrader server running on http://localhost:${port}`);
  console.log('📊 Scheduled tasks:');
  console.log('   - Forex data fetch: Every 1 minute');
  console.log('   - Moving averages: Calculated automatically with each data point');
  
  // Initial data fetch
  console.log('🔄 Performing initial data fetch...');
  try {
    const rateData = await forexService.fetchCurrentRates();
    await forexService.storeForexData(rateData);
    console.log('✅ Initial data fetch completed');
  } catch (error) {
    console.error('❌ Initial data fetch failed:', error.message);
  }
});


