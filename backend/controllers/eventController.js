exports.getPreviousEvents = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pe.previous_events_id AS id, 
        pe.title, 
        pe.event_type AS type, 
        pe.event_date AS date, 
        pe.description,
        GROUP_CONCAT(pei.image_url) AS images
      FROM previous_events pe
      LEFT JOIN previous_events_images pei ON pe.previous_events_id = pei.previous_events_id
      GROUP BY pe.previous_events_id
      ORDER BY pe.event_date DESC
    `;

    const [rows] = await db.query(sql);

    // Convert the comma-separated string from GROUP_CONCAT into a real array
    const formattedRows = rows.map((row) => ({
      ...row,
      images: row.images ? row.images.split(",") : [],
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Error fetching previous events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
