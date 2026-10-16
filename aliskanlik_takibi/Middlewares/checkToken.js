const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "gizliAnahtar123"; //!!!!

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ mesaj: "Giriş yapınız." });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      console.error("JWT doğrulama hatası:", err);
      return res
        .status(403)
        .json({ mesaj: "Geçersiz veya süresi dolmuş token." });
    }

    req.tokenPayload = payload;    
    next();
  });
};

module.exports = authMiddleware;
