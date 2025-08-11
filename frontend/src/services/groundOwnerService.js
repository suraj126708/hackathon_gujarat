// services/groundOwnerService.js
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

// Ground Owner API Services
export const groundOwnerService = {
  // Get owner's grounds
  async getOwnerGrounds(page = 1, limit = 10, status = null) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ page, limit });
      if (status) params.append("status", status);

      const response = await fetch(
        `${API_BASE_URL}/grounds/owner/my-grounds?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch grounds");
      return data;
    } catch (error) {
      console.error("Error fetching owner grounds:", error);
      throw error;
    }
  },

  // Get ground statistics
  async getGroundStats(groundId) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/grounds/${groundId}/stats`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch ground stats");
      return data;
    } catch (error) {
      console.error("Error fetching ground stats:", error);
      throw error;
    }
  },

  // Get ground bookings
  async getGroundBookings(
    groundId,
    date = null,
    status = null,
    page = 1,
    limit = 10
  ) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ page, limit });
      if (date) params.append("date", date);
      if (status) params.append("status", status);

      const response = await fetch(
        `${API_BASE_URL}/bookings/ground/${groundId}?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch ground bookings");
      return data;
    } catch (error) {
      console.error("Error fetching ground bookings:", error);
      throw error;
    }
  },

  // Get all owner's bookings across all grounds
  async getAllOwnerBookings(page = 1, limit = 50) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ page, limit });

      const response = await fetch(
        `${API_BASE_URL}/bookings/owner/all?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch bookings");
      return data;
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
      throw error;
    }
  },

  // Get financial summary for owner
  async getOwnerFinancialSummary() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/grounds/owner/financial-summary`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch financial summary");
      return data;
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      throw error;
    }
  },

  // Get reviews for owner's grounds
  async getOwnerGroundReviews(page = 1, limit = 20) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ page, limit });

      const response = await fetch(
        `${API_BASE_URL}/reviews/owner/grounds?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch reviews");
      return data;
    } catch (error) {
      console.error("Error fetching owner ground reviews:", error);
      throw error;
    }
  },

  // Reply to a review
  async replyToReview(reviewId, content, isPublic = true) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/reviews/${reviewId}/reply`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ content, isPublic }),
        }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to reply to review");
      return data;
    } catch (error) {
      console.error("Error replying to review:", error);
      throw error;
    }
  },

  // Update ground status
  async updateGroundStatus(groundId, status) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/grounds/${groundId}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update ground status");
      return data;
    } catch (error) {
      console.error("Error updating ground status:", error);
      throw error;
    }
  },

  // Update ground information
  async updateGround(groundId, groundData) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/grounds/${groundId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(groundData),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update ground");
      return data;
    } catch (error) {
      console.error("Error updating ground:", error);
      throw error;
    }
  },

  // Delete ground (soft delete)
  async deleteGround(groundId) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/grounds/${groundId}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to delete ground");
      return data;
    } catch (error) {
      console.error("Error deleting ground:", error);
      throw error;
    }
  },

  // Get monthly analytics
  async getMonthlyAnalytics(month, year) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ month, year });

      const response = await fetch(
        `${API_BASE_URL}/grounds/owner/monthly-analytics?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch monthly analytics");
      return data;
    } catch (error) {
      console.error("Error fetching monthly analytics:", error);
      throw error;
    }
  },

  // Update owner profile
  async updateProfile(profileData) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profileData),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: headers.Authorization,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to upload profile picture");
      return data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  // Export data
  async exportData(type, dateRange) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/grounds/owner/export`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type, dateRange }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to export data");
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${dateRange.start}_${dateRange.end}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: "Data exported successfully" };
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  },

  // Time Slot Management
  async blockTimeSlot(timeSlotData) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/timeslots/block`, {
        method: "POST",
        headers,
        body: JSON.stringify(timeSlotData),
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to block time slot");
      return data;
    } catch (error) {
      console.error("Error blocking time slot:", error);
      throw error;
    }
  },

  async unblockTimeSlot(timeSlotId) {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/timeslots/${timeSlotId}`, {
        method: "DELETE",
        headers,
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to unblock time slot");
      return data;
    } catch (error) {
      console.error("Error unblocking time slot:", error);
      throw error;
    }
  },

  async getBlockedTimeSlots(
    groundId,
    date = null,
    startDate = null,
    endDate = null
  ) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${API_BASE_URL}/timeslots/ground/${groundId}/blocked?${params}`,
        { headers }
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch blocked time slots");
      return data;
    } catch (error) {
      console.error("Error fetching blocked time slots:", error);
      throw error;
    }
  },

  async getGroundAvailability(
    groundId,
    date = null,
    startDate = null,
    endDate = null
  ) {
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${API_BASE_URL}/timeslots/ground/${groundId}/availability?${params}`
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch ground availability");
      return data;
    } catch (error) {
      console.error("Error fetching ground availability:", error);
      throw error;
    }
  },
};

// Mock data fallback for development
export const mockData = {
  grounds: [
    {
      id: 1,
      groundId: "GRD-001",
      name: "Elite Sports Complex",
      sport: "Football",
      location: "Mumbai, Maharashtra",
      rating: 4.5,
      totalBookings: 156,
      monthlyRevenue: 45000,
      status: "active",
    },
    {
      id: 2,
      groundId: "GRD-002",
      name: "Royal Cricket Ground",
      sport: "Cricket",
      location: "Pune, Maharashtra",
      rating: 4.8,
      totalBookings: 89,
      monthlyRevenue: 32000,
      status: "active",
    },
  ],
  bookings: [
    {
      id: 1,
      groundName: "Elite Sports Complex",
      customerName: "Rahul Sharma",
      date: "2024-01-15",
      time: "14:00 - 16:00",
      amount: 1200,
      status: "confirmed",
      sport: "Football",
    },
    {
      id: 2,
      groundName: "Royal Cricket Ground",
      customerName: "Priya Patel",
      date: "2024-01-16",
      time: "10:00 - 12:00",
      amount: 800,
      status: "completed",
      sport: "Cricket",
    },
  ],
  reviews: [
    {
      id: 1,
      groundName: "Elite Sports Complex",
      customerName: "Amit Kumar",
      rating: 5,
      comment:
        "Excellent facilities and well-maintained ground. Highly recommended!",
      date: "2024-01-14",
    },
    {
      id: 2,
      groundName: "Royal Cricket Ground",
      customerName: "Sneha Singh",
      rating: 4,
      comment:
        "Great cricket ground with good pitch quality. Staff is very helpful.",
      date: "2024-01-13",
    },
  ],
  financialData: {
    totalEarnings: 125000,
    monthlyEarnings: 45000,
    totalBookings: 245,
    cancelledBookings: 12,
    averageRating: 4.6,
    totalReviews: 89,
  },
};
