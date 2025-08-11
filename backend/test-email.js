// test-email.js - Test email functionality
import dotenv from "dotenv";
import emailService from "./config/email.js";

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log("🧪 Testing email service...");

    // Test connection
    const isConnected = await emailService.verifyConnection();
    if (!isConnected) {
      console.log("❌ Email service connection failed");
      return;
    }

    console.log("✅ Email service connection successful");

    // Test sending email (only if GMAIL_USER and GMAIL_APP_PASSWORD are set)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log("📧 Testing email sending...");

      const result = await emailService.sendNotificationEmail(
        process.env.GMAIL_USER, // Send to yourself for testing
        "Test Email from QuickCourt Backend",
        "This is a test email to verify the email service is working correctly."
      );

      if (result.success) {
        console.log("✅ Test email sent successfully!");
        console.log("📧 Message ID:", result.messageId);
      } else {
        console.log("❌ Failed to send test email");
      }
    } else {
      console.log("⚠️  GMAIL_USER or GMAIL_APP_PASSWORD not set in .env file");
      console.log("📝 Please configure your email settings first");
    }
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
  }
}

// Run the test
testEmail();
