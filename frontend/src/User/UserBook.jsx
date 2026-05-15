import React, { useState, useEffect } from "react";
import UserHeader from "../Components/UserHeader";
import UserBookingCard from "../Props/UserBookingCard";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = "https://calidro-production.up.railway.app";

const UserBook = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user?.user_id || !token) {
          setLoading(false);
          return;
        }

        // 1. Fetch Bookings
        const bookingRes = await axios.get(
          `${API_URL}/api/bookings/my-bookings/${user.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setBookings(bookingRes.data);

        // 2. Check Profile Completion
        const profileRes = await axios.get(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { phone_number, address } = profileRes.data;
        // Logic: Access is granted only if phone and address are not empty/null
        if (
          phone_number &&
          address &&
          phone_number.trim() !== "" &&
          address.trim() !== ""
        ) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.key]);

  const handleCreateBookingClick = (e) => {
    if (!isProfileComplete) {
      e.preventDefault(); // Stop the Link from navigating
      alert(
        "Please complete your profile (Phone and Address) before creating a booking!",
      );
    }
  };

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
            to={isProfileComplete ? "/booking" : "#"}
            onClick={handleCreateBookingClick}
            className={`px-10 py-3 rounded-full text-sm font-bold uppercase transition-all shadow-md ${
              isProfileComplete
                ? "bg-[#f4dfba] hover:bg-white text-[#4a3733]"
                : "bg-gray-400 cursor-not-allowed text-gray-200"
            }`}
          >
            Create new booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserBook;
