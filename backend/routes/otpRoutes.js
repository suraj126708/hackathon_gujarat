// routes/otpRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  sendOTP,
  verifyOTP,
  resendOTP,
  sendEmailOTP,
  verifyEmailOTP,
} from "../controllers/otpController.js";
import { authenticateFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Validation middleware
const phoneValidation = [
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];

const otpValidation = [
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

const emailValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
];

const emailOtpValidation = [...emailValidation, ...otpValidation];

// @route   POST /api/otp/send-email
// @desc    Send OTP to email
// @access  Public
router.post("/send-email", emailValidation, sendEmailOTP);

// @route   POST /api/otp/verify-email
// @desc    Verify email OTP
// @access  Public
router.post("/verify-email", emailOtpValidation, verifyEmailOTP);

// @route   POST /api/otp/send
// @desc    Send OTP to phone number
// @access  Public
router.post("/send", phoneValidation, sendOTP);

// @route   POST /api/otp/verify
// @desc    Verify OTP
// @access  Public
router.post("/verify", [...phoneValidation, ...otpValidation], verifyOTP);

// @route   POST /api/otp/resend
// @desc    Resend OTP to phone number
// @access  Public
router.post("/resend", phoneValidation, resendOTP);

// @route   POST /api/otp/verify-authenticated
// @desc    Verify OTP for authenticated user
// @access  Private
router.post(
  "/verify-authenticated",
  authenticateFirebaseToken,
  [...phoneValidation, ...otpValidation],
  verifyOTP
);

export default router;
