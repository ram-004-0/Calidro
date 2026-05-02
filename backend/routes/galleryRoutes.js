const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  deleteEvent,
  updateEvent,
  addImageToEvent,
  removeImage,
} = require("../controllers/galleryController");

router.get("/all", getAllEvents);
router.post("/add", createEvent);
router.delete("/delete/:id", deleteEvent);
router.put("/update/:id", updateEvent);
router.post("/add-image/:id", addImageToEvent);

// Matches: DELETE /api/gallery/delete-image
router.delete("/delete-image", removeImage);

module.exports = router;
