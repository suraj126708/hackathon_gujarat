import React, { useState, useEffect } from "react";
import {
  Star,
  Calendar,
  User,
  ThumbsUp,
  Flag,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ReviewsSection = ({ groundId, reviews = [], onRefresh }) => {
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Use AuthContext instead of localStorage
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    console.log("🔄 [ReviewsSection] Reviews prop changed:", reviews);
    console.log("🔄 [ReviewsSection] Reviews count:", reviews?.length || 0);
    setFilteredReviews(reviews);
    setCurrentPage(1);
  }, [reviews]);

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (selectedRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(selectedRating)
      );
    }

    // Sort reviews
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "mostHelpful":
        filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [reviews, selectedRating, sortBy]);

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      alert("Please login to mark reviews as helpful");
      return;
    }

    try {
      // Get the current Firebase ID token
      const idToken = await user.getIdToken();
      if (!idToken) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${reviewId}/helpful`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.ok) {
        // Refresh reviews to get updated helpful count
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error marking review helpful:", error);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!user) {
      alert("Please login to report reviews");
      return;
    }

    const reason = prompt("Please provide a reason for reporting this review:");
    if (!reason) return;

    try {
      // Get the current Firebase ID token
      const idToken = await user.getIdToken();
      if (!idToken) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/reviews/${reviewId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        alert("Review reported successfully");
      }
    } catch (error) {
      console.error("Error reporting review:", error);
    }
  };

  const StarRating = ({
    rating,
    size = "w-4 h-4",
    interactive = false,
    onRatingChange,
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange(star)}
          className={`${
            interactive ? "cursor-pointer" : "cursor-default"
          } transition-colors`}
          disabled={!interactive}
        >
          <Star
            className={`${size} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {review.user?.photoURL ? (
              <img
                src={review.user.photoURL}
                alt="User"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {review.user?.displayName || review.userName || "Anonymous"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date not available"}
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            <StarRating rating={review.rating} />
          </div>
          <span className="text-sm text-gray-600">{review.rating}/5</span>
        </div>
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 text-lg">{review.title}</h4>
      )}

      {/* Review Content */}
      <p className="text-gray-700 leading-relaxed">{review.content}</p>

      {/* Owner Reply */}
      {review.ownerReply && review.ownerReply.content && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Owner Response</span>
          </div>
          <p className="text-blue-800 text-sm">{review.ownerReply.content}</p>
          {review.ownerReply.repliedAt && (
            <div className="text-xs text-blue-600 mt-2">
              {new Date(review.ownerReply.repliedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleMarkHelpful(review.reviewId || review._id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful ({review.helpfulCount || 0})</span>
          </button>
          <button
            onClick={() => handleReportReview(review.reviewId || review._id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Debug logging to help troubleshoot
  console.log("ReviewsSection - Received reviews:", reviews);
  console.log("ReviewsSection - Filtered reviews:", filteredReviews);
  console.log("ReviewsSection - Current page reviews:", currentReviews);
  console.log("ReviewsSection - Reviews length:", reviews?.length || 0);
  console.log("ReviewsSection - First review:", reviews?.[0]);
  console.log("ReviewsSection - Reviews type:", typeof reviews);
  console.log("ReviewsSection - Is reviews array:", Array.isArray(reviews));
  console.log("ReviewsSection - Ground ID:", groundId);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600">
          Be the first to share your experience with this venue!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Player Reviews & Ratings
          </h2>
          <p className="text-gray-600 mt-1">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} • Average
            rating:{" "}
            {(
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            ).toFixed(1)}
            /5
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Filter & Sort Reviews</h3>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Rating
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", 5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedRating === rating
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {rating === "all" ? "All" : `${rating}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "highest", label: "Highest Rated" },
                { value: "lowest", label: "Lowest Rated" },
                { value: "mostHelpful", label: "Most Helpful" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === option.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {currentReviews.map((review) => (
          <ReviewCard key={review.reviewId || review._id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-green-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-600">
        Showing {indexOfFirstReview + 1}-
        {Math.min(indexOfLastReview, filteredReviews.length)} of{" "}
        {filteredReviews.length} reviews
        {selectedRating !== "all" && ` (filtered by ${selectedRating}★ rating)`}
      </div>
    </div>
  );
};

export default ReviewsSection;
