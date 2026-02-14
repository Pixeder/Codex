const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes   = require("./routes/authRoutes");
// const aiRoutes     = require("./routes/aiRoutes");
// const recipeRoutes = require("./routes/recipeRoutes");
const trialRoutes  = require("./routes/trialRoutes");
const ApiError     = require("./utils/ApiError");

const app = express();

// ─────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────

// CORS — allow frontend + credentials (required for cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses guestId cookie on every request

// Serve uploaded images (helpful during hackathon demos)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FoodScope AI backend is running ✅",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth",    authRoutes);
// app.use("/api/ai",      aiRoutes);
// app.use("/api/recipes", recipeRoutes);
app.use("/api/trials",  trialRoutes);

// ─────────────────────────────────────────────
// 404 Handler — catch unmatched routes
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // Multer file size exceeded
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      statusCode: 413,
      message: "File too large. Maximum upload size is 5MB.",
    });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("💥 Unhandled error:", err);
  }

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
  });
});

module.exports = app;
