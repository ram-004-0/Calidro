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

const deleteSelectedNotifications = async (req, res) => {
  const { notifIds } = req.body;

  const { user_id, role } = req.user;

  if (!notifIds || !Array.isArray(notifIds) || notifIds.length === 0) {
    return res.status(400).json({ message: "No notification IDs provided." });
  }

  try {
    let query;
    let params;

    if (role === "admin") {
      query = "DELETE FROM notifications WHERE notif_id IN (?)";
      params = [notifIds];
    } else {
      query = "DELETE FROM notifications WHERE notif_id IN (?) AND user_id = ?";
      params = [notifIds, user_id];
    }

    const [result] = await db.query(query, params);

    res.status(200).json({
      message: "Notifications deleted successfully",
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Database error during batch delete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
    n.notif_id, 
    IFNULL(u.username, 'System') AS username,
    CONCAT(IFNULL(u.username, 'System'), ': ', n.message) AS text, 
    n.related_id, -- Note: you used 'related_id' in createNotification but 'booking_id' here. Use related_id.
    DATE_FORMAT(CONVERT_TZ(n.created_at, '+00:00', '+08:00'), '%b %d, %h:%i %p') AS time,
    n.is_read 
   FROM notifications n
   LEFT JOIN user u ON n.user_id = u.user_id
   ORDER BY n.created_at DESC 
   LIMIT 50`,
    );
    res.json(rows);
  } catch (error) {
    console.error("Admin Notification Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  deleteSelectedNotifications,
  getAdminNotifications,
};
