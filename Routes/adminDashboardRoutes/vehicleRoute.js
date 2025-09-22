import express from "express"

import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";
import { addVehicle, getAllVehicles, updateVehicle, deleteVehicle } from "../../Controllers/adminDAshboardRoutes/vehicleController.js";


const router = express.Router();

router.post('/', protectRoute, adminOnly, addVehicle);
router.get('/', protectRoute, adminOnly, getAllVehicles);
router.put('/:id', protectRoute, adminOnly, updateVehicle);
router.delete('/:id', protectRoute, adminOnly, deleteVehicle);

export default router;