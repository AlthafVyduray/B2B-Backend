import express from "express"
import { protectRoute } from "../Middlewares/authMiddleware.js";
import { getPackageDetails, getAllPackages, getAllVehicles, getHotelsByRating, createBooking, getBookings, getAdminNotifications, getPricing } from "../Controllers/bookingController.js";

const router = express.Router();


router.get("/package-details/:id", protectRoute, getPackageDetails);
router.get("/all-packages", protectRoute, getAllPackages);
router.get("/all-vehicles", protectRoute, getAllVehicles);
router.post("/hotels-by-rating", protectRoute, getHotelsByRating);
router.post("/book-package", protectRoute, createBooking);



router.get("/bookings", protectRoute, getBookings);
// router.delete("/bookings/:id", protectRoute, deleteBooking);

router.get("/notifications", protectRoute, getAdminNotifications);
router.get("/pricing", protectRoute, getPricing);



export default router;