import express, { Router } from "express"
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js"
import { getCount } from "../../Controllers/adminDAshboardRoutes/homeController.js"
 
const router = express.Router()

router.get("/", protectRoute, adminOnly, getCount)

export default router