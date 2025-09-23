const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// POST /api/trading/run-bot
router.post("/run-bot", (req, res) => {
  const pythonPath = process.env.PYTHON_PATH || "python";
  const scriptPath = path.join(__dirname, "..", "trading_bot.py");

  const child = spawn(pythonPath, [scriptPath]);

  let output = "";
  let errorOutput = "";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  child.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        success: false,
        error: errorOutput || "Trading bot failed"
      });
    }
    return res.json({
      success: true,
      message: "Random trading bot executed",
      logs: output
    });
  });
});

// GET /api/trading/download-trades
router.get("/download-trades", (req, res) => {
  const filePath = path.join(__dirname, "..", "models", "trading_simulation_results.csv");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "No results available yet" });
  }
  res.download(filePath, "trading_simulation_results.csv");
});

module.exports = router;
