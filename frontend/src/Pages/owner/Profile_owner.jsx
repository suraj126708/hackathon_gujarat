/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Star,
  Edit3,
  Plus,
  Eye,
  BarChart3,
  CreditCard,
  Settings,
  Home,
  Users,
  CalendarDays,
  MessageSquare,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  Building2,
  Wallet,
  Receipt,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  RefreshCw,
  X,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertTriangle,
  CheckCircle2,
  List,
  Info,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { groundOwnerService } from "../../services/groundOwnerService";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProfileOwner = () => {
  const { user, userProfile } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Check if user is an owner
  const isOwner = userProfile?.role === "Facility Owner";
  const isPlayer = userProfile?.role === "Player" || !userProfile?.role;

  // Data states
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [financialData, setFinancialData] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [monthlyAnalytics, setMonthlyAnalytics] = useState({
    currentMonth: {},
    previousMonth: {},
    trends: {},
  });

  // Time slot management states
  const [timeSlotView, setTimeSlotView] = useState("calendar");
  const [selectedGround, setSelectedGround] = useState(null);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState([]);
  const [groundAvailability, setGroundAvailability] = useState([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [timeSlotForm, setTimeSlotForm] = useState({
    groundId: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "Maintenance",
    isRecurring: false,
    recurringDays: [],
    endDate: "",
  });

  // Ground editing states
  const [editingGround, setEditingGround] = useState(null);
  const [groundEditForm, setGroundEditForm] = useState({
    name: "",
    description: "",
    pricing: {
      weekdayPrice: "",
      weekendPrice: "",
      currency: "INR",
      perHour: false,
    },
    contact: {
      phone: "",
      email: "",
    },
  });

  // Ground search and filter states
  const [groundSearchTerm, setGroundSearchTerm] = useState("");
  const [groundStatusFilter, setGroundStatusFilter] = useState("all");

  // Chart data states
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [bookingsChartData, setBookingsChartData] = useState([]);
  const [groundPerformanceData, setGroundPerformanceData] = useState([]);
  const [reviewDistributionData, setReviewDistributionData] = useState([]);

  // Form data for profile editing
  const [formData, setFormData] = useState({
    displayName: "",
    profile: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      bio: "",
      location: "",
      businessName: "",
      businessAddress: "",
      businessPhone: "",
      businessEmail: "",
      taxId: "",
      bankDetails: {
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
      },
    },
  });

  // Function to clear messages after a delay
  const clearMessageAfterDelay = (delay = 5000) => {
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, delay);
  };

  // Show initial message when component loads
  useEffect(() => {
    if (user && userProfile) {
      setMessage({
        type: "info",
        text: "Loading your profile data...",
      });
    }
  }, [user, userProfile]);

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
          businessName: userProfile.profile?.businessName || "",
          businessAddress: userProfile.profile?.businessAddress || "",
          businessPhone: userProfile.profile?.businessPhone || "",
          businessEmail: userProfile.profile?.businessEmail || "",
          taxId: userProfile.profile?.taxId || "",
          bankDetails: {
            accountNumber:
              userProfile.profile?.bankDetails?.accountNumber || "",
            ifscCode: userProfile.profile?.bankDetails?.ifscCode || "",
            accountHolderName:
              userProfile.profile?.bankDetails?.accountHolderName || "",
          },
        },
      });
    }
  }, [userProfile]);

  // Fetch data from backend APIs
  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Prepare chart data when data changes
  useEffect(() => {
    if (grounds.length > 0 || bookings.length > 0 || reviews.length > 0) {
      prepareChartData();
    }
  }, [grounds, bookings, reviews, monthlyAnalytics]);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      // Get current month and year for analytics
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // Fetch all data in parallel
      const [
        groundsData,
        bookingsData,
        reviewsData,
        financialData,
        analyticsData,
      ] = await Promise.allSettled([
        groundOwnerService.getOwnerGrounds(),
        groundOwnerService.getAllOwnerBookings(),
        groundOwnerService.getOwnerGroundReviews(),
        groundOwnerService.getOwnerFinancialSummary(),
        groundOwnerService.getMonthlyAnalytics(currentMonth, currentYear),
      ]);

      // Set grounds data
      if (groundsData.status === "fulfilled") {
        console.log("🔍 [DEBUG] Grounds data received:", groundsData.value);
        console.log(
          "🔍 [DEBUG] Grounds array:",
          groundsData.value.data?.grounds
        );

        if (groundsData.value.success && groundsData.value.data?.grounds) {
          setGrounds(groundsData.value.data.grounds);
          console.log(
            "🔍 [DEBUG] Grounds set successfully:",
            groundsData.value.data.grounds.length
          );
          setMessage({
            type: "success",
            text: `Successfully loaded ${groundsData.value.data.grounds.length} grounds!`,
          });
          clearMessageAfterDelay(3000);
        } else {
          console.warn(
            "❌ [DEBUG] Grounds API returned success: false or no data"
          );
          setGrounds([]);
          setMessage({
            type: "warning",
            text: "No grounds found in the API response. Trying fallback method...",
          });
        }
      } else {
        console.warn("❌ [DEBUG] Failed to fetch grounds:", groundsData.reason);
        setMessage({
          type: "warning",
          text: "Failed to fetch grounds, trying fallback method...",
        });

        // Fallback: Try to fetch grounds by user ID
        try {
          const fallbackGrounds = await fetchGroundsByUserId();
          if (fallbackGrounds.length > 0) {
            console.log(
              "🔍 [DEBUG] Fallback grounds fetch successful:",
              fallbackGrounds
            );
            setGrounds(fallbackGrounds);
            setMessage({
              type: "success",
              text: `Found ${fallbackGrounds.length} grounds using fallback method!`,
            });
            clearMessageAfterDelay(3000);
          } else {
            console.warn(
              "❌ [DEBUG] No grounds found with fallback method either"
            );
            setGrounds([]);
            setMessage({
              type: "info",
              text: "No grounds found. You can add your first ground using the button below.",
            });
          }
        } catch (fallbackError) {
          console.error(
            "❌ [DEBUG] Fallback method also failed:",
            fallbackError
          );
          setGrounds([]);
          setMessage({
            type: "error",
            text: "Failed to load grounds. Please try refreshing or contact support.",
          });
        }
      }

      // Set bookings data
      if (bookingsData.status === "fulfilled") {
        console.log("🔍 [DEBUG] Bookings data received:", bookingsData.value);
        if (bookingsData.value.success && bookingsData.value.data?.bookings) {
          setBookings(bookingsData.value.data.bookings);
        } else {
          setBookings([]);
        }
      } else {
        console.warn(
          "❌ [DEBUG] Failed to fetch bookings:",
          bookingsData.reason
        );
        setBookings([]);
      }

      // Set reviews data
      if (reviewsData.status === "fulfilled") {
        console.log("🔍 [DEBUG] Reviews data received:", reviewsData.value);
        if (reviewsData.value.success && reviewsData.value.data?.reviews) {
          setReviews(reviewsData.value.data.reviews);
        } else {
          setReviews([]);
        }
      } else {
        console.warn("❌ [DEBUG] Failed to fetch reviews:", reviewsData.reason);
        setReviews([]);
      }

      // Set financial data
      if (financialData.status === "fulfilled") {
        console.log("🔍 [DEBUG] Financial data received:", financialData.value);
        if (financialData.value.success && financialData.value.data) {
          setFinancialData(financialData.value.data);
        } else {
          setFinancialData({
            totalEarnings: 0,
            monthlyEarnings: 0,
            totalBookings: 0,
            cancelledBookings: 0,
            averageRating: 0,
            totalReviews: 0,
          });
        }
      } else {
        console.warn(
          "❌ [DEBUG] Failed to fetch financial data:",
          financialData.reason
        );
        setFinancialData({
          totalEarnings: 0,
          monthlyEarnings: 0,
          totalBookings: 0,
          cancelledBookings: 0,
          averageRating: 0,
          totalReviews: 0,
        });
      }

      // Set monthly analytics data
      if (analyticsData.status === "fulfilled") {
        console.log("🔍 [DEBUG] Analytics data received:", analyticsData.value);
        if (analyticsData.value.success && analyticsData.value.data) {
          setMonthlyAnalytics(analyticsData.value.data);
        } else {
          setMonthlyAnalytics({
            currentMonth: { revenue: 0, bookings: 0, growth: 0 },
            previousMonth: { revenue: 0, bookings: 0, growth: 0 },
            trends: { revenue: 0, bookings: 0 },
          });
        }
      } else {
        console.warn(
          "❌ [DEBUG] Failed to fetch monthly analytics:",
          analyticsData.reason
        );
        setMonthlyAnalytics({
          currentMonth: { revenue: 0, bookings: 0, growth: 0 },
          previousMonth: { revenue: 0, bookings: 0, growth: 0 },
          trends: { revenue: 0, bookings: 0 },
        });
      }
    } catch (error) {
      setGrounds([]);
      setBookings([]);
      setReviews([]);
      setFinancialData({
        totalEarnings: 0,
        monthlyEarnings: 0,
        totalBookings: 0,
        cancelledBookings: 0,
        averageRating: 0,
        totalReviews: 0,
      });
      setMonthlyAnalytics({
        currentMonth: { revenue: 0, bookings: 0, growth: 0 },
        previousMonth: { revenue: 0, bookings: 0, growth: 0 },
        trends: { revenue: 0, bookings: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback method to fetch grounds by user ID
  const fetchGroundsByUserId = async () => {
    try {
      console.log(
        "🔍 [DEBUG] Trying fallback method to fetch grounds by user ID"
      );
      console.log("🔍 [DEBUG] User object:", user);
      console.log("🔍 [DEBUG] UserProfile object:", userProfile);
      console.log("🔍 [DEBUG] User UID:", user?.uid);
      console.log(
        "🔍 [DEBUG] UserProfile FirebaseUID:",
        userProfile?.firebaseUid
      );

      // Try to fetch all grounds and filter by owner
      const response = await fetch(`http://localhost:5000/api/grounds`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🔍 [DEBUG] All grounds fetched:", data);

      // Filter grounds by owner ID - try both owner and ownerId fields
      const userGrounds =
        data.data?.grounds?.filter((ground) => {
          const isOwner =
            ground.owner === user?.uid ||
            ground.ownerId === user?.uid ||
            ground.owner === userProfile?.firebaseUid ||
            ground.ownerId === userProfile?.firebaseUid;

          console.log(
            "🔍 [DEBUG] Checking ground:",
            ground.name,
            "Owner:",
            ground.owner,
            "OwnerId:",
            ground.ownerId,
            "User:",
            user?.uid,
            "IsOwner:",
            isOwner
          );

          return isOwner;
        }) || [];

      console.log("🔍 [DEBUG] Filtered user grounds:", userGrounds);
      return userGrounds;
    } catch (error) {
      console.error("❌ [DEBUG] Fallback method failed:", error);
      throw error;
    }
  };

  // Test method to fetch all grounds (for debugging)
  const testFetchAllGrounds = async () => {
    try {
      console.log("🔍 [DEBUG] Testing fetch all grounds...");
      const response = await fetch(`http://localhost:5000/api/grounds`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🔍 [DEBUG] All grounds response:", data);
      console.log("🔍 [DEBUG] Grounds array:", data.data?.grounds);

      // Check if any grounds have the current user as owner
      const userGrounds =
        data.data?.grounds?.filter((ground) => {
          const isOwner =
            ground.owner === user?.uid ||
            ground.ownerId === user?.uid ||
            ground.owner === userProfile?.firebaseUid ||
            ground.ownerId === userProfile?.firebaseUid;

          console.log(
            "🔍 [DEBUG] Checking ground:",
            ground.name,
            "Owner:",
            ground.owner,
            "OwnerId:",
            ground.ownerId,
            "User UID:",
            user?.uid,
            "UserProfile FirebaseUID:",
            userProfile?.firebaseUid,
            "IsOwner:",
            isOwner
          );

          return isOwner;
        }) || [];

      console.log("🔍 [DEBUG] Found user grounds:", userGrounds);

      if (userGrounds.length > 0) {
        setGrounds(userGrounds);
        setMessage({
          type: "success",
          text: `Found ${userGrounds.length} grounds using fallback method!`,
        });
      } else {
        setMessage({
          type: "warning",
          text: "No grounds found for current user",
        });
      }

      return data;
    } catch (error) {
      console.error("❌ [DEBUG] Test fetch all grounds failed:", error);
      setMessage({ type: "error", text: `Test failed: ${error.message}` });
      throw error;
    }
  };

  // Simple test to fetch all grounds without auth
  const testFetchAllGroundsNoAuth = async () => {
    try {
      console.log("🔍 [DEBUG] Testing fetch all grounds without auth...");
      const response = await fetch(`http://localhost:5000/api/grounds`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🔍 [DEBUG] All grounds (no auth):", data);

      if (data.data?.grounds) {
        setMessage({
          type: "success",
          text: `Backend is working! Found ${data.data.grounds.length} total grounds.`,
        });
        clearMessageAfterDelay(5000);
      }

      return data;
    } catch (error) {
      console.error(
        "❌ [DEBUG] Test fetch all grounds (no auth) failed:",
        error
      );
      setMessage({
        type: "error",
        text: `Backend test failed: ${error.message}`,
      });
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("profile.")) {
      const field = name.split(".")[1];
      if (field === "bankDetails") {
        const bankField = name.split(".")[2];
        setFormData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            bankDetails: {
              ...prev.profile.bankDetails,
              [bankField]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            [field]: value,
          },
        }));
      }
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
      // Call the real profile update API
      const result = await groundOwnerService.updateProfile(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // Refresh data after successful update
      fetchOwnerData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOwnerData();
    // Refresh chart data after a short delay to ensure new data is loaded
    setTimeout(() => {
      prepareChartData();
    }, 1000);
  };

  const handleGroundStatusUpdate = async (groundId, newStatus) => {
    try {
      await groundOwnerService.updateGroundStatus(groundId, newStatus);
      setMessage({
        type: "success",
        text: "Ground status updated successfully!",
      });
      // Refresh data to show updated status
      fetchOwnerData();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update ground status" });
    }
  };

  const handleReplyToReview = async (reviewId, content) => {
    try {
      await groundOwnerService.replyToReview(reviewId, content);
      setMessage({ type: "success", text: "Reply added successfully!" });
      // Refresh data to show the reply
      fetchOwnerData();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add reply" });
    }
  };

  const handleExportData = async (type) => {
    try {
      const dateRange = {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        end: new Date().toISOString().split("T")[0],
      };

      await groundOwnerService.exportData(type, dateRange);
      setMessage({ type: "success", text: "Data exported successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export data" });
    }
  };

  const handleMonthlyAnalyticsRefresh = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const analyticsData = await groundOwnerService.getMonthlyAnalytics(
        currentMonth,
        currentYear
      );
      setMonthlyAnalytics(analyticsData.data || {});
      setMessage({ type: "success", text: "Monthly analytics refreshed!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to refresh monthly analytics",
      });
    }
  };

  // Time slot management functions
  const handleTimeSlotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groundOwnerService.blockTimeSlot(timeSlotForm);
      setMessage({ type: "success", text: "Time slot blocked successfully!" });
      setShowTimeSlotModal(false);
      setTimeSlotForm({
        groundId: "",
        date: "",
        startTime: "",
        endTime: "",
        reason: "Maintenance",
        isRecurring: false,
        recurringDays: [],
        endDate: "",
      });
      // Refresh blocked time slots
      if (selectedGround) {
        fetchBlockedTimeSlots(selectedGround.groundId);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to block time slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockTimeSlot = async (timeSlotId) => {
    if (!window.confirm("Are you sure you want to unblock this time slot?")) {
      return;
    }

    setLoading(true);
    try {
      await groundOwnerService.unblockTimeSlot(timeSlotId);
      setMessage({
        type: "success",
        text: "Time slot unblocked successfully!",
      });
      // Refresh blocked time slots
      if (selectedGround) {
        fetchBlockedTimeSlots(selectedGround.groundId);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to unblock time slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedTimeSlots = async (groundId) => {
    try {
      const result = await groundOwnerService.getBlockedTimeSlots(groundId);
      setBlockedTimeSlots(result.data.blockedTimeSlots || []);
    } catch (error) {
      console.error("Error fetching blocked time slots:", error);
    }
  };

  const fetchGroundAvailability = async (groundId) => {
    try {
      const result = await groundOwnerService.getGroundAvailability(groundId);
      setGroundAvailability(result.data.availability || []);
    } catch (error) {
      console.error("Error fetching ground availability:", error);
    }
  };

  const handleGroundSelect = (ground) => {
    setSelectedGround(ground);
    fetchBlockedTimeSlots(ground.groundId);
    fetchGroundAvailability(ground.groundId);
  };

  // Chart data preparation functions
  const prepareChartData = () => {
    // Prepare revenue chart data (last 6 months) - use real data when available
    const revenueData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      // Try to find real data for this month
      let monthRevenue = 0;
      if (
        monthlyAnalytics.currentMonth &&
        monthYear ===
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      ) {
        monthRevenue = monthlyAnalytics.currentMonth.revenue || 0;
      } else if (
        monthlyAnalytics.previousMonth &&
        monthYear ===
          `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`
      ) {
        monthRevenue = monthlyAnalytics.previousMonth.revenue || 0;
      } else {
        // Calculate from bookings data if available
        const monthBookings = bookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return (
            bookingDate.getMonth() === date.getMonth() &&
            bookingDate.getFullYear() === date.getFullYear() &&
            booking.status === "confirmed"
          );
        });
        monthRevenue = monthBookings.reduce(
          (sum, booking) => sum + (booking.amount || 0),
          0
        );
      }

      revenueData.push({
        month: monthName,
        revenue: monthRevenue,
        year: date.getFullYear(),
      });
    }
    setRevenueChartData(revenueData);

    // Prepare bookings chart data - use real data
    const bookingsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      // Try to find real data for this month
      let monthBookings = 0;
      if (
        monthlyAnalytics.currentMonth &&
        monthYear ===
          `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      ) {
        monthBookings = monthlyAnalytics.currentMonth.bookings || 0;
      } else if (
        monthlyAnalytics.previousMonth &&
        monthYear ===
          `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`
      ) {
        monthBookings = monthlyAnalytics.previousMonth.bookings || 0;
      } else {
        // Calculate from actual bookings data
        const monthBookingsData = bookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return (
            bookingDate.getMonth() === date.getMonth() &&
            bookingDate.getFullYear() === date.getFullYear()
          );
        });
        monthBookings = monthBookingsData.length;
      }

      bookingsData.push({
        month: monthName,
        bookings: monthBookings,
        year: date.getFullYear(),
      });
    }
    setBookingsChartData(bookingsData);

    // Prepare ground performance data - use real data from grounds
    const performanceData = grounds.map((ground) => {
      // Calculate actual bookings for this ground
      const groundBookings = bookings.filter(
        (booking) =>
          booking.groundId === (ground.groundId || ground.id) ||
          booking.groundName === ground.name
      );

      // Calculate actual revenue for this ground
      const groundRevenue = groundBookings
        .filter((booking) => booking.status === "confirmed")
        .reduce((sum, booking) => sum + (booking.amount || 0), 0);

      // Calculate average rating for this ground
      const groundReviews = reviews.filter(
        (review) =>
          review.groundId === (ground.groundId || ground.id) ||
          review.groundName === ground.name
      );
      const averageRating =
        groundReviews.length > 0
          ? groundReviews.reduce(
              (sum, review) => sum + (review.rating || 0),
              0
            ) / groundReviews.length
          : 0;

      return {
        name: ground.name,
        bookings: groundBookings.length,
        revenue: groundRevenue,
        rating: averageRating,
        totalReviews: groundReviews.length,
      };
    });
    setGroundPerformanceData(performanceData);

    // Prepare review distribution data - use real data from reviews
    const reviewDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const rating = review.rating || 0;
      if (rating >= 5) reviewDistribution[5]++;
      else if (rating >= 4) reviewDistribution[4]++;
      else if (rating >= 3) reviewDistribution[3]++;
      else if (rating >= 2) reviewDistribution[2]++;
      else if (rating >= 1) reviewDistribution[1]++;
    });

    const reviewData = [
      { name: "5 Stars", value: reviewDistribution[5] },
      { name: "4 Stars", value: reviewDistribution[4] },
      { name: "3 Stars", value: reviewDistribution[3] },
      { name: "2 Stars", value: reviewDistribution[2] },
      { name: "1 Star", value: reviewDistribution[1] },
    ];
    setReviewDistributionData(reviewData);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setMessage({ type: "error", text: "File size should be less than 5MB" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    setLoading(true);
    try {
      const result = await groundOwnerService.uploadProfilePicture(file);
      setMessage({
        type: "success",
        text: "Profile picture updated successfully!",
      });
      // Refresh user profile data
      fetchOwnerData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to upload profile picture",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGround = async (groundId, groundName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${groundName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await groundOwnerService.deleteGround(groundId);
      setMessage({ type: "success", text: "Ground deleted successfully!" });
      // Refresh data to remove the deleted ground
      fetchOwnerData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to delete ground",
      });
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
          businessName: userProfile.profile?.businessName || "",
          businessAddress: userProfile.profile?.businessAddress || "",
          businessPhone: userProfile.profile?.businessPhone || "",
          businessEmail: userProfile.profile?.businessEmail || "",
          taxId: userProfile.profile?.taxId || "",
          bankDetails: {
            accountNumber:
              userProfile.profile?.bankDetails?.accountNumber || "",
            ifscCode: userProfile.profile?.bankDetails?.ifscCode || "",
            accountHolderName:
              userProfile.profile?.bankDetails?.accountHolderName || "",
          },
        },
      });
    }
    setMessage({ type: "", text: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Ground editing functions
  const handleStartEditGround = (ground) => {
    setEditingGround(ground.id || ground.groundId);
    setGroundEditForm({
      name: ground.name || "",
      description: ground.description || "",
      pricing: {
        weekdayPrice: ground.pricing?.weekdayPrice || "",
        weekendPrice: ground.pricing?.weekendPrice || "",
        currency: ground.pricing?.currency || "INR",
        perHour: ground.pricing?.perHour || false,
      },
      contact: {
        phone: ground.contact?.phone || "",
        email: ground.contact?.email || "",
      },
    });
  };

  const handleGroundEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("pricing.")) {
      const field = name.split(".")[1];
      setGroundEditForm((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setGroundEditForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else {
      setGroundEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveGroundEdit = async () => {
    if (!editingGround) return;

    setLoading(true);
    try {
      await groundOwnerService.updateGround(editingGround, groundEditForm);
      setMessage({ type: "success", text: "Ground updated successfully!" });
      setEditingGround(null);
      setGroundEditForm({
        name: "",
        description: "",
        pricing: {
          weekdayPrice: "",
          weekendPrice: "",
          currency: "INR",
          perHour: false,
        },
        contact: {
          phone: "",
          email: "",
        },
      });
      // Refresh data to show updated information
      fetchOwnerData();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update ground",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGroundEdit = () => {
    setEditingGround(null);
    setGroundEditForm({
      name: "",
      description: "",
      pricing: {
        weekdayPrice: "",
        weekendPrice: "",
        currency: "INR",
        perHour: false,
      },
      contact: {
        phone: "",
        email: "",
      },
    });
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
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Ground Owner Dashboard
        </h1>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : message.type === "error"
                ? "bg-red-100 text-red-700 border border-red-200"
                : message.type === "warning"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : message.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : message.type === "warning" ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {userProfile.profilePicture?.thumbnailUrl ? (
                    <img
                      src={userProfile.profilePicture.thumbnailUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {userProfile.profile?.businessName ||
                    userProfile.displayName ||
                    "Ground Owner"}
                </h3>
                <p className="text-sm text-gray-600">
                  {userProfile.profile?.businessPhone ||
                    userProfile.profile?.phoneNumber ||
                    "No phone number"}
                </p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Owner
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "dashboard"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView("grounds")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "grounds"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  My Grounds
                </button>
                <button
                  onClick={() => setActiveView("bookings")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "bookings"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Bookings
                </button>
                <button
                  onClick={() => setActiveView("reviews")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "reviews"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Star className="w-4 h-4 inline mr-2" />
                  Reviews
                </button>
                <button
                  onClick={() => setActiveView("finance")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "finance"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Finance
                </button>
                <button
                  onClick={() => setActiveView("edit")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "edit"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveView("timeslots")}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                    activeView === "timeslots"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time Slots
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Dashboard View */}
            {activeView === "dashboard" && (
              <div className="space-y-6">
                {loading && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
                      <span className="text-gray-600">
                        Loading dashboard data...
                      </span>
                    </div>
                  </div>
                )}
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Earnings
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(financialData.totalEarnings)}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +12.5% from last month
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Monthly Revenue
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(financialData.monthlyEarnings)}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +8.2% from last month
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Bookings
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {financialData.totalBookings}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-purple-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +15.3% from last month
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Average Rating
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {financialData.averageRating.toFixed(1)} (
                          {financialData.totalReviews})
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-yellow-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      +0.2 from last month
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                      <button
                        onClick={() => setActiveView("bookings")}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.groundName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.customerName} •{" "}
                              {formatDate(booking.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(booking.amount)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue Trend (Last 6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bookings Chart */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Bookings Trend (Last 6 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bookingsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="bookings"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ground Performance Chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ground Performance Comparison
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={groundPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="bookings"
                        fill="#8b5cf6"
                        name="Total Bookings"
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#f59e0b"
                        name="Monthly Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Review Distribution Chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Review Distribution
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={reviewDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reviewDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#10b981",
                                  "#3b82f6",
                                  "#f59e0b",
                                  "#ef4444",
                                  "#8b5cf6",
                                ][index]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">
                        Rating Breakdown
                      </h4>
                      {reviewDistributionData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: [
                                  "#10b981",
                                  "#3b82f6",
                                  "#f59e0b",
                                  "#ef4444",
                                  "#8b5cf6",
                                ][index],
                              }}
                            ></div>
                            <span className="text-sm text-gray-600">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grounds View */}
            {activeView === "grounds" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {loading && (
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
                      <span className="text-gray-600">
                        Loading grounds data...
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      My Grounds ({grounds.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                      <button
                        onClick={() => (window.location.href = "/add-ground")}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Ground
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {grounds.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No grounds found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {loading
                          ? "Loading your grounds..."
                          : "You haven't added any grounds yet, or there was an issue loading them. Start by adding your first ground or try refreshing."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={handleRefresh}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Data
                        </button>
                        <button
                          onClick={() => (window.location.href = "/add-ground")}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Ground
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {grounds.map((ground) => (
                        <div
                          key={ground.id || ground.groundId}
                          className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white"
                        >
                          {/* Ground Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {editingGround ===
                              (ground.id || ground.groundId) ? (
                                <input
                                  type="text"
                                  name="name"
                                  value={groundEditForm.name}
                                  onChange={handleGroundEditFormChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2 text-lg font-semibold"
                                  placeholder="Ground name"
                                />
                              ) : (
                                <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                                  {ground.name}
                                </h4>
                              )}
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {ground.location?.address?.city &&
                                  ground.location?.address?.state
                                    ? `${ground.location.address.city}, ${ground.location.address.state}`
                                    : ground.location?.address?.city ||
                                      ground.location?.address?.state ||
                                      "Location not specified"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                {ground.sport && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    {ground.sport}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    ground.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : ground.status === "maintenance"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : ground.status === "inactive"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {ground.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">
                                {ground.rating
                                  ? ground.rating.toFixed(1)
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          {/* Ground Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                              <p className="text-sm text-gray-600">
                                Total Bookings
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {ground.totalBookings || 0}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                              <p className="text-sm text-gray-600">
                                Monthly Revenue
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {ground.monthlyRevenue
                                  ? formatCurrency(ground.monthlyRevenue)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Additional Ground Info */}
                          {editingGround === (ground.id || ground.groundId) ? (
                            <div className="mb-4">
                              <textarea
                                name="description"
                                value={groundEditForm.description}
                                onChange={handleGroundEditFormChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Ground description"
                              />
                            </div>
                          ) : (
                            ground.description && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {ground.description}
                                </p>
                              </div>
                            )
                          )}

                          {/* Pricing Info */}
                          {editingGround === (ground.id || ground.groundId) ? (
                            <div className="mb-4 p-3 bg-blue-50 rounded-xl space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Weekday Price
                                  </label>
                                  <input
                                    type="number"
                                    name="pricing.weekdayPrice"
                                    value={groundEditForm.pricing.weekdayPrice}
                                    onChange={handleGroundEditFormChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Weekend Price
                                  </label>
                                  <input
                                    type="number"
                                    name="pricing.weekendPrice"
                                    value={groundEditForm.pricing.weekendPrice}
                                    onChange={handleGroundEditFormChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    name="pricing.perHour"
                                    checked={groundEditForm.pricing.perHour}
                                    onChange={handleGroundEditFormChange}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                  />
                                  <span className="text-xs text-gray-600">
                                    Per Hour
                                  </span>
                                </label>
                                <select
                                  name="pricing.currency"
                                  value={groundEditForm.pricing.currency}
                                  onChange={handleGroundEditFormChange}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                  <option value="INR">INR</option>
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
                                  <option value="GBP">GBP</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            ground.pricing && (
                              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Weekday:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {ground.pricing.weekdayPrice
                                      ? formatCurrency(
                                          ground.pricing.weekdayPrice
                                        )
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Weekend:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {ground.pricing.weekendPrice
                                      ? formatCurrency(
                                          ground.pricing.weekendPrice
                                        )
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            )
                          )}

                          {/* Contact Info */}
                          {editingGround === (ground.id || ground.groundId) && (
                            <div className="mb-4 p-3 bg-green-50 rounded-xl space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    name="contact.phone"
                                    value={groundEditForm.contact.phone}
                                    onChange={handleGroundEditFormChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Phone number"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    name="contact.email"
                                    value={groundEditForm.contact.email}
                                    onChange={handleGroundEditFormChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                    placeholder="Email address"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2 mb-3">
                            {editingGround ===
                            (ground.id || ground.groundId) ? (
                              <>
                                <button
                                  onClick={handleSaveGroundEdit}
                                  disabled={loading}
                                  className="flex-1 px-4 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                                >
                                  {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelGroundEdit}
                                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditGround(ground)}
                                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    (window.location.href = `/venue-details/${
                                      ground.groundId || ground.id
                                    }`)
                                  }
                                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteGround(
                                      ground.groundId || ground.id,
                                      ground.name
                                    )
                                  }
                                  className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                                  title="Delete ground"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Status Update */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <select
                              value={ground.status || "active"}
                              onChange={(e) =>
                                handleGroundStatusUpdate(
                                  ground.groundId || ground.id,
                                  e.target.value
                                )
                              }
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>

                          {/* Quick Stats */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                Created:{" "}
                                {ground.createdAt
                                  ? formatDate(ground.createdAt)
                                  : "N/A"}
                              </span>
                              <span>
                                Last Updated:{" "}
                                {ground.updatedAt
                                  ? formatDate(ground.updatedAt)
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings View */}
            {activeView === "bookings" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      All Bookings
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search bookings..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportData("bookings")}
                        className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                        title="Export bookings data"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {booking.groundName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.customerName} • {booking.sport}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(booking.amount)}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(booking.date)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {booking.time}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              // TODO: Implement booking details modal or navigation
                              alert(
                                `Booking ID: ${booking.id}\nGround: ${
                                  booking.groundName
                                }\nCustomer: ${
                                  booking.customerName
                                }\nAmount: ${formatCurrency(booking.amount)}`
                              );
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews View */}
            {activeView === "reviews" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Reviews
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                      <span className="text-sm text-gray-600">
                        Average Rating:
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-semibold">
                          {financialData.averageRating.toFixed(1)} (
                          {financialData.totalReviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {review.groundName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {review.customerName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatDate(review.date)}</span>
                          <button
                            onClick={() => {
                              const reply = prompt(
                                "Enter your reply to this review:"
                              );
                              if (reply && reply.trim()) {
                                handleReplyToReview(review.id, reply.trim());
                              }
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Finance View */}
            {activeView === "finance" && (
              <div className="space-y-6">
                {/* Financial Overview */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Financial Overview
                    </h3>
                    <button
                      onClick={handleMonthlyAnalyticsRefresh}
                      className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh Analytics
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                      <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Total Earnings
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(financialData.totalEarnings)}
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        {monthlyAnalytics.trends?.revenue
                          ? `${
                              monthlyAnalytics.trends.revenue > 0 ? "+" : ""
                            }${monthlyAnalytics.trends.revenue.toFixed(
                              1
                            )}% from last month`
                          : "Data loading..."}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                      <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Monthly Revenue
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(financialData.monthlyEarnings)}
                      </p>
                      <p className="text-sm text-blue-600 mt-2">
                        {monthlyAnalytics.currentMonth?.revenue
                          ? `₹${monthlyAnalytics.currentMonth.revenue.toLocaleString()} this month`
                          : "Data loading..."}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                      <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Total Bookings
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {financialData.totalBookings}
                      </p>
                      <p className="text-sm text-purple-600 mt-2">
                        {monthlyAnalytics.trends?.bookings
                          ? `${
                              monthlyAnalytics.trends.bookings > 0 ? "+" : ""
                            }${monthlyAnalytics.trends.bookings.toFixed(
                              1
                            )}% from last month`
                          : "Data loading..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Monthly Analytics Details */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Monthly Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Current Month
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-semibold">
                            {monthlyAnalytics.currentMonth?.revenue
                              ? formatCurrency(
                                  monthlyAnalytics.currentMonth.revenue
                                )
                              : "Loading..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-semibold">
                            {monthlyAnalytics.currentMonth?.bookings ||
                              "Loading..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Growth:</span>
                          <span
                            className={`font-semibold ${
                              monthlyAnalytics.currentMonth?.growth > 0
                                ? "text-green-600"
                                : monthlyAnalytics.currentMonth?.growth < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {monthlyAnalytics.currentMonth?.growth
                              ? `${
                                  monthlyAnalytics.currentMonth.growth > 0
                                    ? "+"
                                    : ""
                                }${monthlyAnalytics.currentMonth.growth.toFixed(
                                  1
                                )}%`
                              : "Loading..."}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Previous Month
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-semibold">
                            {monthlyAnalytics.previousMonth?.revenue
                              ? formatCurrency(
                                  monthlyAnalytics.previousMonth.revenue
                                )
                              : "Loading..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-semibold">
                            {monthlyAnalytics.previousMonth?.bookings ||
                              "Loading..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comparison:</span>
                          <span
                            className={`font-semibold ${
                              monthlyAnalytics.trends?.revenue > 0
                                ? "text-green-600"
                                : monthlyAnalytics.trends?.revenue < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {monthlyAnalytics.trends?.revenue
                              ? `${
                                  monthlyAnalytics.trends.revenue > 0 ? "+" : ""
                                }${monthlyAnalytics.trends.revenue.toFixed(1)}%`
                              : "Loading..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment History
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleExportData("financial")}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Download Statement
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.groundName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(booking.amount)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile View */}
            {activeView === "edit" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    Edit Profile
                  </h2>

                  {/* Profile Image Section */}
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {userProfile.profilePicture?.thumbnailUrl ? (
                        <img
                          src={userProfile.profilePicture.thumbnailUrl}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                        disabled={loading}
                      />
                      <span className="text-sm text-green-600 hover:text-green-700 transition-colors">
                        {loading ? "Uploading..." : "Change Profile Picture"}
                      </span>
                    </label>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Personal Information
                      </h3>
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
                      <div className="mt-4">
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
                    </div>

                    {/* Business Information */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name
                          </label>
                          <input
                            type="text"
                            name="profile.businessName"
                            value={formData.profile.businessName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter business name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Phone
                          </label>
                          <input
                            type="tel"
                            name="profile.businessPhone"
                            value={formData.profile.businessPhone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter business phone"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <textarea
                          name="profile.businessAddress"
                          value={formData.profile.businessAddress}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter business address"
                        />
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Bank Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            name="profile.bankDetails.accountHolderName"
                            value={
                              formData.profile.bankDetails.accountHolderName
                            }
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter account holder name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="profile.bankDetails.accountNumber"
                            value={formData.profile.bankDetails.accountNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter account number"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="profile.bankDetails.ifscCode"
                          value={formData.profile.bankDetails.ifscCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
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
            )}

            {/* Time Slot Management View */}
            {activeView === "timeslots" && (
              <div className="space-y-6">
                {/* Ground Selection */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Ground for Time Slot Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grounds.map((ground) => (
                      <button
                        key={ground.groundId}
                        onClick={() => handleGroundSelect(ground)}
                        className={`p-4 border rounded-xl text-left transition-all duration-300 ${
                          selectedGround?.groundId === ground.groundId
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <h4 className="font-medium text-gray-900 mb-2">
                          {ground.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {ground.location?.address?.city &&
                          ground.location?.address?.state
                            ? `${ground.location.address.city}, ${ground.location.address.state}`
                            : ground.location?.address?.city ||
                              ground.location?.address?.state ||
                              "Location not specified"}
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {ground.sport}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full ${
                              ground.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {ground.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Management */}
                {selectedGround && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Time Slot Management - {selectedGround.name}
                      </h3>
                      <button
                        onClick={() => setShowTimeSlotModal(true)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Block Time Slot
                      </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex space-x-2 mb-6">
                      <button
                        onClick={() => setTimeSlotView("calendar")}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          timeSlotView === "calendar"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <CalendarIcon className="w-4 h-4 inline mr-2" />
                        Calendar View
                      </button>
                      <button
                        onClick={() => setTimeSlotView("list")}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          timeSlotView === "list"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <List className="w-4 h-4 inline mr-2" />
                        List View
                      </button>
                    </div>

                    {/* Calendar View */}
                    {timeSlotView === "calendar" && (
                      <div className="grid grid-cols-7 gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (day) => (
                            <div
                              key={day}
                              className="text-center font-medium text-gray-600 p-2"
                            >
                              {day}
                            </div>
                          )
                        )}
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - date.getDay() + i);
                          const dayAvailability = groundAvailability.find(
                            (day) =>
                              day.date.toDateString() === date.toDateString()
                          );
                          const hasBlockedSlots = blockedTimeSlots.some(
                            (slot) =>
                              slot.date.toDateString() === date.toDateString()
                          );

                          return (
                            <div
                              key={i}
                              className={`p-2 border rounded-lg min-h-[80px] ${
                                dayAvailability?.isWorkingDay
                                  ? "bg-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div className="text-sm text-gray-600 mb-1">
                                {date.getDate()}
                              </div>
                              {hasBlockedSlots && (
                                <div className="w-2 h-2 bg-red-500 rounded-full mx-auto"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* List View */}
                    {timeSlotView === "list" && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          Blocked Time Slots
                        </h4>
                        {blockedTimeSlots.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">
                            No blocked time slots found
                          </p>
                        ) : (
                          blockedTimeSlots.map((slot) => (
                            <div
                              key={slot._id}
                              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(slot.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Reason: {slot.reason}
                                </p>
                              </div>
                              <button
                                onClick={() => handleUnblockTimeSlot(slot._id)}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Unblock
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Block Time Slot
              </h3>
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTimeSlotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ground
                </label>
                <select
                  value={timeSlotForm.groundId}
                  onChange={(e) =>
                    setTimeSlotForm({
                      ...timeSlotForm,
                      groundId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a ground</option>
                  {grounds.map((ground) => (
                    <option key={ground.groundId} value={ground.groundId}>
                      {ground.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={timeSlotForm.date}
                  onChange={(e) =>
                    setTimeSlotForm({ ...timeSlotForm, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={timeSlotForm.startTime}
                    onChange={(e) =>
                      setTimeSlotForm({
                        ...timeSlotForm,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={timeSlotForm.endTime}
                    onChange={(e) =>
                      setTimeSlotForm({
                        ...timeSlotForm,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={timeSlotForm.reason}
                  onChange={(e) =>
                    setTimeSlotForm({ ...timeSlotForm, reason: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Private Event">Private Event</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Weather">Weather</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={timeSlotForm.isRecurring}
                  onChange={(e) =>
                    setTimeSlotForm({
                      ...timeSlotForm,
                      isRecurring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-700">
                  Recurring block
                </label>
              </div>

              {timeSlotForm.isRecurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recurring Days
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <label
                            key={day}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={timeSlotForm.recurringDays.includes(
                                day.toLowerCase()
                              )}
                              onChange={(e) => {
                                const dayLower = day.toLowerCase();
                                if (e.target.checked) {
                                  setTimeSlotForm({
                                    ...timeSlotForm,
                                    recurringDays: [
                                      ...timeSlotForm.recurringDays,
                                      dayLower,
                                    ],
                                  });
                                } else {
                                  setTimeSlotForm({
                                    ...timeSlotForm,
                                    recurringDays:
                                      timeSlotForm.recurringDays.filter(
                                        (d) => d !== dayLower
                                      ),
                                  });
                                }
                              }}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">{day}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={timeSlotForm.endDate}
                      onChange={(e) =>
                        setTimeSlotForm({
                          ...timeSlotForm,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTimeSlotModal(false)}
                  className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 text-sm font-medium shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Blocking...
                    </>
                  ) : (
                    "Block Time Slot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOwner;
