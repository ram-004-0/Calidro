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
        GROUP_CONCAT(pei.image_url) AS image_list
      FROM previous_events pe
      LEFT JOIN previous_events_images pei 
        ON pe.previous_events_id = pei.previous_events_id
      GROUP BY 
        pe.previous_events_id, 
        pe.title, 
        pe.event_type, 
        pe.event_date, 
        pe.description
      ORDER BY pe.event_date DESC
    `;

    const [rows] = await db.query(sql);

    // Format the data so the frontend gets exactly what it expects
    const formattedRows = rows.map((row) => ({
      ...row,
      // If image_list is null, return empty array; otherwise split string into array
      images: row.image_list ? row.image_list.split(",") : [],
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Error fetching previous events:", error);
    // This will now log the SPECIFIC SQL error in your Railway logs
    res.status(500).json({ error: error.message });
  }
};
