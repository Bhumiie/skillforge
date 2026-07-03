import express from "express";
import { getAllUsers, getProfile, getUserById, updateProfile, getUserProfileDetails } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/profile", protect, getProfile);
router.get("/profile/details", protect, getUserProfileDetails);
router.get("/:id", protect, getUserById);
router.get("/:id/details", protect, getUserProfileDetails);
router.put("/profile", protect, updateProfile);

export default router;