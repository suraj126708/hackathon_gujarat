// controllers/authController.js
import admin from "../config/firebase.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import emailService from "../config/email.js";
import crypto from "crypto";

// @desc    Register user after Firebase auth
// @route   POST /api/auth/register
// @access  Private (requires Firebase token)
export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, bio, preferences, userType } = req.body;

    // User is already authenticated via middleware, so we have req.user
    const user = req.user;

    // Update user profile with additional information
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (bio) user.profile.bio = bio;
    if (userType) user.userType = userType;
    if (userType) user.role = userType;

    if (preferences) {
      // Update preferences if provided
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.notifications) {
        Object.assign(
          user.preferences.notifications,
          preferences.notifications
        );
      }
      if (preferences.privacy) {
        Object.assign(user.preferences.privacy, preferences.privacy);
      }
    }

    await user.save();

    // Send welcome email
    try {
      const userName =
        user.profile.firstName || user.displayName || user.email.split("@")[0];
      await emailService.sendWelcomeEmail(user.email, userName);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error("❌ Failed to send welcome email:", emailError);
      // Don't fail the registration if email fails
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Register user error:", error);
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

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    // Update last active time
    await user.updateLastActive();

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: user.toJSON(),
        firebaseData: {
          uid: req.firebaseUser.uid,
          email: req.firebaseUser.email,
          emailVerified: req.firebaseUser.email_verified,
          signInProvider: req.firebaseUser.firebase.sign_in_provider,
          authTime: new Date(req.firebaseUser.auth_time * 1000),
          issuedAt: new Date(req.firebaseUser.iat * 1000),
        },
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
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

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { displayName, profile, preferences, userType } = req.body;

    const user = req.user;

    // Update basic profile
    if (displayName) {
      user.displayName = displayName;
    }

    // Update user type
    if (userType) {
      user.userType = userType;
    }

    // Update profile fields
    if (profile) {
      if (profile.firstName) user.profile.firstName = profile.firstName;
      if (profile.lastName) user.profile.lastName = profile.lastName;
      if (profile.phoneNumber) {
        user.profile.phoneNumber = profile.phoneNumber;
        // Note: Phone verification would need to be handled separately
      }
      if (profile.bio) user.profile.bio = profile.bio;
      if (profile.dateOfBirth) user.profile.dateOfBirth = profile.dateOfBirth;
      if (profile.location) user.profile.location = profile.location;
    }

    // Update preferences
    if (preferences) {
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.notifications) {
        Object.assign(
          user.preferences.notifications,
          preferences.notifications
        );
      }
      if (preferences.privacy) {
        Object.assign(user.preferences.privacy, preferences.privacy);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
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

// @desc    Delete current user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteUserAccount = async (req, res) => {
  try {
    const user = req.user;

    // Delete user from Firebase (this will trigger the onDelete trigger)
    try {
      await admin.auth().deleteUser(user.firebaseUid);
      console.log(`✅ Firebase user deleted: ${user.firebaseUid}`);
    } catch (firebaseError) {
      console.error("❌ Firebase user deletion failed:", firebaseError);
      // Continue with backend deletion even if Firebase fails
    }

    // Delete user from database
    await User.findByIdAndDelete(user._id);
    console.log(`✅ Backend user deleted: ${user._id}`);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
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

// @desc    Verify Firebase token
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    const firebaseUser = req.firebaseUser;

    res.status(200).json({
      success: true,
      message: "Token verified successfully",
      data: {
        user: user.toJSON(),
        firebaseData: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.email_verified,
          signInProvider: firebaseUser.firebase.sign_in_provider,
          authTime: new Date(firebaseUser.auth_time * 1000),
          issuedAt: new Date(firebaseUser.iat * 1000),
        },
      },
    });
  } catch (error) {
    console.error("Verify token error:", error);
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

// @desc    Create custom Firebase token (Admin only)
// @route   POST /api/auth/custom-token
// @access  Private (Admin)
export const createCustomToken = async (req, res) => {
  try {
    const { uid, additionalClaims } = req.body;

    const customToken = await admin
      .auth()
      .createCustomToken(uid, additionalClaims);

    res.status(200).json({
      success: true,
      message: "Custom token created successfully",
      data: {
        customToken,
      },
    });
  } catch (error) {
    console.error("Create custom token error:", error);
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

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const requestPasswordReset = async (req, res) => {
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error("❌ Failed to send password reset email:", emailError);
      // Remove the reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
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

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    // Update password in Firebase
    try {
      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword,
      });
      console.log(`✅ Firebase password updated for user: ${user.firebaseUid}`);
    } catch (firebaseError) {
      console.error("❌ Firebase password update failed:", firebaseError);
      return res.status(500).json({
        success: false,
        message: "Failed to update password. Please try again later.",
      });
    }

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
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
