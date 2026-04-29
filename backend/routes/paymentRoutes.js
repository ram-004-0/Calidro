const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../config/db");

router.post("/create-checkout", async (req, res) => {
  try {
    const { amount, bookingId, description, payment_methods } = req.body;
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const clientUrl = "https://calidro.vercel.app";
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
            success_url: `https://calidro.vercel.app/ReviewDetails?bookingId=${bookingId}`,
            cancel_url: `https://calidro.vercel.app/userbook`,
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

const crypto = require("crypto");

router.post("/webhook", (req, res) => {
  const signature = req.headers["paymongo-signature"];
  const payload = JSON.stringify(req.body);

  // Verify the signature to ensure the request is actually from PayMongo
  const hmac = crypto.createHmac("sha256", process.env.PAYMONGO_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");

  if (signature !== digest) {
    return res.status(401).send("Unauthorized");
  }

  const event = req.body;
  if (event.data?.attributes?.type === "checkout.session.payment.paid") {
    const bookingId = event.data.attributes.data.attributes.metadata.booking_id;

    db.query(
      "UPDATE booking SET status = 'paid' WHERE booking_id = ?",
      [bookingId],
      (err) => {
        if (err) return res.status(500).send("DB Error");
        return res.status(200).send("OK");
      },
    );
  } else {
    res.status(200).send("Ignored");
  }
});

module.exports = router;
