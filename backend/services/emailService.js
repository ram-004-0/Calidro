const { Resend } = require("resend");

// This line looks for the key in your Railway environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to remove the 00:00:00 GMT part
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
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
  console.log("Attempting to send email via Resend to:", booking.email);
  const balance = booking.total_amount - booking.amount_paid;

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // MUST be verified in Resend
      to: "garinganramy44@gmaiil.com", // MUST be verified in Resend Audiences
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
    });

    console.log("✅ Email sent successfully via Resend:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Resend API Error:", error);
    throw error;
  }
};

module.exports = { sendBookingConfirmation };
