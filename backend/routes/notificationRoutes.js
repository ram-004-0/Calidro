const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
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
});

// 2. MARK AS READ (To hide the red dot)
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

// 3. CLEAR ALL (For your "CLEAR ALL" button)
router.delete("/clear/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    res.json({ message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

router.get("/trigger-reminders", async (req, res) => {
  console.log("⏰ Incoming request to /trigger-reminders...");

  try {
    // 1. Fetch bookings that are 7, 3, or 1 day away
    const [upcoming] = await db.query(`
      SELECT *, DATEDIFF(DATE(event_date), CURDATE()) as days_left 
      FROM booking 
      WHERE status = 'confirmed' 
      AND DATEDIFF(DATE(event_date), CURDATE()) IN (1, 3, 7)
    `);

    console.log(
      `Found ${upcoming.length} bookings matching the time criteria.`,
    );

    for (const b of upcoming) {
      const remainingBalance =
        parseFloat(b.total_amount) - parseFloat(b.amount_paid);
      const dayText = b.days_left === 1 ? "tomorrow" : `in ${b.days_left} days`;

      let message = `Your event "${b.event_name}" is happening ${dayText}!`;

      if (remainingBalance > 0) {
        message += ` Just a reminder, you have a remaining balance of ₱${remainingBalance.toLocaleString()}.`;
      }

      // Insert the notification
      await db.query(
        "INSERT INTO notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)",
        [b.user_id, message, "reminder", b.booking_id],
      );
    }

    // 2. DAY OF EVENT REMINDER
    await db.query(`
      INSERT INTO notifications (user_id, message, type, related_id)
      SELECT user_id, CONCAT('Today is the day! See you at Calidro for "', event_name, '".'), 'reminder', booking_id
      FROM booking 
      WHERE event_date = CURDATE() AND status = 'confirmed'
      AND NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = booking.user_id 
        AND message LIKE '%Today is the day%' 
        AND DATE(created_at) = CURDATE()
      )
    `);

    res.status(200).json({ success: true, count: upcoming.length });
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
