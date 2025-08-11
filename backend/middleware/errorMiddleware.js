// middlewares/errorMiddleware.js
import { validationResult } from "express-validator";

// Custom Error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation middleware for express-validator
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ [VALIDATION] Validation errors found:");
    console.log("❌ [VALIDATION] Error count:", errors.array().length);
    errors.array().forEach((error, index) => {
      console.log(`❌ [VALIDATION] Error ${index + 1}:`, {
        field: error.path,
        message: error.msg,
        value: error.value,
        location: error.location,
        type: error.type,
      });
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  console.log("✅ [VALIDATION] All validations passed successfully");
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("🚨 Error Details:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.email || "Anonymous",
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new AppError(message, 400);
  }

  // Firebase Admin SDK errors
  if (err.code?.startsWith("auth/")) {
    const firebaseErrors = {
      "auth/id-token-expired": {
        message: "Token has expired",
        statusCode: 401,
      },
      "auth/id-token-revoked": {
        message: "Token has been revoked",
        statusCode: 401,
      },
      "auth/invalid-id-token": { message: "Invalid token", statusCode: 401 },
      "auth/user-not-found": { message: "User not found", statusCode: 404 },
      "auth/insufficient-permission": {
        message: "Insufficient permissions",
        statusCode: 403,
      },
    };

    const firebaseError = firebaseErrors[err.code];
    if (firebaseError) {
      error = new AppError(firebaseError.message, firebaseError.statusCode);
    }
  }

  // JSON Web Token errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new AppError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new AppError(message, 401);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = "Too many requests, please try again later";
    error = new AppError(message, 429);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
