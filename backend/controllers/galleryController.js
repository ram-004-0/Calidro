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

  // 1. Validation
  if (!title || !event_date || !user_id) {
    return res
      .status(400)
      .json({ message: "Missing required fields: title, date, or user_id" });
  }

  // Get a specific connection for the transaction
  const connection = await db.getConnection();

  try {
    // START TRANSACTION
    await connection.beginTransaction();
    console.log("Transaction started...");

    // 2. Insert the main event
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
    console.log(`Event created with ID: ${newEventId}`);

    // 3. Handle images table insertion
    if (images && Array.isArray(images) && images.length > 0) {
      // Map the array of URLs into an array of arrays
      const imageValues = images.map((url) => [newEventId, url]);

      // Bulk insert requires .query and [imageValues] (nested array)
      const imageQuery = `INSERT INTO previous_events_images (previous_events_id, image_url) VALUES ?`;

      await connection.query(imageQuery, [imageValues]);
      console.log(`${images.length} images linked to event.`);
    }

    // COMMIT BOTH INSERTS
    await connection.commit();
    console.log("Transaction committed successfully.");

    res.status(201).json({
      success: true,
      message: "Event and images created successfully",
      eventId: newEventId,
    });
  } catch (error) {
    // IF ANYTHING FAILS, UNDO THE EVENT INSERT
    await connection.rollback();

    console.error("DATABASE INSERTION ERROR:", error);

    // Common Foreign Key Error (User ID doesn't exist)
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message:
          "Constraint Error: The user_id provided does not exist in the user table.",
      });
    }

    res.status(500).json({
      message: "Error creating event",
      error: error.message,
    });
  } finally {
    // ALWAYS release the connection
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

module.exports = { getAllEvents, createEvent, deleteEvent };
