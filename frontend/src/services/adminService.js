// services/adminService.js
import { authService } from "../firebase/firebase";

const API_BASE_URL = "https://hackathon-gujarat.onrender.com/api/admin";

// Helper function to get auth headers
const getAuthHeaders = async () => {
  try {
    console.log("Getting auth headers...");
    console.log("authService:", authService);

    // Check if authService is available
    if (!authService) {
      throw new Error("AuthService is not available");
    }

    // Wait a bit for authService to be fully initialized
    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries && !authService.isAuthenticated()) {
      console.log(
        `Waiting for auth initialization, attempt ${retries + 1}/${maxRetries}`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error(
        "User is not authenticated after waiting for initialization"
      );
    }

    const token = await authService.getIdToken();
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      throw new Error("No authentication token available");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
};

// Enhanced error handling
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};

// Admin API Services
export const adminService = {
  // Dashboard & Statistics
  async getDashboardData() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },

  async getSystemStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
  },

  // User Management
  async getAllUsers(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  async updateUserRole(userId, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },

  async updateUserStatus(userId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  async getUserStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  },

  // Facility Management
  async getPendingFacilities() {
    try {
      const response = await fetch(`${API_BASE_URL}/facilities/pending`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching pending facilities:", error);
      throw error;
    }
  },

  async approveFacility(facilityId, comments = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/facilities/${facilityId}/approve`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify({ comments }),
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error approving facility:", error);
      throw error;
    }
  },

  async rejectFacility(facilityId, reason, comments = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/facilities/${facilityId}/reject`,
        {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify({ reason, comments }),
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error rejecting facility:", error);
      throw error;
    }
  },

  async getAllFacilities(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetch(
        `${API_BASE_URL}/facilities?${queryParams}`,
        {
          method: "GET",
          headers: await getAuthHeaders(),
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      throw error;
    }
  },

  async updateFacilityStatus(facilityId, status, reason = "") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/facilities/${facilityId}/status`,
        {
          method: "PATCH",
          headers: await getAuthHeaders(),
          body: JSON.stringify({ status, reason }),
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error updating facility status:", error);
      throw error;
    }
  },

  // Analytics
  async getFacilityAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/facilities`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching facility analytics:", error);
      throw error;
    }
  },

  async getSportsAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/sports`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching sports analytics:", error);
      throw error;
    }
  },

  async getEarningsAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/earnings`, {
        method: "GET",
        headers: await getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error fetching earnings analytics:", error);
      throw error;
    }
  },

  // Real-time data fetching with caching
  async getRealTimeStats() {
    try {
      const [dashboardData, systemStats] = await Promise.all([
        this.getDashboardData(),
        this.getSystemStats(),
      ]);

      return {
        dashboard: dashboardData,
        system: systemStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
      throw error;
    }
  },

  // Bulk operations
  async bulkUpdateUsers(userIds, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/bulk`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userIds, updates }),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error("Error bulk updating users:", error);
      throw error;
    }
  },

  // Export functionality
  async exportUsers(format = "csv", filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...filters,
      });

      const response = await fetch(
        `${API_BASE_URL}/users/export?${queryParams}`,
        {
          method: "GET",
          headers: await getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: "Export completed successfully" };
    } catch (error) {
      console.error("Error exporting users:", error);
      throw error;
    }
  },

  // Mock data for development/testing
  getMockDashboardData() {
    return {
      success: true,
      data: {
        statistics: {
          totalUsers: 1250,
          activeUsers: 980,
          inactiveUsers: 150,
          suspendedUsers: 120,
          userCount: 800,
          moderatorCount: 50,
          adminCount: 5,
          usersThisMonth: 45,
          usersLastMonth: 38,
          growthRate: 18.42,
          totalFacilities: 89,
          activeFacilities: 76,
          pendingFacilities: 13,
          totalBookings: 2340,
          completedBookings: 2100,
          cancelledBookings: 240,
          totalRevenue: 45600,
        },
        recentActivity: {
          newUsers: [
            {
              displayName: "John Doe",
              email: "john@example.com",
              role: "user",
              status: "active",
              createdAt: new Date().toISOString(),
            },
            {
              displayName: "Jane Smith",
              email: "jane@example.com",
              role: "user",
              status: "active",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          activeUsers: [
            {
              displayName: "Mike Johnson",
              email: "mike@example.com",
              role: "user",
              lastActiveAt: new Date().toISOString(),
            },
            {
              displayName: "Sarah Wilson",
              email: "sarah@example.com",
              role: "user",
              lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        },
      },
    };
  },

  getMockSystemStats() {
    return {
      success: true,
      data: {
        totalUsers: 1250,
        totalFacilityOwners: 89,
        totalBookings: 2340,
        totalActiveCourts: 76,
        userGrowth: 18.42,
        facilityGrowth: 12.5,
        bookingGrowth: 25.8,
        activeUsers: 980,
        verifiedUsers: 1150,
        roles: [
          { _id: "user", count: 800 },
          { _id: "facility_owner", count: 89 },
          { _id: "moderator", count: 50 },
          { _id: "admin", count: 5 },
        ],
        statuses: [
          { _id: "active", count: 980 },
          { _id: "inactive", count: 150 },
          { _id: "suspended", count: 120 },
        ],
      },
    };
  },

  getMockUserStats() {
    return {
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 980,
        inactiveUsers: 150,
        suspendedUsers: 120,
        userCount: 800,
        moderatorCount: 50,
        adminCount: 5,
        usersThisMonth: 45,
        usersLastMonth: 38,
        growthRate: 18.42,
      },
    };
  },

  getMockFacilityAnalytics() {
    return {
      success: true,
      data: {
        sportStats: [
          { _id: "football", count: 25 },
          { _id: "basketball", count: 20 },
          { _id: "tennis", count: 15 },
          { _id: "cricket", count: 12 },
          { _id: "badminton", count: 8 },
        ],
        statusStats: [
          { _id: "active", count: 76 },
          { _id: "pending", count: 13 },
          { _id: "suspended", count: 0 },
        ],
        locationStats: [
          { _id: "Mumbai", count: 20 },
          { _id: "Delhi", count: 18 },
          { _id: "Bangalore", count: 15 },
          { _id: "Chennai", count: 12 },
          { _id: "Hyderabad", count: 10 },
        ],
        ratingStats: [
          { _id: "football", avgRating: 4.5 },
          { _id: "basketball", avgRating: 4.3 },
          { _id: "tennis", avgRating: 4.7 },
          { _id: "cricket", avgRating: 4.2 },
          { _id: "badminton", avgRating: 4.1 },
        ],
        monthlyGrowth: [
          { _id: { year: 2024, month: 1 }, count: 5 },
          { _id: { year: 2024, month: 2 }, count: 8 },
          { _id: { year: 2024, month: 3 }, count: 12 },
          { _id: { year: 2024, month: 4 }, count: 15 },
          { _id: { year: 2024, month: 5 }, count: 18 },
          { _id: { year: 2024, month: 6 }, count: 22 },
        ],
        topFacilities: [
          {
            name: "Elite Football Ground",
            sport: "football",
            location: "Mumbai",
            rating: 4.8,
            bookingCount: 156,
          },
          {
            name: "Premium Basketball Court",
            sport: "basketball",
            location: "Delhi",
            rating: 4.6,
            bookingCount: 134,
          },
        ],
      },
    };
  },

  getMockSportsAnalytics() {
    return {
      success: true,
      data: {
        mostActiveSports: [
          {
            _id: "football",
            totalBookings: 450,
            totalRevenue: 13500,
            avgDuration: 7200000,
          },
          {
            _id: "basketball",
            totalBookings: 380,
            totalRevenue: 11400,
            avgDuration: 5400000,
          },
          {
            _id: "tennis",
            totalBookings: 320,
            totalRevenue: 12800,
            avgDuration: 5400000,
          },
          {
            _id: "cricket",
            totalBookings: 280,
            totalRevenue: 8400,
            avgDuration: 10800000,
          },
          {
            _id: "badminton",
            totalBookings: 200,
            totalRevenue: 6000,
            avgDuration: 3600000,
          },
        ],
        monthlySportsTrend: [
          { _id: { year: 2024, month: 1, sport: "football" }, bookings: 35 },
          { _id: { year: 2024, month: 2, sport: "football" }, bookings: 42 },
          { _id: { year: 2024, month: 3, sport: "football" }, bookings: 48 },
        ],
        peakHoursBySport: [
          { _id: { sport: "football", hour: 18 }, bookings: 45 },
          { _id: { sport: "football", hour: 19 }, bookings: 52 },
          { _id: { sport: "basketball", hour: 17 }, bookings: 38 },
          { _id: { sport: "basketball", hour: 18 }, bookings: 42 },
        ],
        seasonalSports: [
          { _id: { sport: "football", season: "Winter" }, bookings: 120 },
          { _id: { sport: "football", season: "Summer" }, bookings: 180 },
          { _id: { sport: "cricket", season: "Winter" }, bookings: 80 },
          { _id: { sport: "cricket", season: "Summer" }, bookings: 60 },
        ],
      },
    };
  },

  getMockEarningsAnalytics() {
    return {
      success: true,
      data: {
        monthlyTrend: [
          {
            _id: { year: 2024, month: 1 },
            totalRevenue: 3800,
            totalTransactions: 95,
            avgTransactionValue: 40,
          },
          {
            _id: { year: 2024, month: 2 },
            totalRevenue: 4200,
            totalTransactions: 105,
            avgTransactionValue: 40,
          },
          {
            _id: { year: 2024, month: 3 },
            totalRevenue: 4800,
            totalTransactions: 120,
            avgTransactionValue: 40,
          },
          {
            _id: { year: 2024, month: 4 },
            totalRevenue: 5200,
            totalTransactions: 130,
            avgTransactionValue: 40,
          },
          {
            _id: { year: 2024, month: 5 },
            totalRevenue: 5800,
            totalTransactions: 145,
            avgTransactionValue: 40,
          },
          {
            _id: { year: 2024, month: 6 },
            totalRevenue: 6400,
            totalTransactions: 160,
            avgTransactionValue: 40,
          },
        ],
        revenueBySport: [
          { _id: "football", totalRevenue: 13500, totalTransactions: 450 },
          { _id: "basketball", totalRevenue: 11400, totalTransactions: 380 },
          { _id: "tennis", totalRevenue: 12800, totalTransactions: 320 },
          { _id: "cricket", totalRevenue: 8400, totalTransactions: 280 },
          { _id: "badminton", totalRevenue: 6000, totalTransactions: 200 },
        ],
        dailyRevenue: [
          {
            _id: { dayOfWeek: 1, hour: 18 },
            totalRevenue: 800,
            avgRevenue: 40,
          },
          {
            _id: { dayOfWeek: 1, hour: 19 },
            totalRevenue: 900,
            avgRevenue: 45,
          },
          {
            _id: { dayOfWeek: 2, hour: 17 },
            totalRevenue: 700,
            avgRevenue: 35,
          },
          {
            _id: { dayOfWeek: 2, hour: 18 },
            totalRevenue: 850,
            avgRevenue: 42.5,
          },
        ],
        paymentMethodStats: [
          { _id: "razorpay", totalRevenue: 32000, totalTransactions: 800 },
          { _id: "stripe", totalRevenue: 13600, totalTransactions: 340 },
        ],
        revenueGrowth: [
          { _id: { year: 2024, month: 5 }, revenue: 5800 },
          { _id: { year: 2024, month: 6 }, revenue: 6400 },
        ],
        growthRate: 10.34,
      },
    };
  },
};

export default adminService;
