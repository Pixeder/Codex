/**
 * utils/ApiError.js — Custom API Error Class
 *
 * Extends the native Error class with an HTTP status code.
 * Throw this anywhere in the stack — the global error handler in app.js
 * will catch it and format the response correctly.
 *
 * Usage:
 *   throw new ApiError(400, "Email is required");
 *   throw new ApiError(403, "Trial limit reached");
 *   throw new ApiError(404, "Recipe not found");
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500, etc.)
   * @param {string} message    - Human-readable error message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";

    // Capture stack trace (excludes constructor call from trace)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

module.exports = ApiError;