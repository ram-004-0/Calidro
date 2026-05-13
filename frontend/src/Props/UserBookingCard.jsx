import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
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
  SquarePen,
  Banknote,
  Star,
} from "lucide-react";
import axios from "axios";

const API_URL =
  "https://calidro-production.up.railway.app" || "http://localhost:5000";

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  if (timeString.includes("AM") || timeString.includes("PM")) return timeString;
  try {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    const date = new Date();
    date.setHours(hours, minutes, 0);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    console.error("Time parsing error:", e);
    return timeString;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const UserBookingCard = ({ booking: initialBooking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [booking, setBooking] = useState(initialBooking);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setBooking(initialBooking);
  }, [initialBooking]);

  const hasBeenRated = Number(booking.is_rated) === 1;

  const balance = useMemo(() => {
    return (booking.total || 0) - (booking.paid || 0);
  }, [booking.total, booking.paid]);

  const handleUpdatePayment = () => {
    const bId = booking.booking_id || booking.id;

    if (!bId) {
      alert(
        "Error: Cannot identify this booking. Please check console for data structure.",
      );
      return;
    }

    navigate(`/payment?bookingId=${bId}`, {
      state: {
        bookingData: booking,
        amountToPay: balance,
        paymentTypeRestriction: "Full",
      },
    });
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await axios.put(
        `${API_URL}/api/bookings/update-status/${booking.booking_id}`,
        {
          status: "cancelled",
        },
      );
      setBooking((prev) => ({ ...prev, bookingStatus: "cancelled" }));
      setShowCancelModal(false);
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel:", err);
      alert("Could not cancel booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = () => {
    navigate("/booking", { state: { rescheduleData: booking } });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    typeOfEvent: booking.typeOfEvent,
    eventName: booking.eventName,
    noOfGuests: booking.noOfGuests,
  });

  const handleSave = async () => {
    const guestCount = parseInt(editData.noOfGuests);

    if (guestCount < 10 || guestCount > 200) {
      alert("Number of guests must be between 10 and 200.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/bookings/edit/${booking.booking_id}`,
        editData,
      );
      setBooking((prev) => ({ ...prev, ...editData }));
      setIsEditing(false);
      alert("Booking updated successfully!");
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Error updating booking.");
    }
  };

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
  return (
    <>
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-5 border-t-4 border-red-500 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center text-red-500">
              <XCircle size={60} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Cancel Booking?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to cancel{" "}
                <span className="font-bold text-black">
                  "{booking.eventName}"
                </span>
                ? This action is permanent.
                <span className="block mt-4 text-xs text-gray-500 italic">
                  For refund concerns, please contact our customer support.
                </span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
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
                <Calendar size={14} /> {formatDate(booking.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {formatTime(booking.time)}
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

              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                  <Users size={14} /> Event Info
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {isEditing ? (
                      <select
                        className="border rounded px-1 w-full"
                        value={editData.typeOfEvent}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            typeOfEvent: e.target.value,
                          })
                        }
                      >
                        <optgroup label="Social Events">
                          <option value="Birthday Party">Birthday Party</option>
                          <option value="Debut">Debut (18th Birthday)</option>
                          <option value="Wedding Ceremony">
                            Wedding Ceremony
                          </option>
                          <option value="Wedding Reception">
                            Wedding Reception
                          </option>
                          <option value="Anniversary">
                            Anniversary Celebration
                          </option>
                        </optgroup>
                        <optgroup label="Family Milestones">
                          <option value="Baby Shower">Baby Shower</option>
                          <option value="Gender Reveal">Gender Reveal</option>
                          <option value="Baptism">Baptism / Christening</option>
                          <option value="Graduation Party">
                            Graduation Party
                          </option>
                        </optgroup>
                        <optgroup label="Corporate Events">
                          <option value="Corporate Meeting">
                            Corporate Meeting
                          </option>
                          <option value="Seminar">Seminar / Workshop</option>
                          <option value="Conference">Conference</option>
                          <option value="Team Building">
                            Team Building Event
                          </option>
                          <option value="Company Party">Company Party</option>
                        </optgroup>
                        <optgroup label="Creative / Others">
                          <option value="Exhibit">
                            Exhibit / Art Showcase
                          </option>
                          <option value="Pop-up Market">
                            Pop-up Market / Bazaar
                          </option>
                          <option value="Photoshoot">
                            Photoshoot / Studio Rental
                          </option>
                          <option value="Other">Other</option>
                        </optgroup>
                      </select>
                    ) : (
                      booking.typeOfEvent
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Event Name:</span>{" "}
                    {isEditing ? (
                      <input
                        className="border rounded px-1 w-full"
                        value={editData.eventName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            eventName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      booking.eventName
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">Guests:</span>{" "}
                    {isEditing ? (
                      <input
                        type="number"
                        min="10"
                        max="200"
                        className="border rounded px-1 w-full"
                        value={editData.noOfGuests}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            noOfGuests: e.target.value,
                          })
                        }
                      />
                    ) : (
                      `${booking.noOfGuests} pax`
                    )}
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
                    <span>₱{balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
              {/* Rate Event button*/}
              {booking.bookingStatus?.toLowerCase() === "completed" &&
                !hasBeenRated && (
                  <button
                    onClick={() =>
                      navigate(`/rate-event/${booking.booking_id}`)
                    }
                    className="flex items-center gap-2 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100 transition-colors"
                  >
                    <Star size={16} fill="currentColor" />
                    Rate Event
                  </button>
                )}
              {hasBeenRated &&
                booking.bookingStatus?.toLowerCase() === "completed" && (
                  <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 italic">
                    <Star size={16} className="text-gray-300" />
                    Feedback submitted
                  </span>
                )}

              {/* 2. Show Management buttons ONLY if NOT completed and NOT cancelled */}
              {booking.bookingStatus?.toLowerCase() !== "completed" &&
                booking.bookingStatus?.toLowerCase() !== "cancelled" && (
                  <>
                    {isEditing ? (
                      // EDIT MODE
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      // VIEW MODE
                      <>
                        {balance > 0 && (
                          <button
                            onClick={handleUpdatePayment}
                            className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <Banknote size={16} />
                            Update Payment
                          </button>
                        )}
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <SquarePen size={16} />
                          Edit
                        </button>
                        <button
                          onClick={handleReschedule}
                          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <CalendarDays size={16} />
                          Reschedule
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => setShowCancelModal(true)}
                          className={`flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 ${
                            isProcessing ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <XCircle size={16} />
                          {isProcessing ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      </>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBookingCard;
