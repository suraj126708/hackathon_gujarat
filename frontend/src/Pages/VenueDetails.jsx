/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  User,
} from "lucide-react";

const venueData = {
  id: 1,
  name: "SBR Badminton",
  rating: 4.5,
  reviews: 6,
  location: "Satellite, Jodhpur Village",
  address:
    "2nd Floor, Anagan Banquet Hall Opp. Akruti Heights, Satellite, Jodhpur Village, Ahmedabad, Gujarat - 380015",
  operatingHours: "7:00AM - 11:00PM",
  images: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
  ],
  sportsAvailable: [
    { name: "Badminton", icon: "🏸", active: true },
    { name: "Table Tennis", icon: "🏓", active: false },
    { name: "Box Cricket", icon: "🏏", active: false },
  ],
  amenities: [
    "Parking",
    "Restroom",
    "Refreshments",
    "CCTV Surveillance",
    "Centrally Air Conditioned Hall",
    "Seating Arrangement",
    "Wi-Fi",
    "Library",
  ],
  aboutPoints: [
    "Tournament Training Venue",
    "For more than 2 players Rs. 50 extra per person",
    "Equipment available on rent",
    "...",
  ],
  reviewsList: [
    {
      id: 1,
      name: "Mitchell Admin",
      rating: 5,
      date: "10 June 2025, 5:30 PM",
      comment: "Nice turf, well maintained",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4,
      date: "08 June 2025, 3:15 PM",
      comment: "Good facilities, friendly staff",
    },
    {
      id: 3,
      name: "Raj Patel",
      rating: 5,
      date: "05 June 2025, 7:45 AM",
      comment: "Excellent courts, great experience",
    },
    {
      id: 4,
      name: "Priya Shah",
      rating: 4,
      date: "02 June 2025, 6:20 PM",
      comment: "Clean and well-organized venue",
    },
  ],
  pricing: {
    weekdays: {
      morning: { time: "05:00 AM - 07:00 AM", price: 500 },
      evening: { time: "04:00 PM - 10:00 PM", price: 500 },
    },
    weekends: {
      allDay: { time: "05:00 AM - 10:00 PM", price: 500 },
    },
    holidays: {
      allDay: { time: "05:00 AM - 10:00 PM", price: 500 },
    },
  },
};

const ImageCarousel = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative bg-gray-100 rounded-2xl overflow-hidden h-96">
      <img
        src={images[currentImage]}
        alt="Venue"
        className="w-full h-full object-cover"
      />

      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
        Images / Videos
      </div>
    </div>
  );
};

const PricingModal = ({ isOpen, onClose, pricing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Badminton</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Pricing is subjected to change and is controlled by venue
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Badminton Standard Synthetic</h4>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Monday - Friday</div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">INR 500.0 / hour</span>
                  <span className="text-sm text-gray-600">
                    05:00 AM - 07:00 AM
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">INR 500.0 / hour</span>
                  <span className="text-sm text-gray-600">
                    04:00 PM - 10:00 PM
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Saturday - Sunday</div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">INR 500.0 / hour</span>
                  <span className="text-sm text-gray-600">
                    05:00 AM - 10:00 PM
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Holiday(s)</div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">INR 500.0 / hour</span>
                  <span className="text-sm text-gray-600">
                    05:00 AM - 10:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VenueDetails = () => {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Venue Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {venueData.name}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{venueData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{venueData.rating}</span>
              <span>({venueData.reviews})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <ImageCarousel images={venueData.images} />
          </div>

          {/* Right Column - Booking Info */}
          <div className="space-y-4">
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              📅 Book This Venue
            </button>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Operating Hours</span>
              </div>
              <div className="text-lg font-semibold">
                {venueData.operatingHours}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-medium">Address</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{venueData.address}</p>

              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-500">
                Location Map
              </div>
            </div>
          </div>
        </div>

        {/* Sports Available */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold">Sports Available</h2>
            <button
              onClick={() => setShowPricing(true)}
              className="text-sm text-gray-500 underline"
            >
              (Click on sports to view price chart)
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-12">
            {venueData.sportsAvailable.map((sport, index) => (
              <button
                key={index}
                onClick={() => sport.active && setShowPricing(true)}
                className={`border-2 rounded-lg p-4 text-center transition-colors ${
                  sport.active
                    ? "border-gray-300 bg-white hover:border-green-500 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="text-2xl mb-2">{sport.icon}</div>
                <div className="text-sm font-medium">{sport.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venueData.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About Venue */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">About Venue</h2>
          <div className="space-y-3">
            {venueData.aboutPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Player Reviews */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">
            Player Reviews & Ratings
          </h2>
          <div className="space-y-4">
            {venueData.reviewsList.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.name}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={`review-${review.id}-star-${starIndex}`}
                            className={`w-4 h-4 ${
                              starIndex < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-500">
                    <Calendar className="w-4 h-4" />
                    {review.date}
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                [Load more reviews]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="text-center text-gray-600">Footer</div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        pricing={venueData.pricing}
      />
    </div>
  );
};

export default VenueDetails;
