// routes/timeSlotRoutes.js
import express from "express";
import { body, param, query } from "express-validator";
import {
  blockTimeSlot,
  unblockTimeSlot,
  getBlockedTimeSlots,
  getGroundAvailability,
} from "../controllers/timeSlotController.js";
import {
  authenticateFirebaseToken,
  authorize,
  authorizeGroundOwner,
} from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";

const router = express.Router();

// Validation middleware
const validateTimeSlotBlock = [
  body("groundId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ground ID is required"),

  body("date").isISO8601().withMessage("Date must be a valid ISO date"),

  body("startTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format (24-hour)"),

  body("endTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format (24-hour)"),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Reason cannot exceed 200 characters"),

  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring must be a boolean"),

  body("recurringDays")
    .optional()
    .isArray()
    .withMessage("Recurring days must be an array"),

  body("recurringDays.*")
    .optional()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Invalid recurring day"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),
];

const validateTimeSlotId = [
  param("timeSlotId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Time slot ID is required"),
];

const validateGroundId = [
  param("groundId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ground ID is required"),
];

const validateDateQuery = [
  query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),
];

// Routes

// Block a time slot (Ground owners only)
router.post(
  "/block",
  authenticateFirebaseToken,
  authorizeGroundOwner(),
  validateTimeSlotBlock,
  validateRequest,
  blockTimeSlot
);

// Unblock a time slot (Ground owners only)
router.delete(
  "/:timeSlotId",
  authenticateFirebaseToken,
  authorizeGroundOwner(),
  validateTimeSlotId,
  validateRequest,
  unblockTimeSlot
);

// Get blocked time slots for a ground (Ground owners only)
router.get(
  "/ground/:groundId/blocked",
  authenticateFirebaseToken,
  authorizeGroundOwner(),
  validateGroundId,
  validateDateQuery,
  validateRequest,
  getBlockedTimeSlots
);

// Get ground availability (public)
router.get(
  "/ground/:groundId/availability",
  validateGroundId,
  validateDateQuery,
  validateRequest,
  getGroundAvailability
);

export default router;
