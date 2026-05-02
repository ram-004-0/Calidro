const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  deleteEvent,
} = require("../controllers/galleryController");

router.get("/all", getAllEvents);
router.post("/add", createEvent);
router.delete("/delete/:id", deleteEvent);

module.exports = router;
