// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Basic Information
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Related Entities
    bookingId: {
      type: String,
      required: true,
      ref: "Booking",
      index: true,
    },

    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },

    groundId: {
      type: String,
      required: true,
      ref: "Ground",
      index: true,
    },

    // Payment Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["USD", "EUR", "GBP", "INR"],
    },

    // Razorpay Integration
    razorpayOrderId: {
      type: String,
      // Razorpay order ID
    },

    razorpayPaymentId: {
      type: String,
      // Razorpay payment ID
    },

    razorpaySignature: {
      type: String,
      // Razorpay signature for verification
    },

    // Payment Status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // Payment Method
    method: {
      type: String,
      enum: [
        "razorpay",
        "stripe",
        "paypal",
        "cash",
        "card",
        "netbanking",
        "upi",
        "wallet",
        "mock_payment",
      ],
      default: "mock_payment",
    },

    // Transaction Details
    transactionId: {
      type: String,
      // External transaction ID
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      // Store complete gateway response
    },

    // Error Information
    errorCode: {
      type: String,
    },

    errorMessage: {
      type: String,
    },

    // Refund Information
    refundAmount: {
      type: Number,
      default: 0,
    },

    refundReason: {
      type: String,
      maxlength: 500,
    },

    refundedAt: {
      type: Date,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    // Expiry for pending payments
    expiresAt: {
      type: Date,
      // Auto-expire pending payments after 15 minutes
      default: function () {
        return new Date(Date.now() + 15 * 60 * 1000);
      },
    },

    // Additional metadata for custom fields
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Indexes for better query performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for isExpired
paymentSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for isRefundable
paymentSchema.virtual("isRefundable").get(function () {
  return this.status === "completed" && this.amount > this.refundAmount;
});

// Pre-save middleware to update timestamps
paymentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to verify Razorpay signature
paymentSchema.methods.verifyRazorpaySignature = function (
  expectedSignature,
  secret
) {
  const crypto = require("crypto");
  const text = `${this.razorpayOrderId}|${this.razorpayPaymentId}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");

  return signature === expectedSignature;
};

// Method to process refund
paymentSchema.methods.processRefund = function (amount, reason) {
  if (amount > this.amount - this.refundAmount) {
    throw new Error("Refund amount exceeds available amount");
  }

  this.refundAmount += amount;
  this.refundReason = reason;
  this.refundedAt = new Date();

  if (this.refundAmount >= this.amount) {
    this.status = "refunded";
  }

  return this.save();
};

// Transform output
paymentSchema.methods.toJSON = function () {
  const paymentObject = this.toObject();

  // Add virtual fields
  paymentObject.formattedAmount = this.formattedAmount;
  paymentObject.isExpired = this.isExpired;
  paymentObject.isRefundable = this.isRefundable;

  return paymentObject;
};

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
