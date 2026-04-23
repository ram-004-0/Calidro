const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/google-login
router.post("/google-login", authController.googleLogin);

router.get("/test", (req, res) => {
  res.status(200).send("Auth routes are working!");
});
module.exports = router;
