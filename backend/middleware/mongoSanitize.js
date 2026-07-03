const sanitizeMongoData = (val) => {
  if (val !== null && typeof val === "object") {
    if (Array.isArray(val)) {
      return val.map(sanitizeMongoData);
    }
    const cleaned = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        // Strip out any keys starting with $ or containing a dot
        if (!key.startsWith("$") && !key.includes(".")) {
          cleaned[key] = sanitizeMongoData(val[key]);
        }
      }
    }
    return cleaned;
  }
  return val;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeMongoData(req.body);
  if (req.query) req.query = sanitizeMongoData(req.query);
  if (req.params) req.params = sanitizeMongoData(req.params);
  next();
};
