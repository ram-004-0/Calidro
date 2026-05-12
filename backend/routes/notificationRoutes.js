const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getNotifications } = require("../controllers/notificationController");

// 1. TRIGGER REMINDERS (Check for upcoming events)
// URL: /api/notifications/trigger-reminders
router.get("/trigger-reminders", async (req, res) => {
  try {
    const [upcoming] = await db.query(`
      SELECT 
        booking_id, user_id, event_name, total_amount, amount_paid, 
        DATEDIFF(event_date, DATE(CONVERT_TZ(NOW(), '+00:00', '+08:00'))) AS days_left
      FROM booking
      WHERE status = 'confirmed'
      HAVING days_left IN (1, 3, 7)
    `);

    if (upcoming.length === 0) {
      return res.json({
        success: true,
        message: "No reminders to send today.",
      });
    }

    for (const b of upcoming) {
      const [exists] = await db.query(
        "SELECT * FROM notifications WHERE related_id = ? AND type = 'reminder' AND DATE(created_at) = CURDATE()",
        [b.booking_id],
      );

      if (exists.length > 0) continue;

      const balance = b.total_amount - b.amount_paid;
      const msg = `Reminder: Your event "${b.event_name}" is in ${b.days_left} day(s).${balance > 0 ? ` Please settle your balance of ₱${balance}.` : ""}`;

      await db.query(
        "INSERT INTO notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)",
        [b.user_id, msg, "reminder", b.booking_id],
      );
    }

    res.json({ success: true, count: upcoming.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET USER NOTIFICATIONS
router.get("/:userId", getNotifications);

// 3. MARK AS READ
router.patch("/read/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query(
      "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
      [userId],
    );
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// 4. CLEAR ALL
router.delete("/clear/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    res.json({ message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

module.exports = router;
