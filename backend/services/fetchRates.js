const axios = require("axios");
const ForexData = require("../models/ForexData");

// In-memory map to keep last 5 and 3 rates per base-target
const movingWindows = new Map(); 
// key: `${base}-${target}`, value: { queue5: [], sum5: 0, queue3: [], sum3: 0 }

// Function to fetch API data and store in DB
const fetchAndStoreRates = async (user) => {
  try {
    const response = await axios.get(process.env.EXCHANGE_API_URL);
    const data = response.data;

    const base = data.base;
    const rates = data.rates;

    for (const [target, rate] of Object.entries(rates)) {
      const newEntry = new ForexData({
        base,
        target,
        rate,
        userType: user.type,
        userId: user.id,
        username: user.name,
        sma5: null, // will update below
        sma3: null  // will update below
      });

      await newEntry.save();
      
      // Calculate SMA5 and SMA3 after saving
      await calculateSMAs(base, target, rate, newEntry._id);
    }

    console.log("💾 Forex data saved with user info");
  } catch (err) {
    console.error("❌ Error fetching/storing rates:", err.message);
  }
};

// Function to calculate SMA5 and SMA3 using sliding window
const calculateSMAs = async (base, target, newRate, entryId) => {
  const key = `${base}-${target}`;

  if (!movingWindows.has(key)) {
    movingWindows.set(key, { queue5: [], sum5: 0, queue3: [], sum3: 0 });
  }

  const window = movingWindows.get(key);

  // --- SMA5 ---
  window.queue5.push(newRate);
  window.sum5 += newRate;
  if (window.queue5.length > 5) {
    const removed = window.queue5.shift();
    window.sum5 -= removed;
  }
  const sma5 = window.sum5 / window.queue5.length;

  // --- SMA3 ---
  window.queue3.push(newRate);
  window.sum3 += newRate;
  if (window.queue3.length > 3) {
    const removed = window.queue3.shift();
    window.sum3 -= removed;
  }
  const sma3 = window.sum3 / window.queue3.length;

  // Update the latest entry with SMA5 and SMA3
  await ForexData.findByIdAndUpdate(entryId, { sma5, sma3 });

  console.log(`SMA5 for ${base}-${target}: ${sma5}, SMA3: ${sma3}`);
};

module.exports = fetchAndStoreRates;
