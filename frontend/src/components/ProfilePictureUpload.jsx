import React, { useState, useRef } from "react";
import { FaCamera, FaTrash, FaUser, FaSpinner } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const ProfilePictureUpload = ({ onUpdate, currentPicture = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();
  const { user, updateUser } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("/api/auth/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile picture updated successfully!");

        // Update local user state
        if (updateUser) {
          updateUser({
            ...user,
            profilePicture: data.data.profilePicture,
            photoURL: data.data.photoURL,
          });
        }

        // Call parent callback if provided
        if (onUpdate) {
          onUpdate(data.data);
        }
      } else {
        setError(data.message || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Network error. Please try again.");
    }

    setIsUploading(false);
  };

  const deleteProfilePicture = async () => {
    if (!currentPicture?.publicId) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/profile-picture", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile picture deleted successfully!");

        // Update local user state
        if (updateUser) {
          updateUser({
            ...user,
            profilePicture: data.data.profilePicture,
            photoURL: data.data.photoURL,
          });
        }

        // Call parent callback if provided
        if (onUpdate) {
          onUpdate(data.data);
        }
      } else {
        setError(data.message || "Failed to delete profile picture");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Network error. Please try again.");
    }

    setIsDeleting(false);
  };

  const getProfilePictureUrl = () => {
    if (currentPicture?.url) return currentPicture.url;
    if (currentPicture?.thumbnailUrl) return currentPicture.thumbnailUrl;
    return null;
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {getProfilePictureUrl() ? (
            <img
              src={getProfilePictureUrl()}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="p-3 bg-white rounded-full text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Change profile picture"
          >
            <FaCamera className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Button */}
        {getProfilePictureUrl() && (
          <button
            onClick={deleteProfilePicture}
            disabled={isDeleting}
            className="absolute -top-2 -right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            title="Remove profile picture"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
      >
        {isUploading ? (
          <>
            <FaSpinner className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <FaCamera className="w-4 h-4" />
            <span>Change Picture</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">{error}</div>
      )}
      {success && (
        <div className="text-green-600 text-sm text-center max-w-xs">
          {success}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center max-w-xs">
        Supported formats: JPG, PNG, GIF, WebP
        <br />
        Max size: 5MB
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
