const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  createEvent,
  deleteEvent,
  updateEvent, // Added for handleUpdateEvent
  addImageToEvent, // Added for handleImageUpload
  removeImage, // Added for handleRemoveImage
} = require("../controllers/galleryController");

// --- Standard Event Routes ---
router.get("/all", getAllEvents);
router.post("/add", createEvent);
router.delete("/delete/:id", deleteEvent);

// --- Update & Image Management Routes ---

// Matches: PUT /api/gallery/update/:id
router.put("/update/:id", updateEvent);

// Matches: POST /api/gallery/add-image/:id
router.post("/add-image/:id", addImageToEvent);

// Matches: DELETE /api/gallery/delete-image
// Note: This uses a JSON body via Axios, so Ensure your
// backend has express.json() middleware enabled.
router.delete("/delete-image", removeImage);

module.exports = router;
