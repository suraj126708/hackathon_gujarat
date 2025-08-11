// routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  verifyToken,
  createCustomToken,
  requestPasswordReset,
  resetPassword,
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePicture,
} from "../controllers/authController.js";
import {
  authenticateFirebaseToken,
  authorize,
} from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Validation middleware
const profileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("phoneNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
  body("role")
    .optional()
    .isIn(["Player", "Facility Owner", "Player / Facility Owner"])
    .withMessage(
      "Role must be Player, Facility Owner, or Player / Facility Owner"
    ),
  body("preferences.theme")
    .optional()
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be light, dark, or auto"),
];

const updateProfileValidation = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Display name must be between 1 and 100 characters"),
  body("role")
    .optional()
    .isIn(["Player", "Facility Owner", "Player / Facility Owner"])
    .withMessage(
      "Role must be Player, Facility Owner, or Player / Facility Owner"
    ),
  body("profile.firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("profile.lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("profile.phoneNumber")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("profile.bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
  body("profile.dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("profile.location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location must not exceed 100 characters"),
  body("preferences.theme")
    .optional()
    .isIn(["light", "dark", "auto"])
    .withMessage("Theme must be light, dark, or auto"),
];

const customTokenValidation = [
  body("uid").notEmpty().withMessage("UID is required"),
  body("additionalClaims")
    .optional()
    .isObject()
    .withMessage("Additional claims must be an object"),
];

// Password reset validation
const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
];

// @route   GET /api/auth/verify
// @desc    Verify Firebase token
// @access  Private
router.get("/verify", authenticateFirebaseToken, verifyToken);

// @route   POST /api/auth/register
// @desc    Complete user registration with additional profile data
// @access  Private
router.post(
  "/register",
  authenticateFirebaseToken,
  profileValidation,
  registerUser
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticateFirebaseToken, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put(
  "/profile",
  authenticateFirebaseToken,
  updateProfileValidation,
  updateUserProfile
);

// @route   DELETE /api/auth/account
// @desc    Delete current user account
// @access  Private
router.delete("/account", authenticateFirebaseToken, deleteUserAccount);

// @route   POST /api/auth/custom-token
// @desc    Create custom Firebase token (Admin only)
// @access  Private (Admin)
router.post(
  "/custom-token",
  authenticateFirebaseToken,
  authorize("admin"),
  customTokenValidation,
  createCustomToken
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post("/forgot-password", forgotPasswordValidation, requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", resetPasswordValidation, resetPassword);

// @route   POST /api/auth/profile-picture
// @desc    Upload/Update profile picture
// @access  Private
router.post(
  "/profile-picture",
  authenticateFirebaseToken,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// @route   DELETE /api/auth/profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete(
  "/profile-picture",
  authenticateFirebaseToken,
  deleteProfilePicture
);

// @route   GET /api/auth/profile-picture/:userId
// @desc    Get optimized profile picture URL
// @access  Public
router.get("/profile-picture/:userId", getProfilePicture);

export default router;
