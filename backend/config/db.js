const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/alphafxtrader';
    console.log('Attempting to connect to MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected successfully");
    console.log("Database name:", mongoose.connection.db.databaseName);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
