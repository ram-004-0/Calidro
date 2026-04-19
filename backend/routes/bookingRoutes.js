const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Middleware to log all booking route requests
router.use((req, res, next) => {
  console.log(`[Booking Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Paths:
// POST /api/bookings/create
// GET /api/bookings/details/:id
router.post("/create", bookingController.createBooking);
router.get("/details/:id", bookingController.getBookingDetails);

module.exports = router;
