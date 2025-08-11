/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phoneNumber, email, userType, fullName } = location.state || {};

  const handleContinue = () => {
    navigate("/home");
  };

  const handleLogin = () => {
    navigate("/login");
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
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Welcome Aboard!
                </h3>
                <p className="text-green-700 text-lg">Your account is ready</p>
              </div>
            </div>
            <div className="text-green-700 text-sm max-w-md">
              <p>
                Start exploring QuickCourt and connect with the basketball
                community
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-white text-2xl">🏀</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                QUICKCOURT
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                REGISTRATION SUCCESSFUL
              </h2>
            </div>

            {/* Success Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              {/* Success Icon */}
              <div className="text-center mb-6">
                <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Account Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Welcome to QuickCourt, {fullName || "Player"}!
                </p>
              </div>

              {/* Account Details */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Account Details:
                </h4>
                <div className="space-y-2 text-sm text-black">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {fullName || "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Type:</span>
                    <span className="font-medium">{userType}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <button
                  onClick={handleLogin}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-2xl font-medium transition-all duration-200"
                >
                  Go to Login
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  You can now log in with your email and password on any device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess;
