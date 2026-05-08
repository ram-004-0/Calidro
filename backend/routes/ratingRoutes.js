const express = require("express");
const router = express.Router();
const db = require("../config/db");
const upload = require("../middleware/multer"); // Use your existing multer file
const { verifyToken } = require("../middleware/authMiddleware");

// Note: Use upload.array because users can upload multiple photos
router.post(
  "/rate",
  verifyToken,
  upload.array("images", 5),
  async (req, res) => {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.user_id;

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // 1. Insert into rating table
      const [ratingResult] = await connection.execute(
        "INSERT INTO rating (user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?)",
        [user_id, booking_id, rating, comment],
      );

      const newRatingId = ratingResult.insertId;

      // 2. Save Image URLs
      // With your multer.js, the Cloudinary URLs are in file.path
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await connection.execute(
            "INSERT INTO rating_images (rating_id, image_url) VALUES (?, ?)",
            [newRatingId, file.path],
          );
        }
      }

      await connection.commit();
      res.status(201).json({ message: "Rating submitted successfully!" });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Rating Error:", error);
      res
        .status(500)
        .json({ message: "Failed to submit rating", error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },
);

// GET ROUTE: Fetch ratings with usernames
router.get("/event-ratings/:bookingId", async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*, u.username, 
        GROUP_CONCAT(ri.image_url) as review_images
      FROM rating r
      JOIN user u ON r.user_id = u.user_id
      LEFT JOIN rating_images ri ON r.rating_id = ri.rating_id
      WHERE r.booking_id = ?
      GROUP BY r.rating_id
      ORDER BY r.created_at DESC
    `;

    const [results] = await db.execute(query, [req.params.bookingId]);

    // Format the results: turn the GROUP_CONCAT string into a real array
    const formattedResults = results.map((rev) => ({
      ...rev,
      review_images: rev.review_images ? rev.review_images.split(",") : [],
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Fetch Ratings Error:", error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
