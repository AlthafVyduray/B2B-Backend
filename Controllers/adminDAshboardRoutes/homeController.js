import Register from "../../Models/Register.js";
import Booking from "../../Models/Booking.js";

export const getCount = async (req, res) => {
  try {
    const registerCount = await Register.countDocuments();
    const bookingCount = await Booking.countDocuments();

    const revenueResult = await Booking.aggregate([
      {
        $group: {
          _id: null,
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

    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json({
      counts: {
        Agents: registerCount,
        Bookings: bookingCount,
        Revenue: totalRevenue
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching counts", error: error.message });
  }
};
