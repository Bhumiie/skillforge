import express from "express";
import { getAllUsers, getProfile, getUserById, updateProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/profile", protect, getProfile);
router.get("/:id", protect, getUserById);
router.put("/profile", protect, updateProfile);

export default router;