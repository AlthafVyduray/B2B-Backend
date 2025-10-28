import express from "express"
import { allBookings, cancelBooking, changeStatus, confirmBooking, deleteBooking, updateBooking, updateDefaultPackageBooking } from "../../Controllers/adminDashboardControllers/bookingDetailsController.js";
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";


const router = express.Router();

router.get("/", protectRoute, adminOnly, allBookings);
router.delete("/:id", protectRoute, adminOnly, deleteBooking);
router.put("/:id", protectRoute, adminOnly, updateBooking);
router.put("/default/:id", protectRoute, adminOnly, updateDefaultPackageBooking);
router.put("/confirm/:id", protectRoute, adminOnly, confirmBooking);
router.put("/cancel/:id", protectRoute, adminOnly, cancelBooking);
router.put("/status/:id", protectRoute, adminOnly, changeStatus);


export default router;