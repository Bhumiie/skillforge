const sanitizeInPlace = (obj) => {
  if (obj !== null && typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "object" && obj[i] !== null) {
          sanitizeInPlace(obj[i]);
        }
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
          } else {
            if (typeof obj[key] === "object" && obj[key] !== null) {
              sanitizeInPlace(obj[key]);
            }
          }
        }
      }
    }
  }
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) sanitizeInPlace(req.body);
  if (req.query) sanitizeInPlace(req.query);
  if (req.params) sanitizeInPlace(req.params);
  next();
};
