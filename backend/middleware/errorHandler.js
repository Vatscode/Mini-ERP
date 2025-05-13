// NetSuite-like error types
const ErrorType = {
  USER_ERROR: 'USER_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  GOVERNANCE_ERROR: 'GOVERNANCE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
};

// Custom error class for NetSuite-like errors
class NetSuiteError extends Error {
  constructor(message, type = ErrorType.USER_ERROR, details = null) {
    super(message);
    this.name = 'NetSuiteError';
    this.type = type;
    this.details = details;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error using NetSuite-like logging
  req.log?.error(err);

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(400).json({
          error: 'Duplicate record',
          type: ErrorType.VALIDATION_ERROR,
          details: err.meta
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'Record not found',
          type: ErrorType.USER_ERROR,
          details: err.meta
        });
      default:
        return res.status(500).json({
          error: 'Database error',
          type: ErrorType.SYSTEM_ERROR
        });
    }
  }

  // Handle NetSuite-like errors
  if (err instanceof NetSuiteError) {
    const statusCodes = {
      [ErrorType.USER_ERROR]: 400,
      [ErrorType.SYSTEM_ERROR]: 500,
      [ErrorType.GOVERNANCE_ERROR]: 429,
      [ErrorType.PERMISSION_ERROR]: 403,
      [ErrorType.VALIDATION_ERROR]: 400
    };

    return res.status(statusCodes[err.type] || 500).json({
      error: err.message,
      type: err.type,
      details: err.details
    });
  }

  // Handle governance errors
  if (err.message.includes('GOVERNANCE_EXCEEDED')) {
    return res.status(429).json({
      error: 'Script execution limits exceeded',
      type: ErrorType.GOVERNANCE_ERROR,
      details: {
        limit: req.governance?.getMaxUsage(),
        used: req.governance?.getMaxUsage() - req.governance?.getRemainingUsage()
      }
    });
  }

  // Default error response
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    type: ErrorType.SYSTEM_ERROR
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Export error handling utilities
module.exports = {
  errorHandler,
  asyncHandler,
  NetSuiteError,
  ErrorType
}; 