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

const app = express();

const PORT = process.env.PORT || 5000;

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the frontend
app.use(cors());

// Mount all routes
app.use("/", routes);
app.use("/api/users", userRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/hackathons", hackathonRoutes);

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