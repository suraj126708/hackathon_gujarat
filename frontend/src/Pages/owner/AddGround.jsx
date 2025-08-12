import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  MapPin,
  Clock,
  DollarSign,
  Camera,
  Plus,
  X,
  Calendar,
  Phone,
  Mail,
  Globe,
  Users,
  Ruler,
  Star,
} from "lucide-react";
import Unauthorized from "../common/Unauthorized";

const AddGround = () => {
  const navigate = useNavigate();
  const { user, userProfile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    groundId: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    coordinates: {
      latitude: "",
      longitude: "",
    },
    timings: {
      openTime: "06:00",
      closeTime: "22:00",
      workingDays: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
    sports: [],
    amenities: [],
    pricing: {
      weekdayPrice: "",
      weekendPrice: "",
      currency: "INR",
      perHour: true,
    },
    dimensions: {
      length: "",
      width: "",
      capacity: "",
    },
    contact: {
      phone: "",
      email: "",
      website: "",
    },
    features: {
      lighting: false,
      covered: false,
      parking: false,
      restrooms: false,
      changeRooms: false,
    },
    images: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newSport, setNewSport] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refresh profile data when component mounts
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  const steps = [
    { id: 1, title: "Basic Info", icon: Star },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Schedule", icon: Clock },
    { id: 4, title: "Pricing", icon: DollarSign },
    { id: 5, title: "Details", icon: Users },
    { id: 6, title: "Images", icon: Camera },
  ];

  const weekDays = [
    { id: "monday", label: "Mon" },
    { id: "tuesday", label: "Tue" },
    { id: "wednesday", label: "Wed" },
    { id: "thursday", label: "Thu" },
    { id: "friday", label: "Fri" },
    { id: "saturday", label: "Sat" },
    { id: "sunday", label: "Sun" },
  ];

  const currencies = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
  ];

  const commonSports = [
    "Football",
    "Basketball",
    "Tennis",
    "Cricket",
    "Volleyball",
    "Badminton",
    "Table Tennis",
    "Swimming",
    "Gym/Fitness",
  ];

  const commonAmenities = [
    "Parking",
    "Restrooms",
    "Changing Rooms",
    "Showers",
    "Cafeteria",
    "Equipment Rental",
    "First Aid",
    "Security",
    "Wi-Fi",
  ];

  const handleInputChange = (path, value) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addSport = (sport) => {
    if (sport && !formData.sports.includes(sport)) {
      setFormData((prev) => ({
        ...prev,
        sports: [...prev.sports, sport],
      }));
    }
    setNewSport("");
  };

  const removeSport = (sport) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((s) => s !== sport),
    }));
  };

  const addAmenity = (amenity) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }));
    }
    setNewAmenity("");
  };

  const removeAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const toggleWorkingDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      timings: {
        ...prev.timings,
        workingDays: prev.timings.workingDays.includes(day)
          ? prev.timings.workingDays.filter((d) => d !== day)
          : [...prev.timings.workingDays, day],
      },
    }));
  };

  const handleRoleUpdate = async () => {
    if (!user) return;

    try {
      setIsUpdatingRole(true);
      setSubmitError("");

      const response = await axios.put(
        `http://localhost:5000/api/auth/profile`,
        { role: "Facility Owner" },
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await refreshProfile();
        setSubmitError("");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to update role. Please try again."
      );
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSubmitError("You must be logged in to create a ground");
      return;
    }

    // Client-side validation
    const errors = [];

    if (!formData.name.trim()) errors.push("Ground name is required");
    if (!formData.groundId.trim()) errors.push("Ground ID is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (formData.description.trim().length < 10)
      errors.push("Description must be at least 10 characters long");
    if (!formData.address.street.trim())
      errors.push("Street address is required");
    if (!formData.address.city.trim()) errors.push("City is required");
    if (!formData.address.state.trim()) errors.push("State is required");
    if (!formData.address.country.trim()) errors.push("Country is required");
    if (!formData.address.postalCode.trim())
      errors.push("Postal code is required");
    if (!formData.contact.phone.trim()) errors.push("Phone number is required");
    if (formData.contact.phone.trim().length < 10)
      errors.push("Phone number must be at least 10 characters long");
    if (!formData.contact.email.trim()) errors.push("Email is required");
    if (formData.sports.length === 0)
      errors.push("At least one sport is required");
    if (!formData.pricing.weekdayPrice)
      errors.push("Weekday price is required");
    if (!formData.pricing.weekendPrice)
      errors.push("Weekend price is required");

    if (errors.length > 0) {
      setSubmitError(errors.join(", "));
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure required fields are properly formatted
        name: formData.name.trim(),
        groundId: formData.groundId.trim(),
        description: formData.description.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          country: formData.address.country.trim(),
          postalCode: formData.address.postalCode.trim(),
        },
        contact: {
          phone: formData.contact.phone.trim(),
          email: formData.contact.email.trim(),
          website: formData.contact.website.trim() || null,
        },
        // Convert string coordinates to numbers
        coordinates: {
          latitude: formData.coordinates.latitude
            ? parseFloat(formData.coordinates.latitude)
            : null,
          longitude: formData.coordinates.longitude
            ? parseFloat(formData.coordinates.longitude)
            : null,
        },
        // Convert string dimensions to numbers
        dimensions: {
          length: formData.dimensions.length
            ? parseFloat(formData.dimensions.length)
            : null,
          width: formData.dimensions.width
            ? parseFloat(formData.dimensions.width)
            : null,
          capacity: formData.dimensions.capacity
            ? parseInt(formData.dimensions.capacity)
            : null,
        },
        // Convert string pricing to numbers
        pricing: {
          weekdayPrice: parseFloat(formData.pricing.weekdayPrice),
          weekendPrice: parseFloat(formData.pricing.weekendPrice),
          currency: formData.pricing.currency,
          perHour: formData.pricing.perHour,
        },
      };

      // Log the data being sent for debugging
      console.log("Submitting ground data:", submitData);

      const response = await axios.post(
        `http://localhost:5000/api/grounds`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Redirect to MyGrounds page on success
        navigate("/my-grounds", {
          state: {
            message: "Ground created successfully!",
            newGroundId: response.data.data.groundId,
          },
        });
      }
    } catch (error) {
      console.error("Error creating ground:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to create ground. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImages(true);
      setUploadProgress(0);
      const formData = new FormData();

      // Add all selected files
      Array.from(files).forEach((file) => {
        formData.append("groundImages", file);
      });

      const response = await axios.post(
        `http://localhost:5000/api/images/upload-ground`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.success) {
        const newImages = response.data.data.images;
        setUploadedImages((prev) => [...prev, ...newImages]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to upload images. Please try again."
      );
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (imageIndex) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== imageIndex)
    );
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex),
    }));
  };

  const setPrimaryImage = (imageIndex) => {
    setUploadedImages((prev) =>
      prev.map((image, index) => ({
        ...image,
        isPrimary: index === imageIndex,
      }))
    );
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((image, index) => ({
        ...image,
        isPrimary: index === imageIndex,
      })),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ground Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter ground name"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ground ID *
              </label>
              <input
                type="text"
                value={formData.groundId}
                onChange={(e) => handleInputChange("groundId", e.target.value)}
                placeholder="Unique identifier (e.g., GRD001)"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your ground and facilities..."
                rows={4}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters required. Describe the facilities, surface
                type, and any special features.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleInputChange("address.street", e.target.value)
                  }
                  placeholder="Enter street address"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleInputChange("address.city", e.target.value)
                  }
                  placeholder="Enter city"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleInputChange("address.state", e.target.value)
                  }
                  placeholder="Enter state"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) =>
                    handleInputChange("address.country", e.target.value)
                  }
                  placeholder="Enter country"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    handleInputChange("address.postalCode", e.target.value)
                  }
                  placeholder="Enter postal code"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.latitude}
                  onChange={(e) =>
                    handleInputChange("coordinates.latitude", e.target.value)
                  }
                  placeholder="Enter latitude"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.longitude}
                  onChange={(e) =>
                    handleInputChange("coordinates.longitude", e.target.value)
                  }
                  placeholder="Enter longitude"
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Opening Time *
                </label>
                <input
                  type="time"
                  value={formData.timings.openTime}
                  onChange={(e) =>
                    handleInputChange("timings.openTime", e.target.value)
                  }
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Closing Time *
                </label>
                <input
                  type="time"
                  value={formData.timings.closeTime}
                  onChange={(e) =>
                    handleInputChange("timings.closeTime", e.target.value)
                  }
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Working Days *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleWorkingDay(day.id)}
                    className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                      formData.timings.workingDays.includes(day.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.pricing.currency}
                onChange={(e) =>
                  handleInputChange("pricing.currency", e.target.value)
                }
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekday Price (Mon-Thu) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {
                      currencies.find(
                        (c) => c.code === formData.pricing.currency
                      )?.symbol
                    }
                  </span>
                  <input
                    type="number"
                    value={formData.pricing.weekdayPrice}
                    onChange={(e) =>
                      handleInputChange("pricing.weekdayPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full p-4 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekend Price (Fri-Sun) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {
                      currencies.find(
                        (c) => c.code === formData.pricing.currency
                      )?.symbol
                    }
                  </span>
                  <input
                    type="number"
                    value={formData.pricing.weekendPrice}
                    onChange={(e) =>
                      handleInputChange("pricing.weekendPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full p-4 pl-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.pricing.perHour}
                  onChange={(e) =>
                    handleInputChange("pricing.perHour", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-500 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Price per hour
                </span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            {/* Sports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sports Available *
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {commonSports.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => addSport(sport)}
                    disabled={formData.sports.includes(sport)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.sports.includes(sport)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  placeholder="Add custom sport"
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  onKeyPress={(e) => e.key === "Enter" && addSport(newSport)}
                />
                <button
                  type="button"
                  onClick={() => addSport(newSport)}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.sports.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.sports.map((sport, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {sport}
                      <button
                        type="button"
                        onClick={() => removeSport(sport)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ground Dimensions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) =>
                      handleInputChange("dimensions.length", e.target.value)
                    }
                    placeholder="Length (m)"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      handleInputChange("dimensions.width", e.target.value)
                    }
                    placeholder="Width (m)"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.capacity}
                    onChange={(e) =>
                      handleInputChange("dimensions.capacity", e.target.value)
                    }
                    placeholder="Max capacity"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Features
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.features).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        handleInputChange(
                          `features.${feature}`,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-500 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {feature.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Contact Information *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) =>
                      handleInputChange("contact.phone", e.target.value)
                    }
                    placeholder="Phone number"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters required. Include country code if
                    applicable.
                  </p>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) =>
                      handleInputChange("contact.email", e.target.value)
                    }
                    placeholder="Email address"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) =>
                      handleInputChange("contact.website", e.target.value)
                    }
                    placeholder="Website (optional)"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Camera className="inline w-4 h-4 mr-1" />
                Ground Images
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Upload images of your ground. The first image will be the
                primary image.
              </p>

              {/* Image Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    isUploadingImages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {isUploadingImages
                      ? "Uploading..."
                      : "Click to upload images or drag and drop"}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </span>

                  {/* Upload Progress */}
                  {isUploadingImages && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </label>
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Uploaded Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Ground image ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg ${
                            image.isPrimary ? "ring-2 ring-blue-500" : ""
                          }`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className={`p-2 rounded-full ${
                                image.isPrimary
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-700 hover:bg-blue-500 hover:text-white"
                              } transition-colors`}
                              title={
                                image.isPrimary
                                  ? "Primary image"
                                  : "Set as primary"
                              }
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 rounded-full bg-white text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if user has the required role
  const hasRequiredRole =
    userProfile?.role === "Facility Owner" ||
    userProfile?.role === "Player / Facility Owner";

  // If user doesn't have the required role, show role update message
  if (!hasRequiredRole) {
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Ground
          </h1>
          <p className="text-gray-600">
            Create a listing for your sports facility
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 text-sm">
                    <div
                      className={`font-medium ${
                        isActive
                          ? "text-blue-500"
                          : isCompleted
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-8 ${
                        currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {submitError}
            </div>
          )}

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-xl transition-all flex items-center gap-2 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Ground
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGround;
