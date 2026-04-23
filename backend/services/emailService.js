const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Nodemailer Configuration Error:", error);
  } else {
    console.log("✅ Nodemailer is ready to send emails");
  }
});
// Helper to remove the 00:00:00 GMT part
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // This returns "Month Day, Year" (e.g., May 01, 2026)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to convert Military/24h to 12h AM/PM
const formatTime = (timeString) => {
  if (!timeString) return "";
  let [hours, minutes] = timeString.split(":");
  let hoursNum = parseInt(hours, 10);
  const modifier = hoursNum >= 12 ? "PM" : "AM";
  hoursNum = hoursNum % 12 || 12; // Convert 0 to 12 for midnight
  return `${hoursNum}:${minutes} ${modifier}`;
};

const sendBookingConfirmation = async (booking) => {
  const balance = booking.total_amount - booking.amount_paid;

  const mailOptions = {
    from: '"Calidro Team" <no-reply@calidro.com>',
    to: booking.email,
    subject: `Booking Confirmed: ${booking.event_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; color: #333;">
        <h2 style="color: #4a3733;">Booking Confirmation</h2>
        <p>Hi ${booking.username},</p>
        <p>Your booking for <strong>${booking.event_name}</strong> is confirmed!</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Event Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 8px;"><strong>Date:</strong> ${formatDate(booking.event_date)}</li>
          <li style="margin-bottom: 8px;"><strong>Time:</strong> ${formatTime(booking.event_time)}</li>
          <li style="margin-bottom: 8px;"><strong>Type:</strong> ${booking.event_type}</li>
        </ul>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Payment Breakdown:</h3>
        <table style="width: 100%; max-width: 400px; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0;">Total Amount:</td>
            <td style="text-align: right;">₱${booking.total_amount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Amount Paid:</td>
            <td style="text-align: right; color: green;">₱${booking.amount_paid.toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; border-top: 2px solid #4a3733;">
            <td style="padding: 10px 0;">Remaining Balance:</td>
            <td style="text-align: right; color: red;">₱${balance.toLocaleString()}</td>
          </tr>
        </table>
        
        <p style="margin-top: 25px; font-size: 0.9em; color: #777;">Thank you for choosing Calidro!</p>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Nodemailer Failed:", error);
    // This will print the specific error (e.g., "Invalid login", "DNS timeout") to your logs
    throw error;
  }

  return transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };
