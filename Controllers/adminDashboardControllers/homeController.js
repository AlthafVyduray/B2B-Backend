import Register from "../../Models/Register.js";
import Booking from "../../Models/Booking.js";
import DefaultPackageBooking from "../../Models/DefaultPackageBooking.js";

export const getCount = async (req, res) => {
  try {
    // Count total registered users
    const registerCount = await Register.countDocuments();

    // Count total bookings (normal + default)
    const bookingCount = await Booking.countDocuments();
    const defaultBookingCount = await DefaultPackageBooking.countDocuments();
    const totalBookings = bookingCount + defaultBookingCount;

    // Calculate total revenue from confirmed bookings (normal + default)
    const revenuePipeline = [
      {
        $match: { status: "confirmed" }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$pricing.base_total", 0] } }
        }
      }
    ];

    const [bookingRevenueResult, defaultRevenueResult] = await Promise.all([
      Booking.aggregate(revenuePipeline),
      DefaultPackageBooking.aggregate(revenuePipeline)
    ]);

    const totalRevenue =
      (bookingRevenueResult[0]?.totalRevenue || 0) +
      (defaultRevenueResult[0]?.totalRevenue || 0);

    return res.status(200).json({
      counts: {
        Agents: registerCount,
        Bookings: totalBookings,
        Revenue: totalRevenue
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching counts", error: error.message });
  }
};

