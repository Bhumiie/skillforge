import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = "./logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const level = process.env.LOG_LEVEL || "info";

// Custom format for local development (colored & simple text)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Standard JSON format for production structured logs
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level,
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    // Log files in production only
    ...(isProduction
      ? [
          new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
          }),
          new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
          }),
        ]
      : []),
  ],
});

// Create a stream for morgan to write to winston
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;
