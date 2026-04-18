const mongoose = require("mongoose");

const StickerLogSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    username: {
      type: String,
      default: "unknown",
      trim: true,
    },
    chatId: {
      type: Number,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
    },
    fileUniqueId: {
      type: String,
      required: true,
    },
    setName: {
      type: String,
      default: null,
      trim: true,
    },
    emoji: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    isAnimated: {
      type: Boolean,
      default: false,
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    fileSize: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast lookups by fileUniqueId
StickerLogSchema.index({ fileUniqueId: 1 });
StickerLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("StickerLog", StickerLogSchema);
