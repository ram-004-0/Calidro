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
      `SELECT notif_id, message AS text, 
       -- 🕒 CONVERT FROM UTC TO PHILIPPINES TIME (+08:00) BEFORE FORMATTING
       DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), '%b %d, %h:%i %p') AS time,
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

// controllers/notificationController.js (or similar)

const deleteSelectedNotifications = async (req, res) => {
  const { notifIds } = req.body;
  const userId = req.user.id; // From your Auth middleware

  if (!notifIds || !Array.isArray(notifIds) || notifIds.length === 0) {
    return res.status(400).json({ message: "No notification IDs provided." });
  }

  try {
    const query =
      "DELETE FROM notifications WHERE notif_id IN (?) AND user_id = ?";
    db.query(query, [notifIds, userId], (err, result) => {
      if (err) {
        console.error("Database error during batch delete:", err);
        return res.status(500).json({ error: "Database error" });
      }

      res.status(200).json({
        message: "Notifications deleted successfully",
        deletedCount: result.affectedRows,
      });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createNotification, getNotifications };
