const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Default to 500 Internal Server Error

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };

    error.message = err.message;

    // Handle specific Mongoose errors
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((value) => value.message)
        .join(", ");
      error = new ErrorHandler(message, 400);
    }

    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
      error = new ErrorHandler(message, 400);
    }

    if (err.name === "JsonWebTokenError") {
      const message = "JSON web token is invalid. Try again!";
      error = new ErrorHandler(message, 400);
    }

    if (err.name === "TokenExpiredError") {
      const message = "JSON web token is expired. Try again!";
      error = new ErrorHandler(message, 400);
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }

  // Fallback in case environment is not set properly
  return res.status(err.statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
