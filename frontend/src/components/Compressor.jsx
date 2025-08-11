// components/Compressor.js
// This file contains all the admin dashboard components broken down into reusable sections

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  BarChart3,
  Building2,
  Calendar,
  Target,
  ArrowUpRight,
  Activity,
  User,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  X,
  CheckSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ============================================================================
// 1. STATS CARDS COMPONENT
// ============================================================================
export const StatsCards = ({ systemStats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 animate-pulse"
          >
            <div className="h-6 sm:h-8 bg-gray-200 rounded mb-3 sm:mb-4"></div>
            <div className="h-4 sm:h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: systemStats.totalUsers?.toLocaleString() || "0",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      growth: systemStats.userGrowth || 0,
      growthColor: "text-blue-600",
    },
    {
      title: "Facility Owners",
      value: systemStats.totalFacilityOwners?.toLocaleString() || "0",
      icon: Building2,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      growth: systemStats.facilityGrowth || 0,
      growthColor: "text-green-600",
    },
    {
      title: "Total Bookings",
      value: systemStats.totalBookings?.toLocaleString() || "0",
      icon: Calendar,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      growth: systemStats.bookingGrowth || 0,
      growthColor: "text-purple-600",
    },
    {
      title: "Active Courts",
      value: systemStats.totalActiveCourts?.toLocaleString() || "0",
      icon: Target,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      growth: systemStats.facilityGrowth || 0,
      growthColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`}
              />
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                {stat.growth > 0 ? "+" : ""}
                {stat.growth}%
              </div>
              <ArrowUpRight
                className={`w-4 h-4 ${
                  stat.growth > 0 ? stat.growthColor : "text-gray-400"
                }`}
              />
            </div>
          </div>
          <div className="mb-1">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stat.value}
            </div>
          </div>
          <div className="text-sm sm:text-base text-gray-600 font-medium">
            {stat.title}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 2. RECENT ACTIVITY COMPONENT
// ============================================================================
export const RecentActivity = ({ dashboardData, onRefresh }) => {
  const recentUsers = dashboardData.recentActivity?.newUsers || [];
  const activeUsers = dashboardData.recentActivity?.activeUsers || [];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600">
            Latest user registrations and activity
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="mt-3 sm:mt-0 inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* New Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">New Users</h4>
            <span className="text-xs text-gray-500">
              {recentUsers.length} recent
            </span>
          </div>
          <div className="space-y-2">
            {recentUsers.slice(0, 3).map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role} •{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : user.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Active Users</h4>
            <span className="text-xs text-gray-500">
              {activeUsers.length} active
            </span>
          </div>
          <div className="space-y-2">
            {activeUsers.slice(0, 3).map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last active:{" "}
                    {new Date(user.lastActiveAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. USER REGISTRATION CHART COMPONENT
// ============================================================================
export const UserRegistrationChart = ({ data }) => {
  const [hoveredData, setHoveredData] = useState(null);

  // Calculate total users and growth
  const totalUsers =
    data?.reduce((sum, item) => sum + (item.users || 0), 0) || 0;
  const currentMonth =
    data?.find(
      (item) =>
        item.month ===
        new Date().toLocaleDateString("en-US", { month: "short" })
    )?.users || 0;
  const previousMonth =
    data?.find(
      (item) =>
        item.month ===
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-US",
          { month: "short" }
        )
    )?.users || 0;
  const growthRate =
    previousMonth > 0
      ? (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1)
      : 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:rounded-2xl p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            User Registration Trends
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Total: {totalUsers}</span>
            <span
              className={`text-xs font-medium ${
                growthRate >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growthRate >= 0 ? "+" : ""}
              {growthRate}%
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Monthly user registration growth
        </p>
      </div>

      {hoveredData && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-900">
            <div className="font-medium">
              {hoveredData.month} {hoveredData.year}
            </div>
            <div className="text-blue-700">{hoveredData.users} new users</div>
          </div>
        </div>
      )}

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload[0]) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [value, "New Users"]}
              labelFormatter={(label) =>
                `${label} ${hoveredData?.year || new Date().getFullYear()}`
              }
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================================================
// 4. FACILITY APPROVAL CHART COMPONENT
// ============================================================================
export const FacilityApprovalChart = ({ data }) => {
  const [hoveredData, setHoveredData] = useState(null);

  // Calculate totals and approval rate
  const totalApproved =
    data?.reduce((sum, item) => sum + (item.approved || 0), 0) || 0;
  const totalRejected =
    data?.reduce((sum, item) => sum + (item.rejected || 0), 0) || 0;
  const approvalRate =
    totalApproved + totalRejected > 0
      ? ((totalApproved / (totalApproved + totalRejected)) * 100).toFixed(1)
      : 0;

  // Get current month data
  const currentMonth = data?.find(
    (item) =>
      item.month === new Date().toLocaleDateString("en-US", { month: "short" })
  );

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Facility Approval Trends
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Rate: {approvalRate}%</span>
            <span className="text-xs text-green-600 font-medium">
              {totalApproved} approved
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">Monthly facility approval rates</p>
      </div>

      {hoveredData && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-900">
            <div className="font-medium">
              {hoveredData.month} {hoveredData.year}
            </div>
            <div className="flex space-x-4 text-green-700">
              <span>✓ {hoveredData.approved} approved</span>
              <span>✗ {hoveredData.rejected} rejected</span>
            </div>
          </div>
        </div>
      )}

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload[0]) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value, name) => [
                value,
                name === "approved" ? "Approved" : "Rejected",
              ]}
              labelFormatter={(label) =>
                `${label} ${hoveredData?.year || new Date().getFullYear()}`
              }
            />
            <Legend />
            <Bar
              dataKey="approved"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Approved"
            />
            <Bar
              dataKey="rejected"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Rejected"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SportsPopularityChart = ({ data }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Sports Popularity
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="sport" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="facilities" fill="#6366f1" name="Facilities" />
        <Bar dataKey="bookings" fill="#10b981" name="Bookings" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const EarningsTrendChart = ({ data }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const BookingActivityChart = ({ data }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Booking Activity Over Time
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ============================================================================
// 6. USER MANAGEMENT COMPONENT
// ============================================================================
export const UserManagement = ({
  users,
  userFilters,
  setUserFilters,
  onRefresh,
  onUserRoleUpdate,
  onUserStatusUpdate,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              User Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={userFilters.role}
                  onChange={(e) =>
                    setUserFilters({ ...userFilters, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={userFilters.status}
                  onChange={(e) =>
                    setUserFilters({ ...userFilters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userFilters.search}
                  onChange={(e) =>
                    setUserFilters({ ...userFilters, search: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        onUserRoleUpdate(user._id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                        user.role
                      )} border-0 focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        onUserStatusUpdate(user._id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        user.status
                      )} border-0 focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUserRoleUpdate(user._id, "admin")}
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() =>
                          onUserStatusUpdate(user._id, "suspended")
                        }
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. FACILITY MANAGEMENT COMPONENT
// ============================================================================
export const FacilityManagement = ({
  facilities,
  facilityFilters,
  setFacilityFilters,
  onRefresh,
  onFacilityStatusUpdate,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Facility Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage sports facilities and their status
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={facilityFilters.status}
                  onChange={(e) =>
                    setFacilityFilters({
                      ...facilityFilters,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  value={facilityFilters.sport}
                  onChange={(e) =>
                    setFacilityFilters({
                      ...facilityFilters,
                      sport: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Sports</option>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                  <option value="cricket">Cricket</option>
                  <option value="badminton">Badminton</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={facilityFilters.search}
                  onChange={(e) =>
                    setFacilityFilters({
                      ...facilityFilters,
                      search: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sport
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facilities.map((facility) => (
                <tr key={facility._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {facility.name || "Unnamed Facility"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {facility.location || "Location not specified"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {facility.sport || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={facility.status}
                      onChange={(e) =>
                        onFacilityStatusUpdate(facility._id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        facility.status
                      )} border-0 focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {facility.owner?.displayName ||
                      facility.owner?.email ||
                      "Unknown"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          onFacilityStatusUpdate(facility._id, "active")
                        }
                        className="text-green-600 hover:text-green-900 text-xs"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() =>
                          onFacilityStatusUpdate(facility._id, "suspended")
                        }
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {facilities.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No facilities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 8. FACILITY APPROVALS COMPONENT
// ============================================================================
export const FacilityApprovals = ({
  pendingFacilities,
  onRefresh,
  onFacilityApproval,
}) => {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approved: true,
    reason: "",
    comments: "",
  });

  const handleApproval = (facility, approved) => {
    setSelectedFacility(facility);
    setApprovalData({ approved, reason: "", comments: "" });
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    if (selectedFacility) {
      onFacilityApproval(
        selectedFacility._id,
        approvalData.approved,
        approvalData.reason,
        approvalData.comments
      );
      setShowApprovalModal(false);
      setSelectedFacility(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Facility Approvals
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve pending facility submissions
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="mt-4 sm:mt-0 inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Facilities */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {pendingFacilities.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending facilities to approve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sport
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingFacilities.map((facility) => (
                  <tr key={facility._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {facility.name || "Unnamed Facility"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {facility.location || "Location not specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {facility.sport || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {facility.owner?.displayName ||
                        facility.owner?.email ||
                        "Unknown"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(facility.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(facility, true)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(facility, false)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {approvalData.approved ? "Approve" : "Reject"} Facility
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedFacility?.name || "Unnamed Facility"}
                </p>
              </div>

              {!approvalData.approved && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Rejection
                  </label>
                  <input
                    type="text"
                    value={approvalData.reason}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Enter reason for rejection"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  value={approvalData.comments}
                  onChange={(e) =>
                    setApprovalData({
                      ...approvalData,
                      comments: e.target.value,
                    })
                  }
                  placeholder="Additional comments..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  approvalData.approved
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {approvalData.approved ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. ANALYTICS SECTION COMPONENT
// ============================================================================
export const AnalyticsSection = ({
  sportsPopularityData,
  earningsTrendData,
  bookingActivityData,
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("monthly");
  const [selectedSport, setSelectedSport] = useState("all");

  // Debug logging
  console.log("AnalyticsSection received data:", {
    sportsPopularityData,
    earningsTrendData,
    bookingActivityData,
  });

  // Update timestamp when data changes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [sportsPopularityData, earningsTrendData, bookingActivityData]);

  // Calculate comprehensive summary statistics
  const totalSportsRevenue =
    sportsPopularityData?.reduce(
      (sum, sport) => sum + (sport.revenue || 0),
      0
    ) || 0;

  const totalBookings =
    sportsPopularityData?.reduce(
      (sum, sport) => sum + (sport.bookings || 0),
      0
    ) || 0;

  const totalFacilities = sportsPopularityData?.length || 0;

  const avgEarnings =
    earningsTrendData?.length > 0
      ? (
          earningsTrendData.reduce(
            (sum, month) => sum + (month.earnings || 0),
            0
          ) / earningsTrendData.length
        ).toFixed(0)
      : 0;

  // Calculate growth rates
  const currentMonthEarnings =
    earningsTrendData?.[earningsTrendData.length - 1]?.earnings || 0;
  const previousMonthEarnings =
    earningsTrendData?.[earningsTrendData.length - 2]?.earnings || 0;
  const earningsGrowth =
    previousMonthEarnings > 0
      ? (
          ((currentMonthEarnings - previousMonthEarnings) /
            previousMonthEarnings) *
          100
        ).toFixed(1)
      : 0;

  // Calculate top performing sport
  const topSport = sportsPopularityData?.reduce(
    (top, current) =>
      (current.bookings || 0) > (top.bookings || 0) ? current : top,
    { sport: "N/A", bookings: 0 }
  );

  // Calculate average booking value
  const avgBookingValue =
    totalBookings > 0 ? (totalSportsRevenue / totalBookings).toFixed(0) : 0;

  // Enhanced data processing for charts
  const processedSportsData =
    sportsPopularityData?.map((sport) => ({
      ...sport,
      sport: sport.sport || sport._id || "Unknown",
      bookings: sport.bookings || sport.totalBookings || 0,
      revenue: sport.revenue || sport.totalRevenue || 0,
      facilities: sport.facilities || 1,
      avgDuration: sport.avgDuration || 0,
      efficiency:
        sport.bookings > 0 ? (sport.revenue / sport.bookings).toFixed(0) : 0,
    })) || [];

  const processedEarningsData =
    earningsTrendData?.map((month) => ({
      ...month,
      month: month.month || month._id?.month || "Unknown",
      earnings: month.earnings || month.totalRevenue || 0,
      transactions: month.transactions || month.totalTransactions || 0,
      avgTransaction: month.avgTransaction || month.avgTransactionValue || 0,
    })) || [];

  // Handle refresh with loading state
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  // Check data status
  const hasSportsData = processedSportsData.length > 0;
  const hasEarningsData = processedEarningsData.length > 0;
  const hasBookingData = bookingActivityData && bookingActivityData.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              📊 Advanced Analytics Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time insights into platform performance & trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>

            {/* Sport Filter */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sports</option>
              {processedSportsData.map((sport) => (
                <option key={sport.sport} value={sport.sport}>
                  {sport.sport}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isRefreshing
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
            <div className="text-right">
              <div className="text-xs text-gray-500">Last updated</div>
              <div className="text-sm font-medium text-gray-900">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                  Total Revenue
                </div>
                <div className="text-xl font-bold text-blue-900 mt-1">
                  ₹{totalSportsRevenue.toLocaleString()}
                </div>
              </div>
              <div className="text-blue-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 font-medium uppercase tracking-wide">
                  Total Bookings
                </div>
                <div className="text-xl font-bold text-green-900 mt-1">
                  {totalBookings.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Across {totalFacilities} facilities
                </div>
              </div>
              <div className="text-green-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">
                  Avg Monthly
                </div>
                <div className="text-xl font-bold text-purple-900 mt-1">
                  ₹{avgEarnings}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    earningsGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {earningsGrowth >= 0 ? "↗" : "↘"} {Math.abs(earningsGrowth)}%
                  from last month
                </div>
              </div>
              <div className="text-purple-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">
                  Top Sport
                </div>
                <div className="text-xl font-bold text-orange-900 mt-1">
                  {topSport.sport}
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  ₹{avgBookingValue} avg per booking
                </div>
              </div>
              <div className="text-orange-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Enhanced Sports Popularity Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Sports Performance Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Multi-dimensional sports performance metrics
            </p>
          </div>
          <div className="h-64 sm:h-80">
            {hasSportsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedSportsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="sport"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "bookings"
                        ? `${value} bookings`
                        : name === "revenue"
                        ? `₹${value}`
                        : name === "facilities"
                        ? `${value} facilities`
                        : value,
                      name === "bookings"
                        ? "Bookings"
                        : name === "revenue"
                        ? "Revenue"
                        : name === "facilities"
                        ? "Facilities"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="bookings"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Bookings"
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a2 2 0 00-2-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    No sports data available
                  </p>
                  <p className="text-sm">
                    Data will appear here once bookings are made
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Earnings Trend Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Revenue & Transaction Trends
            </h3>
            <p className="text-sm text-gray-600">
              Multi-metric financial performance
            </p>
          </div>
          <div className="h-64 sm:h-80">
            {hasEarningsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "earnings"
                        ? `₹${value}`
                        : name === "transactions"
                        ? `${value} transactions`
                        : name === "avgTransaction"
                        ? `₹${value}`
                        : value,
                      name === "earnings"
                        ? "Revenue"
                        : name === "transactions"
                        ? "Transactions"
                        : name === "avgTransaction"
                        ? "Avg Transaction"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    name="Transactions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a2 2 0 00-2-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    No earnings data available
                  </p>
                  <p className="text-sm">
                    Revenue data will appear here once payments are processed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sports Efficiency Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Sports Efficiency Metrics
            </h3>
            <p className="text-sm text-gray-600">
              Revenue per booking and facility utilization
            </p>
          </div>
          <div className="h-64 sm:h-80">
            {hasSportsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedSportsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="sport"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "efficiency" ? `₹${value}` : `${value}`,
                      name === "efficiency"
                        ? "Revenue per Booking"
                        : "Facilities",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="efficiency"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Revenue per Booking"
                  />
                  <Bar
                    dataKey="facilities"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Facilities"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a2 2 0 00-2-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    No efficiency data available
                  </p>
                  <p className="text-sm">
                    Efficiency metrics will appear here once data is available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Volume Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Transaction Volume Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Monthly transaction counts and average values
            </p>
          </div>
          <div className="h-64 sm:h-80">
            {hasEarningsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "transactions"
                        ? `${value} transactions`
                        : name === "avgTransaction"
                        ? `₹${value}`
                        : value,
                      name === "transactions"
                        ? "Transaction Count"
                        : name === "avgTransaction"
                        ? "Avg Transaction Value"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                    name="Transaction Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgTransaction"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                    name="Avg Transaction Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a2 2 0 00-2-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg font-medium">
                    No transaction data available
                  </p>
                  <p className="text-sm">
                    Transaction data will appear here once available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Width Booking Activity Chart */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Booking Activity Patterns
          </h3>
          <p className="text-sm text-gray-600">
            Daily and weekly booking trends with revenue correlation
          </p>
        </div>
        <div className="h-64 sm:h-80">
          {hasBookingData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  yAxisId="left"
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value, name) => [
                    name === "bookings"
                      ? `${value} bookings`
                      : name === "revenue"
                      ? `₹${value}`
                      : value,
                    name === "bookings"
                      ? "Bookings"
                      : name === "revenue"
                      ? "Revenue"
                      : name,
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  name="Bookings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg font-medium">No booking data available</p>
                <p className="text-sm">
                  Booking patterns will appear here once users start making
                  reservations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Insights Panel */}
      {hasSportsData && hasEarningsData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            📈 Key Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Top Performer</h4>
              <p className="text-sm text-blue-700">
                <strong>{topSport.sport}</strong> leads with {topSport.bookings}{" "}
                bookings and ₹{topSport.revenue} revenue
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-medium text-green-900 mb-2">
                Growth Opportunity
              </h4>
              <p className="text-sm text-green-700">
                {earningsGrowth >= 0 ? "Revenue growing" : "Revenue declining"}{" "}
                by {Math.abs(earningsGrowth)}% month-over-month
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">Efficiency</h4>
              <p className="text-sm text-purple-700">
                Average booking value: ₹{avgBookingValue} across all sports
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 10. ADMIN PROFILE COMPONENT
// ============================================================================
export const AdminProfile = ({ userProfile }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Admin Profile
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your administrator account settings
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {userProfile.displayName || "Administrator"}
            </h3>
            <p className="text-sm text-gray-600">{userProfile.email}</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              <Shield className="w-4 h-4 mr-2" />
              Administrator
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userProfile.displayName || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={userProfile.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={userProfile.phone || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Account Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
              >
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
              >
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <input
                type="text"
                value={
                  userProfile.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : "Unknown"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Security Settings
        </h4>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">
                Two-Factor Authentication
              </h5>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <button className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              Enable 2FA
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Change Password</h5>
              <p className="text-sm text-gray-600">
                Update your account password regularly
              </p>
            </div>
            <button className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          Save Changes
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 11. MESSAGE DISPLAY COMPONENT
// ============================================================================
export const MessageDisplay = ({ message }) => {
  if (!message.text) return null;

  const getMessageStyles = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div
      className={`border rounded-xl p-3 sm:p-4 ${getMessageStyles(
        message.type
      )}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getMessageIcon(message.type)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm sm:text-base font-medium">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 12. LOADING SPINNER COMPONENT
// ============================================================================
export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-8 sm:py-12">
    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mb-4"></div>
    <p className="text-sm sm:text-base text-gray-600 font-medium">{text}</p>
  </div>
);

// ============================================================================
// 11. SIDEBAR NAVIGATION COMPONENT
// ============================================================================
export const AdminSidebar = ({
  userProfile,
  activeView,
  setActiveView,
  onRefresh,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    // { id: "facilities", label: "Facility Management", icon: Building2 },
    { id: "approvals", label: "Facility Approvals", icon: CheckSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: Shield },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-indigo-600 text-white p-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <BarChart3 className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {userProfile.displayName || "Admin"}
                </h3>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </div>
              </div>

              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                      if (
                        item.id === "users" ||
                        item.id === "facilities" ||
                        item.id === "approvals"
                      ) {
                        onRefresh();
                      }
                    }}
                    className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                      activeView === item.id
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 inline mr-2" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">
              {userProfile.displayName || "Admin"}
            </h3>
            <p className="text-sm text-gray-600">{userProfile.email}</p>
            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </div>
          </div>

          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  if (
                    item.id === "users" ||
                    item.id === "facilities" ||
                    item.id === "approvals"
                  ) {
                    onRefresh();
                  }
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300 ${
                  activeView === item.id
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4 inline mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 12. CHART DATA PREPARATION UTILITIES
// ============================================================================
export const prepareChartData = (sportsAnalytics, earningsAnalytics) => {
  // User registration trends (last 6 months)
  const registrationData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    registrationData.push({
      month: monthName,
      users: Math.floor(Math.random() * 50) + 20, // Mock data - replace with real data
      year: date.getFullYear(),
    });
  }

  // Facility approval trends
  const approvalData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    approvalData.push({
      month: monthName,
      approved: Math.floor(Math.random() * 15) + 5,
      rejected: Math.floor(Math.random() * 5) + 1,
      year: date.getFullYear(),
    });
  }

  // Booking activity data
  const bookingData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    bookingData.push({
      month: monthName,
      bookings: Math.floor(Math.random() * 200) + 100,
      year: date.getFullYear(),
    });
  }

  // Sports popularity data
  const sportsPopularityData = sportsAnalytics?.mostActiveSports || [];

  // Earnings trend data
  const earningsTrendData = earningsAnalytics?.monthlyTrend || [];

  return {
    registrationData,
    approvalData,
    bookingData,
    sportsPopularityData,
    earningsTrendData,
  };
};
