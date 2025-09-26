import express from "express"
import { allBookings, cancelBooking, confirmBooking, deleteBooking, updateBooking, updateDefaultPackageBooking } from "../../Controllers/adminDAshboardRoutes/bookingDetailsController.js";
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";


const router = express.Router();

router.get("/", protectRoute, adminOnly, allBookings);
router.delete("/:id", protectRoute, adminOnly, deleteBooking);
router.put("/:id", protectRoute, adminOnly, updateBooking);
router.put("/default/:id", protectRoute, adminOnly, updateDefaultPackageBooking);
router.put("/confirm/:id", protectRoute, adminOnly, confirmBooking);
router.put("/cancel/:id", protectRoute, adminOnly, cancelBooking);


export default router;