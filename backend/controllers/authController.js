const { OAuth2Client } = require("google-auth-library");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handle Traditional Username/Password Login
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Plain text check (Update to bcrypt.compare(password, user.password) later!)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
};

/**
 * Handle Google OAuth Login
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body; // Ensure this matches the frontend body key

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken, // The token from frontend
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists
    let [users] = await db.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    let user = users[0];

    if (!user) {
      // Auto-register new Google users
      const [result] = await db.execute(
        "INSERT INTO user (username, email, role) VALUES (?, ?, 'user')",
        [name, email],
      );
      user = { id: result.insertId, role: "user" };
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};
