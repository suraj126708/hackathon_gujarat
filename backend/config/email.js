// config/email.js
import nodemailer from "nodemailer";

// Create transporter for Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Email service class
class EmailService {
  constructor() {
    this.transporter = createTransporter();
  }

  // Send email method
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "Your App"}" <${
          process.env.GMAIL_USER
        }>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const subject = "Welcome to Our App!";
    const text = `Hi ${userName},\n\nWelcome to our app! We're excited to have you on board.\n\nBest regards,\nThe Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our App!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to our app! We're excited to have you on board.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Password Reset Request";
    const text = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    });
  }

  // Send account verification email
  async sendVerificationEmail(userEmail, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const subject = "Verify Your Email Address";
    const text = `Please verify your email address by clicking the following link: ${verificationUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text,
      html,
    });
  }

  // Send notification email
  async sendNotificationEmail(userEmail, subject, message) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${message}</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      text: message,
      html,
    });
  }

  // Verify transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email transporter is ready");
      return true;
    } catch (error) {
      console.error("❌ Email transporter verification failed:", error);
      return false;
    }
  }
}

// Create and export email service instance
const emailService = new EmailService();

export default emailService;
