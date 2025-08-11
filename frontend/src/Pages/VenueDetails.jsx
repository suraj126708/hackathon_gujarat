import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import AddReviews from "../components/AddReviews";
import ReviewsSection from "../components/ReviewsSection";

// API base URL - adjust this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ImageCarousel = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden h-96 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  console.log("Image url : ", images[currentImage]?.url);

  return (
    <div className="relative bg-gray-100 rounded-2xl overflow-hidden h-96">
      <img
        src={
          images[currentImage]?.url ||
          images[currentImage]?.secureUrl ||
          images[currentImage]
        }
        alt="Venue"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />

      {/* Fallback for broken images */}
      <div
        className="absolute inset-0 bg-gray-100 flex items-center justify-center"
        style={{ display: "none" }}
      >
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p>Image not available</p>
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {currentImage + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

const PricingModal = ({
  isOpen,
  onClose,
  pricing,
  sportName = "Badminton",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{sportName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Pricing is subjected to change and is controlled by venue
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Standard Pricing</h4>

            <div className="space-y-3">
              {pricing?.weekdayPrice && (
                <div>
                  <div className="text-sm font-medium">Monday - Friday</div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">
                      {pricing.currency || "INR"} {pricing.weekdayPrice} / hour
                    </span>
                    <span className="text-sm text-gray-600">
                      {pricing.perHour ? "Per hour" : "Per session"}
                    </span>
                  </div>
                </div>
              )}

              {pricing?.weekendPrice && (
                <div>
                  <div className="text-sm font-medium">Saturday - Sunday</div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">
                      {pricing.currency || "INR"} {pricing.weekendPrice} / hour
                    </span>
                    <span className="text-sm text-gray-600">
                      {pricing.perHour ? "Per hour" : "Per session"}
                    </span>
                  </div>
                </div>
              )}

              {!pricing?.weekdayPrice && !pricing?.weekendPrice && (
                <div className="text-center py-4 text-gray-500">
                  <p>Pricing information not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VenueDetails = () => {
  const { groundId } = useParams();
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState("");

  const fetchVenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🔍 [VENUEDETAILS] Fetching venue data for groundId:",
        groundId
      );
      console.log(
        "🔍 [VENUEDETAILS] API URL:",
        `${API_BASE_URL}/grounds/${groundId}`
      );

      const response = await fetch(`${API_BASE_URL}/grounds/${groundId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Venue not found");
        } else if (response.status === 500) {
          throw new Error("Server error - please try again later");
        } else if (response.status === 0) {
          throw new Error("Network error - please check your connection");
        } else {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch venue data`
          );
        }
      }

      const result = await response.json();
      console.log("🔍 [VENUEDETAILS] API Response:", result);

      if (result.success) {
        // The API returns data in a nested structure: { ground, reviews, ratingStats }
        // We need to merge the ground data with reviews and stats
        const { ground, reviews, ratingStats } = result.data;

        // Check if ground data exists
        if (!ground) {
          throw new Error("Ground data not found in response");
        }

        // Merge the data for easier access in the component
        const mergedVenueData = {
          ...ground,
          reviews: reviews || [],
          stats: {
            totalBookings: ground?.stats?.totalBookings || 0,
            totalRevenue: ground?.stats?.totalRevenue || 0,
            averageRating:
              ratingStats?.averageRating || ground?.stats?.averageRating || 0,
            totalReviews:
              ratingStats?.totalReviews || ground?.stats?.totalReviews || 0,
            viewCount: ground?.stats?.viewCount || 0,
            favoriteCount: ground?.stats?.favoriteCount || 0,
          },
        };

        setVenueData(mergedVenueData);
        console.log(
          "🔍 [VENUEDETAILS] Merged venue data set:",
          mergedVenueData
        );
      } else {
        throw new Error(result.message || "Failed to fetch venue data");
      }
    } catch (err) {
      console.error("❌ [VENUEDETAILS] Error fetching venue data:", err);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Network error - please check if the backend server is running"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groundId) {
      fetchVenueData();
      // Also fetch reviews separately to ensure they're loaded
      fetchReviews();
    }
  }, [groundId]);

  // Function to fetch reviews separately
  const fetchReviews = async () => {
    try {
      console.log("🔍 [VENUEDETAILS] Fetching reviews for groundId:", groundId);
      const response = await fetch(
        `${API_BASE_URL}/reviews/ground/${groundId}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(
            "🔍 [VENUEDETAILS] Reviews fetched:",
            result.data.reviews
          );
          console.log(
            "🔍 [VENUEDETAILS] Reviews count:",
            result.data.reviews?.length || 0
          );
          console.log(
            "🔍 [VENUEDETAILS] Average rating:",
            result.data.averageRating
          );
          console.log(
            "🔍 [VENUEDETAILS] Total reviews:",
            result.data.totalReviews
          );

          setVenueData((prevData) => {
            const newData = {
              ...prevData,
              reviews: result.data.reviews || [],
              stats: {
                ...prevData.stats,
                totalReviews: result.data.totalReviews || 0,
                averageRating: result.data.averageRating || 0,
              },
            };
            console.log("🔍 [VENUEDETAILS] Updated venue data:", newData);
            return newData;
          });
        }
      } else {
        console.error(
          "❌ [VENUEDETAILS] Failed to fetch reviews:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("❌ [VENUEDETAILS] Error fetching reviews:", error);
    }
  };

  // Function to refresh reviews after a new review is added
  const handleReviewAdded = async () => {
    console.log("🔄 [VENUEDETAILS] Refreshing reviews after new review added");
    try {
      // Fetch only the reviews for this ground
      const response = await fetch(
        `${API_BASE_URL}/reviews/ground/${groundId}`
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log("🔄 [VENUEDETAILS] Reviews refresh response:", result);
          console.log(
            "🔄 [VENUEDETAILS] New reviews count:",
            result.data.reviews?.length || 0
          );

          // Update only the reviews part of venueData
          setVenueData((prevData) => {
            const newData = {
              ...prevData,
              reviews: result.data.reviews || [],
              stats: {
                ...prevData.stats,
                totalReviews: result.data.totalReviews || 0,
                averageRating: result.data.averageRating || 0,
              },
            };
            console.log(
              "🔄 [VENUEDETAILS] Updated venue data after review:",
              newData
            );
            return newData;
          });
          console.log("✅ [VENUEDETAILS] Reviews refreshed successfully");
        }
      } else {
        console.error(
          "❌ [VENUEDETAILS] Failed to refresh reviews:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("❌ [VENUEDETAILS] Error refreshing reviews:", error);
      // Fallback to full refresh if just reviews refresh fails
      fetchVenueData();
    }
  };

  const handleSportClick = (sport) => {
    setSelectedSport(sport);
    setShowPricing(true);
  };

  const formatAddress = (location) => {
    if (!location?.address) return "Address not available";

    const { street, city, state, postalCode, country } = location.address;
    return [street, city, state, postalCode, country]
      .filter(Boolean)
      .join(", ");
  };

  const formatTimings = (timings) => {
    if (!timings) return "Timings not available";

    const { openTime, closeTime, workingDays } = timings;
    if (!openTime || !closeTime) return "Timings not available";

    const days = workingDays?.length > 0 ? workingDays.join(", ") : "Daily";

    return `${openTime} - ${closeTime} (${days})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Venue
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchVenueData();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Venue Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The venue you're looking for doesn't exist or has been removed.
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Venue Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {venueData.name}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium">
                {venueData.stats && venueData.stats.averageRating
                  ? venueData.stats.averageRating.toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-sm">
                (
                {venueData.stats && venueData.stats.totalReviews
                  ? venueData.stats.totalReviews
                  : 0}{" "}
                reviews)
              </span>
            </div>
            <span>•</span>
            <span>{venueData.location?.city || "Location not specified"}</span>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="mb-12">
          <ImageCarousel images={venueData.images || []} />
        </div>

        {/* Venue Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Operating Hours</span>
            </div>
            <div className="text-lg font-semibold">
              {formatTimings(venueData.timings)}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="font-medium">Address</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {formatAddress(venueData.location)}
            </p>

            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-500">
              Location Map
            </div>
          </div>
        </div>

        {/* Sports Available */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">Sports Available</h2>
            <button
              onClick={() => setShowPricing(true)}
              className="text-sm text-gray-500 underline"
            >
              (Click on sports to view price chart)
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
            {venueData.sports && venueData.sports.length > 0 ? (
              venueData.sports.map((sport, index) => (
                <button
                  key={index}
                  onClick={() => handleSportClick(sport)}
                  className="border-2 rounded-lg p-4 text-center transition-colors border-gray-300 bg-white hover:border-green-500 cursor-pointer"
                >
                  <div className="text-2xl mb-2">
                    {sport === "Badminton"
                      ? "🏸"
                      : sport === "Table Tennis"
                      ? "🏓"
                      : sport === "Box Cricket"
                      ? "🏏"
                      : sport === "Football"
                      ? "⚽"
                      : sport === "Cricket"
                      ? "🏏"
                      : sport === "Tennis"
                      ? "🎾"
                      : "🏃"}
                  </div>
                  <div className="text-sm font-medium">{sport}</div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No sports information available</p>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venueData.amenities && venueData.amenities.length > 0 ? (
              venueData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm">{amenity}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No amenities information available</p>
              </div>
            )}
          </div>
        </div>

        {/* About Venue */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">About Venue</h2>
          <div className="space-y-3">
            {venueData.description ? (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{venueData.description}</span>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No description available</p>
              </div>
            )}
          </div>
        </div>

        {/* Player Reviews */}
        <div className="mb-12">
          <ReviewsSection
            groundId={groundId}
            reviews={venueData.reviews || []}
            onRefresh={handleReviewAdded}
          />
        </div>

        {/* Book Now Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ready to Book?
              </h2>
              <p className="text-gray-600 mb-6">
                Reserve your preferred time slot and court for an amazing sports
                experience.
              </p>
              <button
                onClick={() => navigate(`/book-court/${groundId}`)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Book Court Now
              </button>
            </div>
          </div>
        </div>

        {/* Add Review Section */}
        <div className="mb-12">
          <AddReviews groundId={groundId} onReviewAdded={handleReviewAdded} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="text-center text-gray-600">Footer</div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        pricing={venueData.pricing}
        sportName={selectedSport}
      />
    </div>
  );
};

export default VenueDetails;
