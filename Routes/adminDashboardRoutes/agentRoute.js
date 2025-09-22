import express from "express"

import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";
import {getAllAgents,approveAgent,rejectAgent} from "../../Controllers/adminDAshboardRoutes/agentController.js"

const router = express.Router()

router.get('/', protectRoute, adminOnly, getAllAgents);
router.put('/approve/:id', protectRoute, adminOnly, approveAgent);
router.put('/reject/:id', protectRoute, adminOnly, rejectAgent);

export default router;