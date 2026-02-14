const User = require("../models/User.js");
const GuestSession = require("../models/GuestSession.js");
const ApiResponse = require("../utils/ApiResponse.js");
const ApiError = require("../utils/ApiError.js");
const { supabase, supabaseAdmin } = require("../config/supabase.js");

const COOKIE_NAME = "guestId";
const COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

// ─────────────────────────────────────────────
// POST /api/auth/signup
// Register a new user with email + password
// ─────────────────────────────────────────────
const signup = async (req, res) => {
  const { email, password, displayName } = req.body;

  
  // Basic validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters.");
  }
  
  // Register user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: displayName || "FoodScope User" }, 
    },
  });
  
  if (error) {
    // Map Supabase error messages to clean user-facing ones
    if (error.message.includes("already registered")) {
      throw new ApiError(409, "An account with this email already exists.");
    }
    throw new ApiError(400, error.message);
  }

  const supabaseUser = data.user;
  const session = data.session; // contains access_token + refresh_token

  // Create MongoDB User document for app-level data
  const user = await User.create({
    supabaseUid: supabaseUser.id,
    email: supabaseUser.email,
    displayName:
      displayName ||
      supabaseUser.user_metadata?.full_name ||
      "FoodScope User",
    provider: "email",
    trialsRemaining: 10,
  });

  // Merge + delete guest session if one exists
  await _mergeGuestSession(req, res);

  console.log(`👤 New user signed up: ${email}`);

  return res.status(201).json(
    new ApiResponse(201, "Account created successfully!", {
      user: _formatUser(user),
      // Send the Supabase tokens — frontend stores these
      accessToken: session?.access_token || null,
      refreshToken: session?.refresh_token || null,
      // Supabase may require email confirmation
      emailConfirmationRequired: !session,
    })
  );
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// Login with email + password
// ─────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  // Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new ApiError(401, "Incorrect email or password.");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new ApiError(403, "Please confirm your email before logging in.");
    }
    throw new ApiError(401, error.message);
  }

  const supabaseUser = data.user;
  const session = data.session;

  // Find or create MongoDB user document
  let user = await User.findOne({ supabaseUid: supabaseUser.id });

  if (!user) {
    user = await User.create({
      supabaseUid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.full_name || "FoodScope User",
      provider: supabaseUser.app_metadata?.provider || "email",
      trialsRemaining: 10,
    });
    console.log(`👤 MongoDB user auto-created on login: ${email}`);
  }

  // Merge + delete guest session if one exists
  await _mergeGuestSession(req, res);

  console.log(`✅ User logged in: ${email}`);

  return res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: _formatUser(user),
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    })
  );
};

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  const user = await User.findOne({ supabaseUid: req.supabaseUser.id });

  if (!user) {
    throw new ApiError(404, "User profile not found. Please log in again.");
  }

  return res.status(200).json(
    new ApiResponse(200, "Profile fetched", {
      user: {
        ..._formatUser(user),
        totalTrialsUsed: user.totalTrialsUsed,
        memberSince: user.createdAt,
      },
    })
  );
};

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1].trim();

    const { createClient } = require("@supabase/supabase-js");

    const userClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    await userClient.auth.signOut();
  }

  // Clear the guest cookie
  res.clearCookie(COOKIE_NAME, COOKIE_CLEAR_OPTIONS);

  return res
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully", {}));
};

// ─────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────

// Delete the guest session from DB and clear the cookie
const _mergeGuestSession = async (req, res) => {
  const guestId = req.cookies[COOKIE_NAME];
  if (!guestId) return;

  const result = await GuestSession.deleteOne({ guestId });

  if (result.deletedCount > 0) {
    console.log(`🔗 Guest session merged and deleted: ${guestId}`);
  }

  res.clearCookie(COOKIE_NAME, COOKIE_CLEAR_OPTIONS);
};

const createGuestSession = async (req, res) => {
  if (!req.guest) {
    throw new ApiError(500, "Guest session could not be created.");
  }

  return res.status(200).json(
    new ApiResponse(200, "Guest session ready", {
      guestId: req.guest.guestId,
      trialsRemaining: req.guest.trialsRemaining,
      expiresAt: req.guest.expiresAt,
    })
  );
};

// Shape the user object returned to the frontend
const _formatUser = (user) => ({
  id: user._id,
  supabaseUid: user.supabaseUid,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  provider: user.provider,
  trialsRemaining: user.trialsRemaining,
});

module.exports = { signup, login, getMe, logout, createGuestSession };
