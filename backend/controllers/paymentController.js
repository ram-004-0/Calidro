const axios = require("axios");
const db = require("../config/db"); // Ensure this points to your database connection
const CLIENT_URL = process.env.CLIENT_URL || "https://calidro.vercel.app";

// 1. CREATE CHECKOUT (What you already have, plus centavo fix)
exports.createCheckout = async (req, res) => {
  const { amount, bookingId, description, customerEmail, payment_methods } =
    req.body;

  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: { email: customerEmail },
            line_items: [
              {
                currency: "PHP",
                amount: Math.round(amount * 100),
                name: description,
                quantity: 1,
              },
            ],
            payment_method_types: payment_methods,
            success_url: `${CLIENT_URL}/success?bookingId=${bookingId}`,
            cancel_url: `${CLIENT_URL}/payment-failed`,
            reference_number: bookingId.toString(),
          },
        },
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString("base64"),
          "Content-Type": "application/json",
        },
      },
    );

    res
      .status(200)
      .json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (error) {
    console.error("PayMongo API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to connect to PayMongo" });
  }
};

// 2. WEBHOOK HANDLER (This fixes the "Data truncated" error)
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body.data;
    const attributes = event.attributes;
    const type = event.type;

    if (type === "checkout_session.payment.paid") {
      const checkoutSession = attributes.data;
      const bookingId = checkoutSession.attributes.reference_number;
      const amountPaid = checkoutSession.attributes.amount / 100;
      const paymongoStatus = checkoutSession.attributes.status;

      console.log(
        `🔍 Received Payment: Booking ${bookingId} | Status: ${paymongoStatus}`,
      );

      let dbStatus = "pending";
      if (paymongoStatus === "succeeded") {
        dbStatus = "confirmed";
      }

      const sql = `
        UPDATE booking 
        SET status = ?, amount_paid = amount_paid + ? 
        WHERE booking_id = ?
      `;

      db.query(sql, [dbStatus, amountPaid, bookingId], (err, result) => {
        if (err) {
          console.error("🔥 SQL ERROR:", err.message);
          return res.status(500).send("DB Update Failed");
        }
        console.log(`✅ Booking ${bookingId} updated to ${dbStatus}`);
        return res.status(200).send("OK");
      });
    } else {
      res.status(200).send("Event ignored");
    }
  } catch (error) {
    console.error("🔥 Webhook System Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
