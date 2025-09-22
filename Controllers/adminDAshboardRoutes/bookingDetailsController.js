import Booking from "../../Models/Booking.js";
import Notification from "../../Models/Notification.js"

// Get all bookings for admin dashboard
// controllers/bookingController.js (or wherever your allBookings lives)
export const allBookings = async (req, res) => {
  try {
    const { stateFilter = "", searchTerm = "", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    let filter = {};
    if (stateFilter) {
      filter["contact.state"] = { $regex: stateFilter, $options: "i" };
    }
    if (searchTerm) {
      filter.$or = [
        { "contact.email": { $regex: searchTerm, $options: "i" } },
        { "contact.fullName": { $regex: searchTerm, $options: "i" } }
      ];
    }

    // Total count
    const total = await Booking.countDocuments(filter);

    // Fetch bookings with pagination
    const bookings = await Booking.find(filter)
      .populate("user_id", "fullName state email mobile_number")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Aggregate stats: counts and revenue (respecting filter)
    const statsAgg = await Booking.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        pendingBookings: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$status", "confirmed"] },
              { $ifNull: ["$pricing.base_total", 0] },
              0
            ]
          }
        }
      }
    }
  ]);

    const stats = statsAgg[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    };

    return res.status(200).json({
      message: "All bookings fetched successfully",
      bookings,
      stats,
      pagination: {
        total: total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};




//delete booking for admin dashboard
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      message: "Booking deleted successfully",
      deletedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//updatebooking for admin dashboard
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Transform flat formData → schema format
    const updateData = {
      contact: {
        name: data.name,
        email: data.email,
        mobile_number: data.mobile_number,
        state: data.state,
      },
      package_id: data.package_id,
      package_name: data.package_name,

      vehicle_id: data.vehicle_id,
      vehicle_name: data.vehicle_name,

      dates: {
        pickup_date: data.pickup_date,
        pickup_time: data.pickup_time,
        pickup_location: data.pickup_location,
        drop_date: data.drop_date,
        drop_time: data.drop_time,
        drop_location: data.drop_location,
      },

      guests: {
        adults_total: data.adults_total,
        children: data.children,
        infants: data.infants,
      },

      extras: {
        entry_ticket_needed: data.entry_ticket_needed,
        snow_world_needed: data.snow_world_needed,
        breakfast: data.extra_food?.breakfast,
        lunchVeg: data.extra_food?.lunchVeg,
        lunchNonVeg: data.extra_food?.lunchNonVeg,
        guideNeeded: data.guideNeeded,
      },

      hotel_id: data.hotel_id,
      hotel: {
        hotel_name: data.hotel_name,
        food_plan: data.food_plan,
        rooms: data.rooms,
        extra_beds: data.extra_beds,
      },

      pricing: {
        agent_commission: data.agent_commission,
        base_total: data.base_total,
        total_amount: data.total_amount,
      },

    };

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBooking = await Booking.findById(id);

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (updatedBooking.status === "confirmed") {
      return res.status(200).json({ message: "Booking already confirmed" });
    }

    updatedBooking.status = "confirmed";
    await updatedBooking.save();

    const notification = new Notification({
      title: "Booking Confirmation",
      type: "success",
      recipient: updatedBooking.user_id,
      booking: updatedBooking._id,
      message: `Booking id:${updatedBooking._id} ${updatedBooking.package_name} on ${updatedBooking.dates?.pickup_date} is confirmed`
    });

    await notification.save();

    return res.status(200).json({
      message: "Booking confirmed successfully",
      booking: updatedBooking
    });
  } catch (error) {
    console.log(error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: error.message, errors });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
