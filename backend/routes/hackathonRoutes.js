import express from "express";
import {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  joinHackathon,
} from "../controllers/hackathonController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getHackathons);
router.get("/:id", getHackathonById);

// Protected
router.post("/", authMiddleware, createHackathon);
router.put("/:id", authMiddleware, updateHackathon);
router.delete("/:id", authMiddleware, deleteHackathon);
router.post("/:id/join", authMiddleware, joinHackathon);

export default router;