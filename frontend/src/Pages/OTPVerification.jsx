/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber, email, fullName, password } = location.state || {};
  const { signUp } = useAuth();

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }

    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify OTP with backend
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL ||
          "https://hackathon-gujarat.onrender.com/api"
        }/otp/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otpString,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // OTP verified successfully, now create the user account
        const signUpResult = await signUp(email, password, fullName);

        if (signUpResult.success) {
          // If there's a profile picture, upload it
          if (location.state?.profilePicture) {
            try {
              const formData = new FormData();
              formData.append("profilePicture", location.state.profilePicture);

              // Get the user's ID token for authentication
              const idToken = await signUpResult.user.getIdToken();

              const uploadResponse = await fetch(
                `${
                  import.meta.env.VITE_API_BASE_URL ||
                  "https://hackathon-gujarat.onrender.com/api"
                }/images/upload-profile`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${idToken}`,
                  },
                  body: formData,
                }
              );

              if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                console.log("Profile picture uploaded:", uploadResult);
              }
            } catch (uploadError) {
              console.error("Profile picture upload failed:", uploadError);
              // Don't fail the registration if image upload fails
            }
          }

          // Navigate to success page
          navigate("/register-success", {
            state: {
              phoneNumber,
              email,
              fullName,
            },
          });
        } else {
          if (signUpResult.error.includes("email-already-in-use")) {
            setError("An account with this email already exists");
          } else {
            setError(signUpResult.error);
          }
        }
      } else {
        setError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
      console.error("OTP verification error:", err);
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");

    try {
      // Call backend to resend OTP
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL ||
          "https://hackathon-gujarat.onrender.com/api"
        }/otp/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Reset countdown
        setCountdown(30);
        setCanResend(false);

        // Clear OTP fields
        setOtp(["", "", "", "", "", ""]);

        // Focus first input
        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();

        // Show success message
        setError(""); // Clear any previous errors
      } else {
        setError(result.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
      console.error("Resend OTP error:", err);
    }

    setLoading(false);
  };

  const handleEditEmail = () => {
    navigate("/register", {
      state: {
        phoneNumber,
        email,
        fullName,
        password,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="min-h-screen flex">
        {/* Desktop View - Left side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20"></div>
          <div className="relative z-10 text-center">
            <div className="w-96 h-80 bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Secure Verification
                </h3>
                <p className="text-green-700 text-lg">
                  Your security is our priority
                </p>
              </div>
            </div>
            <div className="text-green-700 text-sm max-w-md">
              <p>Enter the code sent to your email to complete registration</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate("/register")}
            className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-black text-2xl">🏀</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                QUICKCOURT
              </h1>
              <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                <FaLock className="w-4 h-4 mr-2" />
                VERIFY YOUR EMAIL
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Phone Number Display */}
              <div className="text-center mb-6">
                <p className="text-sm text-green-600">
                  We've sent a code to your email:{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              </div>

              {/* OTP Input Fields */}
              <div className="mb-8">
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-black text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      placeholder=""
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-2xl font-semibold border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
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
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              {/* Assistance Links */}
              <div className="text-center space-y-3">
                <button
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                  className={`block w-full text-sm transition-colors ${
                    canResend
                      ? "text-blue-600 hover:text-blue-700 font-medium"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canResend
                    ? "Didn't receive the code? Resend OTP"
                    : `Resend OTP in ${countdown}s`}
                </button>

                <button
                  onClick={handleEditEmail}
                  className="block w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Wrong email address? Edit Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
