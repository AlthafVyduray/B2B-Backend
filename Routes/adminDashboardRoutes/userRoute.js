import express from "express"
import { protectRoute, adminOnly } from "../../Middlewares/authMiddleware.js";
import { createUser, getAllUsers, updateUser, deleteUser } from "../../Controllers/adminDAshboardRoutes/userController.js";

const router = express.Router()

router.post('/', protectRoute, adminOnly, createUser);   // Create
router.get('/', protectRoute, adminOnly, getAllUsers);       // Read All
router.put('/:id', protectRoute, adminOnly, updateUser);     // Update
router.delete('/:id', protectRoute, adminOnly, deleteUser);  // Delete


export default router;