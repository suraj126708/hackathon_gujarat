// controllers/groundController.js
import Ground from "../models/Ground.js";
import Review from "../models/Review.js";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import Booking from "../models/Booking.js"; // Added import for Booking

// Generate unique ground ID
const generateGroundId = () => {
  return `GRD-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// Create a new ground
export const createGround = async (req, res) => {
  try {
    console.log("🏟️ [GROUND] Starting ground creation process");
    console.log("🏟️ [GROUND] User:", req.user?.email || "No user");
    console.log("🏟️ [GROUND] User role:", req.user?.role || "No role");
    console.log(
      "🏟️ [GROUND] User Firebase UID:",
      req.user?.firebaseUid || "No UID"
    );

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(
        "❌ [GROUND] Validation errors in controller:",
        errors.array()
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Log the incoming data for debugging
    console.log("🏟️ [GROUND] Request body data:");
    console.log("🏟️ [GROUND] Name:", req.body.name);
    console.log("🏟️ [GROUND] Ground ID:", req.body.groundId);
    console.log(
      "🏟️ [GROUND] Description length:",
      req.body.description?.length || 0
    );
    console.log("🏟️ [GROUND] Address:", req.body.address);
    console.log("🏟️ [GROUND] Coordinates:", req.body.coordinates);
    console.log("🏟️ [GROUND] Timings:", req.body.timings);
    console.log("🏟️ [GROUND] Sports:", req.body.sports);
    console.log("🏟️ [GROUND] Pricing:", req.body.pricing);
    console.log("🏟️ [GROUND] Images count:", req.body.images?.length || 0);

    const {
      name,
      groundId,
      description,
      address,
      coordinates,
      timings,
      sports,
      amenities,
      pricing,
      dimensions,
      features,
      contact,
      images,
    } = req.body;

    // User role is already verified by authorize middleware
    // No need to check again here

    // Use provided groundId or generate one
    const finalGroundId = groundId || generateGroundId();

    // Transform images to match model structure
    console.log("🏟️ [GROUND] Processing images...");
    const transformedImages = (images || []).map((img) => ({
      publicId: img.publicId,
      url: img.secureUrl || img.url, // Use secureUrl if available, fallback to url
      thumbnailUrl: img.thumbnailUrl || img.secureUrl || img.url,
      caption: img.caption || "",
      isPrimary: img.isPrimary || false,
      uploadedAt: img.uploadedAt ? new Date(img.uploadedAt) : new Date(),
    }));
    console.log("🏟️ [GROUND] Transformed images:", transformedImages.length);

    // Create new ground with the exact structure from frontend
    console.log("🏟️ [GROUND] Creating Ground model instance...");
    const groundData = {
      name,
      groundId: finalGroundId,
      description,
      location: {
        address,
        coordinates,
      },
      timings,
      sports: sports || [],
      amenities: amenities || [],
      pricing,
      dimensions,
      features,
      contact,
      owner: req.user._id, // Use _id since that's what we store in the User model
      images: transformedImages,
    };
    console.log(
      "🏟️ [GROUND] Ground data prepared:",
      JSON.stringify(groundData, null, 2)
    );

    // Check if user already owns a ground with this name
    const existingGround = await Ground.findOne({
      name: groundData.name,
      owner: req.user.firebaseUid, // Use firebaseUid since that's what we store in the Ground model
    });

    if (existingGround) {
      return res.status(400).json({
        success: false,
        message: "A ground with this name already exists for your account.",
      });
    }

    // Create ground with owner
    const ground = new Ground({
      ...groundData,
      owner: req.user.firebaseUid, // Use firebaseUid since that's what we store in the Ground model
      groundId: generateGroundId(),
      status: "active", // Set default status to active
    });

    // Save ground
    console.log("🏟️ [GROUND] Saving ground to database...");
    await ground.save();
    console.log("✅ [GROUND] Ground saved successfully with ID:", ground._id);

    // Populate owner details
    console.log("🏟️ [GROUND] Populating owner details...");
    await ground.populate({
      path: "owner",
      select: "displayName email profile.firstName profile.lastName",
      localField: "owner",
      foreignField: "_id",
    });
    console.log("✅ [GROUND] Owner details populated");

    console.log("✅ [GROUND] Ground creation completed successfully");
    res.status(201).json({
      success: true,
      message: "Ground created successfully",
      data: ground,
    });
  } catch (error) {
    console.error("❌ [GROUND] Error creating ground:", error);
    console.error("❌ [GROUND] Error stack:", error.stack);
    console.error("❌ [GROUND] Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all grounds (with filtering and pagination)
export const getAllGrounds = async (req, res) => {
  try {
    console.log("🏟️ [GETALLGROUNDS] Request received with query:", req.query);

    const {
      page = 1,
      limit = 10,
      city,
      state,
      sport,
      minPrice,
      maxPrice,
      rating,
      status = "active",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    let filter = {};

    // Handle multiple status values (e.g., "active,pending")
    if (status && status.includes(",")) {
      filter.status = { $in: status.split(",") };
    } else {
      filter.status = status;
    }

    console.log("🏟️ [GETALLGROUNDS] Initial filter:", filter);

    if (city) filter["location.address.city"] = new RegExp(city, "i");
    if (state) filter["location.address.state"] = new RegExp(state, "i");
    if (sport) filter["sports"] = new RegExp(sport, "i");
    if (minPrice || maxPrice) {
      filter["pricing.weekdayPrice"] = {};
      if (minPrice) filter["pricing.weekdayPrice"].$gte = parseFloat(minPrice);
      if (maxPrice) filter["pricing.weekdayPrice"].$lte = parseFloat(maxPrice);
    }
    if (rating) filter["stats.averageRating"] = { $gte: parseFloat(rating) };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("🏟️ [GETALLGROUNDS] Final filter:", filter);
    console.log("🏟️ [GETALLGROUNDS] Sort:", sort);
    console.log("🏟️ [GETALLGROUNDS] Skip:", skip, "Limit:", limit);

    // Execute query with pagination
    const grounds = await Ground.find(filter)
      .populate({
        path: "owner",
        select: "displayName profile.firstName profile.lastName",
        localField: "owner",
        foreignField: "_id",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log("🏟️ [GETALLGROUNDS] Found grounds:", grounds.length);

    // Get total count for pagination
    const total = await Ground.countDocuments(filter);
    console.log("🏟️ [GETALLGROUNDS] Total grounds in database:", total);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Grounds retrieved successfully",
      data: {
        grounds,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting grounds:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get ground by ID
export const getGroundById = async (req, res) => {
  try {
    const { groundId } = req.params;

    const ground = await Ground.findOne({ groundId }).populate({
      path: "owner",
      select: "displayName email profile.firstName profile.lastName photoURL",
      localField: "owner",
      foreignField: "_id",
    });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    // Increment view count
    ground.stats.viewCount += 1;
    await ground.save();

    // Get reviews for this ground using the new approach
    const reviews = await Review.find({ ground: groundId })
      .populate({
        path: "user",
        select: "displayName photoURL profile.firstName profile.lastName",
        localField: "user",
        foreignField: "_id",
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get average rating using the new approach
    const ratingStats = await Review.aggregate([
      { $match: { ground: groundId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };

    console.log("🔍 [GROUND] Found ground:", ground.name);
    console.log("🔍 [GROUND] Found reviews:", reviews.length);
    console.log("🔍 [GROUND] Rating stats:", stats);

    res.status(200).json({
      success: true,
      message: "Ground retrieved successfully",
      data: {
        ground,
        reviews,
        ratingStats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
        },
      },
    });
  } catch (error) {
    console.error("Error getting ground:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get grounds by owner
export const getGroundsByOwner = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    console.log("🔍 [DEBUG] getGroundsByOwner called");
    console.log("🔍 [DEBUG] User object:", req.user);
    console.log("🔍 [DEBUG] User ID:", req.user._id);
    console.log("🔍 [DEBUG] User Firebase UID:", req.user.firebaseUid);
    console.log("🔍 [DEBUG] User Role:", req.user.role);
    console.log("🔍 [DEBUG] User Email:", req.user.email);

    // Build filter - use firebaseUid since that's what we store in the Ground model
    const filter = { owner: req.user.firebaseUid };
    if (status) filter.status = status;

    console.log("🔍 [DEBUG] Filter:", filter);

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const grounds = await Ground.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("🔍 [DEBUG] Found grounds:", grounds.length);

    // Get total count
    const total = await Ground.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Owner grounds retrieved successfully",
      data: {
        grounds,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting owner grounds:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update ground
export const updateGround = async (req, res) => {
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

    const { groundId } = req.params;
    const updateData = req.body;

    // Find ground and check ownership
    const ground = await Ground.findOne({ groundId });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own grounds",
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.owner;
    delete updateData.groundId;
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.verifiedAt;
    delete updateData.verifiedBy;
    delete updateData.stats;

    // Update ground
    const updatedGround = await Ground.findOneAndUpdate(
      { groundId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate({
      path: "owner",
      select: "displayName profile.firstName profile.lastName",
      localField: "owner",
      foreignField: "_id",
    });

    res.status(200).json({
      success: true,
      message: "Ground updated successfully",
      data: updatedGround,
    });
  } catch (error) {
    console.error("Error updating ground:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete ground
export const deleteGround = async (req, res) => {
  try {
    const { groundId } = req.params;

    // Find ground and check ownership
    const ground = await Ground.findOne({ groundId });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own grounds",
      });
    }

    // Soft delete - change status to inactive
    ground.status = "inactive";
    await ground.save();

    res.status(200).json({
      success: true,
      message: "Ground deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ground:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Upload ground images
export const uploadGroundImages = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { images } = req.body; // Array of image objects from Cloudinary

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    // Find ground and check ownership
    const ground = await Ground.findOne({ groundId });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only upload images to your own grounds",
      });
    }

    // Process images
    const processedImages = images.map((image, index) => ({
      publicId: image.public_id,
      url: image.secure_url,
      thumbnailUrl: image.thumbnail_url || image.secure_url,
      caption: image.caption || "",
      isPrimary: index === 0, // First image is primary
      uploadedAt: new Date(),
    }));

    // Update ground images
    ground.images = processedImages;
    await ground.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: ground.images,
      },
    });
  } catch (error) {
    console.error("Error uploading ground images:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Search grounds
export const searchGrounds = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      city,
      sport,
      priceRange,
      rating,
    } = req.query;

    // Build search query
    const searchFilter = { status: { $in: ["active", "pending"] } }; // Show both active and pending grounds

    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { "location.address.city": { $regex: query, $options: "i" } },
        { "location.address.state": { $regex: query, $options: "i" } },
      ];
    }

    if (city) searchFilter["location.address.city"] = new RegExp(city, "i");
    if (sport) searchFilter["sports"] = new RegExp(sport, "i");
    if (rating)
      searchFilter["stats.averageRating"] = { $gte: parseFloat(rating) };

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      searchFilter["pricing.weekdayPrice"] = {};
      if (min) searchFilter["pricing.weekdayPrice"].$gte = min;
      if (max) searchFilter["pricing.weekdayPrice"].$lte = max;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const grounds = await Ground.find(searchFilter)
      .populate({
        path: "owner",
        select: "displayName profile.firstName profile.lastName",
        localField: "owner",
        foreignField: "_id",
      })
      .sort({ "stats.averageRating": -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Ground.countDocuments(searchFilter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: {
        grounds,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
        },
        searchQuery: query,
      },
    });
  } catch (error) {
    console.error("Error searching grounds:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get ground statistics
export const getGroundStats = async (req, res) => {
  try {
    const { groundId } = req.params;

    // Find ground and check ownership
    const ground = await Ground.findOne({ groundId });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only view stats for your own grounds",
      });
    }

    // Get review statistics using the new approach
    const reviewStats = await Review.aggregate([
      { $match: { ground: groundId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Get recent reviews using the new approach
    const recentReviews = await Review.find({ ground: groundId })
      .populate({
        path: "user",
        select: "displayName photoURL profile.firstName profile.lastName",
        localField: "user",
        foreignField: "_id",
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = reviewStats[0] || { averageRating: 0, totalReviews: 0 };

    res.status(200).json({
      success: true,
      message: "Ground statistics retrieved successfully",
      data: {
        groundStats: ground.stats,
        reviewStats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
        },
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Error getting ground stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get owner financial summary
export const getOwnerFinancialSummary = async (req, res) => {
  try {
    const ownerId = req.user.firebaseUid; // Use firebaseUid since that's what we store in the Ground model

    console.log("🔍 [DEBUG] Getting financial summary for owner:", ownerId);

    // Get all active grounds for the owner
    const grounds = await Ground.find({ owner: ownerId, status: "active" });

    console.log(
      "🔍 [DEBUG] Found grounds for financial summary:",
      grounds.length
    );

    // Calculate total earnings from all grounds
    let totalEarnings = 0;
    let monthlyEarnings = 0;
    let totalBookings = 0;
    let cancelledBookings = 0;
    let totalRating = 0;
    let totalReviews = 0;

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    for (const ground of grounds) {
      // Add ground stats
      totalEarnings += ground.stats?.totalRevenue || 0;
      totalBookings += ground.stats?.totalBookings || 0;
      totalRating +=
        (ground.stats?.averageRating || 0) * (ground.stats?.totalReviews || 0);
      totalReviews += ground.stats?.totalReviews || 0;

      // Calculate monthly earnings (this would need to be calculated from actual booking data)
      // For now, we'll use a simple calculation
      monthlyEarnings += (ground.stats?.totalRevenue || 0) / 12;
    }

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    const financialSummary = {
      totalEarnings: Math.round(totalEarnings),
      monthlyEarnings: Math.round(monthlyEarnings),
      totalBookings,
      cancelledBookings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      groundsCount: grounds.length,
    };

    console.log("🔍 [DEBUG] Financial summary calculated:", financialSummary);

    res.status(200).json({
      success: true,
      message: "Financial summary retrieved successfully",
      data: financialSummary,
    });
  } catch (error) {
    console.error("Error getting owner financial summary:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get owner monthly analytics
export const getOwnerMonthlyAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const ownerId = req.user.firebaseUid; // Use firebaseUid since that's what we store in the Ground model

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    // Get all grounds owned by the user
    const grounds = await Ground.find({ owner: ownerId, status: "active" });
    const groundIds = grounds.map((ground) => ground.groundId);

    // Calculate date ranges
    const currentMonthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
    const currentMonthEnd = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59
    );

    const previousMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1;
    const previousYear =
      parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year);
    const previousMonthStart = new Date(previousYear, previousMonth - 1, 1);
    const previousMonthEnd = new Date(
      previousYear,
      previousMonth,
      0,
      23,
      59,
      59
    );

    // Get current month data
    const currentMonthBookings = await Booking.find({
      groundId: { $in: groundIds },
      date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      paymentStatus: "completed",
    });

    const currentMonthRevenue = currentMonthBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    // Get previous month data
    const previousMonthBookings = await Booking.find({
      groundId: { $in: groundIds },
      date: { $gte: previousMonthStart, $lte: previousMonthEnd },
      paymentStatus: "completed",
    });

    const previousMonthRevenue = previousMonthBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    // Calculate trends
    const revenueGrowth =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : 0;

    const bookingsGrowth =
      previousMonthBookings.length > 0
        ? ((currentMonthBookings.length - previousMonthBookings.length) /
            previousMonthBookings.length) *
          100
        : 0;

    res.status(200).json({
      success: true,
      message: "Monthly analytics retrieved successfully",
      data: {
        currentMonth: {
          revenue: currentMonthRevenue,
          bookings: currentMonthBookings.length,
          growth: revenueGrowth,
        },
        previousMonth: {
          revenue: previousMonthRevenue,
          bookings: previousMonthBookings.length,
        },
        trends: {
          revenue: revenueGrowth,
          bookings: bookingsGrowth,
        },
      },
    });
  } catch (error) {
    console.error("Error getting monthly analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update ground status
export const updateGroundStatus = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["active", "inactive", "maintenance", "suspended"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: active, inactive, maintenance, suspended",
      });
    }

    // Find ground and check ownership
    const ground = await Ground.findOne({ groundId });

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    if (ground.owner !== req.user.firebaseUid) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own grounds",
      });
    }

    // Update ground status
    ground.status = status;
    ground.updatedAt = new Date();
    await ground.save();

    res.status(200).json({
      success: true,
      message: "Ground status updated successfully",
      data: {
        groundId,
        status: ground.status,
        updatedAt: ground.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating ground status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
