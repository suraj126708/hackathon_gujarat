// models/Ground.js
import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
  weekdayPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  weekendPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP", "INR"],
  },
  perHour: {
    type: Boolean,
    default: true,
  },
});

const timingSchema = new mongoose.Schema({
  openTime: {
    type: String,
    required: true,
    // Format: "HH:MM" (24-hour)
  },
  closeTime: {
    type: String,
    required: true,
    // Format: "HH:MM" (24-hour)
  },
  workingDays: [
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
      default: [
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
});

const locationSchema = new mongoose.Schema({
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
});

const dimensionsSchema = new mongoose.Schema({
  length: { type: Number },
  width: { type: Number },
  capacity: { type: Number },
});

const featuresSchema = new mongoose.Schema({
  lighting: { type: Boolean, default: false },
  covered: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  restrooms: { type: Boolean, default: false },
  changeRooms: { type: Boolean, default: false },
});

const contactSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
});

const groundSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    groundId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // Owner Information
    owner: {
      type: String, // Firebase UID of the owner
      required: true,
      ref: "User",
      index: true,
    },

    // Location and Map
    location: {
      type: locationSchema,
      required: true,
    },

    // Timings
    timings: {
      type: timingSchema,
      required: true,
    },

    // Sports Available
    sports: [String],

    // Amenities
    amenities: [String],

    // Pricing
    pricing: {
      type: pricingSchema,
      required: true,
    },

    // Ground Specifications
    dimensions: {
      type: dimensionsSchema,
    },

    // Features
    features: {
      type: featuresSchema,
      default: {},
    },

    // Contact Information
    contact: {
      type: contactSchema,
      required: true,
    },

    // Images and Media
    images: [
      {
        publicId: { type: String },
        url: { type: String },
        thumbnailUrl: { type: String },
        caption: { type: String },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Status and Verification
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "suspended", "under_review"],
      default: "active", // Changed from "pending" to "active" so grounds are visible by default
    },

    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: String, ref: "User" },

    // Statistics
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      favoriteCount: { type: Number, default: 0 },
    },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "grounds",
  }
);

// Indexes for better query performance
groundSchema.index({ owner: 1 });
groundSchema.index({ status: 1 });
groundSchema.index({ "location.address.city": 1, "location.address.state": 1 });
groundSchema.index({ "location.coordinates": "2dsphere" });
groundSchema.index({ sports: 1 });
groundSchema.index({ "pricing.weekdayPrice": 1 });
groundSchema.index({ createdAt: -1 });
groundSchema.index({ "stats.averageRating": -1 });

// Virtual for full address
groundSchema.virtual("fullAddress").get(function () {
  const loc = this.location;
  return `${loc.address.street}, ${loc.address.city}, ${loc.address.state} ${loc.address.postalCode}, ${loc.address.country}`;
});

// Virtual for ground area
groundSchema.virtual("groundArea").get(function () {
  if (this.dimensions && this.dimensions.length && this.dimensions.width) {
    return this.dimensions.length * this.dimensions.width;
  }
  return null;
});

// Pre-save middleware to update timestamps
groundSchema.pre("save", function (next) {
  // Update timestamps
  this.updatedAt = new Date();
  this.lastActivityAt = new Date();

  next();
});

// Method to update statistics
groundSchema.methods.updateStats = function () {
  // This method will be implemented to update booking and review statistics
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to check if ground is open
groundSchema.methods.isOpen = function (date = new Date()) {
  const day = date.toLocaleDateString("en-US", { weekday: "lowercase" });
  const time = date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!this.timings.workingDays.includes(day)) return false;

  return time >= this.timings.openTime && time <= this.timings.closeTime;
};

// Method to get current pricing
groundSchema.methods.getCurrentPricing = function (date = new Date()) {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Friday (5), Saturday (6), Sunday (0) are weekend
  if (day === 0 || day === 5 || day === 6) {
    return this.pricing.weekendPrice;
  } else {
    // Monday to Thursday
    return this.pricing.weekdayPrice;
  }
};

// Transform output
groundSchema.methods.toJSON = function () {
  const groundObject = this.toObject();

  // Add virtual fields
  groundObject.fullAddress = this.fullAddress;
  groundObject.groundArea = this.groundArea;

  return groundObject;
};

const Ground = mongoose.model("Ground", groundSchema);

export default Ground;
