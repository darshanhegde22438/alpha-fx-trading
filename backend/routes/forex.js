const express = require('express');
const router = express.Router();
const forexController = require('../controllers/forexController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (for dashboard display)
router.get('/latest-rates', forexController.getLatestRates);
router.get('/available-pairs', forexController.getAvailablePairs);
router.get('/stats', forexController.getStats);

// Protected routes (require authentication)
router.get('/historical/:pair', authenticateToken, forexController.getHistoricalData);
router.get('/moving-averages/:pair', authenticateToken, forexController.getMovingAverages);

module.exports = router;