import express from "express"

import { protectRoute,adminOnly } from "../../Middlewares/authMiddleware.js";
import { getAllNotifications, addNotification, deleteNotification, inactivateNotification } from "../../Controllers/adminDAshboardRoutes/notificationController.js";

const router = express.Router();


router.get("/", protectRoute, adminOnly, getAllNotifications);
router.post("/", protectRoute, adminOnly, addNotification);
router.delete("/:id", protectRoute, adminOnly, deleteNotification);
router.patch("/:id/inactivate", protectRoute, adminOnly, inactivateNotification);

export default router;