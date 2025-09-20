const mongoose = require('mongoose');

const forexDataSchema = new mongoose.Schema({
  base: {
    type: String,
    required: true,
    length: 3
  },
  target: {
    type: String,
    required: true,
    length: 3
  },
  pair: {
    type: String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    default: 'exchangerate-api'
  },
  // Moving averages
  sma3: {
    type: Number,
    default: null
  },
  sma5: {
    type: Number,
    default: null
  },
  sma15: {
    type: Number,
    default: null
  }
});

// Compound index for efficient queries
forexDataSchema.index({ pair: 1, timestamp: -1 });
forexDataSchema.index({ timestamp: -1 });

const ForexData = mongoose.model('ForexData', forexDataSchema);

module.exports = ForexData;
