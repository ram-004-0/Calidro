const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

// Define the GET route
router.get("/", eventController.getPreviousEvents);

module.exports = router;
