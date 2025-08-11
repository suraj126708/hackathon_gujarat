// controllers/adminController.js
import User from "../models/User.js";
import { validationResult } from "express-validator";
import admin from "../config/firebase.js";
import emailService from "../config/email.js";
import Ground from "../models/Ground.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    // Get role statistics
    const userCount = await User.countDocuments({ role: "Player" });
    const moderatorCount = await User.countDocuments({
      role: "Player / Facility Owner",
    });
    const adminCount = await User.countDocuments({ role: "admin" });

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email displayName role status createdAt");

    const recentlyActiveUsers = await User.find()
      .sort({ lastActiveAt: -1 })
      .limit(5)
      .select("email displayName role lastActiveAt");

    // Get monthly user growth
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const thisMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
    });

    // Get facility statistics
    const totalFacilities = await Ground.countDocuments();
    const activeFacilities = await Ground.countDocuments({ status: "active" });
    const pendingFacilities = await Ground.countDocuments({
      status: "pending",
    });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    // Get payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully",
      data: {
        statistics: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          suspendedUsers,
          userCount,
          moderatorCount,
          adminCount,
          usersThisMonth,
          usersLastMonth,
          growthRate:
            usersLastMonth > 0
              ? (
                  ((usersThisMonth - usersLastMonth) / usersLastMonth) *
                  100
                ).toFixed(2)
              : 0,
          totalFacilities,
          activeFacilities,
          pendingFacilities,
          totalBookings,
          completedBookings,
          cancelledBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        recentActivity: {
          newUsers: recentUsers,
          activeUsers: recentlyActiveUsers,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve admin dashboard data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getSystemStats = async (req, res) => {
  try {
    // Get comprehensive system statistics
    const [
      totalUsers,
      totalFacilityOwners,
      totalBookings,
      totalActiveCourts,
      userGrowth,
      facilityGrowth,
      bookingGrowth,
      activeUsers,
      verifiedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        role: { $in: ["Facility Owner", "Player / Facility Owner"] },
      }),
      Booking.countDocuments(),
      Ground.countDocuments({ status: "active" }),
      // Calculate user growth (last 30 days vs previous 30 days)
      (async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentUsers = await User.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        });
        const previousUsers = await User.countDocuments({
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        });

        return previousUsers > 0
          ? (((recentUsers - previousUsers) / previousUsers) * 100).toFixed(2)
          : 0;
      })(),
      // Calculate facility growth
      (async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentFacilities = await Ground.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        });
        const previousFacilities = await Ground.countDocuments({
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        });

        return previousFacilities > 0
          ? (
              ((recentFacilities - previousFacilities) / previousFacilities) *
              100
            ).toFixed(2)
          : 0;
      })(),
      // Calculate booking growth
      (async () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentBookings = await Booking.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        });
        const previousBookings = await Booking.countDocuments({
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        });

        return previousBookings > 0
          ? (
              ((recentBookings - previousBookings) / previousBookings) *
              100
            ).toFixed(2)
          : 0;
      })(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ isEmailVerified: true }),
    ]);

    // Get role and status distributions
    const roles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statuses = await User.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "System statistics retrieved successfully",
      data: {
        totalUsers,
        totalFacilityOwners,
        totalBookings,
        totalActiveCourts,
        userGrowth: parseFloat(userGrowth),
        facilityGrowth: parseFloat(facilityGrowth),
        bookingGrowth: parseFloat(bookingGrowth),
        activeUsers,
        verifiedUsers,
        roles,
        statuses,
      },
    });
  } catch (error) {
    console.error("System stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve system statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get all users with advanced filtering (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { email: { $regex: req.query.search, $options: "i" } },
        { displayName: { $regex: req.query.search, $options: "i" } },
        { "profile.firstName": { $regex: req.query.search, $options: "i" } },
        { "profile.lastName": { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Build sort query
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-preferences -__v");

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { role, reason } = req.body;
    const userId = req.params.id;

    // Prevent admin from changing their own role
    if (userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldRole = user.role;
    user.role = role;

    // Update Firebase custom claims if needed
    if (admin.apps.length > 0) {
      try {
        await admin.auth().setCustomUserClaims(user.firebaseUid, {
          role: role,
          updatedBy: req.user._id,
          updatedAt: new Date().toISOString(),
        });
      } catch (firebaseError) {
        console.error("Firebase custom claims update error:", firebaseError);
        // Continue with database update even if Firebase fails
      }
    } else {
      console.warn(
        "⚠️  Firebase Admin SDK not initialized. Skipping custom claims update."
      );
    }

    await user.save();

    console.log(
      `🔧 Admin ${req.user.email} changed user ${user.email} role from ${oldRole} to ${role}`
    );

    // Send notification email to user about role change
    try {
      const subject = "Your Account Role Has Been Updated";
      const message = `Your account role has been changed from ${oldRole} to ${role}. ${
        reason ? `Reason: ${reason}` : ""
      }`;
      await emailService.sendNotificationEmail(user.email, subject, message);
      console.log(`✅ Role change notification email sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        "❌ Failed to send role change notification email:",
        emailError
      );
      // Don't fail the operation if email fails
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          oldRole,
        },
        reason,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { status, reason } = req.body;
    const userId = req.params.id;

    // Prevent admin from changing their own status
    if (userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldStatus = user.status;
    user.status = status;

    await user.save();

    console.log(
      `🔧 Admin ${req.user.email} changed user ${user.email} status from ${oldStatus} to ${status}`
    );

    // Send notification email to user about status change
    try {
      const subject = "Your Account Status Has Been Updated";
      const message = `Your account status has been changed from ${oldStatus} to ${status}. ${
        reason ? `Reason: ${reason}` : ""
      }`;
      await emailService.sendNotificationEmail(user.email, subject, message);
      console.log(`✅ Status change notification email sent to ${user.email}`);
    } catch (emailError) {
      console.error(
        "❌ Failed to send status change notification email:",
        emailError
      );
      // Don't fail the operation if email fails
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          status: user.status,
          oldStatus,
        },
        reason,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete from Firebase (optional - you might want to keep Firebase user)
    if (admin.apps.length > 0) {
      try {
        await admin.auth().deleteUser(user.firebaseUid);
      } catch (firebaseError) {
        console.error("Firebase user deletion error:", firebaseError);
        // Continue with database deletion even if Firebase fails
      }
    } else {
      console.warn(
        "⚠️  Firebase Admin SDK not initialized. Skipping Firebase user deletion."
      );
    }

    await User.findByIdAndDelete(userId);

    console.log(`🗑️ Admin ${req.user.email} deleted user ${user.email}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          _id: user._id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Bulk update users (Admin only)
// @route   POST /api/admin/users/bulk-update
// @access  Private (Admin)
export const bulkUpdateUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { userIds, updates } = req.body;

    // Remove sensitive fields that shouldn't be bulk updated
    const safeUpdates = { ...updates };
    delete safeUpdates._id;
    delete safeUpdates.firebaseUid;
    delete safeUpdates.email;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: safeUpdates }
    );

    console.log(
      `🔧 Admin ${req.user.email} bulk updated ${result.modifiedCount} users`
    );

    res.status(200).json({
      success: true,
      message: "Bulk update completed successfully",
      data: {
        updatedCount: result.modifiedCount,
        totalRequested: userIds.length,
      },
    });
  } catch (error) {
    console.error("Bulk update users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update users",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Promote user to admin (Super Admin only)
// @route   POST /api/admin/users/:id/promote
// @access  Private (Admin with manage_roles permission)
export const promoteToAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const userId = req.params.id;

    // Prevent admin from promoting themselves
    if (userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot promote yourself",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "User is already an admin",
      });
    }

    const oldRole = user.role;
    user.role = "admin";

    // Update Firebase custom claims
    if (admin.apps.length > 0) {
      try {
        await admin.auth().setCustomUserClaims(user.firebaseUid, {
          role: "admin",
          updatedBy: req.user._id,
          updatedAt: new Date().toISOString(),
        });
      } catch (firebaseError) {
        console.error("Firebase custom claims update error:", firebaseError);
        // Continue with database update even if Firebase fails
      }
    } else {
      console.warn(
        "⚠️  Firebase Admin SDK not initialized. Skipping custom claims update."
      );
    }

    await user.save();

    console.log(
      `🔧 Admin ${req.user.email} promoted user ${user.email} from ${oldRole} to admin`
    );

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          oldRole,
        },
      },
    });
  } catch (error) {
    console.error("Promote to admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to promote user to admin",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Demote admin to user (Super Admin only)
// @route   POST /api/admin/users/:id/demote
// @access  Private (Admin with manage_roles permission)
export const demoteFromAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const userId = req.params.id;

    // Prevent admin from demoting themselves
    if (userId === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot demote yourself",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "User is not an admin",
      });
    }

    const oldRole = user.role;
    user.role = "user";

    // Update Firebase custom claims
    if (admin.apps.length > 0) {
      try {
        await admin.auth().setCustomUserClaims(user.firebaseUid, {
          role: "user",
          updatedBy: req.user._id,
          updatedAt: new Date().toISOString(),
        });
      } catch (firebaseError) {
        console.error("Firebase custom claims update error:", firebaseError);
        // Continue with database update even if Firebase fails
      }
    } else {
      console.warn(
        "⚠️  Firebase Admin SDK not initialized. Skipping custom claims update."
      );
    }

    await user.save();

    console.log(
      `🔧 Admin ${req.user.email} demoted user ${user.email} from ${oldRole} to user`
    );

    res.status(200).json({
      success: true,
      message: "User demoted from admin successfully",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          oldRole,
        },
      },
    });
  } catch (error) {
    console.error("Demote from admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to demote user from admin",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/admin/users/stats
// @access  Private (Admin)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          suspendedUsers: {
            $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] },
          },
          verifiedUsers: {
            $sum: { $cond: ["$isEmailVerified", 1, 0] },
          },
        },
      },
    ]);

    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly user growth
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const thisMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
    });

    res.status(200).json({
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          suspendedUsers: 0,
          verifiedUsers: 0,
        },
        roles: roleStats,
        statuses: statusStats,
        growth: {
          usersThisMonth,
          usersLastMonth,
          growthRate:
            usersLastMonth > 0
              ? (
                  ((usersThisMonth - usersLastMonth) / usersLastMonth) *
                  100
                ).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Export users data (Admin only)
// @route   GET /api/admin/users/export
// @access  Private (Admin)
export const exportUsers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { format = "json", role, status } = req.query;

    // Build filter query
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select("-preferences -__v")
      .sort({ createdAt: -1 });

    if (format === "csv") {
      // Convert to CSV format
      const csvHeaders =
        "Email,Display Name,Role,Status,Created At,Last Active\n";
      const csvData = users
        .map(
          (user) =>
            `"${user.email}","${user.displayName || ""}","${user.role}","${
              user.status
            }","${user.createdAt}","${user.lastActiveAt}"`
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=users-export.csv"
      );
      res.send(csvHeaders + csvData);
    } else {
      // JSON format
      res.status(200).json({
        success: true,
        message: "Users exported successfully",
        data: {
          format: "json",
          totalUsers: users.length,
          users,
        },
      });
    }
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export users",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get pending facilities for approval (Admin only)
// @route   GET /api/admin/facilities/pending
// @access  Private (Admin)
export const getPendingFacilities = async (req, res) => {
  try {
    const pendingFacilities = await Ground.find({ status: "pending" })
      .populate("owner", "displayName email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Pending facilities retrieved successfully",
      data: {
        totalPending: pendingFacilities.length,
        facilities: pendingFacilities,
      },
    });
  } catch (error) {
    console.error("Get pending facilities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve pending facilities",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Approve a facility (Admin only)
// @route   PUT /api/admin/facilities/:id/approve
// @access  Private (Admin)
export const approveFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments, verifiedBy } = req.body;

    const facility = await Ground.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    if (facility.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Facility is not pending approval",
      });
    }

    facility.status = "active";
    facility.isVerified = true;
    facility.verifiedAt = new Date();
    facility.verifiedBy = verifiedBy || req.user.firebaseUid;

    if (comments) {
      facility.verificationComments = comments;
    }

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility approved successfully",
      data: {
        facility: {
          id: facility._id,
          name: facility.name,
          status: facility.status,
          verifiedAt: facility.verifiedAt,
        },
      },
    });
  } catch (error) {
    console.error("Approve facility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve facility",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Reject a facility (Admin only)
// @route   PUT /api/admin/facilities/:id/reject
// @access  Private (Admin)
export const rejectFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, comments, rejectedBy } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const facility = await Ground.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    if (facility.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Facility is not pending approval",
      });
    }

    facility.status = "rejected";
    facility.isVerified = false;
    facility.rejectedAt = new Date();
    facility.rejectedBy = rejectedBy || req.user.firebaseUid;
    facility.rejectionReason = reason;

    if (comments) {
      facility.rejectionComments = comments;
    }

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility rejected successfully",
      data: {
        facility: {
          id: facility._id,
          name: facility.name,
          status: facility.status,
          rejectedAt: facility.rejectedAt,
          rejectionReason: facility.rejectionReason,
        },
      },
    });
  } catch (error) {
    console.error("Reject facility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject facility",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get all facilities with admin controls (Admin only)
// @route   GET /api/admin/facilities
// @access  Private (Admin)
export const getAllFacilities = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sport, city, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (sport) filter.sports = { $in: [sport] };
    if (city) filter["location.address.city"] = { $regex: city, $options: "i" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const facilities = await Ground.find(filter)
      .populate("owner", "displayName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ground.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Facilities retrieved successfully",
      data: {
        facilities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all facilities error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve facilities",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Update facility status (Admin only)
// @route   PUT /api/admin/facilities/:id/status
// @access  Private (Admin)
export const updateFacilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, updatedBy } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["active", "inactive", "suspended", "under_review"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const facility = await Ground.findById(id);
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    facility.status = status;
    facility.updatedAt = new Date();
    facility.statusUpdatedBy = updatedBy || req.user.firebaseUid;

    if (reason) {
      facility.statusUpdateReason = reason;
    }

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility status updated successfully",
      data: {
        facility: {
          id: facility._id,
          name: facility.name,
          status: facility.status,
          updatedAt: facility.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update facility status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update facility status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get facility analytics
// @route   GET /api/admin/analytics/facilities
// @access  Private (Admin)
export const getFacilityAnalytics = async (req, res) => {
  try {
    // Get facility statistics by sport
    const sportStats = await Ground.aggregate([
      { $group: { _id: "$sport", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get facility status distribution
    const statusStats = await Ground.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get facilities by location (city)
    const locationStats = await Ground.aggregate([
      { $match: { "location.address.city": { $exists: true } } },
      { $group: { _id: "$location.address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get average rating by sport
    const ratingStats = await Ground.aggregate([
      { $match: { rating: { $exists: true, $gt: 0 } } },
      { $group: { _id: "$sport", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: -1 } },
    ]);

    // Get monthly facility growth
    const monthlyGrowth = await Ground.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Get top performing facilities by bookings
    const topFacilities = await Ground.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "groundId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          bookingCount: { $size: "$bookings" },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          sport: 1,
          location: 1,
          rating: 1,
          bookingCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Facility analytics retrieved successfully",
      data: {
        sportStats,
        statusStats,
        locationStats,
        ratingStats,
        monthlyGrowth,
        topFacilities,
      },
    });
  } catch (error) {
    console.error("Facility analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve facility analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get sports analytics
// @route   GET /api/admin/analytics/sports
// @access  Private (Admin)
export const getSportsAnalytics = async (req, res) => {
  try {
    // Get most active sports by booking volume
    const mostActiveSports = await Booking.aggregate([
      {
        $lookup: {
          from: "grounds",
          localField: "groundId",
          foreignField: "_id",
          as: "ground",
        },
      },
      { $unwind: "$ground" },
      {
        $group: {
          _id: "$ground.sport",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
          avgDuration: { $avg: { $subtract: ["$endTime", "$startTime"] } },
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);

    // Get sports popularity by month
    const monthlySportsTrend = await Booking.aggregate([
      {
        $lookup: {
          from: "grounds",
          localField: "groundId",
          foreignField: "_id",
          as: "ground",
        },
      },
      { $unwind: "$ground" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            sport: "$ground.sport",
          },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 24 },
    ]);

    // Get peak hours by sport
    const peakHoursBySport = await Booking.aggregate([
      {
        $lookup: {
          from: "grounds",
          localField: "groundId",
          foreignField: "_id",
          as: "ground",
        },
      },
      { $unwind: "$ground" },
      {
        $group: {
          _id: {
            sport: "$ground.sport",
            hour: { $hour: "$startTime" },
          },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.sport": 1, "_id.hour": 1 } },
    ]);

    // Get sports by seasonality
    const seasonalSports = await Booking.aggregate([
      {
        $lookup: {
          from: "grounds",
          localField: "groundId",
          foreignField: "_id",
          as: "ground",
        },
      },
      { $unwind: "$ground" },
      {
        $group: {
          _id: {
            sport: "$ground.sport",
            season: {
              $switch: {
                branches: [
                  {
                    case: { $in: [{ $month: "$createdAt" }, [12, 1, 2]] },
                    then: "Winter",
                  },
                  {
                    case: { $in: [{ $month: "$createdAt" }, [3, 4, 5]] },
                    then: "Spring",
                  },
                  {
                    case: { $in: [{ $month: "$createdAt" }, [6, 7, 8]] },
                    then: "Summer",
                  },
                  {
                    case: { $in: [{ $month: "$createdAt" }, [9, 10, 11]] },
                    then: "Fall",
                  },
                ],
                default: "Unknown",
              },
            },
          },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.sport": 1, "_id.season": 1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Sports analytics retrieved successfully",
      data: {
        mostActiveSports,
        monthlySportsTrend,
        peakHoursBySport,
        seasonalSports,
      },
    });
  } catch (error) {
    console.error("Sports analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sports analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

// @desc    Get earnings analytics
// @route   GET /api/admin/analytics/earnings
// @access  Private (Admin)
export const getEarningsAnalytics = async (req, res) => {
  try {
    // Get monthly revenue trends
    const monthlyTrend = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Get revenue by sport
    const revenueBySport = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      { $unwind: "$booking" },
      {
        $lookup: {
          from: "grounds",
          localField: "booking.groundId",
          foreignField: "_id",
          as: "ground",
        },
      },
      { $unwind: "$ground" },
      {
        $group: {
          _id: "$ground.sport",
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get daily revenue patterns
    const dailyRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$createdAt" },
            hour: { $hour: "$createdAt" },
          },
          totalRevenue: { $sum: "$amount" },
          avgRevenue: { $avg: "$amount" },
        },
      },
      { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
    ]);

    // Get payment method distribution
    const paymentMethodStats = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get revenue growth rate
    const revenueGrowth = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 24 },
    ]);

    // Calculate growth rate
    let growthRate = 0;
    if (revenueGrowth.length >= 2) {
      const current = revenueGrowth[revenueGrowth.length - 1].revenue;
      const previous = revenueGrowth[revenueGrowth.length - 2].revenue;
      growthRate =
        previous > 0 ? (((current - previous) / previous) * 100).toFixed(2) : 0;
    }

    res.status(200).json({
      success: true,
      message: "Earnings analytics retrieved successfully",
      data: {
        monthlyTrend,
        revenueBySport,
        dailyRevenue,
        paymentMethodStats,
        revenueGrowth,
        growthRate: parseFloat(growthRate),
      },
    });
  } catch (error) {
    console.error("Earnings analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve earnings analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};
