// routes/reviewRoutes.js
import express from "express";
import { body, param, query } from "express-validator";
import {
  createReview,
  getReviewsByGround,
  getReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  addOwnerReply,
  getUserReviews,
} from "../controllers/reviewController.js";
import { authenticateFirebaseToken } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";

const router = express.Router();

// Validation middleware
const validateReviewCreation = [
  body("groundId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ground ID is required"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Review title must be between 2 and 100 characters"),

  body("content")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Review content must be between 10 and 1000 characters"),

  body("categoryRatings.cleanliness")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Cleanliness rating must be between 1 and 5"),

  body("categoryRatings.facilities")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Facilities rating must be between 1 and 5"),

  body("categoryRatings.service")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Service rating must be between 1 and 5"),

  body("categoryRatings.value")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Value rating must be between 1 and 5"),

  body("categoryRatings.atmosphere")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Atmosphere rating must be between 1 and 5"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("images.*.public_id")
    .if(body("images").exists())
    .trim()
    .isLength({ min: 1 })
    .withMessage("Image public ID is required"),

  body("images.*.secure_url")
    .if(body("images").exists())
    .isURL()
    .withMessage("Image URL must be valid"),
];

const validateReviewUpdate = [
  param("reviewId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Review ID is required"),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Review title must be between 2 and 100 characters"),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Review content must be between 10 and 1000 characters"),

  body("categoryRatings.cleanliness")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Cleanliness rating must be between 1 and 5"),

  body("categoryRatings.facilities")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Facilities rating must be between 1 and 5"),

  body("categoryRatings.service")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Service rating must be between 1 and 5"),

  body("categoryRatings.value")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Value rating must be between 1 and 5"),

  body("categoryRatings.atmosphere")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Atmosphere rating must be between 1 and 5"),
];

const validateReviewId = [
  param("reviewId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Review ID is required"),
];

const validateGroundId = [
  param("groundId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ground ID is required"),
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const validateReviewFilters = [
  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating filter must be between 1 and 5"),

  query("category")
    .optional()
    .isIn(["cleanliness", "facilities", "service", "value", "atmosphere"])
    .withMessage("Invalid category filter"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "rating", "helpfulCount"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

const validateReportReview = [
  param("reviewId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Review ID is required"),

  body("reason")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Report reason must be between 5 and 200 characters"),
];

const validateOwnerReply = [
  param("reviewId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Review ID is required"),

  body("content")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Reply content must be between 5 and 500 characters"),

  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean"),
];

// Routes

// Create a new review (Authenticated users only)
router.post(
  "/",
  authenticateFirebaseToken,
  validateReviewCreation,
  validateRequest,
  createReview
);

// Get reviews by ground (public)
router.get(
  "/ground/:groundId",
  validateGroundId,
  validatePagination,
  validateReviewFilters,
  validateRequest,
  getReviewsByGround
);

// Get review by ID (public)
router.get("/:reviewId", validateReviewId, validateRequest, getReviewById);

// Update review (Review owner only)
router.put(
  "/:reviewId",
  authenticateFirebaseToken,
  validateReviewId,
  validateReviewUpdate,
  validateRequest,
  updateReview
);

// Delete review (Review owner only)
router.delete(
  "/:reviewId",
  authenticateFirebaseToken,
  validateReviewId,
  validateRequest,
  deleteReview
);

// Mark review as helpful (Authenticated users only)
router.post(
  "/:reviewId/helpful",
  authenticateFirebaseToken,
  validateReviewId,
  validateRequest,
  markReviewHelpful
);

// Report review (Authenticated users only)
router.post(
  "/:reviewId/report",
  authenticateFirebaseToken,
  validateReviewId,
  validateReportReview,
  validateRequest,
  reportReview
);

// Add owner reply to review (Ground owner only)
router.post(
  "/:reviewId/reply",
  authenticateFirebaseToken,
  validateReviewId,
  validateOwnerReply,
  validateRequest,
  addOwnerReply
);

// Get user's reviews (Authenticated users only)
router.get(
  "/user/my-reviews",
  authenticateFirebaseToken,
  validatePagination,
  validateRequest,
  getUserReviews
);

export default router;
