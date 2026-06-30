import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  joinProject,
  leaveProject,
} from "../controllers/projectController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.post("/:id/join", protect, joinProject);
router.post("/:id/leave", protect, leaveProject);

export default router;
