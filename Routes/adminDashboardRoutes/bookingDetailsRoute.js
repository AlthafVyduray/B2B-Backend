import express from "express"
import { allBookings, confirmBooking, deleteBooking, updateBooking } from "../../Controllers/adminDAshboardRoutes/bookingDetailsController.js";
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";


const router = express.Router();

router.get("/", protectRoute, adminOnly, allBookings);
router.delete("/:id", protectRoute, adminOnly, deleteBooking);
router.put("/:id", protectRoute, adminOnly, updateBooking);
router.put("/confirm/:id", protectRoute, adminOnly, confirmBooking)


export default router;