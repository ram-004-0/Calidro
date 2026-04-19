import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ReviewDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (bookingId) {
      axios
        .get(`http://localhost:5000/api/bookings/details/${bookingId}`)
        .then((res) => {
          setDetails(res.data);
        })
        .catch((err) => {
          console.error("Error fetching receipt details:", err);
        });
    }
  }, [bookingId]);

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

  // LOGIC: Since we don't have an 'amount_paid' column yet,
  // we assume for now that 'total_amount' is what was paid if it's full payment.
  // In a real scenario, you'd save the specific partial amount (e.g. 5000) to a 'paid' column.
  const displayAmountPaid =
    details.payment_type === "full" ? details.total_amount : 5000;
  const displayBalance = details.total_amount - displayAmountPaid;

  return (
    <div className="flex flex-col items-center w-full p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-black mb-8 text-[#4a3733] tracking-widest">
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
              <strong>Time:</strong> {details.event_time}
            </p>
            <p>
              <strong>Duration:</strong> {details.event_duration}
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
              <strong>Plan:</strong>{" "}
              <span className="capitalize">{details.payment_type}</span>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-green-600 font-bold uppercase text-xs">
                {details.status}
              </span>
            </p>
            <p className="pt-4 border-t text-lg">
              <strong>Paid:</strong> ₱
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
        <button
          className="bg-[#f4dfba] hover:bg-[#e3cea5] transition px-10 py-3 rounded-full font-bold uppercase text-sm shadow-lg"
          onClick={() =>
            alert(
              "Your reservation request is now being processed by the admin.",
            )
          }
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ReviewDetails;
