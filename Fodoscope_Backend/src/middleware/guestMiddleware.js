const { v4: uuidv4 } = require("uuid");
const GuestSession = require("../models/GuestSession");

const COOKIE_NAME = "guestId";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const guestMiddleware = async (req, res, next) => {
  try {
    const guestId = req.cookies[COOKIE_NAME];

    // ── Cookie exists → try to find active session in DB ──
    if (guestId) {
      const session = await GuestSession.findOne({ guestId });
      if (session) {
        req.guest = session;
        return next();
      }
      // Session expired or deleted — fall through to create new one
    }

    // ── No cookie or no session → create a fresh guest session ──
    const newGuestId = uuidv4();
    const newSession = await GuestSession.create({
      guestId: newGuestId,
      userAgent: req.headers["user-agent"] || null,
    });

    // Set httpOnly cookie so JS cannot tamper with it
    res.cookie(COOKIE_NAME, newGuestId, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    req.guest = newSession;
    next();
  } catch (err) {
    // Non-blocking — if guest creation fails, continue without guest
    console.error("⚠️  guestMiddleware error:", err.message);
    req.guest = null;
    next();
  }
};

module.exports = guestMiddleware;
