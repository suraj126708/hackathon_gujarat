// models/TimeSlot.js
import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    // Ground reference
    groundId: {
      type: String,
      required: true,
      ref: "Ground",
      index: true,
    },

    // Date and time
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

    // Blocking details
    reason: {
      type: String,
      required: true,
      maxlength: 200,
      default: "Maintenance",
    },

    // Recurring settings
    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringDays: [
      {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    ],

    endDate: {
      type: Date,
      // For recurring blocks, when to stop
    },

    // Status and metadata
    status: {
      type: String,
      enum: ["blocked", "unblocked"],
      default: "blocked",
    },

    blockedBy: {
      type: String, // Firebase UID of the owner
      required: true,
      ref: "User",
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
timeSlotSchema.index({ groundId: 1, date: 1, startTime: 1 });
timeSlotSchema.index({ groundId: 1, status: 1 });
timeSlotSchema.index({ date: 1, status: 1 });

// Virtual for duration in hours
timeSlotSchema.virtual("durationHours").get(function () {
  const [startHour, startMinute] = this.startTime.split(":").map(Number);
  const [endHour, endMinute] = this.endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return (endMinutes - startMinutes) / 60;
});

// Virtual for formatted date
timeSlotSchema.virtual("formattedDate").get(function () {
  return this.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for time range
timeSlotSchema.virtual("timeRange").get(function () {
  return `${this.startTime} - ${this.endTime}`;
});

// Method to check if a time slot overlaps with another
timeSlotSchema.methods.overlapsWith = function (otherSlot) {
  if (this.date.toDateString() !== otherSlot.date.toDateString()) {
    return false;
  }

  const [thisStartHour, thisStartMinute] = this.startTime
    .split(":")
    .map(Number);
  const [thisEndHour, thisEndMinute] = this.endTime.split(":").map(Number);
  const [otherStartHour, otherStartMinute] = otherSlot.startTime
    .split(":")
    .map(Number);
  const [otherEndHour, otherEndMinute] = otherSlot.endTime
    .split(":")
    .map(Number);

  const thisStartMinutes = thisStartHour * 60 + thisStartMinute;
  const thisEndMinutes = thisEndHour * 60 + thisEndMinute;
  const otherStartMinutes = otherStartHour * 60 + otherStartMinute;
  const otherEndMinutes = otherEndHour * 60 + otherEndMinute;

  return (
    (thisStartMinutes < otherEndMinutes &&
      thisEndMinutes > otherStartMinutes) ||
    (otherStartMinutes < thisEndMinutes && otherEndMinutes > thisStartMinutes)
  );
};

// Method to check if a time slot is active
timeSlotSchema.methods.isActive = function () {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slotDate = new Date(
    this.date.getFullYear(),
    this.date.getMonth(),
    this.date.getDate()
  );

  if (slotDate < today) {
    return false; // Past date
  }

  if (this.isRecurring && this.endDate && now > this.endDate) {
    return false; // Recurring block has ended
  }

  return this.status === "blocked";
};

// Pre-save middleware to update timestamps
timeSlotSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find overlapping time slots
timeSlotSchema.statics.findOverlapping = function (
  groundId,
  date,
  startTime,
  endTime
) {
  return this.find({
    groundId,
    date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    },
    status: "blocked",
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });
};

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

export default TimeSlot;
