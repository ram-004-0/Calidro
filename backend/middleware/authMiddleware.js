const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("DEBUG: Auth Header received:", authHeader); // See if the token is arriving

  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided, access denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG: Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("DEBUG: Token verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Optional: Specific middleware for Admins only
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Requires Admin role." });
  }
};

module.exports = { verifyToken, isAdmin };
