const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌  MONGODB_URI is missing in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10s timeout
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅  MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌  MongoDB connection error:", err.message);
    });
  } catch (err) {
    console.error("❌  MongoDB initial connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
