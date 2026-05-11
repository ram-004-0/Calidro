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
