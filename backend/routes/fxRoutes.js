const express = require("express");
const router = express.Router();
const ForexData = require("../models/ForexData");
const axios = require("axios");

// In-memory sliding windows for SMA calculation
const movingWindows = new Map(); // key: "base-target" => { queue3, sum3, queue5, sum5 }

router.get("/", async (req, res) => {
  try {
    const data = await ForexData.find().sort({ timestamp: -1 }).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to fetch from API, store, and calculate SMA
router.get("/fetch-and-store", async (req, res) => {
  try {
    const apiRes = await axios.get(process.env.EXCHANGE_API_URL);
    const base = apiRes.data.base;
    const rates = apiRes.data.rates;

    for (const [target, rate] of Object.entries(rates)) {
      const key = `${base}-${target}`;
      if (!movingWindows.has(key)) {
        movingWindows.set(key, { queue3: [], sum3: 0, queue5: [], sum5: 0 });
      }

      const window = movingWindows.get(key);

      // SMA3
      window.queue3.push(rate);
      window.sum3 += rate;
      if (window.queue3.length > 3) {
        window.sum3 -= window.queue3.shift();
      }
      const sma3 = window.sum3 / window.queue3.length;

      // SMA5
      window.queue5.push(rate);
      window.sum5 += rate;
      if (window.queue5.length > 5) {
        window.sum5 -= window.queue5.shift();
      }
      const sma5 = window.sum5 / window.queue5.length;

      const newEntry = new ForexData({
        base,
        target,
        rate,
        sma3,
        sma5,
        userType: "system",
        username: "system",
      });

      await newEntry.save();
    }

    res.json({ message: "Rates fetched and stored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
