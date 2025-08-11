// config/cloudinary.js
import cloudinary from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Check if required environment variables are set
const requiredEnvVars = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required Cloudinary environment variables:",
    missingEnvVars
  );
  console.error("Please create a .env file with the following variables:");
  console.error("CLOUDINARY_NAME=your_cloudinary_cloud_name");
  console.error("CLOUDINARY_API_KEY=your_cloudinary_api_key");
  console.error("CLOUDINARY_API_SECRET=your_cloudinary_api_secret");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connection successful"))
  .catch((error) => {
    console.error("❌ Cloudinary connection failed:", error.message);
    process.exit(1);
  });

// Configure multer storage for Cloudinary - Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quickcourt-profiles",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto" },
    ],
  },
});

// Configure multer storage for Cloudinary - Ground Images
const groundStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quickcourt-grounds",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 800, height: 600, crop: "fill", gravity: "auto" },
      { quality: "auto" },
    ],
  },
});

// Configure multer upload for profile pictures
export const upload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Configure multer upload for ground images
export const groundUpload = multer({
  storage: groundStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for ground images
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  };

  const finalOptions = { ...defaultOptions, ...options };

  return cloudinary.url(publicId, finalOptions);
};

// Export the cloudinary instance for use in other parts of the application
export { cloudinary };
export default cloudinary;
