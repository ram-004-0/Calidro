const db = require("../config/db");

// GET all events with their images
const getAllEvents = async (req, res) => {
  try {
    const query = `
      SELECT e.*, GROUP_CONCAT(i.image_url) as images
      FROM previous_events e
      LEFT JOIN previous_events_images i ON e.previous_events_id = i.previous_events_id
      GROUP BY e.previous_events_id
      ORDER BY e.event_date DESC
    `;

    const [rows] = await db.execute(query);

    const formattedData = rows.map((event) => ({
      ...event,
      images: event.images ? event.images.split(",") : [],
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching gallery", error: error.message });
  }
};

// POST a new event with multiple images
const createEvent = async (req, res) => {
  const {
    user_id,
    created_by,
    title,
    event_date,
    event_type,
    description,
    images,
  } = req.body;

  if (!title || !event_date || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert Event
    const eventQuery = `
      INSERT INTO previous_events (user_id, created_by, title, event_date, event_type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [eventResult] = await connection.execute(eventQuery, [
      user_id,
      created_by || "Admin",
      title,
      event_date,
      event_type || "Other",
      description || "",
    ]);

    const newEventId = eventResult.insertId;

    // 2. Insert Images (The Fix)
    if (images && Array.isArray(images) && images.length > 0) {
      const imageValues = images.map((url) => [newEventId, url]);

      // FIXED: mysql2 expects bulk values wrapped in an extra array [ [ [v1,v2], [v1,v2] ] ]
      const imageQuery = `INSERT INTO previous_events_images (previous_events_id, image_url) VALUES ?`;
      await connection.query(imageQuery, [imageValues]);
    }

    await connection.commit();
    res.status(201).json({ success: true, eventId: newEventId });
  } catch (error) {
    await connection.rollback();
    console.error("SQL ERROR:", error.message);

    // Handle the Foreign Key failure specifically
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Error: The user_id does not exist in the 'user' table.",
      });
    }

    res.status(500).json({ message: "Database error", error: error.message });
  } finally {
    connection.release();
  }
};

// DELETE an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM previous_events WHERE previous_events_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event and associated images deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};

// PUT (Update) event details
// 1. Update text details (Title, Date, Type, Desc)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, event_date, event_type, description } = req.body;

  try {
    const query = `
      UPDATE previous_events 
      SET title = ?, event_date = ?, event_type = ?, description = ? 
      WHERE previous_events_id = ?
    `;
    await db.execute(query, [title, event_date, event_type, description, id]);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// 2. Add a new image URL to an existing event
const addImageToEvent = async (req, res) => {
  const { id } = req.params;
  const { image_url } = req.body;

  try {
    await db.execute(
      "INSERT INTO previous_events_images (previous_events_id, image_url) VALUES (?, ?)",
      [id, image_url],
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Image DB insert failed", error: error.message });
  }
};

// Express Route: DELETE /api/gallery/delete-image
const removeImage = async (req, res) => {
  const { eventId, imageUrl } = req.body;

  try {
    const query = `DELETE FROM previous_events_images WHERE previous_events_id = ? AND image_url = ?`;
    const [result] = await db.execute(query, [eventId, imageUrl]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Image not found in database" });
    }

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Export these new functions
module.exports = {
  getAllEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  addImageToEvent,
};
