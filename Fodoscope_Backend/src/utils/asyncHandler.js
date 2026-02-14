/**
 * utils/asyncHandler.js — Async Controller Wrapper
 *
 * Eliminates try/catch boilerplate from every async controller.
 * Any thrown error or rejected promise is automatically forwarded
 * to Express's global error handler via next(err).
 *
 * Usage:
 *   router.post("/route", asyncHandler(async (req, res) => {
 *     // throw new ApiError(400, "Bad request") — gets caught automatically
 *     res.json(new ApiResponse(200, "Success", data));
 *   }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;