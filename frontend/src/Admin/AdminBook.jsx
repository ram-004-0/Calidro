import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";

const API_URL = "https://calidro-production.up.railway.app";

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

  // FETCH DATA
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

  const formatDateTime = (date, time) => {
    const d = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const t = new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { date: d, time: t };
  };

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col relative">
      <AdminHeader />

      {/* MODAL OVERLAY */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-[#4a3733] p-6 sticky top-0 z-10 flex justify-between items-center text-white">
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide">
                Event Details
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <div className="md:col-span-2 border-b pb-2">
                <p className="text-gray-400 font-bold uppercase text-[10px]">
                  Address
                </p>
                <p className="text-base md:text-lg font-semibold">
                  {selectedBooking.address}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:contents">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">
                    Duration
                  </p>
                  <p className="font-medium text-gray-700">
                    {selectedBooking.duration} hrs
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
              </div>
              <div className="grid grid-cols-2 gap-4 md:contents">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">
                    Ingress
                  </p>
                  <p className="font-medium text-gray-700">
                    {selectedBooking.ingress} hrs
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px]">
                    Egress
                  </p>
                  <p className="font-medium text-gray-700">
                    {selectedBooking.egress} hrs
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
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
            <div className="p-6 bg-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full md:w-auto bg-[#4a3733] text-white px-8 py-3 rounded-full font-bold uppercase text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SECTION */}
      <section className="flex-1 flex flex-col items-center p-4 md:p-6 lg:p-10">
        <div className="w-full max-w-[1460px] bg-[#f1f1f1] rounded-3xl shadow-xl p-4 md:p-6 min-h-[600px] flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-[#4a3733] mb-4 uppercase">
            Reservation Requests
          </h1>

          <div className="bg-white border rounded-2xl shadow-lg flex-1 overflow-hidden flex flex-col">
            {isMobileView ? (
              /* MOBILE VIEW: CARD LIST */
              <div className="overflow-y-auto p-4 space-y-4 max-h-[70vh]">
                {bookings.map((b) => {
                  const { date, time } = formatDateTime(b.date, b.time);
                  return (
                    <div
                      key={b.id}
                      className="border rounded-xl p-4 space-y-3 relative"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#4a3733]">
                            {b.userName}
                          </p>
                          <p className="text-xs text-gray-500">{b.email}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-bold ${getStatusStyles(b.bookingStatus)}`}
                        >
                          {b.bookingStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="text-gray-400 uppercase font-bold">
                            Event
                          </p>
                          <p className="truncate font-semibold">
                            {b.eventName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase font-bold">
                            Date & Time
                          </p>
                          <p>
                            {date} | {time}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="w-full py-2 bg-gray-100 text-[#4a3733] rounded-lg font-bold text-xs uppercase"
                      >
                        View Full Details
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DESKTOP VIEW: TABLE */
              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10 border-b shadow-sm">
                    <tr>
                      <th className="py-4 px-4 text-xs uppercase font-bold text-gray-400">
                        Name
                      </th>
                      <th className="py-4 px-4 text-xs uppercase font-bold text-gray-400">
                        Event Info
                      </th>
                      <th className="py-4 px-4 text-xs uppercase font-bold text-gray-400">
                        Date & Time
                      </th>
                      <th className="py-4 px-4 text-xs uppercase font-bold text-gray-400">
                        Payment
                      </th>
                      <th className="py-4 px-4 text-xs uppercase font-bold text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map((b) => {
                      const { date, time } = formatDateTime(b.date, b.time);
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <p className="font-bold text-sm">{b.userName}</p>
                            <p className="text-xs text-gray-500">{b.email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm font-semibold">
                              {b.eventName}
                            </p>
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="text-blue-600 text-[10px] uppercase font-bold hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-sm">{date}</p>
                            <p className="text-xs text-gray-500">{time}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold">
                              {b.paymentType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusStyles(b.bookingStatus)}`}
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
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBook;
