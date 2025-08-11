import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

const ProfilePicture = ({
  user,
  size = "medium",
  className = "",
  showFallback = true,
  onClick = null,
  clickable = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size presets
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    medium: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    "2xl": "w-24 h-24",
    "3xl": "w-32 h-32",
    "4xl": "w-40 h-40",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const isClickable = clickable || onClick;

  // Get profile picture URL
  const getProfilePictureUrl = () => {
    if (user?.profilePicture?.url) return user.profilePicture.url;
    if (user?.profilePicture?.thumbnailUrl)
      return user.profilePicture.thumbnailUrl;
    if (user?.photoURL) return user.photoURL;
    return null;
  };

  const profilePictureUrl = getProfilePictureUrl();
  const hasImage = profilePictureUrl && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  return (
    <div
      className={`
        ${sizeClass} 
        rounded-full 
        overflow-hidden 
        bg-gray-200 
        flex-shrink-0
        ${
          isClickable
            ? "cursor-pointer hover:opacity-80 transition-opacity"
            : ""
        }
        ${className}
      `}
      onClick={handleClick}
    >
      {hasImage ? (
        <img
          src={profilePictureUrl}
          alt={`${user?.displayName || user?.email || "User"}'s profile`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : showFallback ? (
        <div className="w-full h-full flex items-center justify-center">
          <FaUser
            className={`text-gray-400 ${
              size === "xs" || size === "sm"
                ? "w-3 h-3"
                : size === "md" || size === "medium"
                ? "w-5 h-5"
                : size === "lg"
                ? "w-8 h-8"
                : size === "xl"
                ? "w-10 h-10"
                : size === "2xl"
                ? "w-12 h-12"
                : size === "3xl"
                ? "w-16 h-16"
                : "w-20 h-20"
            }`}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePicture;
