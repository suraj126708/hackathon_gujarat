import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Don't show navbar on auth pages
  const authPages = [
    "/login",
    "/register",
    "/otp-verification",
    "/register-success",
    "/reset-password",
  ];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  // Custom CSS for enhanced navbar effects
  const navbarStyles = `
    .floating-navbar {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.37),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    .floating-navbar:hover {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 
        0 12px 40px 0 rgba(31, 38, 135, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    
    .nav-link {
      position: relative;
      overflow: hidden;
    }
    
    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .nav-link:hover::before {
      left: 100%;
    }
    
    .brand-glow {
      text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
  `;

  return (
    <>
      <style>{navbarStyles}</style>
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="floating-navbar rounded-2xl transition-all duration-500 ease-out">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo/Brand */}
              <div className="flex-shrink-0">
                <Link
                  to="/"
                  className="text-2xl font-bold text-white hover:text-blue-200 transition-all duration-300 brand-glow"
                >
                  QuickCourt
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-2">
                  <Link
                    to="/"
                    className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === "/"
                        ? "text-white bg-white/20 shadow-lg"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md"
                    }`}
                  >
                    Home
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/venues"
                        className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          location.pathname === "/venues"
                            ? "text-white bg-white/20 shadow-lg"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md"
                        }`}
                      >
                        Venues
                      </Link>
                      <Link
                        to="/add-ground"
                        className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          location.pathname === "/add-ground"
                            ? "text-white bg-white/20 shadow-lg"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md"
                        }`}
                      >
                        Add Ground
                      </Link>
                      <Link
                        to="/profile"
                        className={`nav-link px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                          location.pathname === "/profile"
                            ? "text-white bg-white/20 shadow-lg"
                            : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md"
                        }`}
                      >
                        Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* User Menu / Auth Buttons */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white/90 font-medium">
                      Welcome, {user.email?.split("@")[0] || "User"}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500/80 hover:bg-red-600/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="nav-link text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-500/80 hover:bg-blue-600/90 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden absolute right-6 top-4">
            <button className="text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;