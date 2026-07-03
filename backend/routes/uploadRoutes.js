import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import protect from "../middleware/authMiddleware.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryHelper.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
