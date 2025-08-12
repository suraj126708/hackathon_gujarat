import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
      minLength,
      hasLowercase,
      hasUppercase,
      hasNumber,
      isValid: minLength && hasLowercase && hasUppercase && hasNumber,
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValidation.isValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://hackathon-gujarat.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
            <FaTimesCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="min-h-screen flex">
        {/* Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12">
          {/* Back Button */}
          <button
            onClick={handleBackToLogin}
            className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </button>

          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-white text-2xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                QUICKCOURT
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Reset Password
              </h2>
            </div>

            {!success ? (
              /* Reset Password Form */
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        Password Requirements:
                      </p>
                      <div className="space-y-1">
                        <div
                          className={`flex items-center text-xs ${
                            passwordValidation.minLength
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <FaCheckCircle
                            className={`w-3 h-3 mr-2 ${
                              passwordValidation.minLength
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          At least 6 characters
                        </div>
                        <div
                          className={`flex items-center text-xs ${
                            passwordValidation.hasLowercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <FaCheckCircle
                            className={`w-3 h-3 mr-2 ${
                              passwordValidation.hasLowercase
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          One lowercase letter
                        </div>
                        <div
                          className={`flex items-center text-xs ${
                            passwordValidation.hasUppercase
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <FaCheckCircle
                            className={`w-3 h-3 mr-2 ${
                              passwordValidation.hasUppercase
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          One uppercase letter
                        </div>
                        <div
                          className={`flex items-center text-xs ${
                            passwordValidation.hasNumber
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <FaCheckCircle
                            className={`w-3 h-3 mr-2 ${
                              passwordValidation.hasNumber
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          One number
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="w-5 h-5" />
                        ) : (
                          <FaEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !passwordValidation.isValid ||
                      newPassword !== confirmPassword
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Resetting...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                  <FaCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your password has been successfully reset. You can now log in
                  with your new password.
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Continue to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop View - Right side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20"></div>
          <div className="relative z-10 text-center">
            <div className="w-96 h-80 bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Reset Your Password
                </h3>
                <p className="text-green-700 text-lg">
                  Choose a strong, secure password
                </p>
              </div>
            </div>
            <div className="text-green-700 text-sm max-w-md">
              <p>Create a new password that you'll remember and keep secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
