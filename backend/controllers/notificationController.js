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
  console.log("⏰ Starting Notification Logic...");
  try {
    const [upcoming] = await query(`
  SELECT *, DATEDIFF(DATE(event_date), CURDATE()) as days_left 
  FROM booking 
  WHERE status = 'confirmed' 
  AND DATE(event_date) IN (
    DATE_ADD(CURDATE(), INTERVAL 1 DAY), 
    DATE_ADD(CURDATE(), INTERVAL 3 DAY), 
    DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  )
`);

    for (const b of upcoming) {
      const remainingBalance = b.total_amount - b.amount_paid;

      // Balance Reminder
      if (remainingBalance > 0) {
        await query(
          "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
          [
            b.user_id,
            `Reminder: ₱${remainingBalance.toLocaleString()} balance due for your event "${b.event_name}" on ${b.event_date}.`,
            "payment",
          ],
        );
      }

      // Proximity Reminder
      const dayText = b.days_left === 1 ? "tomorrow" : `in ${b.days_left} days`;
      await query(
        "INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)",
        [
          b.user_id,
          `Your event "${b.event_name}" is happening ${dayText}!`,
          "reminder",
        ],
      );
    }

    // 2. DAY OF EVENT REMINDER
    await query(`
      INSERT INTO notifications (user_id, message, type)
      SELECT user_id, CONCAT('Today is the day! See you at Calidro for "', event_name, '".'), 'reminder'
      FROM booking 
      WHERE event_date = CURDATE() AND status = 'confirmed'
    `);

    // 3. LEAVE A REVIEW (Events that finished yesterday)
    await query(`
      INSERT INTO notifications (user_id, message, type)
      SELECT user_id, CONCAT('How was your event "', event_name, '"? Leave a review now!'), 'review'
      FROM booking 
      WHERE event_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND status = 'completed'
    `);

    return { success: true, count: upcoming.length };
  } catch (err) {
    console.error("Notification Controller Error:", err);
    throw err;
  }
};
module.exports = { createNotification };
