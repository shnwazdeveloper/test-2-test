/**
 * start.js — Unified entry point
 * Runs the Telegram bot AND the Express health server in the same process.
 * This is what Render will execute via `npm start`.
 */

require("dotenv").config();

// Start health-check server (binds to process.env.PORT for Render)
require("./server");

// Start Telegram bot polling
require("./index");
