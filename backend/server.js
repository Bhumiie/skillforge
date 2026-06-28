import express from "express";
import cors from "cors";
import "./config/env.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the frontend
app.use(cors());

// Mount all routes
app.use("/", routes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SkillSwap server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();