import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const MyGrounds = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGrounds, setTotalGrounds] = useState(0);

  useEffect(() => {
    if (user && token) {
      fetchGrounds();
    }
  }, [user, token, currentPage]);

  const fetchGrounds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/grounds/owner/my-grounds?page=${currentPage}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setGrounds(response.data.data.grounds);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalGrounds(response.data.data.pagination.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch grounds");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (groundId, newStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/grounds/${groundId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the ground status in the local state
        setGrounds((prev) =>
          prev.map((ground) =>
            ground.groundId === groundId
              ? { ...ground, status: newStatus }
              : ground
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ground status");
    }
  };

  const handleDeleteGround = async (groundId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ground? This action cannot be undone."
      )
    ) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/grounds/${groundId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Remove the ground from the local state
          setGrounds((prev) =>
            prev.filter((ground) => ground.groundId !== groundId)
          );
          setTotalGrounds((prev) => prev - 1);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete ground");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-500" },
      active: { label: "Active", className: "bg-green-500" },
      inactive: { label: "Inactive", className: "bg-gray-500" },
      suspended: { label: "Suspended", className: "bg-red-500" },
      under_review: { label: "Under Review", className: "bg-purple-500" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`${config.className} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}
      >
        {config.label}
      </span>
    );
  };

  const formatPrice = (price, currency = "USD") => {
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      AED: "د.إ",
    };
    return `${currencySymbols[currency] || "$"}${price}`;
  };

  const formatAddress = (location) => {
    const { address } = location;
    return `${address.city}, ${address.state}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 pb-8 border-b-2 border-gray-100">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Grounds</h1>
          <p className="text-lg text-gray-600">
            Manage your playground listings and monitor their performance
          </p>
        </div>
        <button
          onClick={() => navigate("/add-ground")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add New Ground
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-medium mb-2 opacity-90">Total Grounds</h3>
          <p className="text-4xl font-bold">{totalGrounds}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-medium mb-2 opacity-90">
            Active Grounds
          </h3>
          <p className="text-4xl font-bold">
            {grounds.filter((g) => g.status === "active").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
          <h3 className="text-lg font-medium mb-2 opacity-90">
            Pending Review
          </h3>
          <p className="text-4xl font-bold">
            {grounds.filter((g) => g.status === "pending").length}
          </p>
        </div>
      </div>

      {grounds.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Grounds Yet
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              You haven't added any playgrounds yet. Start by adding your first
              ground!
            </p>
            <button
              onClick={() => navigate("/add-ground")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Add Your First Ground
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {grounds.map((ground) => (
              <div
                key={ground.groundId}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  {ground.images && ground.images.length > 0 ? (
                    <img
                      src={
                        ground.images.find((img) => img.isPrimary)?.url ||
                        ground.images[0].url
                      }
                      alt={ground.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-gray-500 text-lg">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(ground.status)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {ground.name}
                  </h3>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    <span>📍</span>
                    {formatAddress(ground.location)}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Surface:
                      </span>
                      <span className="text-gray-900">
                        {ground.dimensions?.length && ground.dimensions?.width
                          ? `${ground.dimensions.length}m × ${ground.dimensions.width}m`
                          : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Price:
                      </span>
                      <span className="text-gray-900">
                        {formatPrice(
                          ground.pricing?.weekdayPrice,
                          ground.pricing?.currency
                        )}
                        /hr
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-700">
                        Sports:
                      </span>
                      <span className="text-gray-900">
                        {ground.sports?.length || 0} available
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <span className="block text-sm text-gray-600 font-medium mb-1">
                        Views
                      </span>
                      <span className="block text-lg font-semibold text-gray-900">
                        {ground.stats?.viewCount || 0}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-sm text-gray-600 font-medium mb-1">
                        Rating
                      </span>
                      <span className="block text-lg font-semibold text-gray-900">
                        {ground.stats?.averageRating
                          ? `${ground.stats.averageRating}/5`
                          : "No ratings"}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-sm text-gray-600 font-medium mb-1">
                        Reviews
                      </span>
                      <span className="block text-lg font-semibold text-gray-900">
                        {ground.stats?.totalReviews || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() =>
                        navigate(`/edit-ground/${ground.groundId}`)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/ground/${ground.groundId}`)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/ground/${ground.groundId}/stats`)
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Stats
                    </button>
                    <button
                      onClick={() => handleDeleteGround(ground.groundId)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-4">
                    <select
                      value={ground.status}
                      onChange={(e) =>
                        handleStatusChange(ground.groundId, e.target.value)
                      }
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="under_review">Under Review</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-3 border-2 rounded-lg font-semibold transition-all duration-200 min-w-[45px] ${
                        currentPage === page
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-6 py-3 border-2 border-gray-200 bg-white text-gray-700 rounded-lg font-semibold transition-all duration-200 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyGrounds;
