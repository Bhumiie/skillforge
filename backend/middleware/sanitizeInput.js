const escapeHTML = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const sanitizeInputInPlace = (obj) => {
  if (obj !== null && typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "string") {
          obj[i] = escapeHTML(obj[i]);
        } else if (typeof obj[i] === "object" && obj[i] !== null) {
          sanitizeInputInPlace(obj[i]);
        }
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === "string") {
            obj[key] = escapeHTML(obj[key]);
          } else if (typeof obj[key] === "object" && obj[key] !== null) {
            sanitizeInputInPlace(obj[key]);
          }
        }
      }
    }
  }
};

const sanitizeInput = (req, res, next) => {
  if (req.body) sanitizeInputInPlace(req.body);
  if (req.query) sanitizeInputInPlace(req.query);
  if (req.params) sanitizeInputInPlace(req.params);
  next();
};

export default sanitizeInput;
