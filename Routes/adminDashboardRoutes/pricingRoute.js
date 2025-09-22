import express from "express"

import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";
import { createPricing, getAllPricing, updatePricing, deletePricing } from "../../Controllers/adminDAshboardRoutes/pricingController.js";

const router = express.Router()

router.post('/', protectRoute, adminOnly, createPricing);
router.get('/', protectRoute, adminOnly, getAllPricing);
router.put('/:id', protectRoute, adminOnly, updatePricing);
router.delete('/:id', protectRoute, adminOnly, deletePricing);

export default router;