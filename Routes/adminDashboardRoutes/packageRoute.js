// routes/packageRoutes.js
import express from 'express';
import { protectRoute, adminOnly } from '../../Middlewares/authMiddleware.js';
import {
  createPackage,
  getAllPackages,
  deletePackage,
  updatePackage
} from '../../Controllers/adminDAshboardRoutes/packageController.js';
import { upload } from '../../Middlewares/uploadItinerary.js'; // Multer + Cloudinary middleware

const router = express.Router();

// Create Package with multiple itinerary images upload
router.post(
  '/',
  protectRoute,
  adminOnly,
  upload.array('itineraryImages', 10), // Accept up to 10 images with field name 'itineraryImages'
  createPackage
);


router.get(
  '/',
  protectRoute,
  adminOnly,
  getAllPackages
);

// Update Package with optional multiple itinerary images upload
router.put(
  '/:id',
  protectRoute,
  adminOnly,
  upload.array('itineraryImages', 10),
  updatePackage
);


router.delete(
  '/:id',
  protectRoute,
  adminOnly,
  deletePackage
);

export default router;
