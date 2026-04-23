const { OAuth2Client } = require("google-auth-library");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Explicitly select phone_number and address
    const [rows] = await db.execute(
      "SELECT id, username, email, password, role, phone_number, address FROM user WHERE username = ?",
      [username],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

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
        phone_number: user.phone_number, // Now included
        address: user.address, // Now included
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
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Select existing user data
    let [users] = await db.execute(
      "SELECT id, username, email, role, phone_number, address FROM user WHERE email = ?",
      [email],
    );
    let user = users[0];

    if (!user) {
      // Auto-register new Google users
      const [result] = await db.execute(
        "INSERT INTO user (username, email, role) VALUES (?, ?, 'user')",
        [name, email],
      );

      // Fetch the newly created user to get the full profile
      user = {
        id: result.insertId,
        username: name,
        email: email,
        role: "user",
        phone_number: null,
        address: null,
      };
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
        phone_number: user.phone_number,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};
