const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Supabase Auth UUID — links this document to Supabase user
    supabaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
      default: "FoodScope User",
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    // Auth provider: "email" or "google"
    provider: {
      type: String,
      enum: ["email", "google", "unknown"],
      default: "unknown",
    },

    // Trial system — authenticated users start with 10 trials
    trialsRemaining: {
      type: Number,
      default: 10,
      min: 0,
    },

    totalTrialsUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt auto-managed
  }
);

// Virtual: does this user have any trials left?
userSchema.virtual("hasTrials").get(function () {
  return this.trialsRemaining > 0;
});

// Instance method: deduct one trial and save
userSchema.methods.consumeTrial = async function () {
  if (this.trialsRemaining <= 0) return false;
  this.trialsRemaining -= 1;
  this.totalTrialsUsed += 1;
  await this.save();
  return true;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
