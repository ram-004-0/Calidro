import React, { useEffect, useState } from "react";

import { useSearchParams, useNavigate } from "react-router-dom";

import axios from "axios";

const ReviewDetails = () => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");

  const [details, setDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;
    // Use a ref or a local variable to ensure we don't trigger the update twice
    // if the component re-renders for other reasons.
    let hasTriggeredUpdate = false;

    if (bookingId) {
      axios
        .get(`http://localhost:5000/api/bookings/details/${bookingId}`)
        .then((res) => {
          if (!isMounted) return;
          setDetails(res.data);

          // ✅ Check if status is pending AND we haven't already tried to update it
          if (res.data.status === "pending" && !hasTriggeredUpdate) {
            hasTriggeredUpdate = true;
            updateBookingStatus(bookingId);
          }
        })
        .catch((err) => {
          if (isMounted) console.error("Initial fetch failed:", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // ReviewDetails.jsx
  // ReviewDetails.jsx
  const updateBookingStatus = async (id) => {
    if (!id) {
      console.error("No ID provided to updateBookingStatus!");
      return;
    }

    try {
      // Force the log to see what is being sent
      console.log(
        "Sending PUT to:",
        `http://localhost:5000/api/bookings/update-status/${id}`,
      );

      await axios.put(
        `http://localhost:5000/api/bookings/update-status/${id}`,
        { status: "confirmed" },
      );
      // ... rest of your code
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (!details) {
    return (
      <div className="flex justify-center p-20 font-medium text-gray-500">
        Loading receipt details...
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",

      month: "long",

      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";

    // Split the time string (e.g., "15:00:00")

    let [hours, minutes] = timeString.split(":");

    let hoursNum = parseInt(hours, 10);

    // Determine AM/PM

    const modifier = hoursNum >= 12 ? "PM" : "AM";

    // Convert 24h to 12h

    hoursNum = hoursNum % 12 || 12;

    return `${hoursNum}:${minutes} ${modifier}`;
  };

  const displayAmountPaid =
    details.payment_type === "full" ? details.total_amount : 5000;

  const displayBalance = details.total_amount - displayAmountPaid;

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-bold text-[#4a3733] mb-4 mt-10 md:mt-30">
        REVIEW DETAILS
      </h2>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center">
        {/* Booking Details */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1">
          <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-tighter border-b pb-2">
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

            {/* Inside ReviewDetails.jsx */}

            <p>
              <strong>Ingress (Setup):</strong>{" "}
              {details.ingress_time
                ? `${parseInt(details.ingress_time.split(":")[0])} Hour${parseInt(details.ingress_time) > 1 ? "s" : ""}`
                : "0 Hours"}
            </p>

            <p>
              <strong>Egress (Cleanup):</strong>{" "}
              {details.egress_time
                ? `${parseInt(details.egress_time.split(":")[0])} Hour${parseInt(details.egress_time) > 1 ? "s" : ""}`
                : "0 Hours"}
            </p>

            <p>
              <strong>Guests:</strong> {details.guests}
            </p>
          </div>
        </div>

        {/* Payment Details */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1">
          <h3 className="text-sm font-bold mb-6 text-gray-400 uppercase tracking-tighter border-b pb-2">
            Payment Summary
          </h3>

          <div className="space-y-4 text-[#4a3733]">
            <p>
              <strong>Payment Type:</strong>{" "}
              <span className="capitalize">{details.payment_type}</span>
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-bold uppercase text-xs ${
                  details.status === "confirmed"
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {details.status === "confirmed"
                  ? " Confirmed"
                  : " Processing..."}
              </span>
            </p>

            <p className="pt-4 border-t text-lg">
              <strong>Amount Paid:</strong> ₱
              {Number(displayAmountPaid).toLocaleString()}
            </p>

            {displayBalance > 0 && (
              <p className="text-red-500 font-medium">
                <strong>Remaining Balance:</strong> ₱
                {Number(displayBalance).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10">
        <button
          className="bg-gray-200 hover:bg-gray-300 transition px-10 py-3 rounded-full font-bold uppercase text-sm"
          onClick={() => navigate("/userbook")}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ReviewDetails;
