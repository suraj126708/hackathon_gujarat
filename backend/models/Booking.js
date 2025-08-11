// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Basic Information
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Ground and User Information
    groundId: {
      type: String,
      required: true,
      ref: "Ground",
      index: true,
    },

    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },

    // Booking Details
    sport: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    startTime: {
      type: String,
      required: true,
      // Format: "HH:MM" (24-hour)
    },

    endTime: {
      type: String,
      required: true,
      // Format: "HH:MM" (24-hour)
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 24, // Maximum 24 hours
    },

    // Court/Table Selection
    selectedCourts: [
      {
        type: String,
        required: true,
        // e.g., "Court 1", "Table 2"
      },
    ],

    // Pricing
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["USD", "EUR", "GBP", "INR"],
    },

    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "cash", "mock_payment"],
      default: "mock_payment",
    },

    paymentId: {
      type: String,
      // External payment gateway ID
    },

    // Booking Status
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no_show"],
      default: "confirmed",
      index: true,
    },

    // Cancellation
    cancelledAt: {
      type: Date,
    },

    cancelledBy: {
      type: String,
      enum: ["user", "owner", "admin"],
    },

    cancellationReason: {
      type: String,
      maxlength: 500,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    // Additional Information
    specialRequests: {
      type: String,
      maxlength: 500,
    },

    numberOfPlayers: {
      type: Number,
      min: 1,
      default: 1,
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
      // Auto-expire pending bookings after 15 minutes
      default: function () {
        return new Date(Date.now() + 15 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  }
);

// Indexes for better query performance
bookingSchema.index({ groundId: 1, date: 1, startTime: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ paymentStatus: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted date
bookingSchema.virtual("formattedDate").get(function () {
  return this.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for formatted time range
bookingSchema.virtual("formattedTimeRange").get(function () {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for isExpired
bookingSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Virtual for isUpcoming
bookingSchema.virtual("isUpcoming").get(function () {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(":");
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return bookingDateTime > now;
});

// Pre-save middleware to update timestamps
bookingSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(":");
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Can cancel up to 2 hours before booking
  const twoHoursBefore = new Date(
    bookingDateTime.getTime() - 2 * 60 * 60 * 1000
  );
  return now < twoHoursBefore && this.status === "confirmed";
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function () {
  if (this.status !== "confirmed") return 0;

  const now = new Date();
  const bookingDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(":");
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const timeUntilBooking = bookingDateTime.getTime() - now.getTime();
  const hoursUntilBooking = timeUntilBooking / (1000 * 60 * 60);

  if (hoursUntilBooking >= 24) {
    return this.totalAmount; // Full refund if cancelled 24+ hours before
  } else if (hoursUntilBooking >= 2) {
    return this.totalAmount * 0.5; // 50% refund if cancelled 2-24 hours before
  } else {
    return 0; // No refund if cancelled less than 2 hours before
  }
};

// Transform output
bookingSchema.methods.toJSON = function () {
  const bookingObject = this.toObject();

  // Add virtual fields
  bookingObject.formattedDate = this.formattedDate;
  bookingObject.formattedTimeRange = this.formattedTimeRange;
  bookingObject.isExpired = this.isExpired;
  bookingObject.isUpcoming = this.isUpcoming;
  bookingObject.canBeCancelled = this.canBeCancelled();

  return bookingObject;
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
