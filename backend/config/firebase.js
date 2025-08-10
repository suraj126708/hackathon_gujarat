// config/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firebase Admin SDK configuration
const initializeFirebase = () => {
  try {
    // Check if Firebase has already been initialized
    if (admin.apps.length === 0) {
      // Check if required environment variables are present
      const requiredEnvVars = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_PRIVATE_KEY_ID",
        "FIREBASE_PRIVATE_KEY",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_CLIENT_ID",
      ];

      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        console.warn(
          "⚠️  Missing Firebase environment variables:",
          missingVars.join(", ")
        );
        console.warn(
          "🔧 Firebase Admin SDK will not be initialized. Some features may not work."
        );
        console.warn(
          "📝 Please create a .env file with your Firebase service account credentials."
        );
        return null;
      }

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri:
          process.env.FIREBASE_AUTH_URI ||
          "https://accounts.google.com/o/oauth2/auth",
        token_uri:
          process.env.FIREBASE_TOKEN_URI ||
          "https://oauth2.googleapis.com/token",
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log("🔥 Firebase Admin SDK initialized successfully");
    } else {
      console.log("🔥 Firebase Admin SDK already initialized");
    }
  } catch (error) {
    console.error(
      "❌ Firebase Admin SDK initialization failed:",
      error.message
    );
    console.error("🔧 Please check your Firebase environment variables");
    console.warn(
      "⚠️  Continuing without Firebase Admin SDK. Some features may not work."
    );
    return null;
  }
};

// Initialize Firebase
initializeFirebase();

// Export admin for use in other files
export default admin;
