const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  base: { type: String, required: true },
  target: { type: String, required: true },
  rate: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Rate", rateSchema);
