const ipRequests = new Map();

// Regularly clean up memory every 1 minute to prevent leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now > data.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 60000);

export const createRateLimiter = (options) => {
  const { windowMs, max, message } = options;

  return (req, res, next) => {
    // Read IP from headers or socket connection
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    let data = ipRequests.get(ip);
    if (!data || now > data.resetTime) {
      data = {
        count: 0,
        resetTime: now + windowMs,
      };
      ipRequests.set(ip, data);
    }

    data.count += 1;

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        message: message || "Too many requests. Please slow down.",
      });
    }

    next();
  };
};

// Sensible production rate limits
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Max 30 signup/login requests per 15 minutes
  message: "Too many signin/signup attempts. Please try again after 15 minutes.",
});

export const chatLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 100 chat messages/inbox refreshes per minute
  message: "Message rate limit exceeded. Please slow down.",
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 file uploads per 15 minutes
  message: "Upload rate limit exceeded. Please try again later.",
});
