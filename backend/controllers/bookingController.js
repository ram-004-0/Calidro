const db = require("../config/db");

// Helper function to ensure time is in HH:MM:SS format for MySQL
const formatTimeTo24H = (timeStr) => {
  if (!timeStr) return "00:00:00";

  // If already in HH:MM:SS format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (!minutes) minutes = "00";

  let hoursNum = parseInt(hours, 10);

  if (modifier === "PM" && hoursNum < 12) hoursNum += 12;
  if (modifier === "AM" && hoursNum === 12) hoursNum = 0;

  return `${hoursNum.toString().padStart(2, "0")}:${minutes}:00`;
};

// SAVE BOOKING
exports.createBooking = async (req, res) => {
  console.log("DEBUG: Received Payload:", req.body); // Check your terminal!

  const {
    userId,
    username,
    email,
    phone_number,
    address,
    eventName,
    eventType,
    eventDate,
    time,
    duration,
    guests,
    totalAmount,
    amount_paid,
    paymentType,
  } = req.body;

  const bookingData = {
    user_id: userId, // Changed from userid
    username: username,
    email: email,
    phone_number: phone_number,
    address: address,
    event_name: eventName, // Changed from eventName
    event_type: eventType, // Changed from eventType
    event_date: eventDate, // Changed from eventDate
    event_time: formatTimeTo24H(time), // Use the helper!
    event_duration: duration, // Changed from eventDuration
    guests: guests,
    total_amount: totalAmount, // Changed from totalAmount
    amount_paid: amount_paid || 0,
    payment_type: paymentType, // Changed from paymentType
    status: "pending",
  };

  db.query("INSERT INTO booking SET ?", [bookingData], (err, result) => {
    if (err) {
      console.error("DB Insertion Error:", err);
      // CRITICAL: Always respond to prevent the "Stalled" network state
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }
    res.status(200).json({ bookingId: result.insertId });
  });
};
// FETCH BOOKING FOR REVIEW DETAILS
exports.getBookingDetails = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM booking WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(result[0]);
  });
};
