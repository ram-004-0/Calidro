import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";

const API_URL =
  "https://calidro-production.up.railway.app" || "http://localhost:5000";

const AdminBook = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // HANDLE RESPONSIVENESS
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FETCH DATA FROM BACKEND
  useEffect(() => {
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

    fetchBookings();
  }, []);

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

  const getPaymentStatusStyles = (paid, total) => {
    if (paid >= total) return "bg-emerald-500 text-white";
    if (paid > 0) return "bg-amber-400 text-black";
    return "bg-red-500 text-white";
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
      <section className="flex-1 flex flex-col items-center md:p-7">
        <div className="w-full max-w-[1460px] bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 h-[600px] flex flex-col">
          <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Reservation Requests
          </h1>

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
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-4 px-2 truncate">{b.userName}</td>
                      <td className="py-4 px-2 truncate">{b.contactNo}</td>
                      <td className="py-4 px-2 truncate text-sm">{b.email}</td>
                      <td className="py-4 px-2 truncate">{b.eventName}</td>
                      <td className="py-4 px-2 text-sm whitespace-nowrap">
                        {new Date(b.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <br />
                        {new Date(`1970-01-01T${b.time}`).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
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
                        <span className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap">
                          {b.paymentType || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase whitespace-nowrap ${getStatusStyles(
                            b.bookingStatus,
                          )}`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
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
      </section>
    </div>
  );
};

export default AdminBook;
