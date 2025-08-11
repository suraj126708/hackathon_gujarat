import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../firebase/firebase";

const ProfilePage = () => {
  const { user, userProfile } = useAuth();
  const [activeView, setActiveView] = useState("bookings");
  const [bookingTab, setBookingTab] = useState("all");

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const [formData, setFormData] = useState({
    displayName: "",
    profile: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      bio: "",
      location: "",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        profile: {
          firstName: userProfile.profile?.firstName || "",
          lastName: userProfile.profile?.lastName || "",
          phoneNumber: userProfile.profile?.phoneNumber || "",
          bio: userProfile.profile?.bio || "",
          location: userProfile.profile?.location || "",
        },
      });
    }
  }, [userProfile]);

  // Fetch user bookings
  useEffect(() => {
    fetchBookings();
  }, [bookingTab]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const status = bookingTab === "cancelled" ? "cancelled" : "all";
      const result = await authService.getUserBookings(status);
      if (result.success) {
        setBookings(result.data.bookings || []);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch bookings" });
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("profile.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await authService.updateProfile(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Refresh user profile in context
        window.location.reload(); // Simple refresh for now
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || "",
        profile: {
          firstName: userProfile.profile?.firstName || "",
          lastName: userProfile.profile?.lastName || "",
          phoneNumber: userProfile.profile?.phoneNumber || "",
          bio: userProfile.profile?.bio || "",
          location: userProfile.profile?.location || "",
        },
      });
    }
    setMessage({ type: "", text: "" });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingBooking(bookingId);
    try {
      const result = await authService.cancelBooking(
        bookingId,
        "Cancelled by user"
      );
      if (result.success) {
        setMessage({
          type: "success",
          text: "Booking cancelled successfully!",
        });
        fetchBookings(); // Refresh bookings
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cancel booking" });
    } finally {
      setCancellingBooking(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isPastBooking = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  const canCancelBooking = (booking) => {
    if (booking.status === "cancelled") return false;
    if (isPastBooking(booking.date)) return false;
    return true;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Page</h1>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
              {/* Profile Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {userProfile.profilePicture?.thumbnailUrl ? (
                    <img
                      src={userProfile.profilePicture.thumbnailUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {userProfile.displayName ||
                    userProfile.profile?.firstName ||
                    "User"}
                </h3>
                <p className="text-sm text-gray-600">
                  {userProfile.profile?.phoneNumber || "No phone number"}
                </p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView("edit")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "edit"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveView("bookings")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "bookings"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  All Bookings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Bookings View */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  activeView === "bookings"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-0 transform translate-x-4 absolute pointer-events-none"
                }`}
              >
                {/* Tab Headers */}
                <div className="border-b border-gray-200 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        className={`px-6 py-3 text-sm rounded-xl transition-all duration-300 ${
                          bookingTab === "all"
                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setBookingTab("all")}
                      >
                        All Bookings
                      </button>
                      <button
                        className={`px-6 py-3 text-sm rounded-xl transition-all duration-300 ${
                          bookingTab === "cancelled"
                            ? "bg-red-500 text-white shadow-lg shadow-red-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setBookingTab("cancelled")}
                      >
                        Cancelled
                      </button>
                    </div>
                    <button
                      onClick={fetchBookings}
                      disabled={loadingBookings}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {loadingBookings ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </button>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="p-6">
                  {loadingBookings ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-600">Loading bookings...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <div
                          key={booking._id}
                          className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animation:
                              activeView === "bookings"
                                ? "slideInUp 0.6s ease-out forwards"
                                : "none",
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {typeof booking.groundId === "object" &&
                                booking.groundId?.name
                                  ? booking.groundId.name
                                  : typeof booking.groundId === "string"
                                  ? booking.groundId
                                  : "Unknown Ground"}{" "}
                                ({booking.sport})
                              </h4>
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">
                                  {booking.groundId?.location?.address?.city &&
                                  booking.groundId?.location?.address?.state
                                    ? `${booking.groundId.location.address.city}, ${booking.groundId.location.address.state}`
                                    : booking.groundId?.city ||
                                      "Location not available"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium">
                                  {formatDate(booking.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-green-500" />
                                <span className="text-sm">
                                  {formatTime(booking.startTime)} -{" "}
                                  {formatTime(booking.endTime)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Additional booking details */}
                          <div className="mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span>
                                Duration: {booking.duration} hour
                                {booking.duration > 1 ? "s" : ""}
                              </span>
                              <span>
                                Courts:{" "}
                                {booking.selectedCourts?.join(", ") || "N/A"}
                              </span>
                              <span>Price: ₹{booking.totalAmount}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusDotColor(
                                    booking.status
                                  )}`}
                                ></div>
                                {booking.status}
                              </span>
                            </div>

                            <div className="flex gap-3">
                              {canCancelBooking(booking) && (
                                <button
                                  className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors disabled:opacity-50"
                                  onClick={() =>
                                    handleCancelBooking(booking.bookingId)
                                  }
                                  disabled={
                                    cancellingBooking === booking.bookingId
                                  }
                                >
                                  {cancellingBooking === booking.bookingId ? (
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                                  ) : null}
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingBookings && bookings.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        {bookingTab === "cancelled"
                          ? "No cancelled bookings"
                          : "No bookings found"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Profile View */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  activeView === "edit"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-0 transform -translate-x-4 absolute pointer-events-none"
                }`}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Edit Profile
                  </h2>

                  {/* Profile Image Section */}
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {userProfile.profilePicture?.thumbnailUrl ? (
                        <img
                          src={userProfile.profilePicture.thumbnailUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <button className="text-sm text-blue-500 hover:text-blue-700 transition-colors">
                      Change Profile Picture
                    </button>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="profile.firstName"
                          value={formData.profile.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="profile.lastName"
                          value={formData.profile.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="profile.phoneNumber"
                        value={formData.profile.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="profile.location"
                        value={formData.profile.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="profile.bio"
                        value={formData.profile.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-medium"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 text-sm font-medium shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
