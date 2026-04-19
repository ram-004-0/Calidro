const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../config/db");

router.post("/create-checkout", async (req, res) => {
  try {
    const { amount, bookingId, description, payment_methods } = req.body;
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const clientUrl = process.env.FRONTEND_URL;
    const authHeader = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            payment_method_types: payment_methods,
            line_items: [
              {
                amount: Math.round(amount),
                currency: "PHP",
                name: description,
                quantity: 1,
              },
            ],
            success_url: `${clientUrl}/ReviewDetails?bookingId=${bookingId}`,
            cancel_url: `${clientUrl}/userbook`,
            metadata: { booking_id: String(bookingId) },
          },
        },
      },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (error) {
    console.error("PayMongo Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Checkout creation failed" });
  }
});

router.post("/webhook", (req, res) => {
  const event = req.body;
  // Ensure this path matches the actual PayMongo webhook payload structure
  if (event.data?.attributes?.type === "checkout.session.payment.paid") {
    const bookingId = event.data.attributes.data.attributes.metadata.booking_id;
    db.query(
      "UPDATE booking SET status = 'paid' WHERE id = ?",
      [bookingId],
      (err) => {
        if (err) return res.status(500).send("DB Error");
        res.status(200).send("OK");
      },
    );
  } else {
    res.status(200).send("Ignored");
  }
});

module.exports = router;
