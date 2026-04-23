import React, { useState, useEffect } from "react";
import UserHeader from "../Components/UserHeader";
import UserBookingCard from "../Props/UserBookingCard";
import { Link } from "react-router-dom";
import axios from "axios";

// Using the environment variable defined in your Vercel/Railway setup
const API_URL =
  "https://calidro-production.up.railway.app/api" || "http://localhost:5000";

const UserBook = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Updated to use dynamic API_URL
        const response = await axios.get(`${API_URL}/api/bookings/my-bookings`);
        setBookings(response.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading)
    return <div className="text-white p-10">Loading bookings...</div>;

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return (
    <div className="min-h-screen bg-[#433633] text-[#4a3733] flex flex-col h-screen overflow-hidden">
      <UserHeader />

      <section className="relative pb-2 w-full flex-1 flex flex-col items-center">
        <div className="max-w-365 w-full mx-auto bg-[#f1f1f1] rounded-3xl shadow-xl p-6 h-140 flex flex-col">
          <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase shrink-0">
            Bookings
          </h1>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1 min-h-0">
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking) => (
                <div key={booking.id} className="w-full shrink-0">
                  <UserBookingCard booking={booking} />
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-lg text-center border border-dashed border-gray-300 shrink-0">
                <p className="text-gray-500">No reservations found.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="w-full shrink-0">
        <div className="flex justify-end text-[#4a3733] uppercase font-medium px-7 py-3">
          <Link
            to="/booking"
            className="bg-[#f4dfba] hover:bg-white hover:text-[#4a3733] px-10 py-3 rounded-full text-sm font-bold uppercase transition-colors shadow-md"
          >
            Create new booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserBook;
