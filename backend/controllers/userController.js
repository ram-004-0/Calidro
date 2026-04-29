const db = require("../config/db");

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT username, email, phone_number, address FROM user WHERE user_id = ?",
      [req.user.user_id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  const { username, email, phone_number, address } = req.body;
  try {
    // FIXED: Changed req.user.id to req.user.user_id
    const [result] = await db.execute(
      "UPDATE user SET username = ?, email = ?, phone_number = ?, address = ? WHERE user_id = ?",
      [username, email, phone_number, address, req.user.user_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
