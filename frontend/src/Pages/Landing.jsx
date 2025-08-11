import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Calendar,
  Star,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const heroImages = [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Custom CSS for animations
  const customStyles = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes floatDelayed {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    .animate-slide-in-up {
      animation: slideInUp 0.6s ease-out forwards;
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-float-delayed {
      animation: floatDelayed 3s ease-in-out infinite;
      animation-delay: 1s;
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-slide-in-up,
      .animate-fade-in-up,
      .animate-float,
      .animate-float-delayed {
        animation: none;
      }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          {/* Background Images */}
          <div className="absolute inset-0 z-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-20" : "opacity-0"
                }`}
              >
                <img
                  src={image}
                  alt={`Sports background ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-green-600/30"></div>
          </div>
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-green-500/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          </div>{" "}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div
                className={`transform transition-all duration-1000 ${
                  isLoaded
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-10 opacity-0"
                }`}
              >
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-4">
                    <Zap className="w-4 h-4 mr-2" />
                    Find Players & Venues Nearby
                  </span>
                </div>

                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  YOUR ONE STOP
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block">
                    PLATFORM
                  </span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Seamlessly explore sports venues and play with sports
                  enthusiasts just like you! Book courts, find players, and
                  elevate your game.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={() => navigate("/venues")}
                    className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                  >
                    Book Venues
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => navigate("/auth")}
                    className="group bg-white text-gray-800 border-2 border-gray-200 hover:border-green-500 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                  >
                    Discover Games
                    <Users className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-600">Active Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      1000+
                    </div>
                    <div className="text-sm text-gray-600">Venues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">15+</div>
                    <div className="text-sm text-gray-600">Sports</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Floating Cards */}
              <div
                className={`relative transform transition-all duration-1000 delay-300 ${
                  isLoaded
                    ? "translate-x-0 opacity-100"
                    : "translate-x-10 opacity-0"
                }`}
              >
                <div className="relative h-96">
                  {/* Floating Court Card */}
                  <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-float">
                    <img
                      src="https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Basketball Court"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Elite Basketball Court
                      </h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Downtown Sports Complex
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-semibold">
                        ₹500/hour
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Available Now
                      </span>
                    </div>
                  </div>

                  {/* Floating Player Card */}
                  <div className="absolute bottom-0 left-0 bg-white rounded-2xl shadow-2xl p-6 w-72 animate-float-delayed">
                    <div className="flex items-center mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                        alt="Player"
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Raj Kumar
                        </h4>
                        <p className="text-sm text-gray-600">⭐ 4.9 Rating</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-800 font-medium">
                        Looking for Badminton Partner
                      </p>
                      <p className="text-xs text-blue-600">
                        Today, 6:00 PM • HSR Layout
                      </p>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Join Game
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Sports Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Popular Sports
              </h2>
              <p className="text-xl text-gray-600">
                Discover the sports you love
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                {
                  icon: "🏸",
                  name: "Badminton",
                  image:
                    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-red-500 to-pink-500",
                },
                {
                  icon: "⚽",
                  name: "Football",
                  image:
                    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: "🏏",
                  name: "Cricket",
                  image:
                    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: "🏊‍♂️",
                  name: "Swimming",
                  image:
                    "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-blue-400 to-blue-600",
                },
                {
                  icon: "🎾",
                  name: "Tennis",
                  image:
                    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  icon: "🏓",
                  name: "Table Tennis",
                  image:
                    "https://images.unsplash.com/photo-1571816119107-07542b3d73dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
                  color: "from-purple-500 to-indigo-500",
                },
              ].map((sport, index) => (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden ${
                    isLoaded ? "animate-slide-in-up" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${sport.color} opacity-60`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{sport.icon}</span>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-semibold text-gray-900">{sport.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose QuickCourt?
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need for the perfect game
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <MapPin className="w-8 h-8" />,
                  title: "Find Local Courts",
                  description:
                    "Discover courts near you with real-time availability",
                  color: "text-green-600",
                  bgColor: "bg-green-100",
                },
                {
                  icon: <Calendar className="w-8 h-8" />,
                  title: "Instant Booking",
                  description:
                    "Book courts instantly with our seamless booking system",
                  color: "text-blue-600",
                  bgColor: "bg-blue-100",
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Find Players",
                  description:
                    "Connect with players of your skill level nearby",
                  color: "text-purple-600",
                  bgColor: "bg-purple-100",
                },
                {
                  icon: <Trophy className="w-8 h-8" />,
                  title: "Track Progress",
                  description: "Monitor your games and improve your skills",
                  color: "text-orange-600",
                  bgColor: "bg-orange-100",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    isLoaded ? "animate-fade-in-up" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div
                    className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className={feature.color}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Players Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of satisfied players
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Arjun Sharma",
                  role: "Cricket Enthusiast",
                  image:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                  text: "QuickCourt made it so easy to find quality cricket grounds. The booking process is seamless!",
                },
                {
                  name: "Priya Patel",
                  role: "Badminton Player",
                  image:
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                  text: "I've found amazing badminton partners through this platform. The community is fantastic!",
                },
                {
                  name: "Rohit Kumar",
                  role: "Football Coach",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                  text: "As a coach, I love how easy it is to book grounds for my team. Highly recommended!",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-3xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Sports background"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-5xl font-bold mb-6">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-xl mb-10 opacity-90 leading-relaxed">
              Join thousands of players who trust QuickCourt for their sports
              booking needs. Start your journey today and discover the joy of
              seamless sports experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-6 h-6" />
              </button>
              <button
                onClick={() => navigate("/venues")}
                className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center"
              >
                Explore Venues
                <Target className="ml-2 w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">Q</span>
                  </div>
                  <span className="text-xl font-bold">QuickCourt</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Your one-stop platform for booking sports venues and
                  connecting with players.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Find Venues
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Join Games
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Sports</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Badminton
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Football
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Cricket
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Tennis
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>
                &copy; 2025 QuickCourt. All rights reserved. | Book smarter,
                play better.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
