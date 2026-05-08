const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db"); // Adjust based on your db file path
const cloudinary = require("../config/cloudinaryConfig");
const { verifyToken } = require("../middleware/authMiddleware"); // To get user_id from token

// Use memory storage for faster transit to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/rate",
  verifyToken,
  upload.array("images", 5),
  async (req, res) => {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.user_id; // Extracted from the JWT token by your middleware

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // 1. Insert the main rating data
      const [ratingResult] = await connection.execute(
        "INSERT INTO rating (user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?)",
        [user_id, booking_id, rating, comment],
      );

      const newRatingId = ratingResult.insertId;

      // 2. Handle Image Uploads if they exist
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "event_reviews" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              },
            );
            stream.end(file.buffer);
          });
        });

        const imageUrls = await Promise.all(uploadPromises);

        // 3. Save Image URLs to the rating_images table
        for (const url of imageUrls) {
          await connection.execute(
            "INSERT INTO rating_images (rating_id, image_url) VALUES (?, ?)",
            [newRatingId, url],
          );
        }
      }

      await connection.commit();
      res.status(201).json({ message: "Rating submitted successfully!" });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Rating Error:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    } finally {
      if (connection) connection.release();
    }
  },
);

// GET ROUTE: Fetch ratings WITH usernames (The JOIN you asked for)
router.get("/event-ratings/:bookingId", async (req, res) => {
  try {
    const query = `
      SELECT 
        r.*, u.username, 
        GROUP_CONCAT(ri.image_url) as images
      FROM rating r
      JOIN user u ON r.user_id = u.user_id
      LEFT JOIN rating_images ri ON r.rating_id = ri.rating_id
      WHERE r.booking_id = ?
      GROUP BY r.rating_id
      ORDER BY r.created_at DESC
    `;
    const [results] = await db.execute(query, [req.params.bookingId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
