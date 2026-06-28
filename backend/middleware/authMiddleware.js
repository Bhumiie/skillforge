import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      message: "Invalid token",
      error: error.message,
    });
  }
};

export default protect;