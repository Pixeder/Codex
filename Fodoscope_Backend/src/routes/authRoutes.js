/**
 * routes/authRoutes.js — Authentication Routes
 *
 * POST /api/auth/signup  → Register with email + password
 * POST /api/auth/login   → Login with email + password
 * GET  /api/auth/me      → Get authenticated user profile
 * POST /api/auth/logout  → Sign out + clear cookie
 * POST /api/auth/guest   → Create/return guest session
 */

const router = require("express").Router();

const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/authController");

const { createGuestSession } = require("../controllers/authController");

const supabaseAuth = require("../middleware/supabaseAuthMiddleware");
const guestMiddleware = require("../middleware/guestMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// ── Public routes (no token needed) ──
router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

// ── Guest session ──
router.post("/guest", guestMiddleware, asyncHandler(createGuestSession));

// ── Protected routes (valid Supabase token required) ──
router.get("/me", supabaseAuth, asyncHandler(getMe));
router.post("/logout", supabaseAuth, asyncHandler(logout));

module.exports = router;
