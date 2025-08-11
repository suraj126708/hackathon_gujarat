/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";

const VenueCard = ({ venue, onClick }) => {
  // Validate venue data
  if (!venue || !venue.name) {
    console.warn("⚠️ [VENUECARD] Invalid venue data:", venue);
    return null;
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(venue)}
    >
      <div className="bg-gray-100 h-32 flex items-center justify-center">
        {venue.images && venue.images.length > 0 && venue.images[0].url ? (
          <img
            src={
              venue.images.find((img) => img.isPrimary && img.url)?.url ||
              venue.images.find((img) => img.url)?.url ||
              venue.images[0].url
            }
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center"
          style={{
            display:
              venue.images && venue.images.length > 0 && venue.images[0].url
                ? "none"
                : "flex",
          }}
        >
          <span className="text-gray-500 text-sm">No Image</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{venue.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">
            {venue.stats?.averageRating
              ? venue.stats.averageRating.toFixed(1)
              : "N/A"}
          </span>
          <span className="text-sm text-gray-500">
            ({venue.stats?.totalReviews || 0})
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {venue.location?.address?.city}, {venue.location?.address?.state}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold text-green-600">
                ₹{venue.pricing?.weekdayPrice || "N/A"}
              </span>
              <span className="text-sm text-gray-500">weekday</span>
            </div>
            {venue.pricing?.weekendPrice &&
              venue.pricing.weekendPrice !== venue.pricing.weekdayPrice && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-orange-600">
                    ₹{venue.pricing.weekendPrice}
                  </span>
                  <span className="text-xs text-gray-500">weekend</span>
                </div>
              )}
            <span className="text-xs text-gray-500">per hour</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {venue.sports?.slice(0, 2).map((sport, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {sport}
            </span>
          ))}
          {venue.features?.covered && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              {venue.features.covered ? "Covered" : "Outdoor"}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
            {venue.status === "active" ? "Available" : venue.status}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(venue);
            }}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const Venues = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVenues, setTotalVenues] = useState(0);
  const venuesPerPage = 9;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCity, setSelectedCity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Available options
  const sportsOptions = [
    "all",
    "Football",
    "Basketball",
    "Tennis",
    "Cricket",
    "Volleyball",
    "Badminton",
    "Table Tennis",
    "Swimming",
    "Gym/Fitness",
    "Hockey",
  ];

  const cities = [
    "all",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Ahmedabad",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Jaipur",
    "Surat",
  ];

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4, label: "4+ stars" },
    { value: 3, label: "3+ stars" },
    { value: 2, label: "2+ stars" },
    { value: 1, label: "1+ stars" },
  ];

  // Fetch venues from backend
  useEffect(() => {
    console.log("🚀 [VENUES] Component mounted, fetching venues...");
    fetchVenues();
  }, [currentPage]);

  // Log when venues change
  useEffect(() => {
    console.log("📊 [VENUES] Venues state updated:", venues.length, "venues");
  }, [venues]);

  // Fetch venues when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        searchTerm.trim() ||
        selectedSport !== "all" ||
        selectedCity !== "all" ||
        priceRange < 10000 ||
        selectedRating > 0
      ) {
        setCurrentPage(1); // Reset to first page
        setFilterLoading(true);
        fetchVenues();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSport, selectedCity, priceRange, selectedRating]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchVenues();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters
  useEffect(() => {
    console.log("🔍 [FILTERS] Applying filters to venues:", venues);
    let filtered = [...venues];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          venue.location?.address?.city
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Sport filter
    if (selectedSport !== "all") {
      filtered = filtered.filter((venue) =>
        venue.sports?.some(
          (sport) => sport.toLowerCase() === selectedSport.toLowerCase()
        )
      );
    }

    // Price filter - show only venues within the selected price range
    filtered = filtered.filter((venue) => {
      const weekdayPrice = venue.pricing?.weekdayPrice || 0;
      const weekendPrice = venue.pricing?.weekendPrice || 0;
      const maxPrice = Math.max(weekdayPrice, weekendPrice);
      return maxPrice <= priceRange;
    });

    // Type filter (Indoor/Outdoor)
    if (selectedType !== "all") {
      filtered = filtered.filter((venue) => {
        if (selectedType === "Indoor") {
          return venue.features?.covered === true;
        } else if (selectedType === "Outdoor") {
          return venue.features?.covered === false;
        }
        return true;
      });
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(
        (venue) => (venue.stats?.averageRating || 0) >= selectedRating
      );
    }

    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter(
        (venue) => venue.location?.address?.city === selectedCity
      );
    }

    console.log("🔍 [FILTERS] Filtered results:", filtered);
    setFilteredVenues(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    venues,
    searchTerm,
    selectedSport,
    priceRange,
    selectedType,
    selectedRating,
    selectedCity,
  ]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("🌐 [VENUES] Using API URL:", apiUrl);

      const params = new URLSearchParams({
        page: currentPage,
        limit: venuesPerPage,
        status: "active",
      });

      // Add search query if provided
      if (searchTerm.trim()) {
        params.append("query", searchTerm.trim());
      }

      // Add sport filter
      if (selectedSport !== "all") {
        params.append("sport", selectedSport);
      }

      // Add city filter
      if (selectedCity !== "all") {
        params.append("city", selectedCity);
      }

      // Add price range filter
      if (priceRange < 10000) {
        params.append("priceRange", `0-${priceRange}`);
      }

      // Add rating filter
      if (selectedRating > 0) {
        params.append("rating", selectedRating);
      }

      let response;

      // Try search endpoint first if we have search parameters
      if (
        searchTerm.trim() ||
        selectedSport !== "all" ||
        selectedCity !== "all" ||
        priceRange < 10000 ||
        selectedRating > 0
      ) {
        try {
          response = await axios.get(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:5000"
            }/api/grounds/search/query?${params.toString()}`
          );
        } catch (searchError) {
          console.log(
            "Search endpoint failed, falling back to regular endpoint"
          );
          // Remove search-specific params for regular endpoint
          const regularParams = new URLSearchParams({
            page: currentPage,
            limit: venuesPerPage,
            status: "active",
          });
          response = await axios.get(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:5000"
            }/api/grounds?${regularParams.toString()}`
          );
        }
      } else {
        // Use regular grounds endpoint for no filters
        response = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/api/grounds?${params.toString()}`
        );
      }

      if (response.data.success) {
        const grounds = response.data.data.grounds || response.data.data;
        console.log("🏟️ [VENUES] Fetched grounds:", grounds);
        console.log("🏟️ [VENUES] Response structure:", response.data);

        // Debug individual venue structure
        if (grounds && grounds.length > 0) {
          console.log("🏟️ [VENUES] First venue structure:", grounds[0]);
          console.log("🏟️ [VENUES] First venue groundId:", grounds[0].groundId);
          console.log("🏟️ [VENUES] First venue _id:", grounds[0]._id);
        }

        setVenues(grounds);
        setFilteredVenues(grounds);

        // Handle pagination data
        if (response.data.data.pagination) {
          setTotalVenues(response.data.data.pagination.total);
          setTotalPages(response.data.data.pagination.totalPages);
        } else {
          setTotalVenues(grounds.length);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("❌ [VENUES] Error fetching venues:", error);
      console.error("❌ [VENUES] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setError("Failed to fetch venues. Please try again.");
      setVenues([]);
      setFilteredVenues([]);
      setTotalVenues(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // Handle venue click
  const handleVenueClick = (venue) => {
    console.log("🔍 [VENUES] Venue clicked:", venue);
    console.log("🔍 [VENUES] Venue groundId:", venue.groundId);
    console.log("🔍 [VENUES] Venue _id:", venue._id);
    const groundId = venue.groundId || venue._id;
    console.log("🔍 [VENUES] Navigating to:", `/venue-details/${groundId}`);
    navigate(`/venue-details/${groundId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSport("all");
    setPriceRange(10000);
    setSelectedType("all");
    setSelectedRating(0);
    setSelectedCity("all");
  };

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get current page venues
  const startIndex = (currentPage - 1) * venuesPerPage;
  const currentVenues = filteredVenues.slice(
    startIndex,
    startIndex + venuesPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`lg:w-64 bg-white border-r border-gray-200 min-h-screen p-6 transition-all duration-300 ${
            showFilters ? "w-full" : "w-full lg:w-64"
          }`}
        >
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Search by venue name
              </h3>
              <input
                type="text"
                placeholder="Search for venue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="border-t border-gray-200 pt-4"></div>

            {/* City Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Filter by city</h4>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === "all" ? "All Cities" : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Filter by sport type
              </h4>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sportsOptions.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport === "all" ? "All Sports" : sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Price range (per hour) - ₹{priceRange}
              </h4>
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>₹0</span>
                <span>₹10000</span>
              </div>
            </div>

            {/* Venue Type */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Choose Venue Type
              </h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="venueType"
                    value="all"
                    checked={selectedType === "all"}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-2"
                  />
                  All Types
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="venueType"
                    value="Indoor"
                    checked={selectedType === "Indoor"}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-2"
                  />
                  Indoor
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="venueType"
                    value="Outdoor"
                    checked={selectedType === "Outdoor"}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mr-2"
                  />
                  Outdoor
                </label>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
              <div className="space-y-2">
                {ratingOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={option.value}
                      checked={selectedRating === option.value}
                      onChange={(e) =>
                        setSelectedRating(parseInt(e.target.value))
                      }
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchVenues}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Refresh Results
                </>
              )}
            </button>

            {/* Results Count */}
            <div className="text-sm text-gray-600 text-center">
              {filteredVenues.length} of {totalVenues} venues found
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header with Filter Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Sports Venues: Discover and Book Nearby Venues
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Loading State */}
          {filterLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-center">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Applying filters...
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading venues...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredVenues.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Venues Grid */}
          {!loading && !error && filteredVenues.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentVenues
                  .filter((venue) => venue && venue.name) // Filter out invalid venues
                  .map((venue) => (
                    <VenueCard
                      key={venue.groundId || venue._id}
                      venue={venue}
                      onClick={handleVenueClick}
                    />
                  ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Show first few pages */}
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-green-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  {/* Show ellipsis if there are more pages */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="text-gray-400">...</span>
                  )}

                  {/* Show last few pages */}
                  {totalPages > 5 && currentPage >= totalPages - 2 && (
                    <>
                      {Array.from({ length: 3 }, (_, index) => {
                        const page = totalPages - 2 + index;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-green-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </>
                  )}

                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Venues;
