import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://calidro-production.up.railway.app";

const ReviewDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");

  // State Management
  const [details, setDetails] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (bookingId) {
      // Strip everything after the colon if it exists (e.g., "9:abc" -> "9")
      const cleanId = bookingId.split(":")[0];

      axios
        .get(`${API_URL}/api/bookings/details/${cleanId}`)
        .then((res) => {
          setDetails(res.data);

          // --- AUTO-CONFIRM LOGIC ---
          // If the booking is still 'pending' (first-time booking), confirm it now.
          if (res.data.status === "pending") {
            updateBookingStatus(cleanId);
          }
        })
        .catch((err) => console.error("Fetch failed:", err));
    }
  }, [bookingId]);

  const updateBookingStatus = async (id) => {
    if (!id) return;
    try {
      await axios.put(`${API_URL}/api/bookings/update-status/${id}`, {
        status: "confirmed",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper: Format Time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    let [hours, minutes] = timeString.split(":");
    let hoursNum = parseInt(hours, 10);
    const modifier = hoursNum >= 12 ? "PM" : "AM";
    hoursNum = hoursNum % 12 || 12;
    return `${hoursNum}:${minutes} ${modifier}`;
  };

  // --- HYDRATION SHIELD ---
  if (!isMounted || !details) {
    return (
      <div className="flex justify-center items-center min-h-screen p-20 font-medium text-gray-500">
        Loading receipt details...
      </div>
    );
  }

  // --- DYNAMIC CALCULATIONS ---
  // This ensures that even if total_amount changes per booking,
  // the paid and balance amounts are always accurate.
  const total = parseFloat(details.total_amount) || 0;
  const paid = parseFloat(details.amount_paid) || 0;
  const displayBalance = Math.max(0, total - paid);

  return (
    <div className="flex flex-col items-center w-full px-4">
      <h2 className="text-2xl font-bold text-[#4a3733] mb-4 mt-10 md:mt-32 uppercase">
        Review Details
      </h2>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
        {/* Booking Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1">
          <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-widest border-b pb-2">
            Booking Info
          </h3>

          <div className="space-y-4 text-[#4a3733]">
            <p>
              <strong>Event:</strong> {details.event_name}
            </p>
            <p>
              <strong>Type:</strong> {details.event_type}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(details.event_date)}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(details.event_time)}
            </p>
            <p>
              <strong>Duration:</strong> {details.event_duration}
            </p>
            <p>
              <strong>Setup Time:</strong>{" "}
              {details.ingress_time
                ? `${parseInt(details.ingress_time)} Hour(s)`
                : "0 Hours"}
            </p>
            <p>
              <strong>Guests:</strong> {details.guests}
            </p>
          </div>
        </div>

        {/* Payment Summary Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1">
          <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-widest border-b pb-2">
            Payment Summary
          </h3>

          <div className="space-y-4 text-[#4a3733]">
            <p>
              <strong>Payment Type:</strong>{" "}
              <span className="capitalize">{details.payment_type}</span>
            </p>

            <p>
              <strong>Booking Status:</strong>{" "}
              <span
                className={`font-bold uppercase text-xs px-2 py-1 rounded-md ${
                  details.status === "confirmed"
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-500"
                }`}
              >
                {details.status === "confirmed" ? "Confirmed" : "Processing..."}
              </span>
            </p>

            <p className="pt-4 border-t text-lg font-semibold">
              <strong>Amount Paid:</strong> ₱{paid.toLocaleString()}
            </p>

            {displayBalance > 0 ? (
              <p className="text-red-500 font-medium">
                <strong>Remaining Balance:</strong> ₱
                {displayBalance.toLocaleString()}
              </p>
            ) : (
              <p className="text-green-600 font-bold">🎉 Fully Paid</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10 pb-20">
        <button
          className="bg-gray-800 text-white hover:bg-black transition px-12 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg"
          onClick={() => navigate("/userbook")}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReviewDetails;
