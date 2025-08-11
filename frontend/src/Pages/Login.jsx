/* eslint-disable no-unused-vars */
// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import ForgotPassword from "../components/ForgotPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate("/home");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to sign in");
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("🔄 Starting Google sign-in...");
      const result = await signInWithGoogle();
      console.log("✅ Google sign-in result:", result);

      if (result.success) {
        console.log("🎉 Google sign-in successful, navigating to home...");
        navigate("/home");
      } else {
        console.error("❌ Google sign-in failed:", result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error("💥 Google sign-in error:", error);
      setError("Failed to sign in with Google");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-green-50 via-white to-green-100">
      {/* Desktop Split Layout / Mobile Full Width */}
      <div className="min-h-screen flex">
        {/* Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12">
          {/* Back Button - Only on mobile */}
          <button
            onClick={() => navigate("/")}
            className="md:hidden absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

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
                LOGIN
              </h2>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white"
                      placeholder="Enter your password"
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
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
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
                      Signing in...
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 px-4 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                {loading ? "Signing in..." : "Continue with Google"}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="block mt-2 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View - Right side with image */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20"></div>
          <div className="relative z-10 text-center">
            <div className="w-96 h-80 bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🏀</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Welcome Back!
                </h3>
                <p className="text-green-700 text-lg">
                  Ready to hit the court?
                </p>
              </div>
            </div>
            <div className="text-green-700 text-sm max-w-md">
              <p>Access your account and continue your basketball journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={() => {
          setShowForgotPassword(false);
          // Optionally show a success message or redirect
        }}
      />
    </div>
  );
};

export default Login;
