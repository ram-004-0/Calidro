const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  generateDailyReminders,
} = require("../controllers/notificationController");

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
  try {
    const result = await generateDailyReminders();
    console.log("Reminders found:", result.count); // See this in your terminal
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
