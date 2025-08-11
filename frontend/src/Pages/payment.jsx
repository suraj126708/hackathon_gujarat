import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  Minus,
  Plus,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { bookingService } from "../services/bookingService.js";
import { groundService } from "../services/groundService.js";

export default function CourtBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("2025-05-06");
  const [startTime, setStartTime] = useState("01:00 PM");
  const [duration, setDuration] = useState(2);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedTables, setSelectedTables] = useState(["Table 1", "Table 2"]);
  const [selectedSport, setSelectedSport] = useState("badminton");
  const [currentMonth, setCurrentMonth] = useState(4); // May = 4 (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);

  // New state for API integration
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [groundsLoading, setGroundsLoading] = useState(true);

  // Fetch available grounds on component mount
  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        setGroundsLoading(true);
        const response = await groundService.getAllGrounds(1, 50, "active");

        if (response.success && response.data.grounds) {
          const groundsList = [
            { value: "", label: "--Select Court--" },
            ...response.data.grounds.map((ground) => ({
              value: ground.groundId,
              label: ground.name,
              ground: ground, // Store full ground data for later use
            })),
          ];
          setCourts(groundsList);
          console.log("Fetched grounds:", groundsList);
        }
      } catch (error) {
        console.error("Error fetching grounds:", error);
        setError("Failed to load available courts. Please refresh the page.");
      } finally {
        setGroundsLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  const sports = [
    { value: "badminton", label: "🏸 Badminton", icon: "🏸" },
    { value: "tennis", label: "🎾 Tennis", icon: "🎾" },
    { value: "squash", label: "🏓 Squash", icon: "🏓" },
    { value: "basketball", label: "🏀 Basketball", icon: "🏀" },
  ];

  const [courts, setCourts] = useState([
    { value: "", label: "--Select Court--" },
  ]);

  const tables = [
    "Table 1",
    "Table 2",
    "Table 3",
    "Table 4",
    "Table 5",
    "Table 6",
  ];

  const timeSlots = [
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
  ];

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

  const calculatePrice = () => {
    const basePrice =
      selectedSport === "badminton"
        ? 600
        : selectedSport === "tennis"
        ? 800
        : selectedSport === "squash"
        ? 500
        : 700;
    return basePrice * duration * selectedTables.length;
  };

  // Handle booking creation and payment
  const handleCreateBooking = async () => {
    if (!selectedCourt || selectedTables.length === 0) {
      setError("Please select a court and at least one table");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Convert time format from "01:00 PM" to "13:00" (24-hour format)
      const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");

        if (hours === "12") {
          hours = "00";
        }

        if (modifier === "PM") {
          hours = parseInt(hours, 10) + 12;
        }

        return `${hours.padStart(2, "0")}:${minutes}`;
      };

      const bookingData = {
        groundId: selectedCourt,
        sport: selectedSport,
        date: selectedDate,
        startTime: convertTo24Hour(startTime),
        duration: duration,
        selectedTables: selectedTables,
        numberOfPlayers: 1,
        specialRequests: "",
      };

      console.log("Creating booking with data:", bookingData);

      // Create the booking
      const bookingResponse = await bookingService.createBooking(bookingData);

      if (bookingResponse.success) {
        const { booking, payment } = bookingResponse.data;

        console.log("Booking created successfully:", booking);
        console.log("Payment record created:", payment);

        // Process mock payment for development
        try {
          const paymentResponse = await bookingService.mockPaymentSuccess(
            booking.bookingId
          );

          if (paymentResponse.success) {
            setSuccess(
              "Booking created and payment processed successfully! Redirecting..."
            );

            // Redirect to success page after a short delay
            setTimeout(() => {
              navigate("/booking-success", {
                state: {
                  booking: paymentResponse.data.booking,
                  payment: paymentResponse.data.payment,
                },
              });
            }, 2000);
          } else {
            setError("Payment processing failed. Please try again.");
          }
        } catch (paymentError) {
          console.error("Payment processing error:", paymentError);
          setError("Payment processing failed. Please try again.");
        }
      } else {
        setError("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addTable = (table) => {
    if (!selectedTables.includes(table)) {
      setSelectedTables((prev) => [...prev, table]);
    }
  };

  const removeTable = (table) => {
    setSelectedTables((prev) => prev.filter((t) => t !== table));
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
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const currentHour = today.getHours();

    return timeSlots.map((time, index) => {
      const hour =
        parseInt(time.split(":")[0]) +
        (time.includes("PM") && !time.startsWith("12") ? 12 : 0);
      const isPast =
        selectedDateObj.toDateString() === today.toDateString() &&
        hour <= currentHour;
      const isUnavailable = Math.random() > 0.7; // Random unavailability for demo

      return {
        time,
        available: !isPast && !isUnavailable,
        isPast,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">QUICKCOURT</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Book</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span>Mitchell Admin</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Court Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              {/* Venue Info */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {selectedCourt
                    ? courts.find((c) => c.value === selectedCourt)?.label ||
                      "Select a Court"
                    : "Select a Court"}
                </h3>
                {selectedCourt &&
                  courts.find((c) => c.value === selectedCourt)?.ground && (
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>
                          {courts.find((c) => c.value === selectedCourt)?.ground
                            ?.location?.address?.city || "Jodhpur"}
                          ,{" "}
                          {courts.find((c) => c.value === selectedCourt)?.ground
                            ?.location?.address?.state || "Rajasthan"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>
                          {courts
                            .find((c) => c.value === selectedCourt)
                            ?.ground?.stats?.averageRating?.toFixed(1) ||
                            "4.5"}{" "}
                          (
                          {courts.find((c) => c.value === selectedCourt)?.ground
                            ?.stats?.totalReviews || "0"}
                          )
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Sport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    >
                      {sports.map((sport) => (
                        <option key={sport.value} value={sport.value}>
                          {sport.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
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

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    >
                      {getAvailableTimeSlots()
                        .filter((slot) => slot.available)
                        .map((slot) => (
                          <option key={slot.time} value={slot.time}>
                            {slot.time}
                          </option>
                        ))}
                    </select>
                    <Clock className="absolute right-10 top-3 w-5 h-5 text-gray-400" />
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
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
                      {duration} Hr
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
                    Court
                  </label>
                  <div className="relative mb-3">
                    <select
                      value={selectedCourt}
                      onChange={(e) => setSelectedCourt(e.target.value)}
                      disabled={groundsLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
                    >
                      {groundsLoading ? (
                        <option>Loading courts...</option>
                      ) : (
                        courts.map((court) => (
                          <option key={court.value} value={court.value}>
                            {court.label}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>

                  {/* Available Tables */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Available Tables:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tables.map((table) => (
                        <button
                          key={table}
                          onClick={() => addTable(table)}
                          disabled={selectedTables.includes(table)}
                          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                            selectedTables.includes(table)
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300"
                          }`}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Tables */}
                  {selectedTables.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Selected Tables:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTables.map((table) => (
                          <span
                            key={table}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                          >
                            {table}
                            <button onClick={() => removeTable(table)}>
                              <X className="w-3 h-3 hover:text-red-500" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleCreateBooking}
                  disabled={selectedTables.length === 0 || isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      Continue to Payment - ₹{calculatePrice().toFixed(2)}
                    </span>
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
                The selected date must be today or later
              </p>
            </div>

            {/* Available Time Slots */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Available Time Slots
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Start time must be in the future
                <br />
                Unavailable time slots are disabled and cannot be selected
              </p>

              <div className="grid grid-cols-2 gap-2">
                {getAvailableTimeSlots().map((slot) => (
                  <button
                    key={slot.time}
                    className={`p-2 text-sm rounded-lg border transition-colors
                      ${
                        slot.time === startTime
                          ? "bg-green-500 text-white border-green-500"
                          : !slot.available
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    disabled={!slot.available}
                    onClick={() => slot.available && setStartTime(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Summary */}
            {selectedTables.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sport:</span>
                    <span className="font-medium">
                      {sports.find((s) => s.value === selectedSport)?.icon}{" "}
                      {sports
                        .find((s) => s.value === selectedSport)
                        ?.label.slice(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tables:</span>
                    <span className="font-medium">{selectedTables.length}</span>
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
                    <span className="text-green-600">₹{calculatePrice()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
