import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Users,
  CreditCard,
  User,
  CalendarDays,
  XCircle,
} from "lucide-react";

const UserBookingCard = ({ booking: initialBooking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [booking, setBooking] = useState(initialBooking);
  const navigate = useNavigate(); // Initialize the navigate function

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-500 text-white";
      case "confirmed":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-yellow-400 text-black";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel "${booking.eventName}"?`,
    );
    if (confirmCancel) {
      setBooking({ ...booking, bookingStatus: "Cancelled" });
    }
  };

  const handleReschedule = () => {
    // You can optionally pass the existing booking data via state
    // if you want the booking form to be pre-filled
    navigate("/booking", { state: { rescheduleData: booking } });
  };

  return (
    <div className="mb-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* --- CARD HEADER --- */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between p-5 hover:bg-gray-50"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-gray-800">
            {booking.eventName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {booking.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {booking.time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getStatusStyles(booking.bookingStatus)}`}
          >
            {booking.bookingStatus}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* --- EXPANDABLE SECTION --- */}
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[1000px] border-t border-gray-100 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-gray-50 p-6 space-y-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                <User size={14} /> Contact Details
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Full Name:</span>{" "}
                  {booking.userName || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {booking.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {booking.contactNo || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {booking.address || "N/A"}
                </p>
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Users size={14} /> Event Info
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Type:</span>{" "}
                  {booking.typeOfEvent}
                </p>
                <p>
                  <span className="font-semibold">Duration:</span>{" "}
                  {booking.duration}
                </p>
                <p>
                  <span className="font-semibold">Guests:</span>{" "}
                  {booking.noOfGuests} pax
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                <CreditCard size={14} /> Payment Summary
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">
                    ₱{booking.total?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid:</span>
                  <span className="font-semibold">
                    ₱{booking.paid?.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 text-base font-bold text-red-500">
                  <span>Balance:</span>
                  <span>₱{booking.balance?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- ACTION BUTTONS --- */}
          {booking.bookingStatus !== "Completed" &&
            booking.bookingStatus !== "Cancelled" && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReschedule}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
                >
                  <CalendarDays size={16} />
                  Reschedule
                </button>

                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <XCircle size={16} />
                  Cancel Booking
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserBookingCard;
