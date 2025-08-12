import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  MapPin,
  Star,
  Minus,
  Plus,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";
import axios from "axios";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CourtBooking() {
  const { groundId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // State variables
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedSport, setSelectedSport] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  // Ground and booking data
  const [groundData, setGroundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking process
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Available time slots (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6; // Start from 6 AM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // State for available time slots from backend
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Fetch ground data
  useEffect(() => {
    if (groundId) {
      fetchGroundData();
    }
  }, [groundId]);

  // Set initial date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate && groundId) {
      // Clear selected start time when date changes
      setStartTime("");
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, groundId]);

  const fetchGroundData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/grounds/${groundId}`
      );

      if (response.data.success) {
        const ground = response.data.data.ground;
        setGroundData(ground);

        // Set default sport if available
        if (ground.sports && ground.sports.length > 0) {
          setSelectedSport(ground.sports[0]);
        }

        // Set default courts
        const defaultCourts = generateDefaultCourts(
          ground.sports?.[0] || "Badminton"
        );
        setSelectedCourts(defaultCourts);
      }
    } catch (error) {
      console.error("Error fetching ground data:", error);
      setError("Failed to fetch ground information");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      setCheckingAvailability(true);
      setError("");

      const token = await user.getIdToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/available-slots/${groundId}?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Store all time slots with availability status
        setAvailableTimeSlots(response.data.data.allTimeSlots || []);
      }
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      // Don't show error for availability check, just log it
      setAvailableTimeSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const generateDefaultCourts = (sport) => {
    const courtNames = {
      Badminton: ["Court 1", "Court 2"],
      Tennis: ["Court 1"],
      Football: ["Field 1"],
      Cricket: ["Pitch 1"],
      Basketball: ["Court 1"],
      Volleyball: ["Court 1"],
      "Table Tennis": ["Table 1", "Table 2"],
    };

    return courtNames[sport] || ["Court 1"];
  };

  const calculatePrice = () => {
    if (!groundData || !selectedSport || selectedCourts.length === 0) return 0;

    const isWeekend = [0, 5, 6].includes(new Date(selectedDate).getDay());
    const pricePerHour = isWeekend
      ? groundData.pricing.weekendPrice
      : groundData.pricing.weekdayPrice;

    return pricePerHour * duration * selectedCourts.length;
  };

  const addCourt = (court) => {
    if (!selectedCourts.includes(court)) {
      setSelectedCourts((prev) => [...prev, court]);
    }
  };

  const removeCourt = (court) => {
    setSelectedCourts((prev) => prev.filter((c) => c !== court));
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const generateCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      const isSelected = selectedDate === dateStr;
      const isPast = new Date(dateStr) < today.setHours(0, 0, 0, 0);

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(dateStr)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors
            ${
              isSelected
                ? "bg-green-500 text-white"
                : isToday
                ? "bg-blue-100 text-blue-600"
                : isPast
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-100 text-gray-700 cursor-pointer"
            }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];

    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const currentHour = today.getHours();

    // If we have backend data, use it; otherwise fall back to basic logic
    if (availableTimeSlots.length > 0) {
      return availableTimeSlots.map((slot) => {
        const hour = parseInt(slot.startTime.split(":")[0]);
        const isPast =
          selectedDateObj.toDateString() === today.toDateString() &&
          hour <= currentHour;

        return {
          time: slot.startTime,
          available: !isPast && slot.isAvailable,
          isPast,
          reason: slot.reason,
          conflictingInfo: slot.conflictingInfo,
          endTime: slot.endTime,
          duration: slot.duration,
        };
      });
    }

    // Fallback to basic logic when backend data is not available
    return timeSlots.map((time) => {
      const hour = parseInt(time.split(":")[0]);
      const isPast =
        selectedDateObj.toDateString() === today.toDateString() &&
        hour <= currentHour;

      return {
        time,
        available: !isPast,
        isPast,
        reason: null,
        conflictingInfo: null,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
        duration: 1,
      };
    });
  };

  const handleCreateBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !selectedDate ||
      !startTime ||
      selectedCourts.length === 0 ||
      !selectedSport
    ) {
      setError(
        "Please select a date, time slot, sport, and at least one court"
      );
      return;
    }

    try {
      setIsCreatingBooking(true);
      setError("");

      const token = await user.getIdToken();

      // First check availability
      const availabilityResponse = await axios.post(
        `${API_BASE_URL}/api/bookings/check-availability`,
        {
          groundId,
          sport: selectedSport,
          date: selectedDate,
          startTime,
          duration,
          selectedCourts,
          numberOfPlayers,
          specialRequests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!availabilityResponse.data.data.available) {
        setError(
          availabilityResponse.data.data.message ||
            "Selected time slot is not available"
        );
        // Refresh available time slots
        await fetchAvailableTimeSlots();
        return;
      }

      // If available, create the booking
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings`,
        {
          groundId,
          sport: selectedSport,
          date: selectedDate,
          startTime,
          duration,
          selectedCourts,
          numberOfPlayers,
          specialRequests,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBookingData(response.data.data.booking);
        setShowPaymentModal(true);
        // Refresh available time slots after successful booking
        await fetchAvailableTimeSlots();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.response?.data?.errorCode === "TIME_SLOT_UNAVAILABLE") {
        setError(
          "Selected time slot is not available. Please choose another time."
        );
        // Refresh available time slots
        await fetchAvailableTimeSlots();
      } else if (error.response?.data?.errorCode === "USER_DOUBLE_BOOKING") {
        setError(
          "You already have a booking at this time. Please choose a different time slot."
        );
      } else {
        setError(error.response?.data?.message || "Failed to create booking");
      }
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const token = await user.getIdToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/verify-payment`,
        {
          bookingId: bookingData.bookingId,
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpaySignature: paymentData.razorpay_signature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Redirect to success page or show success message
        navigate(`/booking-success/${bookingData.bookingId}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Payment verification failed. Please contact support.");
    }
  };

  const handlePayment = async () => {
    try {
      // Show loading state
      setShowPaymentModal(false);

      // Simulate successful payment without Razorpay
      const mockPaymentData = {
        razorpay_order_id: bookingData.payment.razorpayOrderId,
        razorpay_payment_id: `mock_payment_${Date.now()}`,
        razorpay_signature: "mock_signature",
      };

      // Call the payment success handler
      await handlePaymentSuccess(mockPaymentData);
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Payment processing failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading ground information...</p>
        </div>
      </div>
    );
  }

  if (error && !groundData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Ground
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-gray-50">
      {/* Header */}
      <header className=" px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Book Court</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Court Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              {/* Ground Info */}
              {groundData && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {groundData.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>
                        {groundData.location?.address?.city},{" "}
                        {groundData.location?.address?.state}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>
                        {groundData.stats?.averageRating?.toFixed(1) || "N/A"} (
                        {groundData.stats?.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Sport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSport}
                      onChange={(e) => {
                        setSelectedSport(e.target.value);
                        setSelectedCourts(
                          generateDefaultCourts(e.target.value)
                        );
                        // Clear start time when sport changes
                        setStartTime("");
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Sport</option>
                      {groundData?.sports?.map((sport) => (
                        <option key={sport} value={sport}>
                          {sport}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      disabled={duration <= 1}
                    >
                      <Minus className="w-4 h-4 text-green-600" />
                    </button>
                    <span className="text-lg font-medium text-gray-900 min-w-[3rem] text-center">
                      {duration} Hour{duration > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => setDuration(Math.min(8, duration + 1))}
                      className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      disabled={duration >= 8}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Court Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courts *
                  </label>

                  {/* Available Courts */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Available Courts:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {generateDefaultCourts(selectedSport).map((court) => (
                        <button
                          key={court}
                          onClick={() => addCourt(court)}
                          disabled={selectedCourts.includes(court)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedCourts.includes(court)
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300"
                          }`}
                        >
                          {court}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Courts */}
                  {selectedCourts.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Selected Courts:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourts.map((court) => (
                          <span
                            key={court}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                          >
                            {court}
                            <button onClick={() => removeCourt(court)}>
                              <X className="w-3 h-3 hover:text-red-500" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Number of Players */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Players
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfPlayers}
                    onChange={(e) =>
                      setNumberOfPlayers(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows="3"
                    maxLength="500"
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {specialRequests.length}/500 characters
                  </p>
                </div>

                {/* Create Booking Button */}
                <button
                  onClick={handleCreateBooking}
                  disabled={
                    isCreatingBooking ||
                    !selectedDate ||
                    !startTime ||
                    selectedCourts.length === 0 ||
                    !selectedSport
                  }
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingBooking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Booking - ₹{calculatePrice().toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Calendar & Time Slots */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-gray-500">
                {dayNames.map((day) => (
                  <div key={day} className="text-center py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{generateCalendar()}</div>

              <p className="text-xs text-gray-500 mt-4">
                Select a date for your booking
              </p>
            </div>

            {/* Available Time Slots */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Select Time Slot *
                </h3>
                <button
                  onClick={fetchAvailableTimeSlots}
                  disabled={checkingAvailability}
                  className="text-xs text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Refresh available time slots"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Click on an available time slot to select your start time
              </p>

              {checkingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-green-500 animate-spin mr-2" />
                  <span className="text-gray-600">
                    Checking availability...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {getAvailableTimeSlots().map((slot) => {
                    // Determine the appropriate styling based on slot status
                    let buttonClass =
                      "p-2 text-sm rounded-lg border transition-colors ";
                    let tooltipText = "";

                    if (slot.time === startTime) {
                      buttonClass += "bg-green-500 text-white border-green-500";
                      tooltipText = "Selected time slot";
                    } else if (slot.isPast) {
                      buttonClass +=
                        "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                      tooltipText = "Time slot is in the past";
                    } else if (!slot.available) {
                      if (slot.reason === "Booked") {
                        buttonClass +=
                          "bg-red-100 text-red-600 border-red-200 cursor-not-allowed";
                        tooltipText = `Booked from ${slot.conflictingInfo?.[0]?.startTime} to ${slot.conflictingInfo?.[0]?.endTime}`;
                      } else if (slot.reason === "Blocked") {
                        buttonClass +=
                          "bg-orange-100 text-orange-600 border-orange-200 cursor-not-allowed";
                        tooltipText = `Blocked: ${
                          slot.conflictingInfo?.[0]?.reason || "Maintenance"
                        }`;
                      } else {
                        buttonClass +=
                          "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                        tooltipText = "Time slot is not available";
                      }
                    } else {
                      buttonClass +=
                        "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300";
                      tooltipText = `Available: ${slot.time} - ${slot.endTime}`;
                    }

                    return (
                      <button
                        key={slot.time}
                        className={buttonClass}
                        disabled={!slot.available || slot.isPast}
                        onClick={() =>
                          slot.available &&
                          !slot.isPast &&
                          setStartTime(slot.time)
                        }
                        title={tooltipText}
                      >
                        <div className="text-center">
                          <div className="font-medium">{slot.time}</div>
                          {!slot.available && slot.reason && (
                            <div className="text-xs opacity-75">
                              {slot.reason === "Booked" ? "🔒" : "🚫"}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Time Display */}
              {startTime && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Selected Start Time:</span>{" "}
                    {startTime}
                  </p>
                </div>
              )}

              {availableTimeSlots.length === 0 && !checkingAvailability && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    No available time slots for this date
                  </p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            {selectedDate &&
              startTime &&
              selectedCourts.length > 0 &&
              selectedSport && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Booking Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sport:</span>
                      <span className="font-medium">{selectedSport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {duration} hour{duration > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courts:</span>
                      <span className="font-medium">
                        {selectedCourts.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{startTime}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ₹{calculatePrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && bookingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Booking Created Successfully!
              </h3>
              <p className="text-gray-600">
                Your booking has been created. Click "Complete Payment" to
                simulate payment success.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span>Booking ID:</span>
                  <span className="font-medium">{bookingData.bookingId}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Amount:</span>
                  <span className="font-medium text-green-600">
                    ₹{calculatePrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Payment
              </button>
            </div>

            <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
              <Shield className="w-4 h-4 mr-1" />
              Mock payment for development/testing
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
