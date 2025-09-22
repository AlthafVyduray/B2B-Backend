import express from "express";
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";
import { createHotel, getAllHotels, updateHotel, deleteHotel } from "../../Controllers/adminDAshboardRoutes/hotelController.js";
import { upload } from "../../Middlewares/uploadHotel.js"; // Multer + Cloudinary middleware

const router = express.Router();


router.post(
  '/',
  protectRoute,
  adminOnly,
  upload.single("image"), // Multer sends req.file.path & req.file.filename
  createHotel
);


router.get(
  '/',
  protectRoute,
  adminOnly,
  getAllHotels
);


// Update Hotel (with optional new image upload)
router.put(
  '/:id',
  protectRoute,
  adminOnly,
  upload.single("image"), // Allows replacing the image
  updateHotel
);


router.delete(
  '/:id',
  protectRoute,
  adminOnly,
  deleteHotel
);

export default router;
