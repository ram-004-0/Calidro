const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Look for the token in the header (format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided, access denied." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info (id, role) to the request object
        next(); // Move to the next function (the controller)
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// Optional: Specific middleware for Admins only
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Requires Admin role." });
    }
};

module.exports = { verifyToken, isAdmin };