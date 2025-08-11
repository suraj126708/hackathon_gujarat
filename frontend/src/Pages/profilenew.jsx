import React, { useState } from "react";
import { Calendar, MapPin, User, Eye, EyeOff, Clock } from "lucide-react";

const ProfilePage = () => {
  const [activeView, setActiveView] = useState("bookings"); // 'bookings' or 'edit'
  const [bookingTab, setBookingTab] = useState("all"); // 'all' or 'cancelled'
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Mitchell Admin",
    email: "mitchelladmin2017@gmail.com",
    oldPassword: "",
    newPassword: "",
  });

  const allBookings = [
    {
      id: 1,
      venue: "Skyline Badminton Court",
      sport: "Badminton",
      date: "18 June 2025",
      time: "5:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      isPast: false,
      cancelled: false,
    },
    {
      id: 2,
      venue: "Sports Arena",
      sport: "Table Tennis",
      date: "15 June 2025",
      time: "7:00 PM - 8:00 PM",
      location: "Ahmedabad, Gujarat",
      status: "Confirmed",
      isPast: false,
      cancelled: false,
    },
    {
      id: 3,
      venue: "Skyline Badminton Court",
      sport: "Badminton",
      date: "18 June 2024",
      time: "5:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Completed",
      isPast: true,
      cancelled: false,
    },
    {
      id: 4,
      venue: "City Sports Complex",
      sport: "Box Cricket",
      date: "10 June 2025",
      time: "6:00 PM - 7:00 PM",
      location: "Surat, Gujarat",
      status: "Cancelled",
      isPast: false,
      cancelled: true,
    },
  ];

  const filteredBookings =
    bookingTab === "all"
      ? allBookings.filter((b) => !b.cancelled)
      : allBookings.filter((b) => b.cancelled);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    // Handle save logic here
  };

  const handleReset = () => {
    setFormData({
      fullName: "Mitchell Admin",
      email: "mitchelladmin2017@gmail.com",
      oldPassword: "",
      newPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium">
            QUICKCOURT
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-gray-900 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Book
            </button>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <User className="w-4 h-4" />
              Mitchell Admin
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
              {/* Profile Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Mitchell Admin</h3>
                <p className="text-sm text-gray-600">9999999999</p>
                <p className="text-sm text-gray-600">
                  mitchelladmin2017@gmail.com
                </p>
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
                </div>

                {/* Bookings List */}
                <div className="p-6">
                  <div className="space-y-4">
                    {filteredBookings.map((booking, index) => (
                      <div
                        key={booking.id}
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
                              {booking.venue} ({booking.sport})
                            </h4>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">
                                {booking.location}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium">
                                {booking.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{booking.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "Confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  booking.status === "Confirmed"
                                    ? "bg-green-500"
                                    : booking.status === "Cancelled"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              {booking.status}
                            </span>
                          </div>

                          <div className="flex gap-3">
                            {!booking.isPast && !booking.cancelled && (
                              <button className="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors">
                                Cancel Booking
                              </button>
                            )}
                            <button className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors">
                              Write Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredBookings.length === 0 && (
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

                  {!filteredBookings.some((b) => b.isPast) &&
                    bookingTab === "all" && (
                      <div className="text-center text-sm text-gray-500 mt-6 p-4 bg-blue-50 rounded-xl">
                        💡 No cancel booking button for past dates
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
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <button className="text-sm text-blue-500 hover:text-blue-700 transition-colors">
                      Change Profile Picture
                    </button>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value="9999999999"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Phone number cannot be changed
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Change Password
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showOldPassword ? "text" : "password"}
                              name="oldPassword"
                              value={formData.oldPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowOldPassword(!showOldPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showOldPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
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
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 text-sm font-medium shadow-lg shadow-green-200"
                      >
                        Save Changes
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
