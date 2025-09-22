// routes/changePassword.js
import express from "express";
import bcrypt from "bcryptjs";            // or 'bcrypt'
import User from "../../Models/User.js";
import { adminOnly, protectRoute } from "../../Middlewares/authMiddleware.js";

const router = express.Router();


router.put("/", protectRoute, adminOnly, async (req, res) => {
  try {
    const userId = req.user._id; // current logged-in user
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
