import express from "express";
import {
  acceptConnectionRequest,
  getConnections,
  getReceivedRequests,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../controllers/connectionController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getConnections);
router.get("/received", protect, getReceivedRequests);
router.put("/:id/accept", protect, acceptConnectionRequest);
router.put("/:id/reject", protect, rejectConnectionRequest);
router.post("/request", protect, sendConnectionRequest);

export default router;
