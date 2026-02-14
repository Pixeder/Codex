const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const trialMiddleware = async (req, res, next) => {
  try {
    // ── Authenticated user path ──
    if (req.supabaseUser) {
      const user = await User.findOne({ supabaseUid: req.supabaseUser.id });

      if (!user) {
        return next(
          new ApiError(401, "User account not found. Please log in again.")
        );
      }

      if (user.trialsRemaining <= 0) {
        return next(
          new ApiError(403, "You have used all your trials. Sign up for more!")
        );
      }

      // Attach full Mongoose doc for controllers to use
      req.user = user;
      return next();
    }

    // ── Guest user path ──
    if (req.guest) {
      if (req.guest.trialsRemaining <= 0) {
        return next(
          new ApiError(
            403,
            "Trial limit reached. Sign up free to get 10 more trials!"
          )
        );
      }
      return next();
    }

    // ── No session at all ──
    return next(
      new ApiError(401, "No active session. Please refresh the page.")
    );
  } catch (err) {
    next(err);
  }
};

module.exports = trialMiddleware;
