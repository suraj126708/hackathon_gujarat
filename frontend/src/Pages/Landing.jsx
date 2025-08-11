import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Users, Calendar } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QuickCourt</span>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              {/* Image placeholder - Hidden on mobile, shown on desktop as per mockup */}
              <div className="hidden md:block w-80 h-64 bg-gray-100 border-2 border-gray-300 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                <span className="text-gray-500 text-lg font-medium">IMAGE</span>
              </div>

              <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white text-4xl">🏀</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to <span className="text-green-600">QuickCourt</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Your one-stop solution for booking local sports courts. Find,
                book, and play at the best courts in your area.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center mx-auto"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Local Courts
              </h3>
              <p className="text-gray-600">
                Find sports courts near your location
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Booking
              </h3>
              <p className="text-gray-600">
                Book courts instantly with real-time availability
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Flexible Hours
              </h3>
              <p className="text-gray-600">24/7 booking for your convenience</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Community
              </h3>
              <p className="text-gray-600">
                Connect with local sports enthusiasts
              </p>
            </div>
          </div>

          {/* Sports Categories */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Popular Sports
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: "🏀", name: "Basketball" },
                { icon: "🎾", name: "Tennis" },
                { icon: "⚽", name: "Football" },
                { icon: "🏐", name: "Volleyball" },
                { icon: "🏸", name: "Badminton" },
                { icon: "🏓", name: "Table Tennis" },
              ].map((sport, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <div className="text-4xl mb-2">{sport.icon}</div>
                  <p className="font-medium text-gray-900">{sport.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of players who trust QuickCourt for their sports
              booking needs
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Booking Now
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-50 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <span className="text-lg font-bold text-gray-900">QuickCourt</span>
          </div>
          <p className="text-gray-600">
            © 2024 QuickCourt. All rights reserved. | Book smarter, play better.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
