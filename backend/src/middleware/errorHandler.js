const { AppError } = require('../utils/errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // AppError: use its statusCode and code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Duplicate key error',
      },
    });
  }

  // Fallback: 500
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
}

module.exports = errorHandler;
