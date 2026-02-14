/**
 * controllers/trialController.js — Trial Status Controller
 *
 * Handles:
 *  GET /api/trials/status → Return remaining trials for current session
 *
 * Works for both authenticated users and guest sessions.
 * The frontend calls this endpoint to render the trial counter in the UI.
 */

const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────
// GET /api/trials/status
// ─────────────────────────────────────────────
const getTrialStatus = async (req, res) => {

  // ── Authenticated user ──
  if (req.supabaseUser) {
    const user = await User.findOne({ supabaseUid: req.supabaseUser.id });

    if (!user) {
      throw new ApiError(404, "User not found. Please log in again.");
    }

    return res.status(200).json(
      new ApiResponse(200, "Trial status fetched", {
        type: "authenticated",
        trialsRemaining: user.trialsRemaining,
        totalTrialsUsed: user.totalTrialsUsed,
        hasTrials: user.trialsRemaining > 0,
        displayName: user.displayName,
        // Show upgrade prompt if they have 2 or fewer left
        upgradePrompt: user.trialsRemaining <= 2,
      })
    );
  }

  // ── Guest user ──
  if (req.guest) {
    return res.status(200).json(
      new ApiResponse(200, "Trial status fetched", {
        type: "guest",
        trialsRemaining: req.guest.trialsRemaining,
        totalTrialsUsed: req.guest.totalTrialsUsed,
        hasTrials: req.guest.trialsRemaining > 0,
        expiresAt: req.guest.expiresAt,
        // Nudge guest to sign up when they're on their last trial
        loginPrompt: req.guest.trialsRemaining <= 1,
      })
    );
  }

  throw new ApiError(401, "No active session found.");
};

module.exports = { getTrialStatus };
