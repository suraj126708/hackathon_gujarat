// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Review ID
    reviewId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Ground being reviewed
    ground: {
      type: String, // Ground ID
      required: true,
      ref: "Ground",
      index: true,
    },

    // User who wrote the review
    user: {
      type: String, // Firebase UID
      required: true,
      ref: "User",
      index: true,
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },

    // Review title
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Review content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Review categories and ratings
    categoryRatings: {
      cleanliness: { type: Number, min: 1, max: 5 },
      facilities: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      atmosphere: { type: Number, min: 1, max: 5 },
    },

    // Images attached to review
    images: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        caption: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Review status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden"],
      default: "pending",
    },

    // Moderation
    isModerated: { type: Boolean, default: false },
    moderatedAt: { type: Date },
    moderatedBy: { type: String, ref: "User" },
    moderationReason: { type: String },

    // Helpfulness
    helpfulCount: { type: Number, default: 0 },
    helpfulUsers: [{ type: String, ref: "User" }],

    // Report handling
    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: String, ref: "User" }],
    reportReasons: [String],

    // Reply from ground owner
    ownerReply: {
      content: { type: String, maxlength: 500 },
      repliedAt: { type: Date },
      isPublic: { type: Boolean, default: true },
    },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Indexes for better query performance
reviewSchema.index({ ground: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ "categoryRatings.cleanliness": 1 });
reviewSchema.index({ "categoryRatings.facilities": 1 });
reviewSchema.index({ "categoryRatings.service": 1 });
reviewSchema.index({ "categoryRatings.value": 1 });
reviewSchema.index({ "categoryRatings.atmosphere": 1 });
reviewSchema.index({ helpfulCount: -1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for average category rating
reviewSchema.virtual("averageCategoryRating").get(function () {
  const ratings = Object.values(this.categoryRatings).filter(
    (rating) => rating !== undefined
  );
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for review age
reviewSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
reviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  this.lastActivityAt = new Date();
  next();
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function (userId) {
  if (!this.helpfulUsers.includes(userId)) {
    this.helpfulUsers.push(userId);
    this.helpfulCount = this.helpfulUsers.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = function (userId) {
  const index = this.helpfulUsers.indexOf(userId);
  if (index > -1) {
    this.helpfulUsers.splice(index, 1);
    this.helpfulCount = this.helpfulUsers.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to report review
reviewSchema.methods.report = function (userId, reason) {
  if (!this.reportedBy.includes(userId)) {
    this.reportedBy.push(userId);
    this.reportCount = this.reportedBy.length;
    if (reason && !this.reportReasons.includes(reason)) {
      this.reportReasons.push(reason);
    }
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add owner reply
reviewSchema.methods.addOwnerReply = function (content, isPublic = true) {
  this.ownerReply = {
    content,
    repliedAt: new Date(),
    isPublic,
  };
  return this.save();
};

// Static method to get reviews by ground
reviewSchema.statics.findByGround = function (groundId, options = {}) {
  const query = { ground: groundId, status: "approved" };

  if (options.rating) {
    query.rating = options.rating;
  }

  if (options.category) {
    query[`categoryRatings.${options.category}`] = { $exists: true };
  }

  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .populate(
      "user",
      "displayName photoURL profile.firstName profile.lastName"
    );
};

// Static method to get average rating for a ground
reviewSchema.statics.getAverageRating = function (groundId) {
  return this.aggregate([
    { $match: { ground: groundId, status: "approved" } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);
};

// Transform output
reviewSchema.methods.toJSON = function () {
  const reviewObject = this.toObject();

  // Add virtual fields
  reviewObject.averageCategoryRating = this.averageCategoryRating;
  reviewObject.ageInDays = this.ageInDays;

  // Remove sensitive fields
  delete reviewObject.__v;

  return reviewObject;
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
