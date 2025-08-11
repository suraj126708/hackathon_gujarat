// Enhanced routes with RBAC - routes/adminRoutes.js
import express from "express";
import { body, param } from "express-validator";
import {
  getAdminDashboard,
  getSystemStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserStats,
  promoteToAdmin,
  demoteFromAdmin,
  // bulkUpdateRoles,
  getPendingFacilities,
  approveFacility,
  rejectFacility,
  getAllFacilities,
  updateFacilityStatus,
  getFacilityAnalytics,
  getSportsAnalytics,
  getEarningsAnalytics,
} from "../controllers/adminController.js";
import {
  authenticateFirebaseToken,
  authorize,
  checkPermissions,
  authorizeMultiple,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Validation middleware
const userIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isLength({ min: 1 })
    .withMessage("Invalid user ID format"),
];

const roleValidation = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["Player", "Facility Owner", "Player / Facility Owner", "admin"])
    .withMessage(
      "Role must be Player, Facility Owner, Player / Facility Owner, or admin"
    ),
];

const statusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["active", "inactive", "suspended", "pending"])
    .withMessage("Status must be active, inactive, suspended, or pending"),
];

const bulkRoleValidation = [
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("User IDs must be a non-empty array"),
  body("role")
    .isIn(["Player", "Facility Owner", "Player / Facility Owner", "admin"])
    .withMessage("Invalid role"),
];

// 🔥 RBAC Protected Routes

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data (Admin only)
// @access  Private (Admin)
router.get(
  "/dashboard",
  authenticateFirebaseToken,
  authorize("admin"),
  getAdminDashboard
);

// @route   GET /api/admin/stats
// @desc    Get system statistics (Admin only)
// @access  Private (Admin)
router.get(
  "/stats",
  authenticateFirebaseToken,
  authorize("admin"),
  getSystemStats
);

// @route   GET /api/admin/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get(
  "/users/stats",
  authenticateFirebaseToken,
  authorize("admin"),
  getUserStats
);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin, Moderator with read permission)
router.get(
  "/users",
  authenticateFirebaseToken,
  authorizeMultiple({
    admin: true,
    moderator: ["read"],
  }),
  getAllUsers
);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin, Moderator)
router.get(
  "/users/:id",
  authenticateFirebaseToken,
  authorize("admin", "moderator"),
  userIdValidation,
  getUserById
);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put(
  "/users/:id/role",
  authenticateFirebaseToken,
  checkPermissions("manage_roles"),
  userIdValidation,
  roleValidation,
  updateUserRole
);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin, Moderator with manage_users permission)
router.put(
  "/users/:id/status",
  authenticateFirebaseToken,
  authorizeMultiple({
    admin: true,
    moderator: ["manage_users"],
  }),
  userIdValidation,
  statusValidation,
  updateUserStatus
);

// @route   POST /api/admin/users/:id/promote
// @desc    Promote user to admin (Super Admin only)
// @access  Private (Admin with manage_roles permission)
router.post(
  "/users/:id/promote",
  authenticateFirebaseToken,
  checkPermissions("manage_roles"),
  userIdValidation,
  promoteToAdmin
);

// @route   POST /api/admin/users/:id/demote
// @desc    Demote admin to user (Super Admin only)
// @access  Private (Admin with manage_roles permission)
router.post(
  "/users/:id/demote",
  authenticateFirebaseToken,
  checkPermissions("manage_roles"),
  userIdValidation,
  demoteFromAdmin
);

// @route   PUT /api/admin/users/bulk-role
// @desc    Bulk update user roles (Admin only)
// @access  Private (Admin)
// router.put(
//   "/users/bulk-role",
//   authenticateFirebaseToken,
//   authorize("admin"),
//   bulkRoleValidation,
//   bulkUpdateRoles
// );

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete(
  "/users/:id",
  authenticateFirebaseToken,
  authorize("admin"),
  userIdValidation,
  deleteUser
);

// Facility Management Routes

// @route   GET /api/admin/facilities/pending
// @desc    Get pending facilities for approval
// @access  Private (Admin)
router.get(
  "/facilities/pending",
  authenticateFirebaseToken,
  authorize("admin"),
  getPendingFacilities
);

// @route   PUT /api/admin/facilities/:id/approve
// @desc    Approve a facility
// @access  Private (Admin)
router.put(
  "/facilities/:id/approve",
  authenticateFirebaseToken,
  authorize("admin"),
  [
    param("id").notEmpty().withMessage("Facility ID is required"),
    body("comments")
      .optional()
      .isString()
      .withMessage("Comments must be a string"),
  ],
  approveFacility
);

// @route   PUT /api/admin/facilities/:id/reject
// @desc    Reject a facility
// @access  Private (Admin)
router.put(
  "/facilities/:id/reject",
  authenticateFirebaseToken,
  authorize("admin"),
  [
    param("id").notEmpty().withMessage("Facility ID is required"),
    body("reason").notEmpty().withMessage("Rejection reason is required"),
    body("comments")
      .optional()
      .isString()
      .withMessage("Comments must be a string"),
  ],
  rejectFacility
);

// @route   GET /api/admin/facilities
// @desc    Get all facilities with admin controls
// @access  Private (Admin)
router.get(
  "/facilities",
  authenticateFirebaseToken,
  authorize("admin"),
  getAllFacilities
);

// @route   PUT /api/admin/facilities/:id/status
// @desc    Update facility status
// @access  Private (Admin)
router.put(
  "/facilities/:id/status",
  authenticateFirebaseToken,
  authorize("admin"),
  [
    param("id").notEmpty().withMessage("Facility ID is required"),
    body("status").notEmpty().withMessage("Status is required"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
  ],
  updateFacilityStatus
);

// Analytics Routes

// @route   GET /api/admin/analytics/facilities
// @desc    Get facility analytics
// @access  Private (Admin)
router.get(
  "/analytics/facilities",
  authenticateFirebaseToken,
  authorize("admin"),
  getFacilityAnalytics
);

// @route   GET /api/admin/analytics/sports
// @desc    Get sports analytics
// @access  Private (Admin)
router.get(
  "/analytics/sports",
  authenticateFirebaseToken,
  authorize("admin"),
  getSportsAnalytics
);

// @route   GET /api/admin/analytics/earnings
// @desc    Get earnings analytics
// @access  Private (Admin)
router.get(
  "/analytics/earnings",
  authenticateFirebaseToken,
  authorize("admin"),
  getEarningsAnalytics
);

export default router;
