import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";
import { ChevronDown } from "lucide-react";

const API_URL = "https://calidro-production.up.railway.app";

const AdminBook = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [sortType, setSortType] = useState("newest");

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/all-bookings`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSortedBookings = () => {
    let sorted = [...bookings];
    switch (sortType) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            (new Date(b.date).getTime() || 0) -
            (new Date(a.date).getTime() || 0),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            (new Date(a.date).getTime() || 0) -
            (new Date(b.date).getTime() || 0),
        );
      case "dateAdded":
        return sorted.sort(
          (a, b) => (b.booking_id || b.id || 0) - (a.booking_id || a.id || 0),
        );
      default:
        return sorted;
    }
  };

  const displayedBookings = getSortedBookings();

  const handlePaymentUpdate = async (bookingId, newType, currentNote) => {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/update-payment-type`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            paymentType: newType,
            paymentNote: currentNote,
          }),
        },
      );

      if (response.ok) {
        await fetchBookings();

        if (newType === "refund") {
          alert("Successfully Refunded & Cancelled");
        }
      } else {
        alert("Failed to update booking details");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("A network error occurred.");
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

  const getPaymentTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case "full":
        return "bg-emerald-500 text-white";
      case "partial":
        return "bg-amber-400 text-black";
      case "refund":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-full relative">
      <AdminHeader />

      {/* MODAL OVERLAY */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-[#4a3733] p-6 flex justify-between items-center text-white shrink-0">
              <h2 className="text-xl font-bold uppercase tracking-wide">
                Event Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - scrollable on mobile if content exceeds height */}
            <div className="p-6 md:p-8 grid grid-cols-2 gap-y-6 gap-x-8 text-sm overflow-y-auto">
              <div className="col-span-2 border-b pb-2">
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Address
                </p>
                <p className="text-lg font-semibold leading-tight">
                  {selectedBooking.address}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Duration
                </p>
                <p className="font-medium text-gray-700">
                  {selectedBooking.duration}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Guests
                </p>
                <p className="font-medium text-gray-700">
                  {selectedBooking.noOfGuests} Pax
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Ingress
                </p>
                <p className="font-medium text-gray-700">
                  {selectedBooking.ingress}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Egress
                </p>
                <p className="font-medium text-gray-700">
                  {selectedBooking.egress}
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">
                    Total Amount
                  </p>
                  <p className="font-bold">
                    ₱{selectedBooking.total?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">
                    Balance
                  </p>
                  <p className="font-bold text-red-500">
                    ₱
                    {(
                      selectedBooking.total - selectedBooking.paid
                    )?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-[#4a3733] text-white px-8 py-2 rounded-full font-bold uppercase text-xs hover:opacity-90 transition-opacity w-full md:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <section className="relative pb-2 w-full">
        {/* Consistent Container Wrapper */}
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] flex overflow-hidden">
          <div className="p-6 flex flex-col w-full h-full">
            <div className="flex flex-row justify-between items-center mb-4 flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#4a3733] uppercase">
                Reservations
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Sort By:
                </span>
                <div className="relative">
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-[#4a3733] text-xs font-semibold py-2 pl-4 pr-9 rounded-full outline-none cursor-pointer shadow-sm hover:border-[#4a3733]/30 transition-all"
                  >
                    <option value="newest">Newest to Oldest</option>
                    <option value="oldest">Oldest to Newest</option>
                    <option value="dateAdded">Date Added</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg shadow-lg flex-1 overflow-hidden flex flex-col">
              {/* Horizontal Scroll wrapper for Mobile, Vertical for both */}
              <div className="overflow-x-auto overflow-y-auto flex-1">
                {/* Added min-w to force columns to stay readable on mobile */}
                <table className="table-fixed w-full min-w-[1000px] text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10 border-b shadow-sm">
                    <tr>
                      <th className="py-4 px-2 w-1/6">Name</th>
                      <th className="py-4 px-2 w-1/8">Contact</th>
                      <th className="py-4 px-2 w-1/6">Email</th>
                      <th className="py-4 px-2 w-1/6">Event Name</th>
                      <th className="py-4 px-2 w-1/6">Date & Time</th>
                      <th className="py-4 px-2 w-1/8">Type of Event</th>
                      <th className="py-4 px-2 w-1/8">Payment Type</th>
                      <th className="py-4 px-2 w-1/8">Booking Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayedBookings.map((b) => {
                      const currentPaymentType = b.paymentType || "partial";
                      return (
                        <tr
                          key={b.booking_id || b.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-4 px-2 truncate">{b.userName}</td>
                          <td className="py-4 px-2 truncate">{b.contactNo}</td>
                          <td className="py-4 px-2 truncate text-sm">
                            {b.email}
                          </td>
                          <td className="py-4 px-2 truncate">{b.eventName}</td>
                          <td className="py-4 px-2 text-sm whitespace-nowrap">
                            {new Date(b.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <br />
                            {new Date(
                              `1970-01-01T${b.time}`,
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="py-4 px-2">
                            {b.typeOfEvent}
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="block text-blue-600 text-xs mt-1 hover:underline font-bold uppercase"
                            >
                              View Details
                            </button>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col gap-2">
                              {/* PAYMENT STATUS / DROPDOWN */}
                              {currentPaymentType.toLowerCase() === "refund" ? (
                                <span
                                  className={`${getPaymentTypeStyles("refund")} rounded-full px-3 py-1 text-[10px] font-bold uppercase text-center`}
                                >
                                  Refunded
                                </span>
                              ) : (
                                <select
                                  id={`select-pay-${b.booking_id || b.id}`}
                                  value={currentPaymentType}
                                  onChange={(e) =>
                                    handlePaymentUpdate(
                                      b.booking_id || b.id,
                                      e.target.value,
                                      b.payment_note,
                                    )
                                  }
                                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase cursor-pointer outline-none ${getPaymentTypeStyles(currentPaymentType)}`}
                                >
                                  {currentPaymentType.toLowerCase() ===
                                    "partial" && (
                                    <option value="partial">Partial</option>
                                  )}
                                  <option value="full">Full</option>
                                  {b.paid > 5000 && (
                                    <option value="refund">Refund</option>
                                  )}
                                </select>
                              )}

                              {/* CONDITIONAL NOTE SECTION: Only show if NOT refunded */}
                              {currentPaymentType.toLowerCase() !==
                                "refund" && (
                                <div className="flex flex-col">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">
                                    Note:
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Add note..."
                                    defaultValue={b.payment_note || ""}
                                    onBlur={(e) => {
                                      const selectEl = document.getElementById(
                                        `select-pay-${b.booking_id || b.id}`,
                                      );
                                      const activeType = selectEl
                                        ? selectEl.value
                                        : currentPaymentType;
                                      handlePaymentUpdate(
                                        b.booking_id || b.id,
                                        activeType,
                                        e.target.value,
                                      );
                                    }}
                                    className="text-[10px] border-b border-gray-300 bg-transparent focus:border-[#4a3733] outline-none py-1"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap ${getStatusStyles(
                                b.bookingStatus,
                              )}`}
                            >
                              {b.bookingStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Added a small swipe hint for mobile users */}
              {isMobileView && (
                <div className="md:hidden text-center text-[10px] text-gray-400 py-1 border-t italic">
                  Swipe horizontally to view more columns
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBook;
