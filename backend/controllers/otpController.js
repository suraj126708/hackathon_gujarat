// controllers/otpController.js
import admin from "../config/firebase.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import emailService from "../config/email.js";

// In-memory storage for OTPs (use Redis in production)
const otpStorage = new Map();

// @desc    Send OTP to email
// @route   POST /api/otp/send-email
// @access  Public
export const sendEmailOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Check if email is already verified for any user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isEmailVerified: true,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified by another user",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      email: email.toLowerCase(),
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    };

    otpStorage.set(email.toLowerCase(), otpData);

    // Send OTP via email
    try {
      await emailService.sendNotificationEmail(
        email,
        "Your OTP Verification Code",
        `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Remove OTP from storage if email fails
      otpStorage.delete(email.toLowerCase());
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    console.log(`📧 Email OTP sent to ${email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      data: {
        email,
        // In production, don't return the OTP
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
    });
  } catch (error) {
    console.error("Send email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Verify email OTP
// @route   POST /api/otp/verify-email
// @access  Public
export const verifyEmailOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    // Get stored OTP data
    const otpData = otpStorage.get(email.toLowerCase());

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      otpStorage.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      otpStorage.set(email.toLowerCase(), otpData);

      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - remove from storage
    otpStorage.delete(email.toLowerCase());

    console.log(`✅ Email OTP verified for ${email}`);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        email,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Send OTP to phone number
// @route   POST /api/otp/send
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { phoneNumber } = req.body;

    // Check if phone number is already verified for any user
    const existingUser = await User.findOne({
      "profile.phoneNumber": phoneNumber,
      isPhoneVerified: true,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified by another user",
      });
    }

    // In a real implementation, you would integrate with an SMS service
    // For now, we'll simulate OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in session or temporary storage (Redis recommended for production)
    // For demo purposes, we'll just return success

    console.log(`📱 OTP sent to ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phoneNumber,
        // In production, don't return the OTP
        // otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/otp/verify
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { phoneNumber, otp } = req.body;

    // In a real implementation, you would verify the OTP from storage
    // For demo purposes, we'll accept any 6-digit OTP
    if (!otp || otp.length !== 6 || isNaN(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format",
      });
    }

    // Check if phone number is already verified for any user
    const existingUser = await User.findOne({
      "profile.phoneNumber": phoneNumber,
      isPhoneVerified: true,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified by another user",
      });
    }

    // If user is authenticated, update their phone verification status
    if (req.user) {
      const user = req.user;
      user.profile.phoneNumber = phoneNumber;
      user.isPhoneVerified = true;
      await user.save();

      console.log(`✅ Phone verified for user: ${user.email}`);
    }

    console.log(`✅ OTP verified for ${phoneNumber}`);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        phoneNumber,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Resend OTP to phone number
// @route   POST /api/otp/resend
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { phoneNumber } = req.body;

    // Check if phone number is already verified
    const existingUser = await User.findOne({
      "profile.phoneNumber": phoneNumber,
      isPhoneVerified: true,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store new OTP in session or temporary storage
    console.log(`📱 OTP resent to ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        phoneNumber,
        // In production, don't return the OTP
        // otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};
