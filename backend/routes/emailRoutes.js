// routes/emailRoutes.js
import express from "express";
import emailService from "../config/email.js";
import {
  authenticateFirebaseToken,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Test email service (Admin only)
// @route   POST /api/email/test
// @access  Private (Admin)
router.post(
  "/test",
  authenticateFirebaseToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: "Please provide to, subject, and message",
        });
      }

      // Test email connection first
      const isConnected = await emailService.verifyConnection();
      if (!isConnected) {
        return res.status(500).json({
          success: false,
          message: "Email service is not available",
        });
      }

      // Send test email
      const result = await emailService.sendNotificationEmail(
        to,
        subject,
        message
      );

      res.status(200).json({
        success: true,
        message: "Test email sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send test email",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  }
);

// @desc    Send welcome email (Admin only)
// @route   POST /api/email/welcome
// @access  Private (Admin)
router.post(
  "/welcome",
  authenticateFirebaseToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and name",
        });
      }

      const result = await emailService.sendWelcomeEmail(email, name);

      res.status(200).json({
        success: true,
        message: "Welcome email sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send welcome email",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  }
);

export default router;
