import express from "express";
import { getHealth } from "../controllers/healthController.js";
import authRoutes from "./authRoutes.js";

const router = express.Router();

// GET / — confirm the API is running
router.get("/", getHealth);

// Auth routes: POST /api/auth/signup, POST /api/auth/login
router.use("/api/auth", authRoutes);

export default router;
