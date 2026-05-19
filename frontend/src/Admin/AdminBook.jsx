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
        if (newType === "refund") alert("Successfully Refunded & Cancelled");
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

      {/* MODAL OVERLAY - Unchanged */}
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

      {/* TABLE/CARD SECTION */}
      <section className="relative pb-2 w-full">
        <div className="max-w-365 mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl h-[600px] flex overflow-hidden">
          <div className="p-6 flex flex-col w-full h-full">
            <div className="flex flex-row justify-between items-center mb-4 flex-shrink-0">
              <h1 className="text-2xl font-bold text-[#4a3733] uppercase">
                Reservations
              </h1>
              <div className="relative">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-[#4a3733] text-xs font-semibold py-2 pl-4 pr-9 rounded-full outline-none cursor-pointer"
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

            <div className="bg-white border rounded-lg shadow-lg flex-1 overflow-auto">
              {/* DESKTOP TABLE - UNCHANGED */}
              <table className="hidden md:table table-fixed w-full min-w-[1000px] text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 border-b shadow-sm">
                  <tr>
                    <th className="py-4 px-2 w-1/6">Name</th>
                    <th className="py-4 px-2 w-1/8">Contact</th>
                    <th className="py-4 px-2 w-1/6">Email</th>
                    <th className="py-4 px-2 w-1/6">Event</th>
                    <th className="py-4 px-2 w-1/6">Date</th>
                    <th className="py-4 px-2 w-1/8">Type</th>
                    <th className="py-4 px-2 w-1/8">Payment</th>
                    <th className="py-4 px-2 w-1/8">Status</th>
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
                        <td className="py-4 px-2 truncate">{b.email}</td>
                        <td className="py-4 px-2 truncate">{b.eventName}</td>
                        <td className="py-4 px-2">
                          {new Date(b.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-2">
                          {b.typeOfEvent}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="block text-blue-600 text-[10px] mt-1 hover:underline font-bold uppercase"
                          >
                            View
                          </button>
                        </td>
                        <td className="py-4 px-2">
                          {/* Simplified Payment Dropdown for logic consistency */}
                          <span
                            className={`px-2 py-1 text-[10px] rounded-full ${getPaymentTypeStyles(currentPaymentType)}`}
                          >
                            {currentPaymentType}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(b.bookingStatus)}`}
                          >
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* MOBILE CARD VIEW - NEW ADDITION */}
              <div className="md:hidden flex flex-col p-2 gap-3">
                {displayedBookings.map((b) => (
                  <div
                    key={b.booking_id || b.id}
                    className="bg-white border rounded-xl p-4 shadow-sm border-gray-100 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-[#4a3733]">
                        {b.userName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${getStatusStyles(b.bookingStatus)}`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 flex flex-col gap-0.5">
                      <p>
                        <span className="font-bold text-gray-400">EVENT:</span>{" "}
                        {b.eventName}
                      </p>
                      <p>
                        <span className="font-bold text-gray-400">DATE:</span>{" "}
                        {new Date(b.date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-bold text-gray-400">PHONE:</span>{" "}
                        {b.contactNo}
                      </p>
                      <p>
                        <span className="font-bold text-gray-400">EMAIL:</span>{" "}
                        {b.email}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="text-blue-600 text-[10px] font-bold uppercase underline self-start mt-1"
                    >
                      View Details & Update Payment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBook;
