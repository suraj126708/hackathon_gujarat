// routes/groundRoutes.js
import express from "express";
import { body, param, query } from "express-validator";
import {
  createGround,
  getAllGrounds,
  getGroundById,
  getGroundsByOwner,
  updateGround,
  deleteGround,
  uploadGroundImages,
  searchGrounds,
  getGroundStats,
} from "../controllers/groundController.js";
import {
  authenticateFirebaseToken,
  authorize,
} from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";

const router = express.Router();

// Validation middleware
const validateGroundCreation = [
  // Add logging middleware at the start
  (req, res, next) => {
    console.log("🔍 [VALIDATION] Starting ground creation validation");
    console.log(
      "🔍 [VALIDATION] Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("🔍 [VALIDATION] User:", req.user?.email || "No user");
    next();
  },
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Ground name must be between 2 and 100 characters"),

  body("groundId")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ground ID must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Ground ID can only contain letters, numbers, hyphens, and underscores"
    ),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("address.street")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Street address must be between 5 and 200 characters"),

  body("address.city")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  body("address.state")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("State must be between 2 and 100 characters"),

  body("address.country")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),

  body("address.postalCode")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Postal code must be between 3 and 20 characters"),

  body("coordinates.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90 degrees"),

  body("coordinates.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180 degrees"),

  body("timings.openTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Open time must be in HH:MM format (24-hour)"),

  body("timings.closeTime")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Close time must be in HH:MM format (24-hour)"),

  body("timings.workingDays")
    .isArray()
    .withMessage("Working days must be an array"),

  body("timings.workingDays.*")
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Invalid working day"),

  body("pricing.weekdayPrice")
    .isFloat({ min: 0 })
    .withMessage("Weekday pricing must be a positive number"),

  body("pricing.weekendPrice")
    .isFloat({ min: 0 })
    .withMessage("Weekend pricing must be a positive number"),

  body("pricing.currency")
    .optional()
    .isIn(["USD", "EUR", "GBP", "INR"])
    .withMessage("Invalid currency"),

  body("pricing.perHour")
    .optional()
    .isBoolean()
    .withMessage("Per hour must be a boolean"),

  body("dimensions.length")
    .optional()
    .isFloat({ min: 1, max: 100000 })
    .withMessage("Length must be between 1 and 100,000 meters"),

  body("dimensions.width")
    .optional()
    .isFloat({ min: 1, max: 100000 })
    .withMessage("Width must be between 1 and 100,000 meters"),

  body("dimensions.capacity")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Capacity must be between 1 and 10,000"),

  body("features.lighting")
    .optional()
    .isBoolean()
    .withMessage("Lighting must be a boolean"),

  body("features.covered")
    .optional()
    .isBoolean()
    .withMessage("Covered must be a boolean"),

  body("features.parking")
    .optional()
    .isBoolean()
    .withMessage("Parking must be a boolean"),

  body("features.restrooms")
    .optional()
    .isBoolean()
    .withMessage("Restrooms must be a boolean"),

  body("features.changeRooms")
    .optional()
    .isBoolean()
    .withMessage("Change rooms must be a boolean"),

  body("contact.phone")
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),

  body("contact.email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address"),

  body("contact.website").optional().isURL().withMessage("Invalid website URL"),

  body("sports").optional().isArray().withMessage("Sports must be an array"),

  body("sports.*")
    .if(body("sports").exists())
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Sport name must be between 2 and 50 characters"),

  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array"),

  body("amenities.*")
    .if(body("amenities").exists())
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Amenity name must be between 2 and 50 characters"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("images.*.publicId")
    .if(body("images").exists())
    .optional()
    .isString()
    .withMessage("Image publicId must be a string"),

  body("images.*.url")
    .if(body("images").exists())
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),

  body("images.*.secureUrl")
    .if(body("images").exists())
    .optional()
    .isURL()
    .withMessage("Image secureUrl must be a valid URL"),

  body("images.*.caption")
    .if(body("images").exists())
    .optional()
    .isString()
    .withMessage("Image caption must be a string"),

  body("images.*.isPrimary")
    .if(body("images").exists())
    .optional()
    .isBoolean()
    .withMessage("Image isPrimary must be a boolean"),
];

const validateGroundUpdate = [
  param("groundId")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Ground ID is required"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Ground name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("pricing.weekdayPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weekday pricing must be a positive number"),

  body("pricing.weekendPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weekend pricing must be a positive number"),

  body("pricing.currency")
    .optional()
    .isIn(["USD", "EUR", "GBP", "INR"])
    .withMessage("Invalid currency"),

  body("pricing.perHour")
    .optional()
    .isBoolean()
    .withMessage("Per hour must be a boolean"),
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

const validateSearch = [
  query("query")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be between 1 and 200 characters"),

  query("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),

  query("sport")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Sport must be between 2 and 50 characters"),

  query("priceRange")
    .optional()
    .matches(/^\d+-\d+$/)
    .withMessage("Price range must be in format: min-max"),

  query("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

// Routes

// Create a new ground (Facility Owner only)
router.post(
  "/",
  (req, res, next) => {
    console.log("🚀 [ROUTE] POST /api/grounds/ hit");
    console.log("🚀 [ROUTE] Headers:", req.headers);
    console.log("🚀 [ROUTE] Body:", req.body);
    next();
  },
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validateGroundCreation,
  validateRequest,
  createGround
);

// Get all grounds (public)
router.get("/", validatePagination, validateRequest, getAllGrounds);

// Get ground by ID (public)
router.get("/:groundId", validateGroundId, validateRequest, getGroundById);

// Get grounds by owner (Facility Owner only)
router.get(
  "/owner/my-grounds",
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validatePagination,
  validateRequest,
  getGroundsByOwner
);

// Update ground (Facility Owner only)
router.put(
  "/:groundId",
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validateGroundId,
  validateGroundUpdate,
  validateRequest,
  updateGround
);

// Delete ground (Facility Owner only)
router.delete(
  "/:groundId",
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validateGroundId,
  validateRequest,
  deleteGround
);

// Upload ground images (Facility Owner only)
router.post(
  "/:groundId/images",
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validateGroundId,
  validateRequest,
  uploadGroundImages
);

// Search grounds (public)
router.get(
  "/search/query",
  validateSearch,
  validatePagination,
  validateRequest,
  searchGrounds
);

// Get ground statistics (Facility Owner only)
router.get(
  "/:groundId/stats",
  authenticateFirebaseToken,
  authorize("Facility Owner"),
  validateGroundId,
  validateRequest,
  getGroundStats
);

export default router;
