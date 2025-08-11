// controllers/groundController.js
import Ground from "../models/Ground.js";
import Review from "../models/Review.js";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

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
      owner: req.user.firebaseUid,
      images: transformedImages,
    };
    console.log(
      "🏟️ [GROUND] Ground data prepared:",
      JSON.stringify(groundData, null, 2)
    );

    const ground = new Ground(groundData);

    // Save ground
    console.log("🏟️ [GROUND] Saving ground to database...");
    await ground.save();
    console.log("✅ [GROUND] Ground saved successfully with ID:", ground._id);

    // Populate owner details
    console.log("🏟️ [GROUND] Populating owner details...");
    await ground.populate(
      "owner",
      "displayName email profile.firstName profile.lastName"
    );
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
    const filter = { status };

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

    // Execute query with pagination
    const grounds = await Ground.find(filter)
      .populate("owner", "displayName profile.firstName profile.lastName")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Ground.countDocuments(filter);

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

    const ground = await Ground.findOne({ groundId }).populate(
      "owner",
      "displayName email profile.firstName profile.lastName photoURL"
    );

    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found",
      });
    }

    // Increment view count
    ground.stats.viewCount += 1;
    await ground.save();

    // Get reviews for this ground
    const reviews = await Review.findByGround(groundId, {
      limit: 5,
      sort: { createdAt: -1 },
    });

    // Get average rating
    const ratingStats = await Review.getAverageRating(groundId);

    res.status(200).json({
      success: true,
      message: "Ground retrieved successfully",
      data: {
        ground,
        reviews,
        ratingStats: ratingStats[0] || { averageRating: 0, totalReviews: 0 },
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

    // Build filter
    const filter = { owner: req.user.firebaseUid };
    if (status) filter.status = status;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const grounds = await Ground.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
    ).populate("owner", "displayName profile.firstName profile.lastName");

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
    const searchFilter = { status: "active" };

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
      .populate("owner", "displayName profile.firstName profile.lastName")
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

    // Get review statistics
    const reviewStats = await Review.getAverageRating(groundId);

    // Get recent reviews
    const recentReviews = await Review.findByGround(groundId, {
      limit: 10,
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Ground statistics retrieved successfully",
      data: {
        groundStats: ground.stats,
        reviewStats: reviewStats[0] || { averageRating: 0, totalReviews: 0 },
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
