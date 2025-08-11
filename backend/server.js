import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import groundRoutes from "./routes/groundRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:4173",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Firebase-AppCheck",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Security headers middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Backend API is running!" });
});

// Register all API routes - temporarily comment out some to isolate the issue
app.use("/api/auth", authRoutes);
app.use("/api/grounds", groundRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📡 [SERVER] ${req.method} ${req.originalUrl}`);
  console.log(`📡 [SERVER] Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📡 [SERVER] Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      origin: req.headers.origin,
    });
  }

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate field value",
    });
  }

  res.status(500).json({ error: "Something went wrong!" });
});

// app.use("/*", (req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
