const db = require("../config/db"); // Assuming your db connection is here

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

    // Transform the GROUP_CONCAT string back into a clean array
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

  try {
    // 1. Insert the main event
    const eventQuery = `
      INSERT INTO previous_events (user_id, created_by, title, event_date, event_type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(eventQuery, [
      user_id,
      created_by,
      title,
      event_date,
      event_type,
      description,
    ]);
    const newEventId = result.insertId;

    // 2. If there are images, insert them into the images table
    if (images && images.length > 0) {
      const imageValues = images.map((url) => [newEventId, url]);
      const imageQuery = `INSERT INTO previous_events_images (previous_events_id, image_url) VALUES ?`;
      await db.query(imageQuery, [imageValues]);
    }

    res
      .status(201)
      .json({ message: "Event created successfully", eventId: newEventId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

// DELETE an event (Images will auto-delete due to ON DELETE CASCADE)
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      "DELETE FROM previous_events WHERE previous_events_id = ?",
      [id],
    );
    res.status(200).json({ message: "Event and associated images deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};

module.exports = { getAllEvents, createEvent, deleteEvent };
