/**
 * utils/ApiResponse.js — Standard Success Response
 *
 * Wraps all successful API responses in a consistent shape.
 * The frontend can always rely on { success, message, data } being present.
 *
 * Usage:
 *   res.status(200).json(new ApiResponse(200, "Recipes fetched", { recipes }));
 *   res.status(201).json(new ApiResponse(201, "Guest session created", { guestId }));
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {string} message    - Human-readable success message
   * @param {object} data       - Payload to return to the client
   */
  constructor(statusCode, message, data = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;