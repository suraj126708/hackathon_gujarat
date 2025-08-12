// services/groundService.js
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

// Ground API Services
export const groundService = {
  // Get all grounds
  async getAllGrounds(page = 1, limit = 10, status = "active") {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({ page, limit, status });

      const response = await fetch(`${API_BASE_URL}/grounds?${params}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch grounds");
      }

      return data;
    } catch (error) {
      console.error("Error fetching grounds:", error);
      throw error;
    }
  },

  // Get ground by ID
  async getGroundById(groundId) {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/grounds/${groundId}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch ground");
      }

      return data;
    } catch (error) {
      console.error("Error fetching ground:", error);
      throw error;
    }
  },

  // Search grounds
  async searchGrounds(query) {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams(query);

      const response = await fetch(`${API_BASE_URL}/grounds/search?${params}`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search grounds");
      }

      return data;
    } catch (error) {
      console.error("Error searching grounds:", error);
      throw error;
    }
  },
};
