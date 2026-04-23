/**
 * Wraps an async route handler so any thrown error is passed to next()
 * and caught by the centralized error handler middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
