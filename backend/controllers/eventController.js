const db = require("../config/db");

exports.getPreviousEvents = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pe.previous_events_id AS id, 
        pe.title, 
        pe.event_type AS type, 
        pe.event_date AS date, 
        pe.description,
        (SELECT image_url FROM previous_events_images 
         WHERE previous_events_id = pe.previous_events_id LIMIT 1) AS image
      FROM previous_events pe
      ORDER BY pe.event_date DESC
    `;

    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching previous events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
