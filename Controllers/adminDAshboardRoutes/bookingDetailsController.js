import Booking from "../../Models/Booking.js";
import Notification from "../../Models/Notification.js"
import DefaultPackageBooking from "../../Models/DefaultPackageBooking.js"

// Get all bookings for admin dashboard
// controllers/bookingController.js (or wherever your allBookings lives)
// at top of file
// const Booking = require("../models/Booking");
// const DefaultPackageBooking = require("../models/DefaultPackageBooking");
// or ES imports if you use them

export const allBookings = async (req, res) => {
  try {
    const { stateFilter = "", searchTerm = "", page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Build a match object to apply after union (applies to unified docs)
    const match = {};
    if (stateFilter) {
      match["contact.state"] = { $regex: stateFilter, $options: "i" };
    }
    if (searchTerm) {
      match.$or = [
        { "contact.email": { $regex: searchTerm, $options: "i" } },
        { "contact.fullName": { $regex: searchTerm, $options: "i" } }
      ];
    }

    const bookingColl = Booking.collection.name; // e.g. "bookings"
    const dpbColl = DefaultPackageBooking.collection.name; // e.g. "defaultpackagebookings"

    // Aggregation pipeline that preserves original document fields and only adds `source`.
    const pipeline = [
      // Keep original Booking doc fields, just attach a source marker
      { $addFields: { source: "booking" } },

      // Union with DefaultPackageBooking collection; preserve original dpb fields + attach source marker
      {
        $unionWith: {
          coll: dpbColl,
          pipeline: [
            { $addFields: { source: "defaultPackageBooking" } }
          ]
        }
      },

      // Apply filters across the unified stream
      { $match: match },

      // Sort most recent first (uses createdAt if present in docs)
      { $sort: { createdAt: -1 } },

      // Produce stats, total count, and paginated data in a single facet
      {
        $facet: {
          stats: [
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
          ],
          totalCount: [{ $count: "count" }],
          data: [
            { $skip: skip },
            { $limit: limitNumber }
            // we intentionally do not $project here so the original fields remain unchanged
          ]
        }
      }
    ];

    const aggResult = await Booking.aggregate(pipeline).allowDiskUse(true);
    const result = aggResult[0] || { stats: [], totalCount: [], data: [] };

    const statsAgg = result.stats[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    };

    const totalCount = result.totalCount[0] ? result.totalCount[0].count : 0;
    const docs = result.data || [];

    return res.status(200).json({
      message: "Combined bookings fetched successfully",
      bookings: docs, // original documents + `source` field
      stats: {
        totalBookings: statsAgg.totalBookings,
        pendingBookings: statsAgg.pendingBookings,
        confirmedBookings: statsAgg.confirmedBookings,
        cancelledBookings: statsAgg.cancelledBookings,
        totalRevenue: statsAgg.totalRevenue
      },
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error) {
    console.error("allBookingsCombined error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};






//delete booking for admin dashboard
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    let type = "normal"
    let deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      type = "default"
      deletedBooking = await DefaultPackageBooking.findByIdAndDelete(id)
    }
    if (!deletedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      message: "Booking deleted successfully",
      deletedBooking,
      type
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

    return res.status(200).json({ booking: updatedBooking, source: "booking" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateDefaultPackageBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log(data)

    // Transform flat formData → schema format
    const updateData = {
      contact: data.contact,
      package_id: data.package_id,
      package_name: data.package_name,

      

      dates: data.dates,

      guests: data.guests,

  
      pricing: data.pricing

    };

    // Update booking
    const updatedBooking = await DefaultPackageBooking.findByIdAndUpdate(id, updateData, {
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

    let type = "normal"
    let updatedBooking = await Booking.findById(id);


    if (!updatedBooking) {
      type = "default"
      updatedBooking = await DefaultPackageBooking.findById(id)
    }

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
      booking: updatedBooking,
      type
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


export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    let type = "normal"
    let updatedBooking = await Booking.findById(id);

    if (!updatedBooking) {
      type = "default"
      updatedBooking = await DefaultPackageBooking.findById(id);
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (updatedBooking.status === "cancelled") {
      return res.status(200).json({ message: "Booking already cancelled" });
    }

    updatedBooking.status = "cancelled";
    await updatedBooking.save();

    const notification = new Notification({
      title: "Booking Cancellation",
      type: "cancel",
      recipient: updatedBooking.user_id,
      booking: updatedBooking._id,
      message: `Booking id:${updatedBooking._id} ${updatedBooking.package_name} on ${updatedBooking.dates?.pickup_date} is cancelled`
    });

    await notification.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
      type
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
