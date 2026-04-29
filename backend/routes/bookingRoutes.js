const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../config/db");

console.log("🔥 FILE LOADED: bookingRoutes.js");

router.use((req, res, next) => {
  // This version tells us EXACTLY what the URL looks like inside this router

  console.log(`📍 ROUTER INBOUND: ${req.method} ${req.url}`);

  next();
});

const { sendBookingConfirmation } = require("../services/emailService");

// Helper for SQL Queries

const query = async (sql, params) => {
  try {
    console.log("DEBUG: Executing SQL:", sql);

    const [results] = await db.query(sql, params);

    console.log("DEBUG: SQL Success!");

    return results;
  } catch (err) {
    console.error("DEBUG: SQL ERROR:", err);

    throw err;
  }
};

// Helper to format time for MySQL Time column

const formatTimeTo24H = (timeStr) => {
  if (!timeStr) return "00:00:00";

  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const [time, modifier] = timeStr.split(" ");

  let [hours, minutes] = time.split(":");

  if (!minutes) minutes = "00";

  let hoursNum = parseInt(hours, 10);

  if (modifier === "PM" && hoursNum < 12) hoursNum += 12;

  if (modifier === "AM" && hoursNum === 12) hoursNum = 0;

  return `${hoursNum.toString().padStart(2, "0")}:${minutes}:00`;
};

//testing langch

router.post("/test-post", (req, res) => {
  res.json({ message: "POST matching is working!" });
});

// 1. Create New Booking and Launch PayMongo

router.post("/create-booking-and-checkout", async (req, res) => {
  console.log("1. Route Triggered. Event:", req.body.eventName);

  try {
    const {
      userId,
      eventName,
      eventType,
      eventDate,
      time,
      duration,
      guests,
      ingress,
      egress,
      totalAmount,
      amount_paid,
      paymentType,
      payment_methods,
    } = req.body;

    // --- STEP 1: Fetch User Details from the 'user' table ---
    // We do this to ensure we have the correct phone, address, and email
    const [userData] = await query(
      "SELECT username, email, phone_number, address FROM user WHERE user_id = ?",
      [userId],
    );

    if (!userData) {
      return res
        .status(404)
        .json({ error: "User not found. Please log in again." });
    }

    // --- STEP 2: Prepare the Booking Data ---
    const bookingData = {
      user_id: userId,
      username: userData.username, // From 'user' table
      email: userData.email, // From 'user' table
      phone_number: userData.phone_number, // From 'user' table
      address: userData.address, // From 'user' table
      event_name: eventName,
      event_type: eventType,
      event_date: eventDate,
      event_time: formatTimeTo24H(time),
      event_duration: duration,
      ingress_time: ingress ? `${ingress}:00:00` : "02:00:00",
      egress_time: egress ? `${egress}:00:00` : "01:00:00",
      guests: guests || 0,
      total_amount: totalAmount,
      amount_paid: amount_paid || 0,
      payment_type: paymentType,
      status: "pending",
    };

    console.log("2. Attempting Database Insert for User:", userData.username);
    const result = await query("INSERT INTO booking SET ?", [bookingData]);
    const bookingId = result.insertId;

    // --- STEP 3: PayMongo Integration ---
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const authHeader = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

    const paymongoResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: {
              email: userData.email,
              name: userData.username,
              phone: userData.phone_number,
            },
            line_items: [
              {
                currency: "PHP",
                amount: Math.round(amount_paid * 100),
                name: `Calidro Booking: ${eventName}`,
                quantity: 1,
              },
            ],
            payment_method_types: payment_methods,
            success_url: `https://calidro.vercel.app/ReviewDetails?bookingId=${bookingId}`,
            cancel_url: `https://calidro.vercel.app/userbook`,
            reference_number: bookingId.toString(),
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

    res.status(200).json({
      bookingId,
      checkout_url: paymongoResponse.data.data.attributes.checkout_url,
    });
  } catch (error) {
    console.error("❌ FINAL ROUTE ERROR:", error.message);
    res.status(500).json({
      error: "Process failed",
      details: error.response?.data?.details || error.message,
    });
  }
});

// 2. Fetch all bookings for User View

router.get("/my-bookings/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT booking_id, event_name, username, email, phone_number, address, event_type, event_duration, ingress_time, egress_time, guests, total_amount, amount_paid, payment_type, status, event_date, event_time FROM booking WHERE user_id = ? ORDER BY event_date DESC",
      [userId],
    );

    const formatted = rows.map((b) => ({
      booking_id: b.booking_id,

      eventName: b.event_name,

      userName: b.username,

      email: b.email,

      contactNo: b.phone_number,

      address: b.address,

      typeOfEvent: b.event_type,

      duration: `${b.event_duration} hrs`,

      ingress: `${parseInt(b.ingress_time || 0)} hr`,

      egress: `${parseInt(b.egress_time || 0)} hr`,

      noOfGuests: b.guests,

      total: b.total_amount,

      paid: b.amount_paid,
      paymentType: b.payment_type,

      bookingStatus: b.status,

      date: b.event_date,

      time: b.event_time,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Fetch all bookings for Admin View
router.get("/all-bookings", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM booking ORDER BY event_date DESC",
    );
    const formatted = rows.map((b) => ({
      booking_id: b.booking_id,

      eventName: b.event_name,

      userName: b.username,

      email: b.email,

      contactNo: b.phone_number,

      address: b.address,

      typeOfEvent: b.event_type,

      duration: `${b.event_duration} hrs`,

      ingress: `${parseInt(b.ingress_time || 0)} hr`,

      egress: `${parseInt(b.egress_time || 0)} hr`,

      noOfGuests: b.guests,

      total: b.total_amount,

      paid: b.amount_paid,
      paymentType: b.payment_type,

      bookingStatus: b.status,

      date: b.event_date,

      time: b.event_time,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Status and Send Email

router.put("/update-status/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // 1. Safety Check: Is the ID valid?
  if (!id || id === "undefined") {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    // 2. Get the current booking
    const [rows] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found in DB" });
    }

    const booking = rows[0];

    // 3. Update the status
    await db.query("UPDATE booking SET status = ? WHERE booking_id = ?", [
      status,
      id,
    ]);

    // 4. Email Logic (Wrapped in its own try/catch so it doesn't crash the 200 response)
    if (booking.status !== "confirmed" && status === "confirmed") {
      try {
        await sendBookingConfirmation(booking);
        console.log("📧 Email sent successfully");
      } catch (emailErr) {
        console.error("📧 Email failed but DB was updated:", emailErr.message);
        // We don't return error here because the DB update actually worked!
      }
    }

    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("❌ BACKEND CRASH:", err);
    res
      .status(500)
      .json({ error: "Database update failed", details: err.message });
  }
});

// 4. Get specific booking details

router.get("/details/:id", async (req, res) => {
  const { id } = req.params;

  // Log what ID the server actually received
  console.log("DEBUG: Fetching details for ID:", id);

  try {
    // Ensure this uses 'id', NOT 'user_id'
    const [results] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [id],
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("DEBUG: Database Query Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 5. Get confirmed dates only (for calendar blocking)

router.get("/all", async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT event_date FROM booking WHERE status = 'confirmed'",
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// 6. Update Payment (Works for both manual admin updates and PayMongo balance updates)
router.put("/:id/update-payment", async (req, res) => {
  const { id } = req.params;
  const { paymentAmount } = req.body; // The additional amount being paid

  try {
    // 1. Fetch current booking
    const [rows] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Booking not found" });

    const booking = rows[0];
    const newTotalPaid =
      parseFloat(booking.amount_paid) + parseFloat(paymentAmount);
    const remainingBalance = booking.total_amount - newTotalPaid;

    // 2. Logic: Status is 'confirmed' ONLY if fully paid, else 'partial'
    const newStatus = remainingBalance <= 0 ? "confirmed" : "partial";
    const newPaymentType = remainingBalance <= 0 ? "full" : "partial";

    await db.query(
      "UPDATE booking SET amount_paid = ?, status = ?, payment_type = ? WHERE booking_id = ?",
      [newTotalPaid, newStatus, newPaymentType, id],
    );

    // 3. Send email only if it just became fully paid
    if (newStatus === "confirmed" && booking.status !== "confirmed") {
      await sendBookingConfirmation({
        ...booking,
        amount_paid: newTotalPaid,
        status: newStatus,
      });
    }

    res.json({ success: true, remainingBalance, newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 1. THE ACTUAL POST HANDLER ---
router.post("/checkout-balance", async (req, res) => {
  const { bookingId, payment_methods } = req.body;

  // 1. Validation: Stop early if data is missing
  if (!bookingId || bookingId === "undefined") {
    console.error("❌ REJECTED: bookingId is missing or undefined.");
    return res.status(400).json({
      error: "Missing bookingId",
      details:
        "The server received an undefined ID. Check your frontend payload.",
    });
  }

  try {
    // 2. Database Query using booking_id
    const [rows] = await db.query(
      "SELECT event_name, total_amount, amount_paid, email FROM booking WHERE booking_id = ?",
      [bookingId],
    );

    if (!rows || rows.length === 0) {
      console.log(`❌ NOT FOUND: No record for booking_id: ${bookingId}`);
      return res
        .status(404)
        .json({ error: "Booking record not found in database." });
    }

    const booking = rows[0];
    const actualBalance =
      parseFloat(booking.total_amount) - parseFloat(booking.amount_paid);

    if (actualBalance <= 0) {
      return res
        .status(400)
        .json({ details: "This booking is already fully paid." });
    }

    // 3. PayMongo Configuration
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const authHeader = `Basic ${Buffer.from(secretKey + ":").toString("base64")}`;

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            billing: { email: booking.email },
            line_items: [
              {
                name: `Balance: ${booking.event_name}`,
                amount: Math.round(actualBalance * 100), // Amount in cents
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: payment_methods,
            metadata: {
              bookingId: bookingId.toString(),
              type: "balance_update",
            },
            success_url: `https://calidro.vercel.app/ReviewDetails?bookingId=${bookingId}`,
            cancel_url: `https://calidro.vercel.app/userbook`,
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

    console.log("✅ PayMongo Session Created:", response.data.data.id);
    res.json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (err) {
    console.error("❌ PayMongo Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Payment initiation failed",
      details: err.response?.data?.errors?.[0]?.detail || err.message,
    });
  }
});

router.get("/checkout-balance", (req, res) => {
  console.warn("⚠️ WARNING: Received a GET request on a POST endpoint.");
  res.status(405).json({
    error: "Method Not Allowed",
    message:
      "A GET request was detected. This usually means a redirect occurred or the frontend sent the wrong method.",
  });
});

router.get("/test-cleanup-manual", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // This is the exact query that will run in the cron job
    const sql = `
      UPDATE booking 
      SET status = 'completed' 
      WHERE event_date < ? 
      AND status IN ('pending', 'confirmed')
    `;

    const [result] = await db.query(sql, [today]);

    res.json({
      message: "Cleanup triggered successfully",
      rowsUpdated: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Finalize Payment Type
router.put("/finalize-payment/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Fetch the current booking to check real math
    const [rows] = await db.query(
      "SELECT total_amount, amount_paid FROM booking WHERE user_id = ?",
      [bookingId],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Booking not found" });

    const { total_amount, amount_paid } = rows[0];

    // Only set to 'full' if the amount paid covers the total
    const isFullyPaid = amount_paid >= total_amount;
    const newStatus = isFullyPaid ? "confirmed" : "pending";
    const newPaymentType = isFullyPaid ? "full" : "partial";

    await db.query(
      `UPDATE booking SET status = ?, payment_type = ? WHERE booking_id = ?`,
      [newStatus, newPaymentType, bookingId],
    );

    res.json({ success: true, paymentType: newPaymentType, status: newStatus });
  } catch (err) {
    console.error("Finalize Payment Error:", err);
    res.status(500).json({ error: "Could not update." });
  }
});

router.put("/edit/:id", async (req, res) => {
  const { typeOfEvent, eventName, noOfGuests } = req.body;
  try {
    // 1. Changed table name from 'bookings' to 'booking'
    // 2. Changed column names to match your database schema
    await db.query(
      "UPDATE booking SET event_type = ?, event_name = ?, guests = ? WHERE booking_id = ?",
      [typeOfEvent, eventName, noOfGuests, req.params.id],
    );
    res.json({ message: "Booking updated" });
  } catch (err) {
    console.error("DEBUG: Update Error:", err); // Added console log for easier debugging
    res.status(500).json({ error: err.message });
  }
});
router.put("/reschedule/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, duration, ingress_time, egress_time } = req.body;

  try {
    // 1. Fetch current booking
    const [rows] = await db.query("SELECT * FROM booking WHERE user_id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Booking not found" });

    const old = rows[0];
    const dur = parseInt(duration) || 0;
    const ing = parseInt(ingress_time) || 0;
    const eg = parseInt(egress_time) || 0;

    // 2. Strict Enforcement: Prevent decreasing original values
    if (
      dur < parseInt(old.event_duration) ||
      ing < parseInt(old.ingress_time) ||
      eg < parseInt(old.egress_time)
    ) {
      return res
        .status(400)
        .json({ error: "Cannot decrease duration or logistics time." });
    }

    // 3. Recalculate Total
    const BASE_PRICE = 25000;
    const newTotal =
      BASE_PRICE +
      (dur - 4) * 5000 +
      Math.max(0, ing - 2) * 1000 +
      Math.max(0, eg - 1) * 1000;

    // 4. Determine Payment Type (Map to ENUM 'partial' or 'full')
    const amountPaid = parseFloat(old.amount_paid) || 0;
    let newPaymentType = "partial";
    if (amountPaid >= newTotal) {
      newPaymentType = "full";
    }

    // 5. Update Database
    await db.query(
      `UPDATE booking 
       SET event_date = ?, event_time = ?, event_duration = ?, 
           ingress_time = ?, egress_time = ?, total_amount = ?, 
           payment_type = ? 
       WHERE id = ?`,
      [date, time, dur.toString(), ing, eg, newTotal, newPaymentType, id],
    );

    res.json({
      message: "Reschedule successful",
      newTotal,
      paymentType: newPaymentType,
    });
  } catch (error) {
    console.error("Reschedule Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 9. PayMongo Webhook (Finalizes the DB update)
router.post("/webhook/paymongo", async (req, res) => {
  const event = req.body;

  // 1. Log the entire event to see if the metadata is actually hitting the server
  console.log("DEBUG: Full Webhook Event:", JSON.stringify(event, null, 2));

  // 2. Access the metadata safely
  // PayMongo's event structure: event.data.attributes.data.attributes.metadata
  const metadata = event.data?.attributes?.data?.attributes?.metadata;
  const amount = event.data?.attributes?.data?.attributes?.amount;

  if (!metadata || !metadata.bookingId) {
    console.error(
      "❌ WEBHOOK ERROR: Missing bookingId in metadata. Event structure might have changed.",
    );
    return res.status(400).send("No metadata found");
  }

  const bookingId = metadata.bookingId;
  const amountPaid = amount / 100;

  try {
    // 3. Query using the confirmed primary key 'booking_id'
    const [rows] = await db.query(
      "SELECT total_amount, amount_paid FROM booking WHERE booking_id = ?",
      [bookingId],
    );

    if (rows.length === 0) {
      console.error(
        `❌ WEBHOOK ERROR: No record found for booking_id: ${bookingId}`,
      );
      return res.status(404).send("Booking not found");
    }

    const currentPaid = parseFloat(rows[0].amount_paid) || 0;
    const totalAmount = parseFloat(rows[0].total_amount);
    const newPaid = currentPaid + amountPaid;
    const newStatus = newPaid >= totalAmount ? "confirmed" : "partial";

    // 4. Update the DB
    await db.query(
      "UPDATE booking SET amount_paid = ?, status = ? WHERE booking_id = ?",
      [newPaid, newStatus, bookingId],
    );

    console.log(
      `✅ Webhook Success: Booking ${bookingId} updated. New Total Paid: ${newPaid}`,
    );
    res.status(200).send("Webhook Received");
  } catch (err) {
    console.error("❌ WEBHOOK DB ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
