import express from "express";
import cors from "cors";
import "./config/env.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import userRoutes from "./routes/userRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import hackathonRoutes from "./routes/hackathonRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Security middlewares imports
import helmetCustom from "./middleware/helmetCustom.js";
import { mongoSanitize } from "./middleware/mongoSanitize.js";
import sanitizeInput from "./middleware/sanitizeInput.js";
import { authLimiter, chatLimiter, uploadLimiter } from "./middleware/rateLimiter.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Apply Helmet custom secure headers
app.use(helmetCustom);

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the frontend
app.use(cors());

// Apply NoSQL and XSS input sanitization globally
app.use(mongoSanitize);
app.use(sanitizeInput);

// Apply Route Specific Rate Limiters
app.use("/api/auth", authLimiter);
app.use("/api/messages", chatLimiter);
app.use("/api/upload", uploadLimiter);

// Mount all routes
app.use("/", routes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const isProduction = process.env.NODE_ENV === "production";
  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction ? "An internal server error occurred. Please try again later." : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SkillForge server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();