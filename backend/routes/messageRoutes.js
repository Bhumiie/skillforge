import express from "express";
import protect from "../middleware/authMiddleware.js";
import { sendMessage, getConversation, getConversationsList } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversationsList);
router.get("/:userId", protect, getConversation);

export default router;
