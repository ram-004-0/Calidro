const db = require("../config/db");

const createNotification = async (userId, message, bookingId) => {
  console.log("🔔 NOTIFICATION TRIGGERED for User:", userId);
  try {
    const query = `
      INSERT INTO notifications (user_id, message, type, related_id) 
      VALUES (?, ?, ?, ?)
    `;

    await db.query(query, [userId, message, "booking_update", bookingId]);

    console.log(
      `Notification created for User ${userId} regarding Booking ${bookingId}`,
    );
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createNotification };
