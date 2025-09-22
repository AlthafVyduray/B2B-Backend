import express from "express"

import { registerUser, loginUser, updateProfile, logoutUser, getProfile, forgotPassword, resetPassword } from "../Controllers/authController.js";
import { protectRoute } from "../Middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 4, // max requests per IP per window
  message: "Too many requests, try again later."
});

router.post("/register", registerUser)

router.post("/login", loginUser)

router.post("/logout", logoutUser)

router.put("/edit-profile", protectRoute, updateProfile)

router.get("/profile", protectRoute, getProfile);

router.post("/forgot-password", limiter, forgotPassword);
router.post("/reset-password", limiter, resetPassword);


export default router;