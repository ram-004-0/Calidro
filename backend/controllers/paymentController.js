const axios = require("axios");
const CLIENT_URL = process.env.CLIENT_URL || "https://calidro.vercel.app";

exports.createCheckout = async (req, res) => {
  const { amount, bookingId, description, customerEmail, payment_methods } =
    req.body;

  try {
    // PayMongo API call
    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: { email: customerEmail },
            line_items: [
              {
                currency: "PHP",
                amount: amount, // Ensure this is in centavos (e.g., 5000 * 100)
                name: description,
                quantity: 1,
              },
            ],
            payment_method_types: payment_methods,
            success_url: `${CLIENT_URL}/success?bookingId=${bookingId}`,
            cancel_url: `${CLIENT_URL}/payment-failed`,
            reference_number: bookingId.toString(), // Crucial for tracking
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

    // Send back the checkout URL
    res.status(200).json({
      checkout_url: response.data.data.attributes.checkout_url,
    });
  } catch (error) {
    console.error("PayMongo API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to connect to PayMongo",
      details: error.response?.data?.errors?.[0]?.detail || error.message,
    });
  }
};
