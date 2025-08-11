// controllers/reviewController.js
import Review from "../models/Review.js";
import Ground from "../models/Ground.js";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

// Generate unique review ID
const generateReviewId = () => {
  return `REV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { groundId, rating, title, content, categoryRatings, images } =
      req.body;

    // Check if ground exists and is active
    const ground = await Ground.findOne({ groundId, status: "active" });
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found or inactive",
      });
    }

    // Check if user has already reviewed this ground
    const existingReview = await Review.findOne({
      ground: groundId,
      user: req.user.firebaseUid,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this ground",
      });
    }

    // Generate unique review ID
    const reviewId = generateReviewId();

    // Create new review
    const review = new Review({
      reviewId,
      ground: groundId,
      user: req.user.firebaseUid,
      rating,
      title,
      content,
      categoryRatings: categoryRatings || {},
      images: images || [],
    });

    // Save review
    await review.save();

    // Update ground statistics
    await updateGroundStats(groundId);

    // Populate user details
    await review.populate(
      "user",
      "displayName photoURL profile.firstName profile.lastName"
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get reviews by ground
export const getReviewsByGround = async (req, res) => {
  try {
    const { groundId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Check if ground exists
    const ground = await Ground.findOne({ groundId });
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    // Build filter
    const filter = { ground: groundId, status: "approved" };

    if (rating) filter.rating = parseInt(rating);
    if (category) filter[`categoryRatings.${category}`] = { $exists: true };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const reviews = await Review.find(filter)
      .populate(
        "user",
        "displayName photoURL profile.firstName profile.lastName"
      )
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { ground: groundId, status: "approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
        },
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ reviewId })
      .populate(
        "user",
        "displayName photoURL profile.firstName profile.lastName"
      )
      .populate("ground", "name groundId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error getting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { reviewId } = req.params;
    const updateData = req.body;

    // Find review and check ownership
    const review = await Review.findOne({ reviewId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.reviewId;
    delete updateData.ground;
    delete updateData.user;
    delete updateData.status;
    delete updateData.isModerated;
    delete updateData.moderatedAt;
    delete updateData.moderatedBy;
    delete updateData.moderationReason;

    // Update review
    const updatedReview = await Review.findOneAndUpdate(
      { reviewId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate(
      "user",
      "displayName photoURL profile.firstName profile.lastName"
    );

    // Update ground statistics
    await updateGroundStats(review.ground);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find review and check ownership
    const review = await Review.findOne({ reviewId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    // Soft delete - change status to hidden
    review.status = "hidden";
    await review.save();

    // Update ground statistics
    await updateGroundStats(review.ground);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Toggle helpful status
    if (review.helpfulUsers.includes(req.user.firebaseUid)) {
      await review.unmarkHelpful(req.user.firebaseUid);
      res.status(200).json({
        success: true,
        message: "Review unmarked as helpful",
        data: { helpfulCount: review.helpfulCount },
      });
    } else {
      await review.markHelpful(req.user.firebaseUid);
      res.status(200).json({
        success: true,
        message: "Review marked as helpful",
        data: { helpfulCount: review.helpfulCount },
      });
    }
  } catch (error) {
    console.error("Error marking review helpful:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Report review
export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required for reporting",
      });
    }

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user has already reported this review
    if (review.reportedBy.includes(req.user.firebaseUid)) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this review",
      });
    }

    await review.report(req.user.firebaseUid, reason);

    res.status(200).json({
      success: true,
      message: "Review reported successfully",
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add owner reply to review
export const addOwnerReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content, isPublic = true } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Reply content is required",
      });
    }

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the ground owner
    const ground = await Ground.findOne({ groundId: review.ground });
    if (!ground || ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "Only ground owners can reply to reviews",
      });
    }

    await review.addOwnerReply(content, isPublic);

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: { ownerReply: review.ownerReply },
    });
  } catch (error) {
    console.error("Error adding owner reply:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const reviews = await Review.find({ user: req.user.firebaseUid })
      .populate("ground", "name groundId images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments({ user: req.user.firebaseUid });

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "User reviews retrieved successfully",
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to update ground statistics
const updateGroundStats = async (groundId) => {
  try {
    const ratingStats = await Review.getAverageRating(groundId);
    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };

    await Ground.findOneAndUpdate(
      { groundId },
      {
        "stats.averageRating": Math.round(stats.averageRating * 10) / 10,
        "stats.totalReviews": stats.totalReviews,
      }
    );
  } catch (error) {
    console.error("Error updating ground stats:", error);
  }
};
