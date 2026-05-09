const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/admin-stats", async (req, res) => {
  try {
    // 1. Get Monthly Booking Counts for the current year
    const monthlyBookingsQuery = `
      SELECT 
        DATE_FORMAT(event_date, '%M') as name, 
        COUNT(*) as value 
      FROM booking 
      WHERE YEAR(event_date) = YEAR(CURDATE())
      GROUP BY MONTH(event_date), name
      ORDER BY MONTH(event_date) ASC
    `;

    // 2. Get Rating Distribution & Totals - Using "rating" column from your table
    const ratingsQuery = `
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as avgRating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star1
      FROM rating
    `;

    const [monthlyData] = await db.query(monthlyBookingsQuery);
    const [ratingStats] = await db.query(ratingsQuery);

    const stats = ratingStats[0];
    const total = stats.totalReviews || 1;

    const formattedStarRatings = [
      {
        stars: 5,
        percent: `${Math.round(((stats.star5 || 0) / total) * 100)}%`,
      },
      {
        stars: 4,
        percent: `${Math.round(((stats.star4 || 0) / total) * 100)}%`,
      },
      {
        stars: 3,
        percent: `${Math.round(((stats.star3 || 0) / total) * 100)}%`,
      },
      {
        stars: 2,
        percent: `${Math.round(((stats.star2 || 0) / total) * 100)}%`,
      },
      {
        stars: 1,
        percent: `${Math.round(((stats.star1 || 0) / total) * 100)}%`,
      },
    ];

    res.json({
      barData: monthlyData,
      starRatings: formattedStarRatings,
      avgRating: parseFloat(stats.avgRating || 0).toFixed(1),
      totalReviews: stats.totalReviews || 0,
    });
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
