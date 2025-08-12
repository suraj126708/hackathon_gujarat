// Main Pages Index - Organized by User Roles and Functionality

// Import all page categories
export * from "./auth";
export * from "./user";
export * from "./owner";
export * from "./admin";
export * from "./common";

// Re-export commonly used pages for convenience
export { default as Landing } from "./common/Landing";
export { default as Venues } from "./user/Venues";
export { default as Login } from "./auth/Login";
export { default as Register } from "./auth/Register";
export { default as AdminDashboard } from "./admin/AdminDashboard";
export { default as AddGround } from "./owner/AddGround";

// Page organization structure:
// - auth/: Authentication pages (Login, Register, OTP, Password reset)
// - user/: User-facing pages (Venues, Venue details, Court booking, User profile)
// - owner/: Ground owner pages (Add ground, My grounds, Owner profile)
// - admin/: Admin-only pages (Admin dashboard)
// - common/: Shared/common pages (Landing, Success pages, Error pages, Protected routes)
