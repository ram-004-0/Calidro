const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");
const { createNotification } = require("../controllers/notificationController");

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
  console.log("Full Payload Received:", req.body);

  try {
    const {
      userId,
      eventName,
      eventType,
      eventDate,
      time,
      duration,
      ingress,
      egress,
      totalAmount,
      amount_paid,
      paymentType,
      payment_methods,
    } = req.body;

    const rawGuests =
      req.body.noOfGuests || req.body.guests || req.body.guestCount || 0;
    const finalGuestCount = parseInt(rawGuests, 10);

    const [userData] = await query(
      "SELECT username, email, phone_number, address FROM user WHERE user_id = ?",
      [userId],
    );

    const bookingData = {
      user_id: userId,
      username: userData.username,
      email: userData.email,
      phone_number: userData.phone_number,
      address: userData.address,
      event_name: eventName,
      event_type: eventType,
      event_date: eventDate,
      event_time: formatTimeTo24H(time),
      event_duration: duration,
      ingress_time: ingress ? `${ingress}:00:00` : "02:00:00",
      egress_time: egress ? `${egress}:00:00` : "01:00:00",
      guests: finalGuestCount,
      total_amount: totalAmount,
      amount_paid: 0,
      payment_type: paymentType,
      status: "pending",
    };

    console.log("DEBUG: Final Object being INSERTED:", bookingData);

    const result = await query("INSERT INTO booking SET ?", [bookingData]);
    const bookingId = result.insertId;
    const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    //confirmation notif
    const successMsg = `Your booking for "${eventName}" on ${formattedDate} at ${time} has been confirmed. Your payment was processed securely!`;
    await createNotification(userId, successMsg, bookingId);

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
            metadata: {
              bookingId: bookingId.toString(),
              paymentType: paymentType,
            },
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
    res.status(500).json({ error: "Process failed", details: error.message });
  }
});
// 2. Fetch all bookings for User View w rate
router.get("/my-bookings/:user_id", verifyToken, async (req, res) => {
  const user_id = req.params.user_id;

  const sqlQuery = `
    SELECT 
      b.*, 
      CASE WHEN r.rating_id IS NOT NULL THEN 1 ELSE 0 END AS is_rated
    FROM booking b
    LEFT JOIN rating r ON b.booking_id = r.booking_id
    WHERE b.user_id = ?
    ORDER BY b.event_date DESC 
  `;

  try {
    const [rows] = await db.query(sqlQuery, [user_id]);

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
      is_rated: b.is_rated,
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

// Status updater route (Handles Confirmations, Cancellations, etc.)
router.put("/update-status/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    // 1. Fetch the existing booking details first so we can use its data
    const [rows] = await db.query(
      "SELECT * FROM booking WHERE booking_id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found in DB" });
    }

    const booking = rows[0];

    // 2. 🔔 CANCELLATION NOTIFICATION LOGIC (Do this BEFORE sending the final response!)
    if (status === "cancelled") {
      // 📅 Clean format for dates
      const formattedDate = new Date(booking.event_date).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );

      // 🕒 Clean format for time
      let formattedTime = booking.event_time;
      if (booking.event_time) {
        const [hoursStr, minutesStr] = booking.event_time.split(":");
        let hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;

        if (minutesStr === "00") {
          formattedTime = `${hours} ${ampm}`;
        } else {
          formattedTime = `${hours}:${minutesStr} ${ampm}`;
        }
      }

      const cancellationMsg = `Notice: Your booking for "${booking.event_name}" originally scheduled on ${formattedDate} at ${formattedTime} has been cancelled.`;

      // We block and wait for this notification to be written completely into the DB
      await createNotification(booking.user_id, cancellationMsg, id);
      console.log(
        `🔔 Cancellation notification written safely to DB for user ${booking.user_id}`,
      );
    }

    // 3. Update the booking status in the database
    await db.query("UPDATE booking SET status = ? WHERE booking_id = ?", [
      status,
      id,
    ]);

    // 📧 EMAIL LOGIC: If moving to confirmed, fire off the confirmation email
    if (booking.status !== "confirmed" && status === "confirmed") {
      try {
        await sendBookingConfirmation(booking);
        console.log("📧 Email sent successfully");
      } catch (emailErr) {
        console.error("📧 Email failed but DB was updated:", emailErr.message);
      }
    }

    // 4. NOW it is safe to respond to the frontend!
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
    const newStatus = remainingBalance <= 0 ? "confirmed" : "pending";
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

router.post("/checkout-balance", async (req, res) => {
  const { bookingId, payment_methods } = req.body;

  // 1. VALIDATION: Stop early if bookingId is missing
  if (!bookingId || bookingId === "undefined") {
    console.error("❌ REJECTED: bookingId is missing or undefined.");
    return res.status(400).json({
      error: "Missing bookingId",
      details:
        "The server received an undefined ID. Check your frontend payload.",
    });
  }

  try {
    // 2. DATABASE FETCH: Get current totals to calculate the remaining balance
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
    const total = parseFloat(booking.total_amount) || 0;
    const paid = parseFloat(booking.amount_paid) || 0;
    const actualBalance = total - paid;

    // Check if they actually owe money
    if (actualBalance <= 0) {
      return res.status(400).json({
        error: "Paid in full",
        details: "This booking is already fully paid.",
      });
    }

    // 3. PAYMONGO CONFIGURATION
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
                name: `Balance Payment: ${booking.event_name}`,
                amount: Math.round(actualBalance * 100), // PayMongo expects cents
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: payment_methods || ["gcash", "paymaya"],

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

    console.log(
      `✅ PayMongo Session Created for Booking ${bookingId}:`,
      response.data.data.id,
    );

    // Return the URL to the frontend for redirection
    res.json({ checkout_url: response.data.data.attributes.checkout_url });
  } catch (err) {
    console.error("❌ PayMongo Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Payment initiation failed",
      details: err.response?.data?.errors?.[0]?.detail || err.message,
    });
  }
});

router.get("/test-cleanup-manual", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const selectSql = `
      SELECT booking_id, user_id, event_name 
      FROM booking 
      WHERE event_date < ? 
      AND status IN ('pending', 'confirmed')
    `;
    const [bookingsToComplete] = await db.query(selectSql, [today]);

    if (bookingsToComplete.length > 0) {
      for (const booking of bookingsToComplete) {
        const completionMsg = `Thank you! Your event "${booking.event_name}" has been marked as completed. We hope you enjoyed your time with Calidro! You can now leave a review or rating by visiting your bookings section.`;
        await createNotification(
          booking.user_id,
          completionMsg,
          booking.booking_id,
        );
      }
      console.log(
        `🔔 Generated ${bookingsToComplete.length} completion notifications.`,
      );
    }

    // 3. Proceed with the status update operation in the database
    const updateSql = `
      UPDATE booking 
      SET status = 'completed' 
      WHERE event_date < ? 
      AND status IN ('pending', 'confirmed')
    `;
    const [result] = await db.query(updateSql, [today]);

    res.json({
      message: "Cleanup triggered successfully",
      rowsUpdated: result.affectedRows,
      notificationsSent: bookingsToComplete.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/edit/:id", async (req, res) => {
  const { typeOfEvent, eventName, noOfGuests } = req.body;
  try {
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
  const bookingId = req.params.id;

  console.log("📥 RECEIVED PAYLOAD:", req.body);

  const {
    event_date,
    event_time,
    event_duration,
    total_amount,
    ingress_time,
    egress_time,
    userId,
  } = req.body;

  try {
    // 1. Get current booking
    const [currentBooking] = await db.query(
      `SELECT event_duration, user_id FROM booking WHERE booking_id = ?`,
      [bookingId],
    );

    if (currentBooking.length === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }

    const oldDuration = parseInt(currentBooking[0].event_duration) || 0;
    const rawIncoming = req.body.event_duration;
    const newDuration =
      rawIncoming === undefined || rawIncoming === null || rawIncoming === 0
        ? oldDuration
        : parseInt(rawIncoming);

    console.log(
      `DEBUG: Comparing New(${newDuration}) against Old(${oldDuration})`,
    );

    if (isNaN(newDuration)) {
      return res.status(400).json({ error: "Invalid duration provided." });
    }

    if (newDuration < oldDuration) {
      return res.status(400).json({
        error: `Duration cannot be decreased. Original duration was ${oldDuration} hours.`,
      });
    }
    // 3. Conflict Check
    const [conflicts] = await db.query(
      `SELECT * FROM booking 
       WHERE event_date = ? 
       AND event_time = ? 
       AND status = 'confirmed' 
       AND booking_id != ?`,
      [event_date, event_time, bookingId],
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        error: "This schedule is already taken. Please pick another time.",
      });
    }

    // 4. Execute Update
    const updateQuery = `
  UPDATE booking 
  SET 
    event_date = ?, 
    event_time = ?, 
    event_duration = ?, 
    ingress_time = ?, 
    egress_time = ?,
    total_amount = GREATEST(total_amount, ?) 
  WHERE booking_id = ?
`;

    await db.query(updateQuery, [
      event_date,
      event_time,
      newDuration,
      parseInt(ingress_time) || 0,
      parseInt(egress_time) || 0,
      total_amount || 0,
      bookingId,
    ]);

    // 5. Notification Logic
    let finalUserId = userId || currentBooking[0].user_id;

    if (finalUserId) {
      const formattedDate = new Date(event_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const notificationMessage = `Your booking reschedule request was successful! Your new event schedule is set for ${formattedDate} at ${event_time}.`;

      await createNotification(finalUserId, notificationMessage, bookingId);
    }

    res.status(200).json({
      message: "Reschedule successful!",
      newTotal: total_amount,
    });
  } catch (error) {
    console.error("Backend Reschedule Error:", error);
    res.status(500).json({ error: "Server error during rescheduling." });
  }
});

//PayMongo Webhook (Finalizes the DB update)
router.post("/webhook/paymongo", async (req, res) => {
  res.status(200).send("ok");

  try {
    const payload = req.body;
    const resource = payload.data?.attributes?.data || payload.data;
    const attr = resource?.attributes || payload.data?.attributes;

    if (!attr) {
      console.log("⚠️ Webhook Error: Could not locate attributes in payload");
      return;
    }

    const bookingId =
      attr.metadata?.bookingId ||
      attr.payment_intent?.attributes?.metadata?.bookingId ||
      payload.data?.attributes?.metadata?.bookingId;

    const amountInCents =
      attr.payment_intent?.attributes?.amount ||
      attr.amount ||
      attr.line_items?.[0]?.amount ||
      0;

    const paymentAmount = Number(amountInCents) / 100;

    console.log(
      `[WEBHOOK] Attempting Update: ID ${bookingId} | Amt ₱${paymentAmount}`,
    );

    if (!bookingId || paymentAmount <= 0) {
      console.log("⚠️ Webhook ignored: ID is still undefined or Amount is 0.");
      return;
    }

    const updateSql = `
      UPDATE booking 
      SET 
        amount_paid = amount_paid + ?,
        status = CASE 
          WHEN (amount_paid + ?) >= (total_amount - 10) THEN 'confirmed' 
          ELSE 'pending' 
        END,
        payment_type = CASE 
          WHEN (amount_paid + ?) >= (total_amount - 10) THEN 'full' 
          ELSE 'partial' 
        END
      WHERE booking_id = ?
    `;

    const [result] = await db.query(updateSql, [
      paymentAmount,
      paymentAmount,
      paymentAmount,
      bookingId,
    ]);

    if (result.affectedRows > 0) {
      console.log(
        `✅ SUCCESS: Booking ${bookingId} updated with ₱${paymentAmount}`,
      );
    } else {
      console.log(`❌ DB ERROR: Booking ${bookingId} not found in database.`);
    }
  } catch (err) {
    console.error("🔥 WEBHOOK CRASH:", err.message);
  }
});

module.exports = router;
