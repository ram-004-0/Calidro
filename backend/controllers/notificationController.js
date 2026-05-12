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

const generateDailyReminders = async () => {
  console.log("⏰ Running Daily Reminder Logic...");
  try {
    // 1. Fetch bookings that are 7, 3, or 1 day away
    const [upcoming] = await db.query(`
      SELECT *, DATEDIFF(event_date, CURDATE()) as days_left 
      FROM booking 
      WHERE status = 'confirmed' 
      AND DATEDIFF(event_date, CURDATE()) IN (1, 3, 7)
    `);

    for (const b of upcoming) {
      const remainingBalance =
        parseFloat(b.total_amount) - parseFloat(b.amount_paid);
      const dayText = b.days_left === 1 ? "tomorrow" : `in ${b.days_left} days`;

      // Combined Message: Balance + Proximity
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

    // 2. DAY OF EVENT REMINDER (Run once at the start of the day)
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

    return { success: true, count: upcoming.length };
  } catch (err) {
    console.error("Notification Controller Error:", err);
    throw err;
  }
};
module.exports = { createNotification };
