require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const StickerLog = require("./models/StickerLog");

// ── Validate env vars ──────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌  BOT_TOKEN is missing in environment variables.");
  process.exit(1);
}

// ── Connect to MongoDB ─────────────────────────────────────────────
connectDB();

// ── Init bot ───────────────────────────────────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖  Telegram Sticker ID Bot is running...");

// ── /start command ─────────────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "there";
  bot.sendMessage(
    msg.chat.id,
    `👋 Hello, *${name}*!\n\n` +
      `Send me any *sticker* and I'll reply with its full details:\n` +
      `• 🆔 File ID\n` +
      `• 🔑 File Unique ID\n` +
      `• 📦 Pack Name\n` +
      `• 😄 Emoji\n` +
      `• 📐 Dimensions\n\n` +
      `You can also send a *sticker pack link* like:\n` +
      "`https://t.me/addstickers/PackName`\n\n" +
      `and I'll extract the pack name for you!\n\n` +
      `Commands:\n` +
      `/start - Show this message\n` +
      `/help  - Help guide\n` +
      `/stats - Bot usage stats`,
    { parse_mode: "Markdown" }
  );
});

// ── /help command ──────────────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📖 *How to use this bot:*\n\n` +
      `1️⃣  Forward or send any sticker directly in chat.\n` +
      `2️⃣  The bot replies instantly with the sticker's IDs and metadata.\n` +
      `3️⃣  Paste a Telegram sticker pack link to extract its pack name.\n\n` +
      `*Why do you need a File ID?*\n` +
      `File IDs are used by bot developers to send pre-uploaded stickers without re-uploading them — saving bandwidth and time.\n\n` +
      `*What is File Unique ID?*\n` +
      `A stable ID that never changes, even across different bots — great for deduplication.`,
    { parse_mode: "Markdown" }
  );
});

// ── /stats command ─────────────────────────────────────────────────
bot.onText(/\/stats/, async (msg) => {
  try {
    const total = await StickerLog.countDocuments();
    const unique = await StickerLog.distinct("fileUniqueId");
    const userCount = await StickerLog.distinct("userId");
    bot.sendMessage(
      msg.chat.id,
      `📊 *Bot Statistics*\n\n` +
        `• Total stickers scanned: *${total}*\n` +
        `• Unique stickers: *${unique.length}*\n` +
        `• Unique users: *${userCount.length}*`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("Stats error:", err.message);
    bot.sendMessage(msg.chat.id, "⚠️ Could not fetch stats right now.");
  }
});

// ── Sticker handler ────────────────────────────────────────────────
bot.on("sticker", async (msg) => {
  const sticker = msg.sticker;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const username = msg.from?.username || "unknown";

  const fileId = sticker.file_id;
  const fileUniqueId = sticker.file_unique_id;
  const setName = sticker.set_name || "_(not part of a pack)_";
  const emoji = sticker.emoji || "—";
  const width = sticker.width;
  const height = sticker.height;
  const isAnimated = sticker.is_animated ? "✅ Yes" : "❌ No";
  const isVideo = sticker.is_video ? "✅ Yes" : "❌ No";
  const fileSize = sticker.file_size
    ? `${(sticker.file_size / 1024).toFixed(1)} KB`
    : "Unknown";

  const reply =
    `🎯 *Sticker Details*\n\n` +
    `🆔 *File ID:*\n\`${fileId}\`\n\n` +
    `🔑 *File Unique ID:*\n\`${fileUniqueId}\`\n\n` +
    `📦 *Pack Name:* ${setName}\n` +
    `😄 *Emoji:* ${emoji}\n` +
    `📐 *Size:* ${width} × ${height} px\n` +
    `🎬 *Animated:* ${isAnimated}\n` +
    `🎥 *Video Sticker:* ${isVideo}\n` +
    `💾 *File Size:* ${fileSize}`;

  try {
    await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    // ── Save to MongoDB ──────────────────────────────────────────
    await StickerLog.create({
      userId,
      username,
      chatId,
      fileId,
      fileUniqueId,
      setName: sticker.set_name || null,
      emoji,
      width,
      height,
      isAnimated: sticker.is_animated,
      isVideo: sticker.is_video,
      fileSize: sticker.file_size || null,
    });
  } catch (err) {
    console.error("Sticker handler error:", err.message);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again.");
  }
});

// ── Text message: detect sticker pack link ─────────────────────────
bot.on("message", (msg) => {
  if (msg.sticker || msg.text?.startsWith("/")) return; // already handled

  const text = msg.text || "";
  const linkMatch = text.match(
    /(?:https?:\/\/)?t\.me\/addstickers\/([A-Za-z0-9_]+)/i
  );

  if (linkMatch) {
    const packName = linkMatch[1];
    bot.sendMessage(
      msg.chat.id,
      `📦 *Sticker Pack Detected!*\n\n` +
        `Pack Name: \`${packName}\`\n\n` +
        `To get individual sticker IDs, forward a sticker from that pack here.`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  // Generic fallback for non-command text
  bot.sendMessage(
    msg.chat.id,
    "👆 Send me a *sticker* to get its ID and details!",
    { parse_mode: "Markdown" }
  );
});

// ── Graceful polling error handling ───────────────────────────────
bot.on("polling_error", (err) => {
  console.error("Polling error:", err.code, "-", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
