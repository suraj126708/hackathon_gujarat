// controllers/timeSlotController.js
import TimeSlot from "../models/TimeSlot.js";
import Ground from "../models/Ground.js";
import Booking from "../models/Booking.js";
import { validationResult } from "express-validator";

// Block a time slot
export const blockTimeSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      groundId,
      date,
      startTime,
      endTime,
      reason,
      isRecurring = false,
      recurringDays = [],
      endDate,
    } = req.body;

    // Verify user owns the ground
    const ground = await Ground.findOne({
      groundId,
      owner: req.user._id,
    });
    if (!ground) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this ground.",
      });
    }

    // Check if there are existing bookings in the time slot
    const existingBookings = await Booking.find({
      groundId,
      date: new Date(date),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
      status: { $nin: ["cancelled"] },
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot block time slot with existing bookings",
        conflicts: existingBookings.map((booking) => ({
          bookingId: booking.bookingId,
          startTime: booking.startTime,
          endTime: booking.endTime,
        })),
      });
    }

    // Create blocked time slot
    const blockedTimeSlot = new TimeSlot({
      groundId,
      date: new Date(date),
      startTime,
      endTime,
      reason: reason || "Maintenance",
      isRecurring,
      recurringDays,
      endDate: endDate ? new Date(endDate) : null,
      blockedBy: req.user._id,
      status: "blocked",
    });

    await blockedTimeSlot.save();

    res.status(201).json({
      success: true,
      message: "Time slot blocked successfully",
      data: blockedTimeSlot,
    });
  } catch (error) {
    console.error("Error blocking time slot:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Unblock a time slot
export const unblockTimeSlot = async (req, res) => {
  try {
    const { timeSlotId } = req.params;

    // Find the blocked time slot
    const blockedTimeSlot = await TimeSlot.findById(timeSlotId);
    if (!blockedTimeSlot) {
      return res.status(404).json({
        success: false,
        message: "Blocked time slot not found",
      });
    }

    // Verify user owns the ground
    const ground = await Ground.findOne({
      groundId: blockedTimeSlot.groundId,
      owner: req.user._id,
    });
    if (!ground) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this ground.",
      });
    }

    // Remove the blocked time slot
    await TimeSlot.findByIdAndDelete(timeSlotId);

    res.status(200).json({
      success: true,
      message: "Time slot unblocked successfully",
    });
  } catch (error) {
    console.error("Error unblocking time slot:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get blocked time slots for a ground
export const getBlockedTimeSlots = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Verify user owns the ground
    const ground = await Ground.findOne({
      groundId,
      owner: req.user.firebaseUid,
    });
    if (!ground) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this ground.",
      });
    }

    // Build query
    const query = { groundId, status: "blocked" };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const blockedTimeSlots = await TimeSlot.find(query).sort({
      date: 1,
      startTime: 1,
    });

    res.status(200).json({
      success: true,
      message: "Blocked time slots retrieved successfully",
      data: {
        blockedTimeSlots,
        total: blockedTimeSlots.length,
      },
    });
  } catch (error) {
    console.error("Error getting blocked time slots:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get ground availability
export const getGroundAvailability = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Check if ground exists and is active
    const ground = await Ground.findOne({ groundId, status: "active" });
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: "Ground not found or inactive",
      });
    }

    // Build date range
    let dateRange = {};
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateRange = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateRange = { $gte: start, $lte: end };
    } else {
      // Default to next 7 days
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      dateRange = { $gte: today, $lte: nextWeek };
    }

    // Get bookings and blocked time slots
    const [bookings, blockedTimeSlots] = await Promise.all([
      Booking.find({
        groundId,
        date: dateRange,
        status: { $nin: ["cancelled"] },
      }).sort({ date: 1, startTime: 1 }),
      TimeSlot.find({
        groundId,
        date: dateRange,
        status: "blocked",
      }).sort({ date: 1, startTime: 1 }),
    ]);

    // Generate availability for each day
    const availability = [];
    const currentDate = new Date(dateRange.$gte);
    const rangeEndDate = new Date(dateRange.$lte);

    while (currentDate <= rangeEndDate) {
      const dayAvailability = {
        date: new Date(currentDate),
        dayOfWeek: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
        isWorkingDay: ground.timings.workingDays.includes(
          currentDate
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase()
        ),
        openTime: ground.timings.openTime,
        closeTime: ground.timings.closeTime,
        bookings: [],
        blockedSlots: [],
        availableSlots: [],
      };

      // Add bookings for this day
      const dayBookings = bookings.filter(
        (booking) => booking.date.toDateString() === currentDate.toDateString()
      );
      dayAvailability.bookings = dayBookings;

      // Add blocked slots for this day
      const dayBlockedSlots = blockedTimeSlots.filter(
        (slot) => slot.date.toDateString() === currentDate.toDateString()
      );
      dayAvailability.blockedSlots = dayBlockedSlots;

      // Generate available time slots
      if (dayAvailability.isWorkingDay) {
        const availableSlots = generateAvailableTimeSlots(
          ground.timings.openTime,
          ground.timings.closeTime,
          dayBookings,
          dayBlockedSlots
        );
        dayAvailability.availableSlots = availableSlots;
      }

      availability.push(dayAvailability);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      message: "Ground availability retrieved successfully",
      data: {
        groundId,
        groundName: ground.name,
        availability,
      },
    });
  } catch (error) {
    console.error("Error getting ground availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to generate available time slots
const generateAvailableTimeSlots = (
  openTime,
  closeTime,
  bookings,
  blockedSlots
) => {
  const slots = [];
  const [openHour, openMinute] = openTime.split(":").map(Number);
  const [closeHour, closeMinute] = closeTime.split(":").map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const slotStart = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    // Check if slot is available (not booked or blocked)
    const isBooked = bookings.some(
      (booking) => booking.startTime <= slotStart && booking.endTime > slotStart
    );

    const isBlocked = blockedSlots.some(
      (slot) => slot.startTime <= slotStart && slot.endTime > slotStart
    );

    if (!isBooked && !isBlocked) {
      slots.push(slotStart);
    }

    // Move to next slot (assuming 1-hour slots)
    currentMinute += 60;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};
