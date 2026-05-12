const db = require("../config/db");

// Internal helper for other controllers (e.g., when a booking is confirmed)
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

// Logic for fetching user-specific alerts
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT notif_id, message AS text, 
       DATE_FORMAT(created_at, '%b %d, %h:%i %p') AS time,
       is_read 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createNotification, getNotifications };
