// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./Pages/ProtectedRoute";
import AuthGuard from "./components/AuthGuard";
import Navbar from "./components/Navbar";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import OTPVerification from "./Pages/OTPVerification";
import RegisterSuccess from "./Pages/RegisterSuccess";
import ResetPassword from "./Pages/ResetPassword";
import Profile from "./Pages/Profile_owner";
import AdminDashboard from "./Pages/AdminDashboard";
import Unauthorized from "./Pages/Unauthorized";
import AddGround from "./Pages/AddGround";
import MyGrounds from "./Pages/MyGrounds";
import VenueDetails from "./Pages/VenueDetails";
import Venues from "./Pages/Venues";
import CourtBooking from "./Pages/CourtBooking";
import BookingSuccess from "./Pages/BookingSuccess";
import ProfilePage from "./Pages/profile_User";
import ProfileOwner from "./Pages/Profile_owner";
// import ProfilePage from "./Pages/profilenew";

// Component to redirect users to appropriate profile based on their role
const ProfileRedirect = () => {
  const { userProfile } = useAuth();

  if (userProfile?.role === "Facility Owner") {
    return <Navigate to="/owner-profile" replace />;
  } else if (userProfile?.role === "admin") {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/user-profile" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/venue-details/:groundId" element={<VenueDetails />} />
            <Route path="/venues" element={<Venues />} />

            {/* Auth routes - prevent logged-in users from accessing */}
            <Route
              path="/login"
              element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              }
            />
            <Route
              path="/register"
              element={
                <AuthGuard>
                  <Register />
                </AuthGuard>
              }
            />
            <Route
              path="/otp-verification"
              element={
                <AuthGuard>
                  <OTPVerification />
                </AuthGuard>
              }
            />
            <Route
              path="/register-success"
              element={
                <AuthGuard>
                  <RegisterSuccess />
                </AuthGuard>
              }
            />
            <Route
              path="/reset-password"
              element={
                <AuthGuard>
                  <ResetPassword />
                </AuthGuard>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Unified profile route - redirects based on user role */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileRedirect />
                </ProtectedRoute>
              }
            />

            {/* Profile routes - accessible to both owners and players */}
            <Route
              path="/user-profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner-profile"
              element={
                <ProtectedRoute>
                  <ProfileOwner />
                </ProtectedRoute>
              }
            />

            {/* Admin routes - require admin role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Ground management routes - require owner role */}
            <Route
              path="/add-ground"
              element={
                <ProtectedRoute requiredRole="Facility Owner">
                  <AddGround />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-ground/:id"
              element={
                <ProtectedRoute requiredRole="Facility Owner">
                  <AddGround />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-grounds"
              element={
                <ProtectedRoute requiredRole="Facility Owner">
                  <MyGrounds />
                </ProtectedRoute>
              }
            />

            {/* Booking routes - require authentication */}
            <Route
              path="/book-court/:groundId"
              element={
                <ProtectedRoute>
                  <CourtBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-success/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingSuccess />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
