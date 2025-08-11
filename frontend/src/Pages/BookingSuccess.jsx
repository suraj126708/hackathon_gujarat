import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";
import axios from "axios";

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await user.getIdToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setBookingData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    // Create a simple receipt text
    const receipt = `
BOOKING RECEIPT
================

Booking ID: ${bookingData?.booking?.bookingId}
Date: ${new Date(bookingData?.booking?.date).toLocaleDateString()}
Time: ${bookingData?.booking?.startTime} - ${bookingData?.booking?.endTime}
Sport: ${bookingData?.booking?.sport}
Courts: ${bookingData?.booking?.selectedCourts?.join(", ")}
Duration: ${bookingData?.booking?.duration} hour(s)
Amount: ₹${bookingData?.payment?.amount}

Ground: ${bookingData?.groundId?.name}
Location: ${bookingData?.groundId?.location?.address?.city}, ${
      bookingData?.groundId?.location?.address?.state
    }

Thank you for choosing QuickCourt!
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-receipt-${bookingData?.booking?.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const shareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Court Booking",
          text: `I just booked a ${bookingData?.booking?.sport} court at ${
            bookingData?.groundId?.name
          } for ${new Date(
            bookingData?.booking?.date
          ).toLocaleDateString()} at ${bookingData?.booking?.startTime}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `I just booked a ${bookingData?.booking?.sport} court at ${
          bookingData?.groundId?.name
        } for ${new Date(bookingData?.booking?.date).toLocaleDateString()} at ${
          bookingData?.booking?.startTime
        }!`
      );
      alert("Booking details copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Booking Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The booking you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/venues")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Browse Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/venues")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Venues
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your court has been successfully booked. We've sent a confirmation
            email with all the details.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Booking Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(bookingData.booking.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.booking.startTime} -{" "}
                      {bookingData.booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sport</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.booking.sport}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Courts</p>
                    <p className="font-medium text-gray-900">
                      {bookingData.booking.selectedCourts.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Venue Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Venue Name</p>
                  <p className="font-medium text-gray-900 text-lg">
                    {bookingData.groundId?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {bookingData.groundId?.location?.address?.street},{" "}
                    {bookingData.groundId?.location?.address?.city},{" "}
                    {bookingData.groundId?.location?.address?.state}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">
                    {bookingData.booking.duration} hour
                    {bookingData.booking.duration > 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-green-600 text-2xl">
                    ₹{bookingData.payment?.amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadReceipt}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>

          <button
            onClick={shareBooking}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Share Booking
          </button>

          <button
            onClick={() => navigate("/venues")}
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
          >
            Book Another Court
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">
            <strong>Important:</strong> Please arrive 10 minutes before your
            scheduled time.
          </p>
          <p className="mb-2">
            Don't forget to bring your sports equipment and comfortable
            clothing.
          </p>
          <p>
            If you need to cancel or modify your booking, please do so at least
            2 hours in advance.
          </p>
        </div>
      </div>
    </div>
  );
}
