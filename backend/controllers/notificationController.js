const createNotification = async (userId, message, bookingId) => {
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
module.exports = { createNotification };
