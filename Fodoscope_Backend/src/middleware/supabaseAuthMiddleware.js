const { supabase } = require("../config/supabase.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");

const supabaseAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "No auth token provided. Include: Authorization: Bearer <token>"
    );
  }

  const token = authHeader.split("Bearer ")[1].trim();

  if (!token) {
    throw new ApiError(401, "Auth token is empty");
  }

  // Verify the JWT with Supabase — checks signature + expiry
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    if (error?.message?.includes("expired")) {
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
    throw new ApiError(401, "Invalid auth token. Please sign in again.");
  }

  // Attach the verified Supabase user to the request
  // Shape: { id, email, user_metadata: { full_name, avatar_url }, ... }
  req.supabaseUser = data.user;

  next();
});

module.exports = supabaseAuth;
