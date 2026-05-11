const createNotification = async (userId, message, type = "general") => {
  try {
    const query = `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`;
    await db.query(query, [userId, message, type]);
    console.log(`Notification created for User ${userId}`);
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
