/**
 * models/GuestSession.js — Guest Session Schema
 *
 * Tracks anonymous users by a UUID stored in their browser cookie.
 * Sessions auto-expire from MongoDB after 7 days via a TTL index.
 */

const mongoose = require("mongoose");

const guestSessionSchema = new mongoose.Schema(
  {
    // UUID stored in the browser cookie named "guestId"
    guestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Guest users start with 3 free trials
    trialsRemaining: {
      type: Number,
      default: 3,
      min: 0,
    },

    // Track usage for analytics
    totalTrialsUsed: {
      type: Number,
      default: 0,
    },

    // TTL index field — MongoDB will auto-delete documents when this date passes
    // Set to 7 days from creation
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      index: { expires: 0 }, // TTL index: delete when expiresAt is reached
    },

    // Optional: track user agent / IP for abuse detection
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Instance method: consume one trial and persist
guestSessionSchema.methods.consumeTrial = async function () {
  if (this.trialsRemaining <= 0) return false;
  this.trialsRemaining -= 1;
  this.totalTrialsUsed += 1;
  await this.save();
  return true;
};

// Virtual: whether the guest still has trials
guestSessionSchema.virtual("hasTrials").get(function () {
  return this.trialsRemaining > 0;
});

const GuestSession = mongoose.model("GuestSession", guestSessionSchema);
module.exports = GuestSession;