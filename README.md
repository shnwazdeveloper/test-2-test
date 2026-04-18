# 🎯 Telegram Sticker ID Bot

A Telegram bot that extracts **File IDs**, **File Unique IDs**, and full metadata from any sticker. Also logs every scan to **MongoDB** and runs an **Express health server** for Render deployment.

---

## ✨ Features

- 🆔 Returns `file_id` and `file_unique_id` for any sticker
- 📦 Shows pack name, emoji, dimensions, animated/video flags
- 🔗 Detects Telegram sticker pack links and extracts pack names
- 📊 `/stats` command shows total scans, unique stickers, unique users
- 💾 Logs every sticker to MongoDB Atlas
- 🌐 Express health server at `/health` — keeps Render alive
- 🔄 Auto-reconnect on MongoDB disconnect

---

## 🚀 Quick Start (Local)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/telegram-sticker-id-bot.git
cd telegram-sticker-id-bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your BOT_TOKEN and MONGODB_URI
```

### 4. Run the bot
```bash
npm start       # production mode
npm run dev     # development mode (nodemon auto-reload)
```

---

## ☁️ Deploy to Render

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/telegram-sticker-id-bot.git
git push -u origin main
```

### Step 2 — Create a Render Web Service
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml`

### Step 3 — Set Environment Variables in Render Dashboard
| Key | Value |
|-----|-------|
| `BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `MONGODB_URI` | Your MongoDB Atlas connection string |

> `PORT` and `NODE_ENV` are set automatically by Render / `render.yaml`.

### Step 4 — Deploy
Click **Deploy** — Render will build, start the service, and hit `/health` to confirm it's alive.

---

## 🗄️ MongoDB Setup (Atlas)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free **M0** cluster
3. Create a database user with read/write permissions
4. Whitelist IP `0.0.0.0/0` (allow all — required for Render)
5. Copy the connection string into `MONGODB_URI`

---

## 📁 Project Structure

```
telegram-sticker-id-bot/
├── start.js          # Unified entry point (bot + server)
├── index.js          # Telegram bot logic
├── server.js         # Express health-check server
├── render.yaml       # Render deployment config
├── package.json
├── .env.example      # Environment variable template
├── .gitignore
├── config/
│   └── db.js         # MongoDB connection with auto-reconnect
└── models/
    └── StickerLog.js # Mongoose schema for sticker logs
```

---

## 🤖 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + usage guide |
| `/help`  | Detailed help |
| `/stats` | Bot usage statistics |

---

## 🌐 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Basic status check |
| `GET /health` | Detailed health + DB status |

---

## 📄 License

MIT
