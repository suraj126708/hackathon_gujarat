// routes/bookingRoutes.js
import express from "express";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/errorMiddleware.js";
import {
  authenticateFirebaseToken,
  authorizeGroundOwner,
} from "../middleware/authMiddleware.js";
import {
  createBooking,
  verifyPayment,
  mockPaymentSuccess,
  getUserBookings,
  getGroundBookings,
  cancelBooking,
  getBookingDetails,
  getAllOwnerBookings,
  checkAvailability,
  getAvailableTimeSlots,
} from "../controllers/bookingController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateFirebaseToken);

// Validation middleware for creating bookings
const createBookingValidation = [
  body("groundId")
    .notEmpty()
    .withMessage("Ground ID is required")
    .isString()
    .withMessage("Ground ID must be a string"),

  body("sport")
    .notEmpty()
    .withMessage("Sport is required")
    .isString()
    .withMessage("Sport must be a string")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Sport must be between 1 and 50 characters"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO date")
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        throw new Error("Date cannot be in the past");
      }
      return true;
    }),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format (24-hour)"),

  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 1, max: 24 })
    .withMessage("Duration must be between 1 and 24 hours"),

  body("selectedCourts")
    .isArray({ min: 1 })
    .withMessage("At least one court must be selected")
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error(
          "Selected courts must be an array with at least one court"
        );
      }

      value.forEach((court, index) => {
        if (typeof court !== "string" || court.trim().length === 0) {
          throw new Error(`Court ${index + 1} must be a non-empty string`);
        }
      });

      return true;
    }),

  body("numberOfPlayers")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Number of players must be between 1 and 50"),

  body("specialRequests")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requests cannot exceed 500 characters"),
];

// Validation middleware for payment verification
const verifyPaymentValidation = [
  body("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required")
    .isString()
    .withMessage("Booking ID must be a string"),

  body("razorpayOrderId")
    .notEmpty()
    .withMessage("Razorpay order ID is required")
    .isString()
    .withMessage("Razorpay order ID must be a string"),

  body("razorpayPaymentId")
    .notEmpty()
    .withMessage("Razorpay payment ID is required")
    .isString()
    .withMessage("Razorpay payment ID must be a string"),

  body("razorpaySignature")
    .notEmpty()
    .withMessage("Razorpay signature is required")
    .isString()
    .withMessage("Razorpay signature must be a string"),
];

// Validation middleware for cancelling bookings
const cancelBookingValidation = [
  param("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required")
    .isString()
    .withMessage("Booking ID must be a string"),

  body("reason")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cancellation reason cannot exceed 500 characters"),
];

// Validation middleware for query parameters
const queryValidation = [
  query("status")
    .optional()
    .isIn(["all", "confirmed", "cancelled", "completed", "no_show", "pending"])
    .withMessage("Invalid status filter"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date"),
];

// Routes

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post("/", createBookingValidation, validateRequest, createBooking);

// @route   POST /api/bookings/check-availability
// @desc    Check time slot availability before booking
// @access  Private
router.post(
  "/check-availability",
  createBookingValidation,
  validateRequest,
  checkAvailability
);

// @route   GET /api/bookings/available-slots/:groundId
// @desc    Get available time slots for a ground on a specific date
// @access  Private
router.get("/available-slots/:groundId", getAvailableTimeSlots);

// @route   POST /api/bookings/verify-payment
// @desc    Verify payment and confirm booking
// @access  Private
router.post(
  "/verify-payment",
  verifyPaymentValidation,
  validateRequest,
  verifyPayment
);

// @route   POST /api/bookings/mock-payment-success
// @desc    Mock payment success (for development/testing)
// @access  Private
router.post(
  "/mock-payment-success",
  [
    body("bookingId")
      .notEmpty()
      .withMessage("Booking ID is required")
      .isString()
      .withMessage("Booking ID must be a string"),
  ],
  validateRequest,
  mockPaymentSuccess
);

// @route   GET /api/bookings/user
// @desc    Get user's bookings
// @access  Private
router.get("/user", queryValidation, validateRequest, getUserBookings);

// @route   GET /api/bookings/ground/:groundId
// @desc    Get ground's bookings (for owners)
// @access  Private (Ground owner)
router.get(
  "/ground/:groundId",
  authenticateFirebaseToken,
  authorizeGroundOwner(),
  queryValidation,
  validateRequest,
  getGroundBookings
);

// @route   GET /api/bookings/owner/all
// @desc    Get all owner's bookings across all grounds
// @access  Private (Ground owner)
router.get(
  "/owner/all",
  authenticateFirebaseToken,
  authorizeGroundOwner(),
  queryValidation,
  validateRequest,
  getAllOwnerBookings
);

// @route   GET /api/bookings/:bookingId
// @desc    Get booking details
// @access  Private
router.get("/:bookingId", getBookingDetails);

// @route   PUT /api/bookings/:bookingId/cancel
// @desc    Cancel booking
// @access  Private
router.put(
  "/:bookingId/cancel",
  cancelBookingValidation,
  validateRequest,
  cancelBooking
);

export default router;
