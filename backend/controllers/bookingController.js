// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Ground from "../models/Ground.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// Generate unique booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `BK${timestamp}${random}`.toUpperCase();
};

// Generate unique payment ID
const generatePaymentId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `PAY${timestamp}${random}`.toUpperCase();
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      groundId,
      sport,
      date,
      startTime,
      duration,
      selectedCourts,
      numberOfPlayers = 1,
      specialRequests,
    } = req.body;

    const userId = req.user._id;

    // Validate ground exists
    const ground = await Ground.findOne({ groundId, status: "active" });
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found or inactive",
      });
    }

    // Check if ground supports the selected sport
    if (!ground.sports.includes(sport)) {
      return res.status(400).json({
        success: false,
        message: `Sport '${sport}' is not available at this ground`,
      });
    }

    // Calculate end time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, "0")}:${startMinute
      .toString()
      .padStart(2, "0")}`;

    // Check if the time slot is available
    const isAvailable = await checkTimeSlotAvailability(
      groundId,
      date,
      startTime,
      endTime,
      selectedCourts
    );

    if (!isAvailable.available) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is not available",
        conflicts: isAvailable.conflicts,
      });
    }

    // Calculate pricing
    const pricing = calculatePricing(
      ground,
      date,
      duration,
      selectedCourts.length
    );

    // Create booking
    const booking = new Booking({
      bookingId: generateBookingId(),
      groundId,
      userId,
      sport,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      selectedCourts,
      pricePerHour: pricing.pricePerHour,
      totalAmount: pricing.totalAmount,
      currency: pricing.currency,
      numberOfPlayers,
      specialRequests,
    });

    await booking.save();

    // Create payment record
    const payment = new Payment({
      paymentId: generatePaymentId(),
      bookingId: booking.bookingId,
      userId,
      groundId,
      amount: pricing.totalAmount,
      currency: pricing.currency,
      method: "mock_payment",
      metadata: {
        mock: true,
        note: "Mock payment for development/testing",
      },
    });

    // Create mock order ID
    payment.razorpayOrderId = `mock_order_${Date.now()}`;
    await payment.save();

    console.log(`✅ [BOOKING] New booking created: ${booking.bookingId}`);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking: {
          ...booking.toJSON(),
          payment: {
            paymentId: payment.paymentId,
            amount: payment.amount,
            currency: payment.currency,
            razorpayOrderId: payment.razorpayOrderId,
          },
        },
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    // Validate input
    if (!bookingId || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId and razorpayOrderId",
      });
    }

    // Find the booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if payment is already verified
    if (booking.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    // Find the payment record
    const payment = await Payment.findOne({
      bookingId,
      razorpayOrderId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Bypass actual Razorpay signature verification for testing
    // In production, you would verify the signature here
    const isSignatureValid = true; // Always true for testing

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update payment status
    payment.status = "completed";
    payment.razorpayPaymentId =
      razorpayPaymentId || `mock_payment_${Date.now()}`;
    payment.razorpaySignature = razorpaySignature || "mock_signature";
    payment.completedAt = new Date();
    payment.gatewayResponse = {
      success: true,
      message: "Payment completed successfully (mock)",
    };
    await payment.save();

    // Update booking status
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentId = payment.paymentId;
    await booking.save();

    // Update ground statistics
    if (booking.groundId) {
      const ground = await Ground.findOne({ groundId: booking.groundId });
      if (ground) {
        ground.stats.totalBookings = (ground.stats.totalBookings || 0) + 1;
        ground.stats.totalRevenue =
          (ground.stats.totalRevenue || 0) + booking.totalAmount;
        await ground.save();
      }
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        bookingId: booking.bookingId,
        paymentId: payment.paymentId,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Mock payment verification (for development/testing)
// @route   POST /api/bookings/mock-payment-success
// @access  Private
export const mockPaymentSuccess = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Find or create payment record
    let payment = await Payment.findOne({ bookingId });
    if (!payment) {
      // Create a mock payment record
      payment = new Payment({
        paymentId: generatePaymentId(),
        bookingId: booking.bookingId,
        amount: booking.totalAmount,
        currency: "INR",
        status: "completed",
        paymentMethod: "mock_payment",
        transactionId: `MOCK_${Date.now()}`,
        paymentDate: new Date(),
        metadata: {
          mock: true,
          note: "This is a mock payment for development/testing purposes",
        },
      });
    } else {
      // Update existing payment
      payment.status = "completed";
      payment.paymentMethod = "mock_payment";
      payment.transactionId = `MOCK_${Date.now()}`;
      payment.paymentDate = new Date();
      payment.metadata = {
        mock: true,
        note: "This is a mock payment for development/testing purposes",
      };
    }

    await payment.save();

    // Update booking status
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    await booking.save();

    // Update ground statistics
    const ground = await Ground.findOne({ groundId: booking.groundId });
    if (ground) {
      ground.stats.totalBookings += 1;
      ground.stats.totalRevenue += payment.amount;
      await ground.save();
    }

    console.log(
      `✅ [BOOKING] Mock payment successful for booking: ${bookingId}`
    );

    res.json({
      success: true,
      message: "Mock payment successful! Booking confirmed.",
      data: {
        booking: booking.toJSON(),
        payment: payment.toJSON(),
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error processing mock payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process mock payment",
      error: error.message,
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(query),
    ]);

    // Manually fetch ground information for each booking
    const bookingsWithGroundInfo = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const ground = await Ground.findOne({ groundId: booking.groundId });
          if (ground) {
            const groundInfo = {
              _id: ground._id,
              groundId: ground.groundId,
              name: ground.name,
              location: ground.location,
              city: ground.location?.address?.city,
              state: ground.location?.address?.state,
            };
            // Create a new object with the ground info
            return {
              ...booking.toObject(),
              groundId: groundInfo,
            };
          }
          return booking;
        } catch (error) {
          console.error(
            `Error fetching ground info for ${booking.groundId}:`,
            error
          );
          return booking;
        }
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings: bookingsWithGroundInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// @desc    Get ground's bookings (for owners)
// @route   GET /api/bookings/ground/:groundId
// @access  Private (Ground owner)
export const getGroundBookings = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date, status, page = 1, limit = 10 } = req.query;

    // Verify user owns the ground
    const ground = await Ground.findOne({ groundId, owner: req.user._id });
    if (!ground) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this ground.",
      });
    }

    const query = { groundId };
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.date = { $gte: startOfDay, $lt: endOfDay };
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: "userId",
          select: "displayName email profile.firstName profile.lastName",
          localField: "userId",
          foreignField: "_id",
        }),
      Booking.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error fetching ground bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ground bookings",
      error: error.message,
    });
  }
};

// @desc    Get all owner's bookings across all grounds
// @route   GET /api/bookings/owner/all
// @access  Private (Ground owner)
export const getAllOwnerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const ownerId = req.user._id; // This is correct, keep as is

    // Get all grounds owned by the user
    const grounds = await Ground.find({ owner: ownerId });
    const groundIds = grounds.map((ground) => ground.groundId);

    if (groundIds.length === 0) {
      return res.json({
        success: true,
        data: {
          bookings: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalBookings: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    const query = { groundId: { $in: groundIds } };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ date: -1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: "userId",
          select: "displayName email profile.firstName profile.lastName",
          localField: "userId",
          foreignField: "_id",
        }),
      Booking.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error fetching all owner bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch owner bookings",
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:bookingId/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findOne({ bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled at this time",
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Update booking status
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = "user";
    booking.cancellationReason = reason;
    await booking.save();

    // Process refund if applicable
    if (refundAmount > 0) {
      const payment = await Payment.findOne({ bookingId });
      if (payment && payment.status === "completed") {
        payment.status = "refunded";
        payment.refundAmount = refundAmount;
        payment.refundReason = reason;
        payment.refundedAt = new Date();
        await payment.save();

        // TODO: Process actual refund through Razorpay
        console.log(
          `💰 [BOOKING] Refund processed: ${refundAmount} for booking ${bookingId}`
        );
      }
    }

    console.log(`✅ [BOOKING] Booking cancelled: ${bookingId}`);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking: booking.toJSON(),
        refundAmount,
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// @desc    Get booking details
// @route   GET /api/bookings/:bookingId
// @access  Private
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ bookingId, userId }).populate({
      path: "userId",
      select: "displayName email profile.firstName profile.lastName",
      localField: "userId",
      foreignField: "_id",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const payment = await Payment.findOne({ bookingId });

    res.json({
      success: true,
      data: {
        booking: booking.toJSON(),
        payment: payment?.toJSON(),
      },
    });
  } catch (error) {
    console.error("❌ [BOOKING] Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
      error: error.message,
    });
  }
};

// Helper function to check time slot availability
const checkTimeSlotAvailability = async (
  groundId,
  date,
  startTime,
  endTime,
  selectedCourts
) => {
  try {
    const conflictingBookings = await Booking.find({
      groundId,
      date: new Date(date),
      status: { $in: ["confirmed", "pending"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
      selectedCourts: { $in: selectedCourts },
    });

    if (conflictingBookings.length > 0) {
      return {
        available: false,
        conflicts: conflictingBookings.map((booking) => ({
          startTime: booking.startTime,
          endTime: booking.endTime,
          courts: booking.selectedCourts,
        })),
      };
    }

    return { available: true, conflicts: [] };
  } catch (error) {
    console.error("❌ [BOOKING] Error checking availability:", error);
    return { available: false, conflicts: [] };
  }
};

// Helper function to calculate pricing
const calculatePricing = (ground, date, duration, numberOfCourts) => {
  const isWeekend = [0, 5, 6].includes(new Date(date).getDay());
  const pricePerHour = isWeekend
    ? ground.pricing.weekendPrice
    : ground.pricing.weekdayPrice;
  const totalAmount = pricePerHour * duration * numberOfCourts;

  return {
    pricePerHour,
    totalAmount,
    currency: ground.pricing.currency || "INR",
  };
};
