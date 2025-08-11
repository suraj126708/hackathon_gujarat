import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AddReviews = ({ groundId, onReviewAdded, existingReviews = [] }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use the AuthContext instead of manual localStorage check
  const { user, loading } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Reset form when component mounts or groundId changes
  useEffect(() => {
    resetForm();
  }, [groundId]);

  const resetForm = () => {
    setFormData({
      rating: 0,
      title: "",
      content: "",
    });
    setErrors({});
    setShowSuccess(false);
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating) {
      newErrors.rating = "Please select a rating";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Review content is required";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Review content must be at least 10 characters";
    }

    if (formData.title.trim() && formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Double-check authentication before submitting
    if (!user) {
      setErrors({ submit: "Please log in to submit a review" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the current Firebase ID token
      const idToken = await user.getIdToken();
      if (!idToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          groundId,
          rating: formData.rating,
          title: formData.title.trim() || undefined,
          content: formData.content.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit review");
      }

      setShowSuccess(true);
      resetForm();
      setShowAddForm(false);

      // Call the callback to refresh reviews
      if (onReviewAdded) {
        onReviewAdded();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    size = "w-5 h-5",
    interactive = true,
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span className="font-medium">Review submitted successfully!</span>
          </div>
        </div>
      )}

      {/* Add Review Button */}
      {!showAddForm && (
        <div className="space-y-4">
          {user ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your Review
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Login Required
                </span>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                You need to be logged in to add a review for this venue.
              </p>
              <button
                onClick={() => {
                  // Redirect to login page or show login modal
                  window.location.href = "/login";
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Review Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Write Your Review
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <StarRating
                rating={formData.rating}
                onRatingChange={handleRatingChange}
              />
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Summarize your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Share your experience with this venue..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content && (
                  <p className="text-red-500 text-sm">{errors.content}</p>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.content.length}/1000
                </span>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddReviews;
