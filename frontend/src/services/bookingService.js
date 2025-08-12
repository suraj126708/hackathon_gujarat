// services/bookingService.js
import { authService } from "../firebase/firebase";

const API_BASE_URL = "https://hackathon-gujarat.onrender.com/api";

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await authService.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Booking API Services
export const bookingService = {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const headers = await getAuthHeaders();

      // Transform the data to match backend expectations
      const transformedData = {
        groundId: bookingData.groundId,
        sport: bookingData.sport,
        date: bookingData.date,
        startTime: bookingData.startTime,
        duration: bookingData.duration,
        selectedCourts: bookingData.selectedTables, // Map tables to courts
        numberOfPlayers: bookingData.numberOfPlayers || 1,
        specialRequests: bookingData.specialRequests || "",
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify(transformedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      return data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Verify payment and confirm booking
  async verifyPayment(paymentData) {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/bookings/verify-payment`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify payment");
      }

      return data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },

  // Mock payment success (for development/testing)
  async mockPaymentSuccess(bookingId) {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/bookings/mock-payment-success`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process mock payment");
      }

      return data;
    } catch (error) {
      console.error("Error processing mock payment:", error);
      throw error;
    }
  },

  // Get user's bookings
  async getUserBookings(status = "all", page = 1, limit = 10) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ status, page, limit });

      const response = await fetch(`${API_BASE_URL}/bookings/user?${params}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bookings");
      }

      return data;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  },

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch booking details");
      }

      return data;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  },

  // Cancel booking
  async cancelBooking(bookingId, reason = "") {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      return data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  },
};
