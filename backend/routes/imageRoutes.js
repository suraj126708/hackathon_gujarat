// routes/imageRoutes.js
import express from "express";
import { upload, groundUpload } from "../config/cloudinary.js";
import { authenticateFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/images/upload-profile
// @desc    Upload profile picture
// @access  Private
router.post(
  "/upload-profile",
  authenticateFirebaseToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Return the uploaded image information
      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          publicId: req.file.filename,
          url: req.file.path,
          secureUrl: req.file.path.replace("http://", "https://"),
          format: req.file.format,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  }
);

// @route   POST /api/images/upload-ground
// @desc    Upload ground images (multiple files)
// @access  Private
router.post(
  "/upload-ground",
  authenticateFirebaseToken,
  groundUpload.array("groundImages", 10), // Allow up to 10 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      // Process uploaded images
      const uploadedImages = req.files.map((file, index) => ({
        publicId: file.filename,
        url: file.path,
        secureUrl: file.path.replace("http://", "https://"),
        format: file.format,
        size: file.size,
        caption: req.body.captions ? req.body.captions[index] : "",
        isPrimary: index === 0, // First image is primary
        uploadedAt: new Date(),
      }));

      res.status(200).json({
        success: true,
        message: "Ground images uploaded successfully",
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      });
    } catch (error) {
      console.error("Ground image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload ground images",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  }
);

// @route   DELETE /api/images/delete/:publicId
// @desc    Delete image from Cloudinary
// @access  Private
router.delete(
  "/delete/:publicId",
  authenticateFirebaseToken,
  async (req, res) => {
    try {
      const { publicId } = req.params;

      // Import deleteImage function
      const { deleteImage } = await import("../config/cloudinary.js");

      const result = await deleteImage(publicId);

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Image deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete image",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    }
  }
);

export default router;
