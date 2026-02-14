const express = require("express");

const guestMiddleware = require("../middleware/guestMiddleware");
const supabaseAuth = require("../middleware/supabaseAuthMiddleware");
const { getTrialStatus } = require("../controllers/trialController");

const router = express.Router();

router.get(
  "/status",
  guestMiddleware,   // 1️⃣ Load guest
  supabaseAuth,      // 2️⃣ Load user (if logged in)
  getTrialStatus     // 3️⃣ Controller
);

module.exports = router;
