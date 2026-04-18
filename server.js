const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Root health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Telegram Sticker ID Bot",
    uptime: process.uptime().toFixed(1) + "s",
    timestamp: new Date().toISOString(),
  });
});

// ── Detailed health endpoint ───────────────────────────────────────
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? "connected"
      : dbState === 2
      ? "connecting"
      : dbState === 3
      ? "disconnecting"
      : "disconnected";

  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    database: dbStatus,
    uptime: process.uptime().toFixed(1) + "s",
    memory: {
      rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(1) + " MB",
      heap: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1) + " MB",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start server ───────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🌐  Health server running on port ${PORT}`);
});

// ── Graceful shutdown ──────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed. Process terminated.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = server;
