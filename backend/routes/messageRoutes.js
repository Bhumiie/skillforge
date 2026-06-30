import express from "express";
import protect from "../middleware/authMiddleware.js";
import { sendMessage, getConversation } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getConversation);

export default router;
